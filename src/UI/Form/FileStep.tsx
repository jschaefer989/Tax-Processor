import type { TaxBehavior } from "../../api/TaxBehavior";
import type { Steps, TaxStep } from "../../data/TaxStep";
import BackButton from "./BackButton";
import FormHeader from "./FormHeader";

type FileStepProps = {
  readonly taxBehavior: TaxBehavior;
  readonly step: TaxStep;
  readonly isLoading: boolean;
};

export default function FileStep(props: FileStepProps) {
  const { taxBehavior, step, isLoading } = props;

  return (
    <>
      <FormHeader step={step} />
      <a
        className="button-link"
        href="https://www.freefilefillableforms.com/home/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Go to Free File Fillable Forms
      </a>
      <div className="panel__actions">
        <BackButton
          taxBehavior={taxBehavior}
          currentStep={step.step}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
