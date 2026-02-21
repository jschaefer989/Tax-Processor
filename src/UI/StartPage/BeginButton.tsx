import { useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import { Steps } from "../../DataModel/TaxStep";
import type TaxResponse from "../../DataModel/TaxResponse";

interface BeginButtonProps {
  readonly tempName?: string;
  readonly year?: number;
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
  readonly setSelectedName: React.Dispatch<React.SetStateAction<string | undefined>>;
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

export default function BeginButton(props: BeginButtonProps) {
  const {
    tempName,
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
    taxBehavior,
    year,
  } = props;

  const onStart = useCallback(async () => {
    if (tempName?.trim() === "") {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    await taxBehavior.loadSteps(setCurrentStep, setError);
    if (year && tempName) {
      await taxBehavior.resumeProgress(
        year,
        tempName.trim(),
        setCurrentStep,
        setResponses,
        setError,
        setLastSavedTime,
        setNoDbConnection,
      );
    }
    setSelectedName(tempName?.trim());
    setNewYear(false);
    setCurrentStep(Steps.Income);
    setIsLoading(false);
    setShowStartPage(false);
  }, [
    setCurrentStep,
    setError,
    setIsLoading,
    setLastSavedTime,
    setSelectedName,
    setNewYear,
    setNoDbConnection,
    setResponses,
    taxBehavior,
    tempName,
    year,
  ]);

  return (
    <button
      className="new-taxpayer-form-button"
      onClick={onStart}
      disabled={isLoading || tempName?.trim() === ""}
    >
      Begin
    </button>
  );
}
