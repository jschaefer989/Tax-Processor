import TaxResponse, { TaxFieldLabel, TaxForm } from "../../DataModel/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form1040Props {
  responses: TaxResponse[];
}

export default function Form1040(props: Form1040Props) {
  const { responses } = props;

  if (responses.length === 0) {
    return null;
  }

  const incomeResponses = getForm1040IncomeResponses(responses);

  if (incomeResponses.length === 0) {
    return null;
  }

  return (
    <FormHeader title="Form 1040">
      {incomeResponses.length > 0 && (
        <FormSection
          title="Income"
          responses={incomeResponses}
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
        incomeResponses.push(response);
        break;
    }
  }
  return incomeResponses;
}
