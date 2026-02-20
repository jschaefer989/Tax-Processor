import React, { useEffect, useState, useRef } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";
import type TaxResponse from "../DataModel/TaxResponse";
import type { Steps } from "../DataModel/TaxStep";
import NameButton from "./NameButton";
import NewYearButton from "./NewYearButton";
import NewYearPage from "./NewYearPage";
import YearButton from "./YearButton";
import BeginButton from "./BeginButton";
import DatabaseConnectionForm from "./DatabaseConnectionForm";
import type { ContextMenuProps } from "./ContextMenu";

interface StartPageProps {
  readonly taxBehavior: TaxBehavior;
  readonly year: number | undefined;
  readonly name: string | undefined;
  readonly isLoading: boolean;
  readonly noDbConnection: boolean;
  readonly setYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  readonly setName: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setCurrentStep: React.Dispatch<
    React.SetStateAction<Steps | undefined>
  >;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  readonly setLastSavedTime: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
  readonly setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuProps | undefined>>;
}

export default function StartPage(props: StartPageProps) {
  const {
    taxBehavior,
    year,
    name,
    isLoading,
    noDbConnection,
    setCurrentStep,
    setError,
    setYear,
    setName,
    setIsLoading,
    setResponses,
    setLastSavedTime,
    setNoDbConnection,
    setShowStartPage,
    setContextMenu
  } = props;

  const [years, setYears] = useState<number[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [newYear, setNewYear] = useState<boolean>(false);

  useEffect(() => {
    if (year) {
      return;
    }

    let isCancelled = false;

    const initialize = async () => {
      const hasDbConnection =
        await taxBehavior.checkDatabaseConnection(setNoDbConnection);

      if (isCancelled) {
        return;
      }

      if (!hasDbConnection) {
        return;
      }

      taxBehavior.loadYears(setYears, setError);
    };

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [setError, setNoDbConnection, taxBehavior, year]);

  if (newYear && year !== undefined) {
    return (
      <NewYearPage
        name={name}
        year={year}
        names={names}
        taxBehavior={taxBehavior}
        isLoading={isLoading}
        setName={setName}
        setIsLoading={setIsLoading}
        setCurrentStep={setCurrentStep}
        setError={setError}
        setResponses={setResponses}
        setLastSavedTime={setLastSavedTime}
        setNewYear={setNewYear}
        setNoDbConnection={setNoDbConnection}
        setShowStartPage={setShowStartPage}
      />
    );
  }

  return (
    <div className="start-page">
      <p className="eyebrow">Tax Clarity</p>
      <h1>File with clarity, step by step.</h1>
      {noDbConnection ? (
        <DatabaseConnectionForm
          taxBehavior={taxBehavior}
          setYears={setYears}
          setNoDbConnection={setNoDbConnection}
          isLoading={isLoading}
        />
      ) : (
        <p className="subtitle">Pick a tax year to begin.</p>
      )}
      <div
        className="panel years-container"
        style={{ maxHeight: year ? "1000px" : "100px" }}
      >
        {years?.map((otherYear) => (
          <YearButton
            key={otherYear}
            year={otherYear}
            selectedYear={year}
            taxBehavior={taxBehavior}
            isLoading={isLoading}
            setYear={setYear}
            setNames={setNames}
            setIsLoading={setIsLoading}
            setError={setError}
            setContextMenu={setContextMenu}
          />
        ))}
        <div className={`names-container ${year ? "visible" : ""}`}>
          {names?.map((name) => (
            <NameButton
              key={name}
              year={year}
              name={name}
              taxBehavior={taxBehavior}
              isLoading={isLoading}
              setName={setName}
              setIsLoading={setIsLoading}
              setCurrentStep={setCurrentStep}
              setError={setError}
              setResponses={setResponses}
              setLastSavedTime={setLastSavedTime}
              setNoDbConnection={setNoDbConnection}
              setShowStartPage={setShowStartPage}
            />
          ))}
        </div>
      </div>
      {noDbConnection ? (
        <BeginButton
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          setError={setError}
          setIsLoading={setIsLoading}
          setCurrentStep={setCurrentStep}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setName={setName}
          setNewYear={setNewYear}
          setNoDbConnection={setNoDbConnection}
          setShowStartPage={setShowStartPage}
        />
      ) : (
        <NewYearButton
          taxBehavior={taxBehavior}
          setYear={setYear}
          setIsLoading={setIsLoading}
          setError={setError}
          setNewYear={setNewYear}
          setNames={setNames}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
