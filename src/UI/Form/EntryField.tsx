import { useCallback, useEffect, useMemo, useRef } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxField from "../../DataModel/TaxField";
import { TaxFieldType } from "../../DataModel/TaxField";
import TaxResponse, {
  type TaxFieldLabel,
  type TaxForm,
} from "../../DataModel/TaxResponse";

interface EntryFieldComponentProps {
  readonly field: TaxField;
  readonly line: number;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly form: TaxForm;
  readonly label: TaxFieldLabel;
  readonly advancedWithErrors: boolean;
}

export default function EntryField(props: EntryFieldComponentProps) {
  const {
    field,
    line,
    responses,
    taxBehavior,
    form,
    label,
    advancedWithErrors,
  } = props;
  const lastHandledValueRef = useRef("");
  const normalizedType = String(field.type).toLowerCase();

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
    async (value: string) => {
      lastHandledValueRef.current = value;
      taxBehavior.updateResponses(form, label, line, value, field.subsection);
    },
    [field.form, field.taxFieldLabel, line, taxBehavior, form, label, field.subsection],
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

  const hasValidationError =
    advancedWithErrors &&
    field.isRequired &&
    String(matchingValue ?? "").trim().length === 0;

  if (normalizedType === TaxFieldType.Select) {
    return (
      <select
        id={field.taxFieldLabel}
        className={
          hasValidationError
            ? "field-control field-control--error"
            : "field-control"
        }
        aria-invalid={hasValidationError}
        title={hasValidationError ? "This field is required" : undefined}
        value={matchingValue ?? ""}
        onChange={(event) => handleResponseChange(event.target.value)}
      >
        <option value="">Select an option</option>
        {field.selectionOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.displayText}
          </option>
        ))}
      </select>
    );
  }

  const inputType =
    normalizedType === TaxFieldType.Currency ||
    normalizedType === TaxFieldType.Number
      ? "number"
      : normalizedType;
  return (
    <input
      id={field.taxFieldLabel}
      className={
        hasValidationError
          ? "field-control field-control--error"
          : "field-control"
      }
      aria-invalid={hasValidationError}
      title={hasValidationError ? "This field is required" : undefined}
      type={inputType}
      inputMode={
        normalizedType === TaxFieldType.Currency ? "decimal" : undefined
      }
      step={normalizedType === TaxFieldType.Currency ? "0.01" : undefined}
      placeholder={
        normalizedType === TaxFieldType.Currency ? "0.00" : undefined
      }
      value={matchingValue ?? ""}
      onChange={(event) => handleResponseChange(event.target.value)}
    />
  );
}
