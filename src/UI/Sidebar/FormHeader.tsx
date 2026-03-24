import { useCallback, useEffect, useState } from "react";
import { ExpandButton } from "../General/ExpandButton";
import { ExpandContent } from "../General/ExpandContent";
import ContextMenuOption from "../../data/ContextMenuOption";
import type { TaxBehavior } from "../../api/TaxBehavior";
import { type TaxForm } from "../../data/TaxResponse";

type FormHeaderProps = {
  taxBehavior: TaxBehavior;
  title: string;
  form: TaxForm;
  formCode?: string;
  children?: React.ReactNode;
  isExpandedOverride?: boolean;
};

export function FormHeader(props: FormHeaderProps) {
  const { taxBehavior, title, form, formCode, children, isExpandedOverride } =
    props;

  const [isExpanded, setIsExpanded] = useState(isExpandedOverride ?? true);

  const onDeleteForm = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all the data for this form? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.state.setResponses((prevResponses) => {
        return prevResponses.filter(
          (currentResponse) =>
            !(
              currentResponse.form === form &&
              currentResponse.formCode === formCode
            ),
        );
      });
      taxBehavior.state.setContextMenu(undefined);
    }
  }, [taxBehavior, form, formCode]);

  const onContextMenuTitle = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      taxBehavior.state.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption(
            "Delete " + title,
            onDeleteForm,
            "Delete",
          ),
        ],
      });
    },
    [onDeleteForm, title],
  );

  useEffect(() => {
    if (isExpandedOverride !== undefined) {
      setIsExpanded(isExpandedOverride);
    }
  }, [isExpandedOverride]);

  return (
    <div className="sidebar-card" onContextMenu={onContextMenuTitle}>
      <div
        className={`sidebar-section-header${isExpanded ? " sidebar-section-header--expanded" : ""}`}
      >
        <h3>{title}</h3>
        <ExpandButton
          expanded={isExpanded}
          setExpanded={setIsExpanded}
          title={isExpanded ? "Collapse section" : "Expand section"}
          direction="down"
          inline={true}
        />
      </div>
      <ExpandContent expanded={isExpanded} direction="down">
        {children}
      </ExpandContent>
    </div>
  );
}
