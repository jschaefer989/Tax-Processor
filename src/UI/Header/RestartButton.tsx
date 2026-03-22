import { useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";

type DeleteButtonProps = {
  readonly taxBehavior: TaxBehavior;
  readonly responses: TaxResponse[];
  readonly year: number;
  readonly name: string;
  readonly isLoading: boolean;
};

export default function RestartButton(props: DeleteButtonProps) {
  const {
    taxBehavior,
    responses,
    year,
    name,
    isLoading,
  } = props;

  const handleRestart = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all responses and restart?",
    );
    if (confirmed) {
      taxBehavior.state.setResponses([]);
      taxBehavior.state.setCurrentStep("income");
      taxBehavior.state.setLastSavedTime(undefined);
    }
  }, [name, year]);

  return (
    <button
      className="ghost"
      onClick={handleRestart}
      disabled={isLoading || responses.length === 0}
      title={
        isLoading
          ? "Server is busy. Please wait..."
          : "Delete all responses and restart from the beginning."
      }
    >
      Restart
    </button>
  );
}
