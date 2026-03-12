import { useCallback, useEffect, useRef, useState } from "react";
import ExpandArrowIcon, { Orientation } from "./ExpandArrowIcon";

export enum ExpandDirection {
  Left,
  Right,
  Down,
  Up,
}

interface ExpandButtonProps {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  title: string;
  direction?: ExpandDirection;
  inline?: boolean;
}

export function ExpandButton(props: ExpandButtonProps) {
  const {
    expanded,
    setExpanded,
    title,
    direction = ExpandDirection.Left,
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
    case ExpandDirection.Left:
      return expanded ? Orientation.Right : Orientation.Left;
    case ExpandDirection.Right:
      return expanded ? Orientation.Left : Orientation.Right;
    case ExpandDirection.Down:
      return expanded ? Orientation.Up : Orientation.Down;
    case ExpandDirection.Up:
      return expanded ? Orientation.Down : Orientation.Up;
  }
}
