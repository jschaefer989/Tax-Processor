import { useEffect, useState } from "react";
import { ExpandButton, ExpandDirection } from "../General/ExpandButton";
import { ExpandContent } from "../General/ExpandContent";

interface FormHeaderProps {
  title: string;
  children?: React.ReactNode;
  isExpandedOverride?: boolean;
}

export function FormHeader(props: FormHeaderProps) {
  const { title, children, isExpandedOverride } = props;

  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() =>{
    setIsExpanded(isExpandedOverride ?? true);
  }, [isExpandedOverride]);

  return (
    <div className="sidebar-card">
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
      <ExpandContent expanded={isExpanded}>
        {children}
      </ExpandContent>
    </div>
  );
}
