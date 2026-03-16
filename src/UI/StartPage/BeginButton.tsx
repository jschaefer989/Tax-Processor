import { useCallback } from "react";
import { Steps } from "../../DataModel/TaxStep";
import type { StartBehavior } from "../../DataModel/StartBehavior";

interface BeginButtonProps {
  readonly startBehavior: StartBehavior;
  readonly tempName?: string;
  readonly isLoading: boolean;
}

export default function BeginButton(props: BeginButtonProps) {
  const { tempName, isLoading, startBehavior } = props;

  const onStart = useCallback(async () => {
    const stepsLoaded = await startBehavior.taxBehavior.loadSteps();
    if (!stepsLoaded) {
      return;
    }
    startBehavior.taxBehavior.setCurrentStep(Steps.Income);
    startBehavior.taxBehavior.setShowStartPage(false);
  }, [startBehavior]);

  return (
    <button
      className="begin-button"
      onClick={onStart}
      disabled={isLoading || tempName?.trim() === ""}
      title={isLoading ? "Server is busy. Please wait..." : ""}
    >
      Begin
    </button>
  );
}
