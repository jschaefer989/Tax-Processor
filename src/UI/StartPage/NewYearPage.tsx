import { useCallback, useState } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import { Steps } from "../../DataModel/TaxStep";
import HeaderTitle from "../Header/HeaderTitle";
import BeginButton from "./BeginButton";
import NameButton from "./NameButton";
import NewTaxpayerField from "./NewTaxpayerField";

interface NewYearPageProps {
  readonly names: string[];
  readonly year: number;
  readonly name: string | undefined;
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
  readonly setSelectedName: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setCurrentStep: React.Dispatch<
    React.SetStateAction<Steps | undefined>
  >;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  readonly setLastSavedTime: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
  readonly setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NewYearPage(props: NewYearPageProps) {
  const {
    names,
    year,
    taxBehavior,
    isLoading,
    name,
    setSelectedName,
    setIsLoading,
    setCurrentStep,
    setError,
    setResponses,
    setLastSavedTime,
    setNewYear,
    setNoDbConnection,
    setShowStartPage,
  } = props;

  const [tempName, setTempName] = useState<string>("");
  
  const onStart = useCallback(async () => {
    if (tempName?.trim() === "") {
      return;
    }
    setError(undefined);    
    await taxBehavior.loadSteps(setCurrentStep, setError, setIsLoading);
    if (year && tempName) {
      await taxBehavior.resumeProgress(
        year,
        tempName.trim(),
        setCurrentStep,
        setResponses,
        setError,
        setLastSavedTime,
        setNoDbConnection,
        setIsLoading
      );
    }
    setSelectedName(tempName?.trim());
    setNewYear(false);
    setCurrentStep(Steps.Income);    
    setShowStartPage(false);
  }, [tempName, year]);

  return (
    <>
      <HeaderTitle year={year.toString()} name={name} />
      {names.map((name) => (
        <NameButton
          key={name}
          name={name}
          year={year}
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          setSelectedName={setSelectedName}
          setIsLoading={setIsLoading}
          setCurrentStep={setCurrentStep}
          setError={setError}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setNoDbConnection={setNoDbConnection}
          setShowStartPage={setShowStartPage}
        />
      ))}
      <div className="new-taxpayer-form">
        <NewTaxpayerField setTempName={setTempName} onStart={onStart} />
        <BeginButton
          tempName={tempName}
          year={year}
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          onStart={onStart}
        />
      </div>
    </>
  );
}
