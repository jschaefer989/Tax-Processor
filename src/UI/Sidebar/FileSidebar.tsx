import type TaxResponse from "../../DataModel/TaxResponse";
import { TaxFieldLabel, TaxForm } from "../../DataModel/TaxResponse";
import Form1040 from "./Form1040";
import Form8949Page1 from "./Form8949Page1";
import Form8949Page2 from "./Form8949Page2";

interface FileSidebarProps {
  readonly responses: TaxResponse[];
  readonly isExpanded: boolean;
}

export default function FileSidebar(props: FileSidebarProps) {
  const { responses, isExpanded } = props;

  const form1040Responses = responses.filter(
    (response) => response.form === TaxForm.Form1040,
  );

  const form8949Page1Responses = responses.filter(
    (response) =>
      response.form === TaxForm.Form8949Page1 &&
      response.label !== TaxFieldLabel.formCode,
  );

  const form8949Page2Responses = responses.filter(
    (response) =>
      response.form === TaxForm.Form8949Page2 &&
      response.label !== TaxFieldLabel.formCode,
  );

  return (
    <div className="sidebar-container">
      <div
        className={`sidebar-panel ${isExpanded ? "sidebar-panel--open" : "sidebar-panel--closed"}`}
      >
        <div className="panel__header">
          <div>
            <h2 style={{ marginTop: 0 }}>Tax form data</h2>
            <p>Review the data to be entered in your tax forms.</p>
            <br />
            {form1040Responses.length === 0 &&
              form8949Page1Responses.length === 0 &&
              form8949Page2Responses.length === 0 && (
                <i>Tax form data will appear here.</i>
              )}
            <Form1040 responses={form1040Responses} />
            <Form8949Page1 responses={form8949Page1Responses} />
            <Form8949Page2 responses={form8949Page2Responses} />
          </div>
        </div>
      </div>
    </div>
  );
}
