import TaxResponse from "../../DataModel/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form8949Page1Props {
  responses: TaxResponse[];
}

export default function Form8949Page1(props: Form8949Page1Props) {
  const { responses } = props;

  if (responses.length === 0) {
    return null;
  }

  return (
    <FormHeader title="Form 8949 - Page 1">
        <FormSection
          responses={responses}
        />
    </FormHeader>
  );
}
