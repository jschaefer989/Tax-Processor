import { useEffect, useMemo } from "react";
import { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import ErrorMessage from "../General/ErrorMessage";
import BackButton from "./BackButton";
import FormFields from "./FormFields";
import FormFiles from "./FormFiles";
import FormHeader from "./FormHeader";
import NextButton from "./NextButton";
import FormButtons from "./FormButtons";

type MainFormProps = {
  readonly currentStep: Steps | undefined;
  readonly responses: TaxResponse[];
  readonly isLoading: boolean;
  readonly taxBehavior: TaxBehavior;
  readonly advancedWithErrors: boolean;
};

export default function MainForm(props: MainFormProps) {
  const { currentStep, responses, isLoading, taxBehavior, advancedWithErrors } =
    props;

  //#useMemo
  const step = useMemo(() => {
    if (!currentStep) {
      return undefined;
    }
    return taxBehavior.getStep(currentStep);
  }, [currentStep, taxBehavior]);
  //#endregion useMemo

  useEffect(() => {
    if (
      advancedWithErrors &&
      currentStep != undefined &&
      taxBehavior.getMissingFieldsForStep(currentStep, responses).length === 0
    ) {
      taxBehavior.state.setAdvancedWithErrors(false);
    }
  }, [responses, advancedWithErrors, currentStep]);

  if (isLoading) {
    return <div className="panel__loading">Loading your tax steps...</div>;
  }

  if (!currentStep || !step) {
    return <div className="panel__loading">No steps available yet.</div>;
  }

  return (
    <>
      <FormHeader step={step} />
      {advancedWithErrors && (
        <ErrorMessage text="Please fill out all required fields before advancing to the next step." />
      )}
      {step.fields && step.fields.length > 0 && (
        <FormFields
          step={step}
          responses={responses}
          taxBehavior={taxBehavior}
          advancedWithErrors={advancedWithErrors}
        />
      )}

      {step.files && step.files.length > 0 && (
        <FormFiles taxBehavior={taxBehavior} step={step} />
      )}

      {step.buttons && step.buttons.length > 0 && (
        <FormButtons
          step={step}
          responses={responses}
          taxBehavior={taxBehavior}
        />
      )}

      <div className="panel__actions">
        <BackButton
          taxBehavior={taxBehavior}
          currentStep={currentStep}
          isLoading={isLoading}
        />
        <NextButton
          taxBehavior={taxBehavior}
          currentStep={currentStep}
          isLoading={isLoading}
          responses={responses}
        />
      </div>
    </>
  );
}
