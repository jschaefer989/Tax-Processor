import { useCallback } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

interface YearButtonProps {
  readonly year: number;
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
    taxBehavior,
    isLoading,
    setYear,
    setNames,
    setIsLoading,
    setError,
  } = props;

  const onClick = useCallback(async () => {
    setIsLoading(true);
    await taxBehavior.loadNames(year, setNames, setError);
    setYear(year);
    setIsLoading(false);
  }, [setError, setIsLoading, setNames, setYear, taxBehavior, year]);

  return (
    <button onClick={onClick} disabled={isLoading}>
      {year}
    </button>
  );
}
