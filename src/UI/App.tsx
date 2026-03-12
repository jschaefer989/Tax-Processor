import { useMemo, useState } from "react";
import { TaxBehavior } from "../DataModel/TaxBehavior";
import TaxResponse from "../DataModel/TaxResponse";
import { Steps } from "../DataModel/TaxStep";
import { useContextMenu } from "../hooks/useContextMenu";
import { useRefreshDbConnection } from "../hooks/useRefreshDbConnection";
import { MainAppFooter } from "./Footer/MainAppFooter";
import MainForm from "./Form/MainForm";
import ContextMenu from "./General/ContextMenu";
import { ExpandButton, ExpandDirection } from "./General/ExpandButton";
import Toast from "./General/Toast";
import MainAppHeader from "./Header/MainAppHeader";
import FileSidebar from "./Sidebar/FileSidebar";
import StartPage from "./StartPage/StartPage";

export default function App() {
  const taxBehavior = useMemo(() => new TaxBehavior(), []);

  //#region useState
  const [currentStep, setCurrentStep] = useState<Steps | undefined>(undefined);
  const [responses, setResponses] = useState<TaxResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>(
    undefined,
  );
  const [toastMessage, setToastMessage] = useState<string | undefined>(
    undefined,
  );
  const [year, setYear] = useState<number | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [noDbConnection, setNoDbConnection] = useState<boolean>(false);
  const [showStartPage, setShowStartPage] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  //#endregion useState

  useRefreshDbConnection(
    showStartPage,
    noDbConnection,
    taxBehavior,
    setNoDbConnection,
  );

  const { contextMenu, setContextMenu, onWhitespaceClick } = useContextMenu();

  return (
    <div className="app" onClick={onWhitespaceClick}>
      {toastMessage && (
        <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
      )}
      {contextMenu && <ContextMenu {...contextMenu} />}
      {showStartPage ? (
        <StartPage
          taxBehavior={taxBehavior}
          selectedYear={year}
          selectedName={name}
          isLoading={isLoading}
          setSelectedYear={setYear}
          setCurrentStep={setCurrentStep}
          setError={setError}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setIsLoading={setIsLoading}
          setSelectedName={setName}
          setNoDbConnection={setNoDbConnection}
          noDbConnection={noDbConnection}
          setShowStartPage={setShowStartPage}
          setContextMenu={setContextMenu}
          setToastMessage={setToastMessage}
        />
      ) : (
        <>
          <header>
            <MainAppHeader
              currentStep={currentStep}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setCurrentStep={setCurrentStep}
              taxBehavior={taxBehavior}
              responses={responses}
              setError={setError}
              setToastMessage={setToastMessage}
              lastSavedTime={lastSavedTime}
              setLastSavedTime={setLastSavedTime}
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
                error={error}
                taxBehavior={taxBehavior}
                setCurrentStep={setCurrentStep}
                setResponses={setResponses}
                setError={setError}
                setIsLoading={setIsLoading}
              />
            </section>

            {sidebarExpanded && (
              <ExpandButton
                expanded={panelExpanded}
                setExpanded={setPanelExpanded}
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
                setExpanded={setSidebarExpanded}
                title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                direction={ExpandDirection.Right}
              />
            )}

            <section className="sidebar-column">
              <FileSidebar
                responses={responses}
                isExpanded={sidebarExpanded}
                setIsExpanded={setSidebarExpanded}
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
