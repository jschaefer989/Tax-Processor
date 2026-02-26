import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import BeginButton from "./BeginButton";
import DatabaseConnectionForm from "./DatabaseConnectionForm";

interface MissingDatabaseControlsProps {
  taxBehavior: TaxBehavior;
  isLoading: boolean;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setSelectedName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
  setYears: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function MissingDatabaseControls(
  props: MissingDatabaseControlsProps,
) {
  const {
    taxBehavior,
    isLoading,
    setError,
    setIsLoading,
    setCurrentStep,
    setResponses,
    setLastSavedTime,
    setSelectedName,
    setNewYear,
    setNoDbConnection,
    setShowStartPage,
    setYears,
  } = props;

  return (
    <>
      <BeginButton
        taxBehavior={taxBehavior}
        isLoading={isLoading}
        setError={setError}
        setIsLoading={setIsLoading}
        setCurrentStep={setCurrentStep}
        setResponses={setResponses}
        setLastSavedTime={setLastSavedTime}
        setSelectedName={setSelectedName}
        setNewYear={setNewYear}
        setNoDbConnection={setNoDbConnection}
        setShowStartPage={setShowStartPage}
      />      
      <DatabaseConnectionForm
        taxBehavior={taxBehavior}
        setYears={setYears}
        setNoDbConnection={setNoDbConnection}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </>
  );
}
