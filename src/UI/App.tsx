import { useCallback, useEffect } from "react";
import { SERVER_DOWN_MESSAGE } from "../api/ServerBehavior";
import useAuthentication from "../hooks/useAuthentication";
import { useTaxBehavior } from "../hooks/useTaxBehavior";
import AuthPage from "./Auth/AuthPage";
import DuplicateDataPopup from "./Form/DuplicateDataPopup";
import MainForm from "./Form/MainForm";
import ContextMenu from "./General/ContextMenu";
import { ExpandButton } from "./General/ExpandButton";
import Toast from "./General/Toast";
import MainAppHeader from "./Header/MainAppHeader";
import FileSidebar from "./Sidebar/FileSidebar";
import StartPage from "./StartPage/StartPage";
import useServerBehavior from "../hooks/useServerBehavior";

export default function App() {
  const { serverBehavior } = useServerBehavior();

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
  } = useTaxBehavior({ serverBehavior });

  const { isAuthenticated, setIsAuthenticated } = useAuthentication({
    serverBehavior,
  });

  const onServerDown = useCallback(() => {
    taxBehavior.state.setToastMessage(SERVER_DOWN_MESSAGE);
  }, [taxBehavior]);

  useEffect(() => {
    serverBehavior.setOnServerDown(onServerDown);
  }, [serverBehavior, onServerDown]);

  const onAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

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
      {!isAuthenticated && !noDbConnection ? (
        <AuthPage
          serverBehavior={serverBehavior}
          onAuthenticated={onAuthenticated}
          isBusy={isLoading}
          setIsBusy={taxBehavior.state.setIsLoading}
        />
      ) : (
        <>
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
                    title={
                      sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
                    }
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
          )}
        </>
      )}
    </div>
  );
}
