import type { TaxBehavior } from "../../api/TaxBehavior";
import type TaxResponse from "../../data/TaxResponse";
import { Steps } from "../../data/TaxStep";
import CheckmarkIcon from "../General/CheckmarkIcon";

type StepTrackerProps = {
  readonly taxBehavior: TaxBehavior;
  readonly activeStep: Steps;
  readonly responses: TaxResponse[];
};

export default function StepTracker(props: StepTrackerProps) {
  const { taxBehavior, activeStep, responses } = props;

  return (
    <div className="stepper">
      <StepTrackerNumbers
        taxBehavior={taxBehavior}
        steps={Object.values(Steps)}
        activeStep={activeStep}
        responses={responses}
      />
      <StepTrackerLabels steps={Object.values(Steps)} activeStep={activeStep} />
    </div>
  );
}

type StepTrackerNumbersProps = {
  readonly taxBehavior: TaxBehavior;
  readonly steps: Steps[];
  readonly activeStep: Steps;
  readonly responses: TaxResponse[];
};

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

type StepTrackerNumberProps = {
  readonly taxBehavior: TaxBehavior;
  readonly step: Steps;
  readonly index: number;
  readonly activeIndex: number;
  readonly steps: Steps[];
  readonly activeStep: Steps;
  readonly responses: TaxResponse[];
};

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

type StepTrackerLabelsProps = {
  readonly steps: Steps[];
  readonly activeStep: Steps;
};

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

type OneStepTrackerLabelProps = {
  readonly step: Steps;
  readonly activeIndex: number;
  readonly index: number;
};

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
    case "demographics":
      return "Demographics";
    case "income":
      return "Income";
    case "taxAndCredits":
      return "Tax and Credits";
    case "file":
      return "File";
    default:
      return step;
  }
}
