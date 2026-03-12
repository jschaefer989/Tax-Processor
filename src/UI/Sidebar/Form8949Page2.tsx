import TaxResponse, { TaxFieldLabel } from "../../DataModel/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form8949Page2Props {
  responses: TaxResponse[];
}

export default function Form8949Page2(props: Form8949Page2Props) {
  const { responses } = props;

  if (responses.length === 0) {
    return null;
  }

  return (
    <FormHeader title="Form 8949 - Page 2">
        <FormSection
          responses={responses}
        />
    </FormHeader>
  );
}
