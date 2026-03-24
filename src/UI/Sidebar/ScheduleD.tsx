import type { TaxBehavior } from "../../api/TaxBehavior";
import TaxResponse, { type TaxForm } from "../../data/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

type ScheduleDProps = {
  taxBehavior: TaxBehavior;
  title: string;
  form: TaxForm;
  responses: TaxResponse[];
  isExpandedOverride?: boolean;
};

export default function ScheduleD(props: ScheduleDProps) {
  const { taxBehavior, title, form, responses, isExpandedOverride } = props;

  if (responses.length === 0) {
    return null;
  }
  return (
    <FormHeader
      taxBehavior={taxBehavior}
      form={form}
      title={title}
      isExpandedOverride={isExpandedOverride ?? false}
    >
      <FormSection taxBehavior={taxBehavior} responses={responses} />
    </FormHeader>
  );
}
