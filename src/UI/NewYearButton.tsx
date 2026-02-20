import { useCallback } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

interface NewYearButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly setNames: React.Dispatch<React.SetStateAction<string[]>>;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  readonly setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  readonly isLoading: boolean;
}

export default function NewYearButton(props: NewYearButtonProps) {
  const { taxBehavior, setNames, setError, setIsLoading, setYear, setNewYear, isLoading } =
    props;

  const onStartNewYear = useCallback(async () => {
    setIsLoading(true);
    await taxBehavior.loadAllNames(setNames, setError);
    setYear(new Date().getFullYear() - 1);
    setNewYear(true);
    setIsLoading(false);
  }, []);

  return (
    <button onClick={onStartNewYear} disabled={isLoading}>
      Start new year
    </button>
  );
}
