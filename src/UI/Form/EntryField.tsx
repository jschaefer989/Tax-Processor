import { useMemo, useCallback, useEffect, useRef } from "react";
import type TaxField from "../../DataModel/TaxField";
import TaxResponse from "../../DataModel/TaxResponse";
import { type TaxForm, type TaxFieldLabel } from "../../DataModel/TaxResponse";
import { TaxFieldType } from "../../DataModel/TaxField";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type { TaxStep } from "../../DataModel/TaxStep";

interface EntryFieldComponentProps {
  readonly field: TaxField;
  readonly line: number;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly step: TaxStep;
  readonly form: TaxForm;
  readonly label: TaxFieldLabel;
  readonly lastTimeTriedAdvancing: Date | undefined;
}

export default function EntryField(props: EntryFieldComponentProps) {
  const {
    field,
    line,
    responses,
    taxBehavior,
    step,
    form,
    label,
    lastTimeTriedAdvancing,
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
      const convertedValue = await handleServerConversion(
        field,
        value,
        taxBehavior,
      );
      updateResponses(taxBehavior, form, label, line, convertedValue, field);
    },
    [
      field.form,
      field.taxFieldLabel,
      line,
      taxBehavior,
      step.step,
      form,
      label,
    ],
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
    Boolean(lastTimeTriedAdvancing) &&
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

async function handleServerConversion(
  field: TaxField,
  value: string,
  taxBehavior: TaxBehavior,
): Promise<string> {
  if (field.calculationCallback) {
    return (
      (await taxBehavior.calculateFieldRequest(
        field.calculationCallback,
        value,
      )) ?? ""
    );
  }
  return value;
}

function updateResponses(
  taxBehavior: TaxBehavior,
  form: TaxForm,
  label: TaxFieldLabel,
  line: number,
  value: string,
  field: TaxField,
) {
  taxBehavior.setResponses((prev) => {
    const existingIndex = prev.findIndex(
      (response) =>
        response.form === form &&
        response.label === label &&
        response.line === line,
    );
    if (existingIndex !== -1) {
      // Update existing response
      const updated = [...prev];
      updated[existingIndex] = new TaxResponse(form, label, line, value, {
        subsection: field.subsection,
      });
      return updated;
    } else {
      // Add new response
      return [
        ...prev,
        new TaxResponse(form, label, line, value, {
          subsection: field.subsection,
        }),
      ];
    }
  });
}
