import type { TaxBehavior } from "../api/TaxBehavior";
import type TaxResponse from "../data/TaxResponse";
import type { Steps } from "../data/TaxStep";
import MainForm from "./Form/MainForm";
import ExpandButton from "./General/ExpandButton";
import MainAppHeader from "./Header/MainAppHeader";
import FileSidebar from "./Sidebar/FileSidebar";

type MainAppProps = {
  currentStep: Steps | undefined;
  isLoading: boolean;
  taxBehavior: TaxBehavior;
  responses: TaxResponse[];
  lastSavedTime: Date | undefined;
  year: number | undefined;
  name: string | undefined;
  noDbConnection: boolean;
  panelExpanded: boolean;
  sidebarExpanded: boolean;
  advancedWithErrors: boolean;
};

export default function MainApp(props: MainAppProps) {
  const {
    currentStep,
    isLoading,
    taxBehavior,
    responses,
    lastSavedTime,
    year,
    name,
    noDbConnection,
    panelExpanded,
    sidebarExpanded,
    advancedWithErrors,
  } = props;

  return (
    <>
      <header>
        <MainAppHeader
          currentStep={currentStep}
          isLoading={isLoading}
          taxBehavior={taxBehavior}
          responses={responses}
          lastSavedTime={lastSavedTime}
          year={year}
          name={name}
          noDbConnection={noDbConnection}
        />
      </header>

      <main
        className={`layout ${!sidebarExpanded ? "sidebar-collapsed" : ""} ${!panelExpanded ? "main-collapsed" : ""}`}
      >
        <section className="panel">
          <MainForm
            currentStep={currentStep}
            responses={responses}
            isLoading={isLoading}
            taxBehavior={taxBehavior}
            advancedWithErrors={advancedWithErrors}
          />
        </section>

        {sidebarExpanded && (
          <ExpandButton
            expanded={panelExpanded}
            setExpanded={taxBehavior.state.setPanelExpanded}
            title={
              panelExpanded
                ? "Collapse income overview"
                : "Expand income overview"
            }
          />
        )}

        {panelExpanded && (
          <ExpandButton
            expanded={sidebarExpanded}
            setExpanded={taxBehavior.state.setSidebarExpanded}
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            direction="right"
          />
        )}

        <section className="sidebar-column">
          <FileSidebar
            taxBehavior={taxBehavior}
            responses={responses}
            isExpanded={sidebarExpanded}
            year={year ?? new Date().getFullYear()}
            name={name ?? "Unnamed"}
            isLoading={isLoading}
          />
        </section>
      </main>
    </>
  );
}
