import type { TaxBehavior } from "../api/TaxBehavior";
import type { DuplicateResponse } from "../data/DuplicateResponse";
import DuplicateDataPopup from "./Form/DuplicateDataPopup";
import ContextMenu, { type ContextMenuProps } from "./General/ContextMenu";
import Toast from "./General/Toast";

type PageWrapperProps = {
  toastMessage: string | undefined;
  contextMenu: ContextMenuProps | undefined;
  duplicateResponses: DuplicateResponse[] | undefined;
  taxBehavior: TaxBehavior;
  onWhitespaceClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
};

export default function PageWrapper(props: PageWrapperProps) {
  const {
    toastMessage,
    contextMenu,
    duplicateResponses,
    taxBehavior,
    onWhitespaceClick,
    children,
  } = props;

  return (
    <div className="app" onClick={onWhitespaceClick}>
      {toastMessage && (
        <Toast toastMessage={toastMessage} taxBehavior={taxBehavior} />
      )}
      {contextMenu && <ContextMenu {...contextMenu} />}
      {duplicateResponses && (
        <DuplicateDataPopup
          taxBehavior={taxBehavior}
          duplicateResponses={duplicateResponses}
        />
      )}
      {children}
    </div>
  );
}
