import { useCallback } from "react";
import type { StartBehavior } from "../../api/StartBehavior";
import { Steps } from "../../data/TaxStep";

type BeginButtonProps = {
  readonly startBehavior: StartBehavior;
  readonly tempName?: string;
  readonly isLoading: boolean;
};

export default function BeginButton(props: BeginButtonProps) {
  const { tempName, isLoading, startBehavior } = props;

  const onStart = useCallback(async () => {

    const stepsLoaded = await startBehavior.taxBehavior.loadSteps();
    if (!stepsLoaded) {
      return;
    }
    startBehavior.taxBehavior.state.setCurrentStep(Steps.Income);
    startBehavior.taxBehavior.state.setShowStartPage(false);
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
