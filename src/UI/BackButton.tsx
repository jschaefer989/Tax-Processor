import { useCallback, useMemo } from "react";
import type { Steps } from "../DataModel/TaxStep";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

interface BackButtonProps {
  readonly taxBehavior: TaxBehavior;
  readonly currentStep: Steps;
  readonly setCurrentStep: (step: Steps) => void;
}

export default function BackButton(props: BackButtonProps) {
  const { taxBehavior, currentStep, setCurrentStep } = props;

  const currentIndex = useMemo(
    () => taxBehavior.getStepIndex(currentStep),
    [currentStep, taxBehavior],
  );

  const handleBack = useCallback(() => {
    const nextIndex = Math.max(currentIndex - 1, 0);
    const nextStep = taxBehavior.steps[nextIndex];
    setCurrentStep(nextStep.step);
  }, [currentIndex, taxBehavior.steps, setCurrentStep]);

  return (
    <button
      className="ghost"
      onClick={handleBack}
      disabled={currentIndex === 0}
    >
      Back
    </button>
  );
}
