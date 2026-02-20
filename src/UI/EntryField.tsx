import { useMemo, useCallback } from "react";
import type TaxField from "../DataModel/TaxField";
import type TaxResponse from "../DataModel/TaxResponse";

interface EntryFieldComponentProps {
  field: TaxField;
  responses: TaxResponse[];
  onResponseChange: (fieldId: string, value: string) => void;
}

export default function EntryField(props: EntryFieldComponentProps) {
  const { field, responses, onResponseChange } = props;

  //#region useMemo
  const value = useMemo(
    () => responses.find((r) => r.id === field.id)?.value,
    [responses, field.id],
  );
  //#endregion useMemo

  //#region useCallback
  const handleResponseChange = useCallback(
    (value: string) => {
      onResponseChange(field.id, value);
    },
    [field.id, onResponseChange],
  );
  //#endregion useCallback

  if (field.type === "select") {
    return (
      <select
        id={field.id}
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
      id={field.id}
      type={inputType}
      inputMode={field.type === "currency" ? "decimal" : undefined}
      step={field.type === "currency" ? "0.01" : undefined}
      placeholder={field.type === "currency" ? "0.00" : undefined}
      value={value}
      onChange={(event) => handleResponseChange(event.target.value)}
    />
  );
}
