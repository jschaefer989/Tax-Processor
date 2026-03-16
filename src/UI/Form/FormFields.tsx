import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse from "../../DataModel/TaxResponse";
import type { TaxStep } from "../../DataModel/TaxStep";
import EntryField from "./EntryField";

interface FormFieldsProps {
  step: TaxStep;
  responses: TaxResponse[];
  taxBehavior: TaxBehavior;
}

export default function FormFields(props: FormFieldsProps) {
  const { step, responses, taxBehavior } = props;

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
            step={step}
            form={field.form}
            label={field.taxFieldLabel}

          />
          {field.helperText ? <small>{field.helperText}</small> : null}
        </label>
      ))}
    </div>
  );
}
