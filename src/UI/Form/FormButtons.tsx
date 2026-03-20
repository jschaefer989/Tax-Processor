import { useCallback } from "react";
import { FILING_STATUS_TO_API } from "../../DataModel/ServerNormalizer";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxButton from "../../DataModel/TaxButton";
import { FieldCalculationCallback } from "../../DataModel/TaxButton";
import type TaxResponse from "../../DataModel/TaxResponse";
import { TaxFieldLabel } from "../../DataModel/TaxResponse";
import type { TaxStep } from "../../DataModel/TaxStep";

interface FormButtonsProps {
  readonly step: TaxStep;
  readonly taxBehavior: TaxBehavior;
  readonly responses: TaxResponse[];
}

export default function FormButtons(props: FormButtonsProps) {
  const { step, taxBehavior, responses } = props;

  return (
    <div className="fields">
      {step.buttons.map((button) => (
        <label key={button.taxFieldLabel} className="field">
          <span>{button.label}</span>
          <FormButton
            button={button}
            responses={responses}
            taxBehavior={taxBehavior}
          />
        </label>
      ))}
    </div>
  );
}

interface FormButtonProps {
  readonly button: TaxButton;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
}

function FormButton(props: FormButtonProps) {
  const { button, responses, taxBehavior } = props;

  const onClick = useCallback(async () => {
    const convertedValue = await handleServerConversion(
      button,
      responses,
      taxBehavior,
    );
    if (convertedValue !== undefined) {
      taxBehavior.updateResponses(
        button.form,
        button.taxFieldLabel,
        0,
        convertedValue,
        button.subsection,
      );
    }
  }, [button, responses, taxBehavior]);

  return (
    <button
      id={button.taxFieldLabel}
      className="field-control field-control--action"
      onClick={onClick}
    >
      Do the math <span className="arrow">→</span>
    </button>
  );
}

async function handleServerConversion(
  button: TaxButton,
  responses: TaxResponse[],
  taxBehavior: TaxBehavior,
): Promise<string | undefined> {
  const value = getValueToPassToApi(button, responses);
  if (button.calculationCallback) {
    return await taxBehavior.calculateFieldRequest(
      button.calculationCallback,
      value,
    );
  }
  return value;
}

function getValueToPassToApi(
  button: TaxButton,
  responses: TaxResponse[],
): string {
  switch (button.calculationCallback) {
    case FieldCalculationCallback.StandardDeduction:
      const filingStatus = responses.find(
        (response) =>
          response.form === button.form &&
          response.label === TaxFieldLabel.FilingStatus,
      )?.value;
      return FILING_STATUS_TO_API[filingStatus ?? ""] ?? filingStatus ?? "";
    default:
      return "";
  }
}
