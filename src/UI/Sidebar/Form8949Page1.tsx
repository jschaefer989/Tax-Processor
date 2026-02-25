import TaxResponse, { TaxFieldLabel } from "../../DataModel/TaxResponse";
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
    <div className="sidebar-card">
      <h3>Form 8949 - Part I</h3>
        <FormSection
          responses={responses}
        />
    </div>
  );
}
