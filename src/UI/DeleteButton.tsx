import { useCallback } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

interface ClearButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly isSaving: boolean;
  readonly isDeleting: boolean;
  readonly lastSavedTime: Date | undefined;
  readonly year: number;
  readonly name: string;
  readonly setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setToastMessage: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  readonly setLastSavedTime: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
}

export default function DeleteButton(props: ClearButtonProps) {
  const {
    taxBehavior,
    isSaving,
    isDeleting,
    lastSavedTime,
    year,
    name,
    setIsDeleting,
    setToastMessage,
    setLastSavedTime,
  } = props;

  //#region useCallback
  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all progress? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.deleteProgress(year, name, setIsDeleting, setToastMessage);
      setLastSavedTime(undefined);
    }
  }, [name, setIsDeleting, setLastSavedTime, setToastMessage, taxBehavior, year]);
  //#endregion useCallback

  return (
    <button
      className="ghost"
      onClick={handleDelete}
      disabled={isSaving || isDeleting || !lastSavedTime}
    >
      {isDeleting ? "Deleting..." : "Delete progress"}
    </button>
  );
}
