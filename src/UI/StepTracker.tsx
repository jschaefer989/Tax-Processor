import { Steps } from "../DataModel/TaxStep";

interface StepTrackerProps {
  readonly activeStep: Steps;
  readonly setActiveStep: (step: Steps) => void;
}

const stepLabels: Record<Steps, string> = {
  [Steps.Income]: "Income",
  [Steps.TaxAndCredits]: "Tax and Credits",
  [Steps.PaymentsAndRefundableCredits]: "Payments and Refundable Credits",
  [Steps.RefundOwe]: "Refund or Owe",
};

export default function StepTracker(props: StepTrackerProps) {
  const { activeStep, setActiveStep } = props;
  const steps = Object.values(Steps);
  const activeIndex = steps.indexOf(activeStep);

  return (
    <div className="stepper">
      <div className="stepper-track">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = step === activeStep;
          const stepNumber = index + 1;

          return (
            <div key={step} className="stepper-item">
              <button
                className={`stepper-button ${
                  isCompleted ? "completed" : isActive ? "active" : "inactive"
                }`}
                onClick={() => setActiveStep(step)}
              >
                <div className="stepper-circle">
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13.3333 4L6 11.3333L2.66667 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className={`stepper-line ${
                  isCompleted ? "completed" : ""
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="stepper-labels">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = step === activeStep;
          
          return (
            <div key={step} className="stepper-label-wrapper">
              <div 
                className={`stepper-label ${
                  isCompleted ? "completed" : isActive ? "active" : "inactive"
                }`}
              >
                {stepLabels[step]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
