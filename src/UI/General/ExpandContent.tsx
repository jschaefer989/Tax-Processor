import { useRef, useState, useEffect, useCallback } from "react";
import { type ExpandDirection } from "./ExpandButton";

type ExpandContentProps = {
  expanded: boolean;
  children: React.ReactNode;
  direction?: ExpandDirection;
  className?: string;
};

export function ExpandContent(props: ExpandContentProps) {
  const {
    expanded,
    children,
    direction = "down",
    className,
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const [contentSize, setContentSize] = useState<string>(
    expanded ? "none" : "0px",
  );
  const hasMounted = useRef(false);
  const prevExpanded = useRef(expanded);

  const isVertical =
    direction === "down" || direction === "up";

  const onTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      const sizeProperty = isVertical ? "max-height" : "max-width";
      if (event.propertyName !== sizeProperty) {
        return;
      }

      if (expanded) {
        setContentSize("none");
      }
    },
    [expanded, isVertical],
  );

  useEffect(() => {
    if (!hasMounted.current || !expanded || !contentInnerRef.current) {
      return;
    }

    if (contentSize === "none") {
      return;
    }

    setContentSize(`${getContentSize(contentInnerRef, isVertical)}px`);
  }, [children, contentSize, expanded, isVertical]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      prevExpanded.current = expanded;
      return;
    }

    if (prevExpanded.current === expanded || !contentRef.current) {
      return;
    }
    prevExpanded.current = expanded;

    const current = getContentSize(contentInnerRef, isVertical);

    if (!expanded) {
      setContentSize(`${current}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setContentSize("0px"));
      });
    } else {
      setContentSize("0px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() =>
          setContentSize(`${getContentSize(contentInnerRef, isVertical)}px`),
        );
      });
    }
  }, [expanded, isVertical]);

  return (
    <div
      ref={contentRef}
      className={className}
      onTransitionEnd={onTransitionEnd}
      style={{
        overflow: "hidden",
        ...(isVertical
          ? { maxHeight: contentSize }
          : { maxWidth: contentSize }),
        opacity: expanded ? 1 : 0,
        transition: isVertical
          ? "max-height 400ms ease, opacity 300ms ease"
          : "max-width 400ms ease, opacity 300ms ease",
      }}
    >
      <div ref={contentInnerRef}>{children}</div>
    </div>
  );
}

function getContentSize(
  contentInnerRef: React.RefObject<HTMLDivElement | null>,
  isVertical: boolean,
): number {
  if (!contentInnerRef.current) {
    return 0;
  }
  return isVertical
    ? contentInnerRef.current.scrollHeight
    : contentInnerRef.current.scrollWidth;
}
