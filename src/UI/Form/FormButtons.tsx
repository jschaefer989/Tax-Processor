import type { TaxBehavior } from "../../api/TaxBehavior";
import type TaxResponse from "../../data/TaxResponse";
import type { TaxStep } from "../../data/TaxStep";
import FormButton from "./FormButton";

type FormButtonsProps = {
  readonly step: TaxStep;
  readonly taxBehavior: TaxBehavior;
  readonly responses: TaxResponse[];
}

export default function FormButtons(props: FormButtonsProps) {
  const { step, taxBehavior, responses } = props;

  return (
    <div className="fields fields--calculations">
      <h3 className="form-section-header">Calculations</h3>
      {step.buttons.map((button) => (
        <FormButton
          key={button.taxFieldLabel}
          button={button}
          responses={responses}
          taxBehavior={taxBehavior}
        />
      ))}
    </div>
  );
}
