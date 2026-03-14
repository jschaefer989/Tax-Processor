import TaxResponse, { TaxFieldLabel } from "../../DataModel/TaxResponse";
import { FormHeader } from "./FormHeader";
import FormSection from "./FormSection";

interface Form8949Props {
  title: string;
  responses: TaxResponse[];
  isExpandedOverride?: boolean;
}

export default function Form8949(props: Form8949Props) {
  const { title, responses, isExpandedOverride } = props;

  if (responses.length === 0) {
    return null;
  }

  const responsesByFormCode = new Map<string, TaxResponse[]>();
  const responsesByLine = new Map<number, TaxResponse[]>();

  for (const response of responses) {
    if (responsesByLine.has(response.line)) {
      const existingResponse = responsesByLine.get(response.line);
      if (!existingResponse) {
        throw new Error(`Expected existing response for line ${response.line}`);
      }
      responsesByLine.set(response.line, [...existingResponse, response]);
    } else {
      responsesByLine.set(response.line, [response]);
    }
  }

  // Sort the responses in responsesByLine by label
  for (const [line, respArr] of responsesByLine.entries()) {
    responsesByLine.set(
      line,
      TaxResponse.sortByLabel(respArr),
    );
  }

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
      <FormHeader title={title} isExpandedOverride={isExpandedOverride}>
        <FormSection
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
            key={formCode}
            title={`${title}, Code ${formCode}`}
            isExpandedOverride={isExpandedOverride}
          >
            <FormSection
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
