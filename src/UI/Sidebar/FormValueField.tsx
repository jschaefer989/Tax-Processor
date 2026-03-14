import { useCallback } from "react";
import ContextMenuOption, {
  ContextMenuIcon,
} from "../../DataModel/ContextMenuOption";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface FormValueFieldProps {
  taxBehavior: TaxBehavior;
  response: TaxResponse;
}

export default function FormValueField(props: FormValueFieldProps) {
  const { response, taxBehavior } = props;
  const { form, line } = response;

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
      taxBehavior.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption("Delete", onDeleteLine, ContextMenuIcon.Delete),
        ],
      });
    },
    [onDeleteLine],
  );

  if (response.value.trim() === "") {
    return null;
  }

  return (
    <div className="form-value-field" onContextMenu={onContextMenu}>
      <span className="form-value-label">
        {response.getUserFriendlyLabel()}
      </span>
      <span className="form-value">{response.value}</span>
    </div>
  );
}
