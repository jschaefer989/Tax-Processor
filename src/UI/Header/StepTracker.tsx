import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import { Steps } from "../../DataModel/TaxStep";
import CheckmarkIcon from "../General/CheckMarkIcon";

interface StepTrackerProps {
  readonly taxBehavior: TaxBehavior;
  readonly activeStep: Steps;
  readonly responses: TaxResponse[];
}

export default function StepTracker(props: StepTrackerProps) {
  const { taxBehavior, activeStep, responses } = props;

  const steps = Object.values(Steps);

  return (
    <div className="stepper">
      <StepTrackerNumbers
        taxBehavior={taxBehavior}
        steps={steps}
        activeStep={activeStep}
        responses={responses}
      />
      <StepTrackerLabels steps={steps} activeStep={activeStep} />
    </div>
  );
}

interface StepTrackerNumbersProps {
  readonly taxBehavior: TaxBehavior;
  readonly steps: Steps[];
  readonly activeStep: Steps;
  readonly responses: TaxResponse[];
}

function StepTrackerNumbers(props: StepTrackerNumbersProps) {
  const { taxBehavior, steps, activeStep, responses } = props;

  const activeIndex = steps.indexOf(activeStep);

  return (
    <div className="stepper-track">
      {steps.map((step, index) => (
        <OneStepTrackerNumber
          key={step}
          taxBehavior={taxBehavior}
          step={step}
          index={index}
          activeIndex={activeIndex}
          steps={steps}
          activeStep={activeStep}
          responses={responses}
        />
      ))}
    </div>
  );
}

interface StepTrackerNumberProps {
  readonly taxBehavior: TaxBehavior;
  readonly step: Steps;
  readonly index: number;
  readonly activeIndex: number;
  readonly steps: Steps[];
  readonly activeStep: Steps;
  readonly responses: TaxResponse[];
}

function OneStepTrackerNumber(props: StepTrackerNumberProps) {
  const { taxBehavior, step, index, activeIndex, steps, activeStep, responses } = props;

  const isCompleted = index < activeIndex;
  const isActive = index === activeIndex;
  const stepNumber = index + 1;

  const onClick = () => {
    if (taxBehavior.getMissingFieldsForStep(activeStep, responses).length > 0) {
      // Don't allow the user to advance if there are missing required fields,
      // but record that they tried to advance so we can show validation errors.
      taxBehavior.state.setAdvancedWithErrors(true);      
      return;
    }

    taxBehavior.state.setCurrentStep(step);
    taxBehavior.state.setAdvancedWithErrors(false);  
  };

  return (
    <div key={step} className="stepper-item">
      <button
        className={`stepper-button ${
          isCompleted ? "completed" : isActive ? "active" : "inactive"
        }`}
        onClick={onClick}
        disabled={index > activeIndex + 1}
      >
        <div className="stepper-circle">
          {isCompleted ? <CheckmarkIcon /> : <span>{stepNumber}</span>}
        </div>
      </button>
      {index < steps.length - 1 && (
        <div className={`stepper-line ${isCompleted ? "completed" : ""}`} />
      )}
    </div>
  );
}

interface StepTrackerLabelsProps {
  readonly steps: Steps[];
  readonly activeStep: Steps;
}

function StepTrackerLabels(props: StepTrackerLabelsProps) {
  const { steps, activeStep } = props;

  const activeIndex = steps.indexOf(activeStep);

  return (
    <div className="stepper-labels">
      {steps.map((step, index) => (
        <OneStepTrackerLabel
          key={step}
          step={step}
          activeIndex={activeIndex}
          index={index}
        />
      ))}
    </div>
  );
}

interface OneStepTrackerLabelProps {
  readonly step: Steps;
  readonly activeIndex: number;
  readonly index: number;
}

function OneStepTrackerLabel(props: OneStepTrackerLabelProps) {
  const { step, activeIndex, index } = props;

  const isCompleted = index < activeIndex;
  const isActive = index === activeIndex;

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
