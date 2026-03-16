import { useCallback, useState } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";
import { Steps } from "../../DataModel/TaxStep";
import Popup from "../General/Popup";
import NewTaxpayerField from "./NewTaxpayerField";

interface NewYearPageProps {
  readonly startBehavior: StartBehavior;
  readonly year: number;
}

export default function NewTaxpayerPopup(props: NewYearPageProps) {
  const { startBehavior, year } = props;

  const [tempName, setTempName] = useState<string>("");

  const onClose = useCallback(() => {
    startBehavior.setNewYear(false);
    if (year) {
      startBehavior.loadNames(year);
    }
  }, [startBehavior, year]);

  const onSubmit = useCallback(async () => {
    if (tempName?.trim() === "") {
      return;
    }    
    const stepsLoaded = await startBehavior.taxBehavior.loadSteps();
    if (!stepsLoaded) {
      return;
    }

    startBehavior.taxBehavior.setName(tempName?.trim());
    startBehavior.taxBehavior.setCurrentStep(Steps.Income);
    startBehavior.taxBehavior.setShowStartPage(false);

    onClose();
  }, [tempName, year, onClose, startBehavior]);

  return (
    <Popup
      title={`New taxpayer for ${year}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Begin"
    >
      <NewTaxpayerField setTempName={setTempName} onStart={onSubmit} />
    </Popup>
  );
}
