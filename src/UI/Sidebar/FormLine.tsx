import { useCallback } from "react";
import ContextMenuOption, {
  ContextMenuIcon,
} from "../../DataModel/ContextMenuOption";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import FormValueField from "./FormValueField";
import type { TaxForm } from "../../DataModel/TaxResponse";

interface FormLineProps {
  readonly taxBehavior: TaxBehavior;
  readonly form: TaxForm;
  readonly responses: TaxResponse[];
}

export default function FormLine(props: FormLineProps) {
  const { taxBehavior, form, responses } = props;

  const line = responses[0]?.line;
  const isBoxed = line !== undefined && line !== 0;
  4;

  const onDeleteLine = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete the data for this line on this form? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.setResponses((prevResponses) => {
        return prevResponses.filter(
          (currentResponse) =>
            !(currentResponse.form === form && currentResponse.line === line),
        );
      });
      taxBehavior.setContextMenu(undefined);
    }
  }, [form, line, taxBehavior]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      taxBehavior.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption(
            "Delete line " + line,
            onDeleteLine,
            ContextMenuIcon.Delete,
          ),
        ],
      });
    },
    [onDeleteLine],
  );

  return (
    <div
      className={`form-line${isBoxed ? " form-line--boxed" : ""}`}
      onContextMenu={isBoxed ? undefined : onContextMenu}
    >
      {isBoxed && <p>{line}</p>}
      {responses.map((response, index) => (
        <FormValueField
          key={index}
          taxBehavior={taxBehavior}
          response={response}
        />
      ))}
    </div>
  );
}
