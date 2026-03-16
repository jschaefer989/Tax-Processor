import { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse, { TaxForm } from "../../DataModel/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form8949Props {
  taxBehavior: TaxBehavior;
  title: string;
  form: TaxForm;
  responses: TaxResponse[];
  isExpandedOverride?: boolean;
}

export default function Form8949(props: Form8949Props) {
  const { taxBehavior, title, form, responses, isExpandedOverride } = props;

  if (responses.length === 0) {
    return null;
  }

  const responsesByFormCode = new Map<string, TaxResponse[]>();
  const responsesByLine = TaxBehavior.getResponsesByLine(responses);

  for (const responsesForLine of responsesByLine.values()) {
    const formCode = responsesForLine[0]?.formCode;

    if (!formCode) {
      continue;
    }

    const existingResponse = responsesByFormCode.get(formCode) ?? [];
    responsesByFormCode.set(formCode, [
      ...existingResponse,
      ...responsesForLine,
    ]);
  }

  if (responsesByFormCode.size === 0) {
    return (
      <FormHeader
        taxBehavior={taxBehavior}
        form={form}
        title={title}
        isExpandedOverride={isExpandedOverride}
      >
        <FormSection taxBehavior={taxBehavior} responses={responses} />
      </FormHeader>
    );
  }

  return (
    <>
      {Array.from(responsesByFormCode.entries()).map(
        ([formCode, responsesForCode]) => (
          <FormHeader
            taxBehavior={taxBehavior}
            form={form}
            key={formCode}
            title={`${title}, Code ${formCode}`}
            isExpandedOverride={isExpandedOverride}
            formCode={formCode}
          >
            <FormSection
              taxBehavior={taxBehavior}
              responses={responsesForCode}
            />
          </FormHeader>
        ),
      )}
    </>
  );
}
