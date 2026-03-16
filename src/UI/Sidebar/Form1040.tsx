import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse, {
  TaxForm,
} from "../../DataModel/TaxResponse";
import { Steps } from "../../DataModel/TaxStep";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form1040Props {
  taxBehavior: TaxBehavior;
  responses: TaxResponse[];
  isExpandedOverride?: boolean;
}

export default function Form1040(props: Form1040Props) {
  const { taxBehavior, responses, isExpandedOverride } = props;

  if (responses.length === 0) {
    return null;
  }

  const incomeResponses = responses.filter(
    (response) => hasSubsection(response, Steps.Income),
  );

  const taxAndCreditsResponses = responses.filter(
    (response) => hasSubsection(response, Steps.TaxAndCredits),
  );

  const paymentsAndRefundableCreditsResponses = responses.filter(
    (response) => hasSubsection(response, Steps.PaymentsAndRefundableCredits),
  );

  const refundOrOweResponses = responses.filter(
    (response) => hasSubsection(response, Steps.RefundOwe),
  );

  if (
    incomeResponses.length === 0 &&
    taxAndCreditsResponses.length === 0 &&
    paymentsAndRefundableCreditsResponses.length === 0 &&
    refundOrOweResponses.length === 0
  ) {
    return null;
  }

  return (
    <FormHeader
      taxBehavior={taxBehavior}
      title="Form 1040"
      form={TaxForm.Form1040}
      isExpandedOverride={isExpandedOverride}
    >
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
      {paymentsAndRefundableCreditsResponses.length > 0 && (
        <FormSection
          taxBehavior={taxBehavior}
          title="Payments and Refundable Credits"
          responses={TaxResponse.sortByLabel(
            paymentsAndRefundableCreditsResponses,
          )}
        />
      )}
      {refundOrOweResponses.length > 0 && (
        <FormSection
          taxBehavior={taxBehavior}
          title="Refund or Amount Owed"
          responses={TaxResponse.sortByLabel(refundOrOweResponses)}
        />
      )}
    </FormHeader>
  );
}

  function hasSubsection(response: TaxResponse, step: Steps) {
    return response.getSubsection() === step.toLowerCase();
  }
