import React, { useEffect, useState } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";
import type TaxResponse from "../DataModel/TaxResponse";
import type { Steps } from "../DataModel/TaxStep";
import NameButton from "./NameButton";
import NewYearButton from "./NewYearButton";
import NewYearPage from "./NewYearPage";
import YearButton from "./YearButton";

interface StartPageProps {
  readonly taxBehavior: TaxBehavior;
  readonly year: number | undefined;
  readonly name: string | undefined;
  readonly isLoading: boolean;
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
}

export default function StartPage(props: StartPageProps) {
  const {
    taxBehavior,
    year,
    name,
    isLoading,
    setCurrentStep,
    setError,
    setYear,
    setName,
    setIsLoading,
    setResponses,
    setLastSavedTime,
  } = props;

  const [years, setYears] = useState<number[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [newYear, setNewYear] = useState<boolean>(false);

  useEffect(() => {
    if (year) {
      return;
    }
    taxBehavior.loadYears(setYears, setError);
  }, [year]);

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
      />
    );
  }

  return (
    <div className="start-page">
      <p className="eyebrow">Tax Clarity</p>
      <h1>File with clarity, step by step.</h1>
      <p className="subtitle">Pick a tax year to begin.</p>
      {years?.map((year) => (
        <YearButton
          key={year}
          year={year}
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          setYear={setYear}
          setNames={setNames}
          setIsLoading={setIsLoading}
          setError={setError}
        />
      ))}
      {year &&
        names?.map((name) => (
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
          />
        ))}
      <NewYearButton
        taxBehavior={taxBehavior}
        setYear={setYear}
        setIsLoading={setIsLoading}
        setError={setError}
        setNewYear={setNewYear}
        setNames={setNames}
        isLoading={isLoading}
      />
    </div>
  );
}
