export type ContextMenuIcon = "Delete";

export default class ContextMenuOption {
    label: string
    onClick: () => void;
    icon?: ContextMenuIcon;

    constructor(label: string, onClick: () => void, icon?: ContextMenuIcon) {
        this.label = label;
        this.onClick = onClick;
        this.icon = icon;
    }
}