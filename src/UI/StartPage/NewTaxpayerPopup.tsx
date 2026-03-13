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
  }, [startBehavior]);

  const onSubmit = useCallback(async () => {
    if (tempName?.trim() === "") {
      return;
    }
    startBehavior.taxBehavior.setError(undefined);
    await startBehavior.taxBehavior.loadSteps();
    if (year && tempName) {
      await startBehavior.taxBehavior.resumeProgress(year, tempName.trim());
    }
    startBehavior.taxBehavior.setName(tempName?.trim());
    startBehavior.taxBehavior.setCurrentStep(Steps.Income);
    startBehavior.taxBehavior.setShowStartPage(false);

    onClose();
  }, [tempName, year, onClose]);

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
