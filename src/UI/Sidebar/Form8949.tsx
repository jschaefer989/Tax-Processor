import { TaxBehavior } from "../../DataModel/TaxBehavior";
import TaxResponse, {
  TaxFieldLabel,
  TaxForm,
} from "../../DataModel/TaxResponse";
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
  
  for (const response of responses) {
    if (response.label === TaxFieldLabel.formCode) {
      const formCode = response.value;
      const responsesForLine = responsesByLine.get(response.line);
      if (!responsesForLine) {
        throw new Error(`Expected responses for line ${response.line}`);
      }

      if (responsesByFormCode.has(formCode)) {
        const existingResponse = responsesByFormCode.get(formCode);
        if (!existingResponse) {
          throw new Error(
            `Expected existing response for form code ${formCode}`,
          );
        }
        responsesByFormCode.set(formCode, [
          ...existingResponse,
          ...responsesForLine,
        ]);
      } else {
        responsesByFormCode.set(formCode, [...responsesForLine]);
      }
    }
  }

  if (responsesByFormCode.size === 0) {
    return (
      <FormHeader
        taxBehavior={taxBehavior}
        form={form}
        title={title}
        isExpandedOverride={isExpandedOverride}
      >
        <FormSection
          taxBehavior={taxBehavior}
          responses={responses.filter(
            (response) => response.label !== TaxFieldLabel.formCode,
          )}
        />
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
          >
            <FormSection
              taxBehavior={taxBehavior}
              responses={responsesForCode.filter(
                (response) => response.label !== TaxFieldLabel.formCode,
              )}
            />
          </FormHeader>
        ),
      )}
    </>
  );
}
