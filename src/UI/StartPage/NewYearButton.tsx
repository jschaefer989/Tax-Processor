import { useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface NewYearButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly setNames: React.Dispatch<React.SetStateAction<string[]>>;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSelectedYear: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  readonly setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  readonly isLoading: boolean;
}

export default function NewYearButton(props: NewYearButtonProps) {
  const {
    taxBehavior,
    setNames,
    setError,
    setIsLoading,
    setSelectedYear,
    setNewYear,
    isLoading,
  } = props;

  const onStartNewYear = useCallback(async () => {
    await taxBehavior.loadAllNames(setNames, setError, setIsLoading);
    setSelectedYear(new Date().getFullYear() - 1);
    setNewYear(true);
  }, []);

  return (
    <button
      className="new-year-button"
      onClick={onStartNewYear}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : "Add a new tax year"
      }
    >
      Start new year <span className="arrow">→</span>
    </button>
  );
}
