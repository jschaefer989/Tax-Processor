import { useCallback } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";
import type TaxResponse from "../DataModel/TaxResponse";
import type { Steps } from "../DataModel/TaxStep";

interface SaveButtonProps {
  currentStep: Steps;
  responses: TaxResponse[];
  taxBehavior: TaxBehavior;
  isSaving: boolean;
  isDeleting: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
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
    isSaving,
    isDeleting,
    setIsSaving,
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
      setIsSaving,
      setToastMessage,
      setLastSavedTime,
    );
  }, [
    currentStep,
    name,
    responses,
    setError,
    setIsSaving,
    setLastSavedTime,
    setToastMessage,
    taxBehavior,
    year,
  ]);
  //#endregion useCallback

  return (
    <button
      className="button"
      onClick={handleSave}
      disabled={isSaving || isDeleting}
    >
      {isSaving ? "Saving..." : "Save progress"}
    </button>
  );
}
