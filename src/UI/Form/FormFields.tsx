import type { TaxBehavior } from "../../api/TaxBehavior";
import TaxResponse from "../../data/TaxResponse";
import type { TaxStep } from "../../data/TaxStep";
import EntryField from "./EntryField";

type FormFieldsProps = {
  readonly step: TaxStep;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly advancedWithErrors: boolean;
}

export default function FormFields(props: FormFieldsProps) {
  const { step, responses, taxBehavior, advancedWithErrors } = props;

  return (
    <div className="fields">
      {step.fields.map((field) => (
        <label key={field.taxFieldLabel} className="field">
          <span>{field.label}</span>
          <EntryField
            line={0}
            field={field}
            responses={responses}
            taxBehavior={taxBehavior}
            form={field.form}
            label={field.taxFieldLabel}
            advancedWithErrors={advancedWithErrors}
          />
          {field.helperText ? <small>{field.helperText}</small> : null}
        </label>
      ))}
    </div>
  );
}
