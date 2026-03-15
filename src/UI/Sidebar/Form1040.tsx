import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse, {
  TaxFieldLabel,
  TaxForm,
} from "../../DataModel/TaxResponse";
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

  const incomeResponses = getForm1040IncomeResponses(responses);

  if (incomeResponses.length === 0) {
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
    </FormHeader>
  );
}

function getForm1040IncomeResponses(responses: TaxResponse[]) {
  const incomeResponses: TaxResponse[] = [];
  for (const response of responses) {
    switch (response.label) {
      case TaxFieldLabel.oneA:
      case TaxFieldLabel.twoA:
      case TaxFieldLabel.twoB:
      case TaxFieldLabel.threeA:
      case TaxFieldLabel.threeB:
        incomeResponses.push(response);
        break;
    }
  }
  return incomeResponses;
}
