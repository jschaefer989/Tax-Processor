export enum Orientation {
    Down = "down",
    Up = "up",
    Left = "left",
    Right = "right"
}

interface ExpandArrowIconProps {
    className?: string;
    size?: number | string;
    orientation?: Orientation;
}

export default function ExpandArrowIcon(props: ExpandArrowIconProps) {
  const { className, size, orientation } = props;

  return (
    <svg 
    className={className}
      fill="white" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? "1em"}
      height={size ?? "1em"}
      style={{ display: "inline-block", transform: orientation ? `rotate(${getRotation(orientation)}deg)` : undefined }}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="m2.43 4.8-2.43 2.422 12 11.978 12-11.978-2.43-2.422-9.57 9.547z"></path>
      </g>
    </svg>
  );
}

function getRotation(orientation: Orientation): number {
  switch (orientation) {
    case Orientation.Up:
      return 180;
    case Orientation.Left:
      return -90;
    case Orientation.Right:
      return 90;
    case Orientation.Down:
    default:
      return 0;
  }
}
