import { useCallback } from "react";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface NameButtonProps {
  readonly year?: number;
  readonly name: string;
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
  readonly setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NameButton(props: NameButtonProps) {
  const {
    year,
    name,
    taxBehavior,
    isLoading,
    setSelectedName,
    setIsLoading,
    setCurrentStep,
    setError,
    setResponses,
    setLastSavedTime,
    setNoDbConnection,
    setShowStartPage,
  } = props;

  const onClick = useCallback(async () => {
    await taxBehavior.loadSteps(setCurrentStep, setError, setIsLoading);
    if (year) {
      await taxBehavior.resumeProgress(
        year,
        name,
        setCurrentStep,
        setResponses,
        setError,
        setLastSavedTime,
        setNoDbConnection,
        setIsLoading,
      );
    }
    setSelectedName(name);
    setShowStartPage(false);
  }, [name, taxBehavior, year]);

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : `Continue with ${name}`
      }
    >
      {name}
    </button>
  );
}
