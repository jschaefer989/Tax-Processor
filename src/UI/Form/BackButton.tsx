import { useCallback, useMemo } from "react";
import type { Steps } from "../../DataModel/TaxStep";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface BackButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly currentStep: Steps;
  readonly isLoading: boolean;
}

export default function BackButton(props: BackButtonProps) {
  const { taxBehavior, currentStep, isLoading } = props;

  const currentIndex = useMemo(
    () => taxBehavior.getStepIndex(currentStep),
    [currentStep, taxBehavior],
  );

  const handleBack = useCallback(() => {
    const nextIndex = Math.max(currentIndex - 1, 0);
    const nextStep = taxBehavior.steps[nextIndex];
    taxBehavior.state.setCurrentStep(nextStep.step);
  }, [currentIndex, taxBehavior.steps]);

  return (
    <button
      className="ghost"
      onClick={handleBack}
      disabled={currentIndex === 0 || isLoading}
      title={isLoading ? "Server is busy. Please wait..." : "Go back to the previous step."}
    >
      Back
    </button>
  );
}
