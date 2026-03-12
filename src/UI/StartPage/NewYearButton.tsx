import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";

interface NewYearButtonProps {
  readonly startBehavior: StartBehavior;
  readonly isLoading: boolean;
}

export default function NewYearButton(props: NewYearButtonProps) {
  const {
    startBehavior,
    isLoading,
  } = props;

  const onStartNewYear = useCallback(async () => {
    await startBehavior.loadAllNames();
    startBehavior.taxBehavior.setYear(new Date().getFullYear() - 1);
    startBehavior.setNewYear(true);
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
