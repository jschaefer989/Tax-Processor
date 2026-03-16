import { useCallback, useEffect, useState } from "react";
import { ExpandButton, ExpandDirection } from "../General/ExpandButton";
import { ExpandContent } from "../General/ExpandContent";
import ContextMenuOption, {
  ContextMenuIcon,
} from "../../DataModel/ContextMenuOption";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import {
  AdditionalIdentifierLabel,
  TaxForm,
} from "../../DataModel/TaxResponse";

interface FormHeaderProps {
  taxBehavior: TaxBehavior;
  title: string;
  form: TaxForm;
  additionalIdentifiers?: Map<AdditionalIdentifierLabel, string>; // Used to distinguish multiple sections of the same form, e.g. Form8949 page 1 vs page 2.
  children?: React.ReactNode;
  isExpandedOverride?: boolean;
}

export function FormHeader(props: FormHeaderProps) {
  const {
    taxBehavior,
    title,
    form,
    additionalIdentifiers,
    children,
    isExpandedOverride,
  } = props;

  const [isExpanded, setIsExpanded] = useState(true);

  const onDeleteForm = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all the data for this form? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.setResponses((prevResponses) => {
        return prevResponses.filter(
          (currentResponse) =>
            !(
              currentResponse.form === form &&
              currentResponse.additionalIdentifiers?.get(
                AdditionalIdentifierLabel.formCode,
              ) ===
                additionalIdentifiers?.get(AdditionalIdentifierLabel.formCode)
            ),
        );
      });
      taxBehavior.setContextMenu(undefined);
    }
  }, [taxBehavior, form, additionalIdentifiers]);

  const onContextMenuTitle = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      taxBehavior.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption(
            "Delete " + title,
            onDeleteForm,
            ContextMenuIcon.Delete,
          ),
        ],
      });
    },
    [onDeleteForm, title],
  );

  useEffect(() => {
    setIsExpanded(isExpandedOverride ?? true);
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
          direction={ExpandDirection.Down}
          inline={true}
        />
      </div>
      <ExpandContent expanded={isExpanded}>{children}</ExpandContent>
    </div>
  );
}
