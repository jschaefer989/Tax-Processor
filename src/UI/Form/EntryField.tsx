import { useMemo, useCallback } from "react";
import type TaxField from "../../DataModel/TaxField";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { TaxForm, TaxFieldLabel } from "../../DataModel/TaxResponse";

interface EntryFieldComponentProps {
  field: TaxField;
  line: number;
  responses: TaxResponse[];
  onResponseChange: (form: TaxForm, label: TaxFieldLabel, line: number, value: string) => void;
}

export default function EntryField(props: EntryFieldComponentProps) {
  const { field, line, responses, onResponseChange } = props;

  //#region useMemo
  const value = useMemo(
    () => responses.find((r) => r.form === field.form && r.label === field.taxFieldLabel && r.line === line)?.value,
    [responses, field.form, field.taxFieldLabel, line],
  );
  //#endregion useMemo

  //#region useCallback
  const handleResponseChange = useCallback(
    (value: string) => {
      onResponseChange(field.form, field.taxFieldLabel, line, value);
    },
    [field.form, field.taxFieldLabel, line, onResponseChange],
  );
  //#endregion useCallback

  if (field.type === "select") {
    return (
      <select
        id={field.taxFieldLabel}
        value={value}
        onChange={(event) => handleResponseChange(event.target.value)}
      >
        <option value="">Select an option</option>
        {field.selectionOptions?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  const inputType =
    field.type === "currency" || field.type === "number"
      ? "number"
      : field.type;
  return (
    <input
      id={field.taxFieldLabel}
      type={inputType}
      inputMode={field.type === "currency" ? "decimal" : undefined}
      step={field.type === "currency" ? "0.01" : undefined}
      placeholder={field.type === "currency" ? "0.00" : undefined}
      value={value}
      onChange={(event) => handleResponseChange(event.target.value)}
    />
  );
}
