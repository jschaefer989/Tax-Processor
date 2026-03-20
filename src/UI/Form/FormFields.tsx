import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse from "../../DataModel/TaxResponse";
import type { TaxStep } from "../../DataModel/TaxStep";
import EntryField from "./EntryField";

interface FormFieldsProps {
  readonly step: TaxStep;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly lastTimeTriedAdvancing: Date | undefined;
}

export default function FormFields(props: FormFieldsProps) {
  const { step, responses, taxBehavior, lastTimeTriedAdvancing } = props;

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
            lastTimeTriedAdvancing={lastTimeTriedAdvancing}
          />
          {field.helperText ? <small>{field.helperText}</small> : null}
        </label>
      ))}
    </div>
  );
}
