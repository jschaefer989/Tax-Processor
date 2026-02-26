import { useMemo, useState } from "react";
import "../App.css";
import { TaxBehavior } from "../DataModel/TaxBehavior";
import TaxResponse from "../DataModel/TaxResponse";
import { Steps } from "../DataModel/TaxStep";
import FileSidebar from "./Sidebar/FileSidebar";
import MainAppHeader from "./Header/MainAppHeader";
import MainForm from "./Form/MainForm";
import StartPage from "./StartPage/StartPage";
import Toast from "./General/Toast";
import ContextMenu from "./General/ContextMenu";
import type { ContextMenuProps } from "./General/ContextMenu";
import SidebarExpandButton from "./Sidebar/SidebarExpandButton";

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
  const [contextMenu, setContextMenu] = useState<ContextMenuProps | undefined>(
    undefined,
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  //#endregion useState

  return (
    <div className="app">
      {toastMessage && <Toast toastMessage={toastMessage} />}
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
        />
      ) : (
        <>
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

          <main
            className={`layout ${!sidebarExpanded ? "sidebar-collapsed" : ""}`}
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

            <SidebarExpandButton
              sidebarExpanded={sidebarExpanded}
              setSidebarExpanded={setSidebarExpanded}
            />

            <div className="sidebar-column">
              <FileSidebar
                responses={responses}
                isExpanded={sidebarExpanded}
                setIsExpanded={setSidebarExpanded}
              />
            </div>
          </main>
        </>
      )}
    </div>
  );
}
