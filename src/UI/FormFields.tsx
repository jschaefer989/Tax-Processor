import { useCallback } from "react";
import TaxResponse from "../DataModel/TaxResponse";
import type { TaxStep } from "../DataModel/TaxStep";
import EntryField from "./EntryField";

interface FormFieldsProps {
  step: TaxStep;
  responses: TaxResponse[];
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
}

export default function FormFields(props: FormFieldsProps) {
  const { step, responses, setResponses } = props;

  //#region useCallback
  const handleResponseChange = useCallback((fieldId: string, value: string) => {
    setResponses((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === fieldId);
      if (existingIndex !== -1) {
        // Update existing response
        const updated = [...prev];
        updated[existingIndex] = new TaxResponse(fieldId, value);
        return updated;
      } else {
        // Add new response
        return [...prev, new TaxResponse(fieldId, value)];
      }
    });
  }, []);
  //#endregion useCallback

  return (
    <div className="fields">
      {step.fields.map((field) => (
        <label key={field.id} className="field">
          <span>{field.label}</span>
          <EntryField
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
