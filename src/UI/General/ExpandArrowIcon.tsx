interface ExpandArrowIconProps {
    className?: string;
}

export default function ExpandArrowIcon(props: ExpandArrowIconProps) {
  const { className } = props;

  return (
    <svg 
    className={className}
      fill="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      style={{ display: "inline-block" }}
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="m2.43 4.8-2.43 2.422 12 11.978 12-11.978-2.43-2.422-9.57 9.547z"></path>
      </g>
    </svg>
  );
}
