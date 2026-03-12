import { useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface DeleteButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly lastSavedTime: Date | undefined;
  readonly year: number;
  readonly name: string;
  readonly isLoading: boolean;
}

export default function DeleteButton(props: DeleteButtonProps) {
  const {
    taxBehavior,
    lastSavedTime,
    year,
    name,
    isLoading,
  } = props;

  //#region useCallback
  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all progress? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.deleteProgress(year, name);
      taxBehavior.setLastSavedTime(undefined);
    }
  }, [name, year]);
  //#endregion useCallback

  return (
    <button
      className="ghost"
      onClick={handleDelete}
      disabled={isLoading || !lastSavedTime}
      title={
        isLoading
          ? "Server is busy. Please wait..."
          : "Delete all progress for this year and name."
      }
    >
      {"Delete progress"}
    </button>
  );
}
