import { type ContextMenuIcon } from "../../data/ContextMenuOption";
import ContextMenuOption from "../../data/ContextMenuOption";

export type ContextMenuProps = {
    x: number;
    y: number;
    options: ContextMenuOption[];
};

export default function ContextMenu(props: ContextMenuProps) {
    const { x, y, options } = props;

    return (
        <div className="context-menu" style={{ top: y, left: x }}>
            {options.map((option) => (
                <div key={option.label} className="context-menu-option" onClick={option.onClick}>
                    {option.label}
                    {option.icon && <Icon icon={option.icon} />}
                </div>
            ))}
        </div>
    )
}

type IconProps = {
    icon: ContextMenuIcon;
};

function Icon(props: IconProps) {
    const { icon } = props;
    switch (icon) {
        // case ContextMenuIcon.Edit:
        //     return <span className="context-menu-icon">✏️</span>;
        case "Delete":
            return <span className="context-menu-icon">🗑️</span>;
        default:
            return null;
    }
}