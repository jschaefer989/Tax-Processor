import { useMemo, useCallback, useEffect, useRef } from "react";
import type TaxField from "../../DataModel/TaxField";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { TaxForm, TaxFieldLabel } from "../../DataModel/TaxResponse";

interface EntryFieldComponentProps {
  field: TaxField;
  line: number;
  responses: TaxResponse[];
  onResponseChange: (
    form: TaxForm,
    label: TaxFieldLabel,
    line: number,
    value: string,
  ) => void;
}

export default function EntryField(props: EntryFieldComponentProps) {
  const { field, line, responses, onResponseChange } = props;
  const lastHandledValueRef = useRef("");

  //#region useMemo
  const matchingValue = useMemo(
    () =>
      responses.find(
        (response) =>
          response.form === field.form &&
          response.label === field.taxFieldLabel &&
          response.line === line,
      )?.value,
    [responses, field.form, field.taxFieldLabel, line],
  );
  //#endregion useMemo

  //#region useCallback
  const handleResponseChange = useCallback(
    (value: string) => {
      lastHandledValueRef.current = value;
      onResponseChange(field.form, field.taxFieldLabel, line, value);
    },
    [field.form, field.taxFieldLabel, line, onResponseChange],
  );
  //#endregion useCallback

  useEffect(() => {
    // Only react when the response for this exact field changes externally.
    if (lastHandledValueRef.current !== matchingValue) {
      if (matchingValue === undefined) {
        lastHandledValueRef.current = "";
      } else {
        handleResponseChange(matchingValue);
      }
    }
  }, [matchingValue]);

  if (field.type === "select") {
    return (
      <select
        id={field.taxFieldLabel}
        value={matchingValue ?? ""}
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
      value={matchingValue ?? ""}
      onChange={(event) => handleResponseChange(event.target.value)}
    />
  );
}
