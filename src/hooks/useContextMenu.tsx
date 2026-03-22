import { useCallback, useState } from "react";
import type { ContextMenuProps } from "../UI/General/ContextMenu";

type UseContextMenuResult = {
  contextMenu: ContextMenuProps | undefined;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuProps | undefined>>;
  onWhitespaceClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

type UseContextMenuProps = {
    keepOpenOnClick?: boolean;
}

export function useContextMenu(props?: UseContextMenuProps): UseContextMenuResult {
  const { keepOpenOnClick } = props ?? {};

  const [contextMenu, setContextMenu] = useState<ContextMenuProps | undefined>(
    undefined,
  );

    const onWhitespaceClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (keepOpenOnClick && target.closest(".context-menu")) return;
        setContextMenu(undefined);
    }, [keepOpenOnClick]);

    return {
        contextMenu,
        setContextMenu,
        onWhitespaceClick,
    }
}
