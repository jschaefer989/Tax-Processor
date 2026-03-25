import { useCallback } from "react";
import ExpandArrowIcon, { type Orientation } from "./ExpandArrowIcon";

export type ExpandDirection =
  | "left"
  | "right"
  | "down"
  | "up";

type ExpandButtonProps = {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  title: string;
  direction?: ExpandDirection;
  inline?: boolean;
}

export default function ExpandButton(props: ExpandButtonProps) {
  const {
    expanded,
    setExpanded,
    title,
    direction = "left",
    inline = false,
  } = props;

  const onClick = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const buttonEl = (
    <button
      onClick={onClick}
      className={
        inline ? "expand-button-inline" : "sidebar-toggle sidebar-toggle-center"
      }
      aria-expanded={expanded}
      title={title}
    >
      <ExpandArrowIcon
        orientation={getOrientation(direction, expanded)}
        size={inline ? "12px" : "10px"}
      />
    </button>
  );

  if (!inline) {
    return <div className="panel-toggle-wrapper">{buttonEl}</div>;
  }

  return <>{buttonEl}</>;
}

function getOrientation(
  direction: ExpandDirection,
  expanded: boolean,
): Orientation {
  switch (direction) {
    case "left":
      return expanded ? "right" : "left";
    case "right":
      return expanded ? "left" : "right";
    case "down":
      return expanded ? "up" : "down";
    case "up":
      return expanded ? "down" : "up";
  }
}
