import { useCallback } from "react";
import ExpandArrowIcon, { Orientation } from "../General/ExpandArrowIcon";

interface SidebarExpandButtonProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarExpandButton(props: SidebarExpandButtonProps) {
  const { sidebarExpanded, setSidebarExpanded } = props;

    const onClick = useCallback(() => {
        setSidebarExpanded(!sidebarExpanded);
    }, [sidebarExpanded])

  return (
    <div className="sidebar-toggle-wrapper">
      <button
        onClick={onClick}
        className="sidebar-toggle sidebar-toggle-center"
        aria-expanded={sidebarExpanded}
        title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <div className="sidebar-toggle-header">
          <ExpandArrowIcon
            orientation={sidebarExpanded ? Orientation.Left : Orientation.Right}
            size="10px"
          />
        </div>
      </button>
    </div>
  );
}
