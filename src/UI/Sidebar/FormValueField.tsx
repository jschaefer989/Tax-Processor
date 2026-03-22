import { useCallback } from "react";
import ContextMenuOption from "../../DataModel/ContextMenuOption";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import { FormValue } from "./FormValue";

type FormValueFieldProps = {
  taxBehavior: TaxBehavior;
  response: TaxResponse;
};

export default function FormValueField(props: FormValueFieldProps) {
  const { response, taxBehavior } = props;

  const onDeleteField = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this row? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.state.setResponses((prevResponses) => {
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
      taxBehavior.state.setContextMenu(undefined);
    }
  }, [taxBehavior]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      taxBehavior.state.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption(
            "Delete row",
            onDeleteField,
            "Delete",
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
      <FormValue taxBehavior={taxBehavior} response={response} />
    </div>
  );
}
