import React, { useEffect, useState } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import type { ContextMenuProps } from "../General/ContextMenu";
import MissingDatabaseControls from "./MissingDatabaseControls";
import NewYearPage from "./NewYearPage";
import YearSelectionControls from "./YearSelectionControls";

interface StartPageProps {
  readonly taxBehavior: TaxBehavior;
  readonly selectedYear: number | undefined;
  readonly selectedName: string | undefined;
  readonly isLoading: boolean;
  readonly noDbConnection: boolean;
  readonly setSelectedYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  readonly setSelectedName: React.Dispatch<React.SetStateAction<string | undefined>>;
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
  readonly setContextMenu: React.Dispatch<
    React.SetStateAction<ContextMenuProps | undefined>
  >;
}

export default function StartPage(props: StartPageProps) {
  const {
    taxBehavior,
    selectedYear,
    selectedName,
    isLoading,
    noDbConnection,
    setCurrentStep,
    setError,
    setSelectedYear,
    setSelectedName,
    setIsLoading,
    setResponses,
    setLastSavedTime,
    setNoDbConnection,
    setShowStartPage,
    setContextMenu,
  } = props;

  const [years, setYears] = useState<number[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [newYear, setNewYear] = useState<boolean>(false);

  useEffect(() => {
    if (selectedYear) {
      return;
    }
    let isCancelled = false;

    const initialize = async () => {
      const hasDbConnection =
        await taxBehavior.checkDatabaseConnection(setNoDbConnection, setIsLoading);

      if (isCancelled) {
        return;
      }

      if (!hasDbConnection) {
        return;
      }

      taxBehavior.loadYears(setYears, setError, setIsLoading);
    };

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear]);

  if (newYear && selectedYear !== undefined) {
    return (
      <NewYearPage
        name={selectedName}
        year={selectedYear}
        names={names}
        taxBehavior={taxBehavior}
        isLoading={isLoading}
        setSelectedName={setSelectedName}
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
        <MissingDatabaseControls
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          setError={setError}
          setIsLoading={setIsLoading}
          setCurrentStep={setCurrentStep}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setSelectedName={setSelectedName}
          setNewYear={setNewYear}
          setNoDbConnection={setNoDbConnection}
          setShowStartPage={setShowStartPage}
          setYears={setYears}
        />
      ) : (
        <YearSelectionControls
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          year={selectedYear}
          names={names}
          years={years}
          setYear={setSelectedYear}
          setName={setSelectedName}
          setNames={setNames}
          setIsLoading={setIsLoading}
          setError={setError}
          setContextMenu={setContextMenu}
          setCurrentStep={setCurrentStep}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setNoDbConnection={setNoDbConnection}
          setShowStartPage={setShowStartPage}
          setNewYear={setNewYear}
        />
      )}
    </div>
  );
}
