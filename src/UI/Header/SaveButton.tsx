import { useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";

type SaveButtonProps = {
  currentStep: Steps;
  responses: TaxResponse[];
  taxBehavior: TaxBehavior;
  isLoading: boolean;
  year: number;
  name: string;
};

export default function SaveButton(props: SaveButtonProps) {
  const { currentStep, responses, taxBehavior, isLoading, year, name } = props;

  //#region useCallback
  const handleSave = useCallback(async () => {
    taxBehavior.saveProgress(year, name, currentStep, responses);
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
