import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";

type NewYearButtonProps = {
  readonly startBehavior: StartBehavior;
  readonly years: number[];
  readonly isLoading: boolean;
};

export default function NewYearButton(props: NewYearButtonProps) {
  const { startBehavior, years, isLoading } = props;

  const onStartNewYear = useCallback(async () => {
    await startBehavior.loadAllNames();
    startBehavior.taxBehavior.state.setYear(new Date().getFullYear() - 1);
    startBehavior.setNewYear(true);
  }, []);

  const alreadyHasCurrentYear = years.includes(new Date().getFullYear() - 1);

  return (
    <button
      className="new-year-button"
      onClick={onStartNewYear}
      disabled={isLoading || alreadyHasCurrentYear}
      title={
        isLoading
          ? "Server is busy. Please wait..."
          : alreadyHasCurrentYear
            ? "The current year is already available"
            : "Add a new tax year"
      }
    >
      Start new year <span className="arrow">→</span>
    </button>
  );
}
