import TaxResponse, { TaxFieldLabel } from "../../DataModel/TaxResponse";
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
    <div className="sidebar-card">
      <h3>Form 8949 - Part II</h3>
        <FormSection
          responses={responses}
        />
    </div>
  );
}
