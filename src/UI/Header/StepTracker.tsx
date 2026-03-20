import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import { Steps } from "../../DataModel/TaxStep";

// TODO: factor this out and make it more readable

interface StepTrackerProps {
  readonly taxBehavior: TaxBehavior;
  readonly activeStep: Steps;
}

export default function StepTracker(props: StepTrackerProps) {
  const { taxBehavior, activeStep } = props;
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
                onClick={() => taxBehavior.setCurrentStep(step)}
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
                {getStepLabel(step)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStepLabel(step: Steps): string {
  switch (step) {
    case Steps.Demographics:
      return "Demographics";
    case Steps.Income:
      return "Income";
    case Steps.TaxAndCredits:
      return "Tax and Credits";
    case Steps.PaymentsAndRefundableCredits:
      return "Payments and Refundable Credits";    
  }
}
