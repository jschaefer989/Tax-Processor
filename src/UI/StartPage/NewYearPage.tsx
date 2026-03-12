import { useCallback, useState } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import { Steps } from "../../DataModel/TaxStep";
import HeaderTitle from "../Header/HeaderTitle";
import BeginButton from "./BeginButton";
import NameButton from "./NameButton";
import NewTaxpayerField from "./NewTaxpayerField";
import type { StartBehavior } from "../../DataModel/StartBehavior";

interface NewYearPageProps {
  readonly startBehavior: StartBehavior;
  readonly names: string[];
  readonly year: number;
  readonly name: string | undefined;
  readonly isLoading: boolean;
}

export default function NewYearPage(props: NewYearPageProps) {
  const {
    startBehavior,
    names,
    year,
    isLoading,
    name,
  } = props;

  const [tempName, setTempName] = useState<string>("");
  
  const onStart = useCallback(async () => {
    if (tempName?.trim() === "") {
      return;
    }
    startBehavior.taxBehavior.setError(undefined);    
    await startBehavior.taxBehavior.loadSteps();
    if (year && tempName) {
      await startBehavior.taxBehavior.resumeProgress(
        year,
        tempName.trim(),
      );
    }
    startBehavior.taxBehavior.setName(tempName?.trim());
    startBehavior.setNewYear(false);
    startBehavior.taxBehavior.setCurrentStep(Steps.Income);    
    startBehavior.taxBehavior.setShowStartPage(false);
  }, [tempName, year]);

  return (
    <>
      <HeaderTitle year={year.toString()} name={name} />
      {names.map((name) => (
        <NameButton
          key={name}
          name={name}
          year={year}
          startBehavior={startBehavior}
          isLoading={isLoading}
        />
      ))}
      <div className="new-taxpayer-form">
        <NewTaxpayerField setTempName={setTempName} onStart={onStart} />
        <BeginButton
          tempName={tempName}
          isLoading={isLoading}
          onStart={onStart}
        />
      </div>
    </>
  );
}
