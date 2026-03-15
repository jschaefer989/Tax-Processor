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

  const onDeleteField = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this row? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.setResponses((prevResponses) => {
        return prevResponses.filter(
          (currentResponse) =>
            !(
              response.form === currentResponse.form &&
              response.line === currentResponse.line &&
              response.label === currentResponse.label &&
              response.value === currentResponse.value
            ),
        );
      });
      taxBehavior.setContextMenu(undefined);
    }
  }, [taxBehavior]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      taxBehavior.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption(
            "Delete row",
            onDeleteField,
            ContextMenuIcon.Delete,
          ),
        ],
      });
    },
    [onDeleteField],
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
