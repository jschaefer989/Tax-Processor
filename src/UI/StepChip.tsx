import { useCallback } from "react";
import { Steps } from "../DataModel/TaxStep";

interface StepProps {
  readonly step: Steps;
    readonly activeStep: Steps;
  readonly setActiveStep: (step: Steps) => void;
}

export function StepChip(props: StepProps) {
  const { step, activeStep, setActiveStep } = props;

  const handleClick = useCallback(() => {
    setActiveStep(step);
  }, [setActiveStep, step]);

  return (
    <button
      key={step}
      className={step === activeStep ? "selectedTab" : "tab"}
      onClick={handleClick}
    >
      {getStepLabel(step)}
    </button>
  );
}

function getStepLabel(step: Steps): string {
  switch (step) {
    case Steps.Income:
      return "Income";
    case Steps.TaxAndCredits:
      return "Tax and Credits";
    case Steps.PaymentsAndRefundableCredits:
      return "Payments and Refundable Credits";
    case Steps.RefundOwe:
      return "Refund or Owe";
  }
}
