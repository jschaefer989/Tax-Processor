import { useCallback, useMemo } from "react";
import type { Steps } from "../../DataModel/TaxStep";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface NextButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly currentStep: Steps;
  readonly setCurrentStep: (step: Steps) => void;
  readonly isLoading: boolean;
}

export default function NextButton(props: NextButtonProps) {
  const { taxBehavior, currentStep, setCurrentStep, isLoading } = props;

  const currentIndex = useMemo(
    () => taxBehavior.getStepIndex(currentStep),
    [currentStep, taxBehavior],
  );

  const handleNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, taxBehavior.steps.length - 1);
    const nextStep = taxBehavior.steps[nextIndex];
    setCurrentStep(nextStep.step);
  }, [currentIndex, taxBehavior.steps, setCurrentStep]);

  return (
    <button
      onClick={handleNext}
      disabled={currentIndex >= taxBehavior.steps.length - 1 || isLoading}
      title={isLoading ? "Server is busy. Please wait..." : "Go to the next step."}
    >
      Next step
    </button>
  );
}
