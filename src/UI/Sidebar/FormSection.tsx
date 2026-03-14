import { useState, type JSX } from "react";
import type TaxResponse from "../../DataModel/TaxResponse";
import { ExpandButton, ExpandDirection } from "../General/ExpandButton";
import { ExpandContent } from "../General/ExpandContent";
import FormValueField from "./FormValueField";

interface FormSectionProps {
  title?: string;
  responses: TaxResponse[];
}

export default function FormSection(props: FormSectionProps) {
  const { title, responses } = props;

  const [isExpanded, setIsExpanded] = useState(true);

  const fields: JSX.Element[] = [];
  let line = 0;
  for (const response of responses) {
    if (response.line !== line) {
      fields.push(<hr />);
      line = response.line;
    }
    fields.push(<FormValueField response={response} />);
  }

  return (
    <div className="sidebar-card sidebar-card--nested">
      <div
        className={`sidebar-section-header${isExpanded ? " sidebar-section-header--expanded" : ""}`}
      >
        {title && <h3>{title}</h3>}
        {title && (
          <ExpandButton
            expanded={isExpanded}
            setExpanded={setIsExpanded}
            title={isExpanded ? "Collapse section" : "Expand section"}
            direction={ExpandDirection.Down}
            inline={true}
          />
        )}
      </div>
      <ExpandContent expanded={isExpanded}>{fields}</ExpandContent>
    </div>
  );
}
