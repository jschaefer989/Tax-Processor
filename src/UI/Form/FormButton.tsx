import { useCallback } from "react";
import type { TaxBehavior } from "../../api/TaxBehavior";
import type TaxButton from "../../data/TaxButton";
import type TaxResponse from "../../data/TaxResponse";

type FormButtonProps = {
  readonly button: TaxButton;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
}

export default function FormButton(props: FormButtonProps) {
  const { button, responses, taxBehavior } = props;

  const onClick = useCallback(async () => {
    const convertedValue = await taxBehavior.calculateFieldRequest(
      button.calculationCallback,
      responses,
    );
    console.log("Converted value for button", button.label, ":", convertedValue);
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
    <>
      <button
        id={button.taxFieldLabel}
        className="field-control field-control--action"
        onClick={onClick}
      >
        {button.label} <span className="arrow">→</span>
      </button>
      {button.helperText ? <small>{button.helperText}</small> : null}
    </>
  );
}
