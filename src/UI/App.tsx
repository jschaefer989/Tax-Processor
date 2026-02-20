import { useMemo, useState } from "react";
import "../App.css";
import { TaxBehavior } from "../DataModel/TaxBehavior";
import TaxResponse from "../DataModel/TaxResponse";
import { Steps } from "../DataModel/TaxStep";
import FileSidebar from "./FileSidebar";
import Header from "./Header";
import MainForm from "./MainForm";
import StartPage from "./StartPage";
import Toast from "./Toast";
import ContextMenu from "./ContextMenu";
import type { ContextMenuProps } from "./ContextMenu";

function App() {
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
  const [contextMenu, setContextMenu] = useState<ContextMenuProps | undefined>(undefined);
  //#endregion useState

  return (
    <div className="app">
      {toastMessage && <Toast toastMessage={toastMessage} />}
      {contextMenu && <ContextMenu {...contextMenu} />}
      {showStartPage ? (
        <StartPage
          taxBehavior={taxBehavior}
          year={year}
          name={name}
          isLoading={isLoading}
          setYear={setYear}
          setCurrentStep={setCurrentStep}
          setError={setError}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setIsLoading={setIsLoading}
          setName={setName}
          setNoDbConnection={setNoDbConnection}
          noDbConnection={noDbConnection}
          setShowStartPage={setShowStartPage}
          setContextMenu={setContextMenu}
        />
      ) : (
        <>
          <Header
            currentStep={currentStep}
            isLoading={isLoading}
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

          <main className="layout">
            <section className="panel">
              <MainForm
                currentStep={currentStep}
                responses={responses}
                isLoading={isLoading}
                error={error}
                taxBehavior={taxBehavior}
                setCurrentStep={setCurrentStep}
                setResponses={setResponses}
              />
            </section>
            <FileSidebar />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
