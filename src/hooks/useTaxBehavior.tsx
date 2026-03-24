import { useMemo, useState } from "react";
import { TaxBehavior } from "../api/TaxBehavior";
import type TaxResponse from "../data/TaxResponse";
import type { Steps } from "../data/TaxStep";
import { useContextMenu } from "./useContextMenu";
import type { ContextMenuProps } from "../UI/General/ContextMenu";
import type { DuplicateResponse } from "../data/DuplicateResponse";
import type ServerBehavior from "../api/ServerBehavior";

type UseTaxBehaviorResult = {
  taxBehavior: TaxBehavior;
  currentStep: Steps | undefined;
  responses: TaxResponse[];
  isLoading: boolean;
  lastSavedTime: Date | undefined;
  toastMessage: string | undefined;
  year: number | undefined;
  name: string | undefined;
  noDbConnection: boolean;
  showStartPage: boolean;
  panelExpanded: boolean;
  sidebarExpanded: boolean;
  contextMenu: ContextMenuProps | undefined;
  onWhitespaceClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  duplicateResponses: DuplicateResponse[] | undefined;
  advancedWithErrors: boolean;
};

type UseTaxBehaviorProps = {
  serverBehavior: ServerBehavior;
};

export function useTaxBehavior(
  props: UseTaxBehaviorProps,
): UseTaxBehaviorResult {
  const { serverBehavior } = props;

  const [currentStep, setCurrentStep] = useState<Steps | undefined>(undefined);
  const [responses, setResponses] = useState<TaxResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>(
    undefined,
  );
  const [toastMessage, setToastMessage] = useState<string | undefined>(
    undefined,
  );
  const [year, setYear] = useState<number | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [noDbConnection, setNoDbConnection] = useState<boolean>(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [duplicateResponses, setDuplicateResponses] = useState<
    DuplicateResponse[] | undefined
  >(undefined);
  const [advancedWithErrors, setAdvancedWithErrors] = useState<boolean>(false);

  const { contextMenu, setContextMenu, onWhitespaceClick } = useContextMenu();

  const taxBehavior = useMemo(() => {
    serverBehavior.setOnServerDown(() => {
      setToastMessage("Unable to connect to the server.");
    });
    return new TaxBehavior(
      {
        setCurrentStep,
        setResponses,
        setIsLoading,
        setLastSavedTime,
        setYear,
        setName,
        setNoDbConnection,
        setShowStartPage,
        setPanelExpanded,
        setSidebarExpanded,
        setToastMessage,
        setContextMenu,
        setDuplicateResponses,
        setAdvancedWithErrors,
      },
      serverBehavior,
    );
  }, [
    setCurrentStep,
    setResponses,
    setIsLoading,
    setLastSavedTime,
    setYear,
    setName,
    setNoDbConnection,
    setShowStartPage,
    setPanelExpanded,
    setSidebarExpanded,
    setToastMessage,
    setDuplicateResponses,
    setAdvancedWithErrors,
    serverBehavior,
  ]);

  return {
    taxBehavior,
    currentStep,
    responses,
    isLoading,
    lastSavedTime,
    toastMessage,
    year,
    name,
    noDbConnection,
    showStartPage,
    panelExpanded,
    sidebarExpanded,
    contextMenu,
    onWhitespaceClick,
    duplicateResponses,
    advancedWithErrors,
  };
}
