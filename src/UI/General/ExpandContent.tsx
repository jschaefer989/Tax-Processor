import { useRef, useState, useEffect } from "react";

type ExpandDirection = "vertical" | "horizontal";

interface ExpandContentProps {
  expanded: boolean;
  children: React.ReactNode;
  direction?: ExpandDirection;
  className?: string;
}

export function ExpandContent(props: ExpandContentProps) {
  const { expanded, children, direction = "vertical", className } = props;

  const contentRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const [contentSize, setContentSize] = useState<string>("none");
  const prevExpanded = useRef(expanded);

  const isVertical = direction === "vertical";

  function getContentSize(): number {
    if (!contentInnerRef.current) return 0;
    return isVertical
      ? contentInnerRef.current.scrollHeight
      : contentInnerRef.current.scrollWidth;
  }

  useEffect(() => {
    if (contentInnerRef.current && contentSize === "none") {
      const size = `${getContentSize()}px`;
      setContentSize(size);
    }
  }, [children, isVertical]);

  useEffect(() => {
    if (prevExpanded.current === expanded || !contentRef.current) return;
    prevExpanded.current = expanded;

    const current = getContentSize();

    if (!expanded) {
      setContentSize(`${current}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setContentSize("0px"));
      });
    } else {
      setContentSize(`${current}px`);
    }
  }, [expanded, isVertical]);

  return (
    <div
      ref={contentRef}
      className={className}
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

