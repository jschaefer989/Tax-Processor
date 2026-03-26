import type { TaxBehavior } from "../../api/TaxBehavior";
import TaxResponse from "../../data/TaxResponse";
import { Steps } from "../../data/TaxStep";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

type Form1040Props = {
  taxBehavior: TaxBehavior;
  responses: TaxResponse[];
  isExpandedOverride?: boolean;
};

export default function Form1040(props: Form1040Props) {
  const { taxBehavior, responses, isExpandedOverride } = props;

  if (responses.length === 0) {
    return null;
  }

  const demographicsResponses = responses.filter(
    (response) => hasSubsection(response, Steps.Demographics),
  );

  const incomeResponses = responses.filter(
    (response) => hasSubsection(response, Steps.Income),
  );

  const taxAndCreditsResponses = responses.filter(
    (response) => hasSubsection(response, Steps.TaxAndCredits),
  );

  if (
    demographicsResponses.length === 0 &&
    incomeResponses.length === 0 &&
    taxAndCreditsResponses.length === 0
  ) {
    return null;
  }

  return (
    <FormHeader
      taxBehavior={taxBehavior}
      title="Form 1040"
      form="Form1040"
      isExpandedOverride={isExpandedOverride}
    >
      {demographicsResponses.length > 0 && (
        <FormSection
          taxBehavior={taxBehavior}
          title="Demographics"
          responses={TaxResponse.sortByLabel(demographicsResponses)}
        />
      )}
      {incomeResponses.length > 0 && (
        <FormSection
          taxBehavior={taxBehavior}
          title="Income"
          responses={TaxResponse.sortByLabel(incomeResponses)}
        />
      )}
      {taxAndCreditsResponses.length > 0 && (
        <FormSection
          taxBehavior={taxBehavior}
          title="Tax and Credits"
          responses={TaxResponse.sortByLabel(taxAndCreditsResponses)}
        />
      )}     
    </FormHeader>
  );
}

  function hasSubsection(response: TaxResponse, step: Steps) {
    return response.getSubsection() === step.toLowerCase();
  }
