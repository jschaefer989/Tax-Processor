import { useMemo } from "react";
import { TaxBehavior } from "../DataModel/TaxBehavior";
import TaxResponse from "../DataModel/TaxResponse";
import { Steps } from "../DataModel/TaxStep";
import BackButton from "./BackButton";
import FormFields from "./FormFields";
import FormHeader from "./FormHeader";
import NextButton from "./NextButton";

interface MainFormProps {
  currentStep: Steps | undefined;
  responses: TaxResponse[];
  isLoading: boolean;
  error: string | undefined;
  taxBehavior: TaxBehavior;
  setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
}
export default function MainForm(props: MainFormProps) {
  const {
    currentStep,
    responses,
    isLoading,
    error,
    taxBehavior,
    setCurrentStep,
    setResponses,
  } = props;

  //#useMemo
  const step = useMemo(() => {
    if (!currentStep) {
      return undefined;
    }
    return taxBehavior.getStep(currentStep);
  }, [currentStep]);
  //#endregion useMemo

  if (isLoading) {
    return <div className="panel__loading">Loading your tax steps...</div>;
  }

  if (error) {
    return <div className="panel__error">{error}</div>;
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
        setResponses={setResponses}
      />

      <div className="panel__actions">
        <BackButton
          taxBehavior={taxBehavior}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <NextButton
          taxBehavior={taxBehavior}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </div>
    </>
  );
}
