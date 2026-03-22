import { useEffect, useState } from "react";
import { useRefreshDbConnection } from "../hooks/useRefreshDbConnection";
import { useTaxBehavior } from "../hooks/useTaxBehavior";
import AuthPage from "./Auth/AuthPage";
import { DuplicateDataPopup } from "./Form/DuplicateDataPopup";
import MainForm from "./Form/MainForm";
import ContextMenu from "./General/ContextMenu";
import { ExpandButton, ExpandDirection } from "./General/ExpandButton";
import Toast from "./General/Toast";
import MainAppHeader from "./Header/MainAppHeader";
import FileSidebar from "./Sidebar/FileSidebar";
import StartPage from "./StartPage/StartPage";

// TODO: make custom hooks for authentication and tax behavior, and split this component up into smaller pieces. This file is getting pretty unwieldy.

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
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

  useRefreshDbConnection(
    showStartPage,
    noDbConnection,
    taxBehavior,
    isAuthenticated,
  );

  useEffect(() => {
    let disposed = false;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!disposed) {
          setIsAuthenticated(response.ok);
        }
      } catch {
        if (!disposed) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!disposed) {
          setAuthLoading(false);
        }
      }
    };

    void checkAuth();

    return () => {
      disposed = true;
    };
  }, []);

  if (authLoading) {
    return <div className="auth-shell">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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
        </>
      )}
    </div>
  );
}
