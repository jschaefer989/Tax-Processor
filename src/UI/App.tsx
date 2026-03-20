import { useRefreshDbConnection } from "../hooks/useRefreshDbConnection";
import { useTaxBehavior } from "../hooks/useTaxBehavior";
import { MainAppFooter } from "./Footer/MainAppFooter";
import { DuplicateDataPopup } from "./Form/DuplicateDataPopup";
import MainForm from "./Form/MainForm";
import ContextMenu from "./General/ContextMenu";
import { ExpandButton, ExpandDirection } from "./General/ExpandButton";
import Toast from "./General/Toast";
import MainAppHeader from "./Header/MainAppHeader";
import FileSidebar from "./Sidebar/FileSidebar";
import StartPage from "./StartPage/StartPage";

// TODO: add this link https://www.irs.gov/help/ita

export default function App() {
  const {
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
  } = useTaxBehavior();

  useRefreshDbConnection(showStartPage, noDbConnection, taxBehavior);

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
      {showStartPage ? (
        <StartPage
          taxBehavior={taxBehavior}
          selectedYear={year}
          selectedName={name}
          isLoading={isLoading}
          noDbConnection={noDbConnection}
        />
      ) : (
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
                setExpanded={taxBehavior.setPanelExpanded}
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
                setExpanded={taxBehavior.setSidebarExpanded}
                title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                direction={ExpandDirection.Right}
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

          <footer>
            <MainAppFooter />
          </footer>
        </>
      )}
    </div>
  );
}
