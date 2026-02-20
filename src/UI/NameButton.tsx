import { useCallback } from "react";
import type TaxResponse from "../DataModel/TaxResponse";
import type { Steps } from "../DataModel/TaxStep";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

interface NameButtonProps {
  readonly year: number;
  readonly name: string;
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
  readonly setName: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setCurrentStep: React.Dispatch<
    React.SetStateAction<Steps | undefined>
  >;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  readonly setLastSavedTime: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
}

export default function NameButton(props: NameButtonProps) {
  const {
    year,
    name,
    taxBehavior,
    isLoading,
    setName,
    setIsLoading,
    setCurrentStep,
    setError,
    setResponses,
    setLastSavedTime,
  } = props;

  const onClick = useCallback(async () => {
    setIsLoading(true);
    await taxBehavior.loadSteps(setCurrentStep, setError);
    await taxBehavior.resumeProgress(
      year,
      name,
      setCurrentStep,
      setResponses,
      setError,
      setLastSavedTime,
    );
    setName(name);
    setIsLoading(false);
  }, [year, name]);

  return (
    <button onClick={onClick} disabled={isLoading}>
      {name}
    </button>
  );
}
