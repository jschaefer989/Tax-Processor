import { useCallback } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

interface YearButtonProps {
  readonly year: number;
  readonly selectedYear: number | undefined;
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
  readonly setYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  readonly setNames: React.Dispatch<React.SetStateAction<string[]>>;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function YearButton(props: YearButtonProps) {
  const {
    year,
    selectedYear,
    taxBehavior,
    isLoading,
    setYear,
    setNames,
    setIsLoading,
    setError,
  } = props;

  const onClick = useCallback(async () => {
    if (selectedYear === year) {
      setYear(undefined);
    } else {
      setIsLoading(true);
      await taxBehavior.loadNames(year, setNames, setError);
      setYear(year);
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setNames, setYear, taxBehavior, year, selectedYear]);

  const isSelected = selectedYear === year;

  return (
    <button
      className={`year-button ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      disabled={isLoading && !isSelected}
    >
      {year}
    </button>
  );
}
