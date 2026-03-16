import { useMemo } from "react";
import { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse from "../../DataModel/TaxResponse";
import { Steps } from "../../DataModel/TaxStep";
import BackButton from "./BackButton";
import FormFields from "./FormFields";
import FormHeader from "./FormHeader";
import NextButton from "./NextButton";
import FormFiles from "./FormFiles";

interface MainFormProps {
  readonly currentStep: Steps | undefined;
  readonly responses: TaxResponse[];
  readonly isLoading: boolean;
  readonly taxBehavior: TaxBehavior;
}
export default function MainForm(props: MainFormProps) {
  const {
    currentStep,
    responses,
    isLoading,
    taxBehavior,
  } = props;

  //#useMemo
  const step = useMemo(() => {
    if (!currentStep) {
      return undefined;
    }
    return taxBehavior.getStep(currentStep);
  }, [currentStep, taxBehavior]);
  //#endregion useMemo

  if (isLoading) {
    return <div className="panel__loading">Loading your tax steps...</div>;
  }

  if (!currentStep || !step) {
    return <div className="panel__loading">No steps available yet.</div>;
  }

  return (
    <>
      <FormHeader step={step} />

      <FormFields
        step={step}
        responses={responses}
        taxBehavior={taxBehavior}
      />

      <FormFiles
        taxBehavior={taxBehavior}
        step={step}       
      />

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
        />
      </div>
    </>
  );
}
