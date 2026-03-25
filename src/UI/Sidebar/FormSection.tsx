import { useCallback, useState, type JSX } from "react";
import ContextMenuOption from "../../data/ContextMenuOption";
import { TaxBehavior } from "../../api/TaxBehavior";
import TaxResponse from "../../data/TaxResponse";
import ExpandButton from "../General/ExpandButton";
import { ExpandContent } from "../General/ExpandContent";
import FormLine from "./FormLine";

type FormSectionProps = {
  taxBehavior: TaxBehavior;
  title?: string;
  responses: TaxResponse[];
};

export default function FormSection(props: FormSectionProps) {
  const { taxBehavior, title, responses } = props;

  const [isExpanded, setIsExpanded] = useState(true);

  const onDeleteSection = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all the data for this section? This cannot be undone.",
    );
    if (confirmed) {
      taxBehavior.state.setResponses((prevResponses) => {
        return prevResponses.filter(
          (currentResponse) =>
            !responses.some(
              (response) =>
                response.form === currentResponse.form &&
                response.formCode === currentResponse.formCode &&
                response.line === currentResponse.line &&
                response.label === currentResponse.label &&
                response.subsection === currentResponse.subsection,
            ),
        );
      });
      taxBehavior.state.setContextMenu(undefined);
    }
  }, [responses, taxBehavior]);

  const onContextMenuTitle = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      taxBehavior.state.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption(
            "Delete " + (title ?? "section"), 
            onDeleteSection,
            "Delete",
          ),
        ],
      });
    },
    [onDeleteSection],
  );

  const lines: JSX.Element[] = [];
  TaxBehavior.getResponsesByLine(responses).forEach(
    (responsesForLine, line) => {
      lines.push(
        <FormLine
          key={line}
          taxBehavior={taxBehavior}
          form={responsesForLine[0].form}
          responses={TaxResponse.sortByLabel(responsesForLine)}
        />,
      );
    },
  );

  return (
    <div
      className="sidebar-card sidebar-card--nested"
      onContextMenu={onContextMenuTitle}
    >
      <div
        className={`sidebar-section-header${isExpanded ? " sidebar-section-header--expanded" : ""}`}
      >
        {title && <h3>{title}</h3>}
        {title && (
          <ExpandButton
            expanded={isExpanded}
            setExpanded={setIsExpanded}
            title={isExpanded ? "Collapse section" : "Expand section"}
            direction="down"
            inline={true}
          />
        )}
      </div>
      <ExpandContent expanded={isExpanded} direction="down">
        {lines}
      </ExpandContent>
    </div>
  );
}
