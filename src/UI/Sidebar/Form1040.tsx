import TaxResponse from "../../DataModel/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form1040Props {
  responses: TaxResponse[];
  isExpandedOverride?: boolean;
}

export default function Form1040(props: Form1040Props) {
  const { responses, isExpandedOverride } = props;

  if (responses.length === 0) {
    return null;
  }

  return (
    <FormHeader title="Form 1040" isExpandedOverride={isExpandedOverride}>
      <FormSection
        title="Income"
        responses={TaxResponse.sortByLabel(responses)}
      />
    </FormHeader>
  );
}
