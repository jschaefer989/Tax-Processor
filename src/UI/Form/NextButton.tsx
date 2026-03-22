import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";

type NextButtonProps = {
  readonly taxBehavior: TaxBehavior;
  readonly currentStep: Steps;
  readonly isLoading: boolean;
  readonly responses: TaxResponse[];
};

export default function NextButton(props: NextButtonProps) {
  const { taxBehavior, currentStep, isLoading, responses } = props;

  const currentIndex = taxBehavior.getStepIndex(currentStep);

  const hasMissingFields =
    taxBehavior.getMissingFieldsForStep(currentStep, responses).length > 0;

  const handleNext = () => {
    if (hasMissingFields) {
      // Don't allow the user to advance if there are missing required fields, 
      // but record that they tried to advance so we can show validation errors.
      taxBehavior.state.setAdvancedWithErrors(true);
      return;
    }

    const nextIndex = Math.min(currentIndex + 1, taxBehavior.steps.length - 1);
    const nextStep = taxBehavior.steps[nextIndex];
    if (!nextStep) {
      return;
    }
    taxBehavior.state.setCurrentStep(nextStep.step);
    taxBehavior.state.setAdvancedWithErrors(false);
  };

  return (
    <button
      onClick={handleNext}
      disabled={currentIndex >= taxBehavior.steps.length - 1 || isLoading}
      title={
        isLoading
          ? "Server is busy. Please wait..."
          : hasMissingFields
            ? "Please fill in all required fields before proceeding."
            : "Go to the next step."
      }
    >
      Next step
    </button>
  );
}
