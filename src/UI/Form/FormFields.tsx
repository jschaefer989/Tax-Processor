import { useCallback } from "react";
import TaxResponse, { TaxFieldLabel, TaxForm } from "../../DataModel/TaxResponse";
import type { TaxStep } from "../../DataModel/TaxStep";
import EntryField from "./EntryField";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface FormFieldsProps {
  step: TaxStep;
  responses: TaxResponse[];
  taxBehavior: TaxBehavior;
}

export default function FormFields(props: FormFieldsProps) {
  const { step, responses, taxBehavior } = props;

  //#region useCallback
  const handleResponseChange = useCallback((form: TaxForm, label: TaxFieldLabel, line: number, value: string) => {
    taxBehavior.setResponses((prev) => {
      const existingIndex = prev.findIndex((r) => r.form === form && r.label === label && r.line === line);
      if (existingIndex !== -1) {
        // Update existing response
        const updated = [...prev];
        updated[existingIndex] = new TaxResponse(form, label, line, value);
        return updated;
      } else {
        // Add new response
        return [...prev, new TaxResponse(form, label, line, value)];
      }
    });
  }, [taxBehavior]);
  //#endregion useCallback

  return (
    <div className="fields">
      {step.fields.map((field) => (
        <label key={field.taxFieldLabel} className="field">
          <span>{field.label}</span>
          <EntryField
            line={1}
            field={field}
            responses={responses}
            onResponseChange={handleResponseChange}
          />
          {field.helperText ? <small>{field.helperText}</small> : null}
        </label>
      ))}
    </div>
  );
}
