import type { TaxStep } from "../../DataModel/TaxStep";

type FormHeaderProps = {
  step: TaxStep;
}

export default function FormHeader(props: FormHeaderProps) {
  const { step } = props;

  return (
    <div className="panel__header">
      <div>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
      </div>
    </div>
  );
}
