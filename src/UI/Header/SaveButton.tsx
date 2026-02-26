import { useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";

interface SaveButtonProps {
  currentStep: Steps;
  responses: TaxResponse[];
  taxBehavior: TaxBehavior;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setToastMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>>;
  year: number;
  name: string;
}

export default function SaveButton(props: SaveButtonProps) {
  const {
    currentStep,
    responses,
    taxBehavior,
    isLoading,
    setIsLoading,
    setError,
    setToastMessage,
    setLastSavedTime,
    year,
    name,
  } = props;

  //#region useCallback
  const handleSave = useCallback(async () => {
    taxBehavior.saveProgress(
      year,
      name,
      currentStep,
      responses,
      setError,
      setIsLoading,
      setToastMessage,
      setLastSavedTime,
    );
  }, [currentStep, name, responses, taxBehavior, year]);
  //#endregion useCallback

  return (
    <button
      className="button"
      onClick={handleSave}
      disabled={isLoading}
      title={
        isLoading
          ? "Server is busy. Please wait..."
          : "Save your progress. You can resume later from where you left off."
      }
    >
      Save progress
    </button>
  );
}
