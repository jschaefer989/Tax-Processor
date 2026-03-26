import { useCallback } from "react";
import type { TaxBehavior } from "../../api/TaxBehavior";

type ReturnButtonProps = {
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
};

export function ReturnButton(props: ReturnButtonProps) {
  const { taxBehavior, isLoading } = props;

  const onClick = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to return to the start page? Any unsaved progress will be lost.",
    );
    if (confirmed) {
      taxBehavior.returnToStartPage();
    }
  }, [taxBehavior]);

  return (
    <button
      className="ghost"
      onClick={onClick}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : "Return to start page"
      }
    >
      Return
    </button>
  );
}
