import type { ContextMenuProps } from "../UI/General/ContextMenu";
import type { DuplicateResponse } from "./DuplicateResponse";
import type TaxResponse from "./TaxResponse";
import type { Steps } from "./TaxStep";

export interface StateSetters {
  setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  setName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
  setPanelExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  setToastMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setContextMenu: React.Dispatch<
    React.SetStateAction<ContextMenuProps | undefined>
  >;
  setDuplicateResponses: React.Dispatch<
    React.SetStateAction<DuplicateResponse[] | undefined>
  >;
  setAdvancedWithErrors: React.Dispatch<React.SetStateAction<boolean>>;
}

export default class StateManager {
  setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>> =
    () => {};
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>> = () => {};
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>> =
    () => {};
  setYear: React.Dispatch<React.SetStateAction<number | undefined>> = () => {};
  setName: React.Dispatch<React.SetStateAction<string | undefined>> = () => {};
  setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setShowStartPage: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setPanelExpanded: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setToastMessage: React.Dispatch<React.SetStateAction<string | undefined>> =
    () => {};
  setContextMenu: React.Dispatch<
    React.SetStateAction<ContextMenuProps | undefined>
  > = () => {};
  setDuplicateResponses: React.Dispatch<
    React.SetStateAction<DuplicateResponse[] | undefined>
  > = () => {};
  setAdvancedWithErrors: React.Dispatch<React.SetStateAction<boolean>> =
    () => {};

  constructor(setters: StateSetters) {
    this.setCurrentStep = setters.setCurrentStep;
    this.setResponses = setters.setResponses;
    this.setIsLoading = setters.setIsLoading;
    this.setLastSavedTime = setters.setLastSavedTime;
    this.setYear = setters.setYear;
    this.setName = setters.setName;
    this.setNoDbConnection = setters.setNoDbConnection;
    this.setShowStartPage = setters.setShowStartPage;
    this.setPanelExpanded = setters.setPanelExpanded;
    this.setSidebarExpanded = setters.setSidebarExpanded;
    this.setToastMessage = setters.setToastMessage;
    this.setContextMenu = setters.setContextMenu;
    this.setDuplicateResponses = setters.setDuplicateResponses;
    this.setAdvancedWithErrors = setters.setAdvancedWithErrors;
  }
}
