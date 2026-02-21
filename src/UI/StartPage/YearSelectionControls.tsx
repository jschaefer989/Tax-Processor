import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import type { ContextMenuProps } from "../ContextMenu";
import NameButton from "./NameButton";
import NewYearButton from "./NewYearButton";
import YearButton from "./YearButton";

interface YearSelectionControlsProps {
  taxBehavior: TaxBehavior;
  isLoading: boolean;
  year: number | undefined;
  names: string[];
  years: number[];
  setYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  setName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setNames: React.Dispatch<React.SetStateAction<string[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setContextMenu: React.Dispatch<
    React.SetStateAction<ContextMenuProps | undefined>
  >;
  setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
  setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function YearSelectionControls(
  props: YearSelectionControlsProps,
) {
  const {
    taxBehavior,
    isLoading,
    year,
    names,
    years,
    setYear,
    setNames,
    setName,
    setIsLoading,
    setError,
    setContextMenu,
    setCurrentStep,
    setResponses,
    setLastSavedTime,
    setNoDbConnection,
    setShowStartPage,
    setNewYear,
  } = props;

  return (
    <>
      <p className="subtitle">Pick a tax year to begin.</p>
      {years && years.length > 0 && (
        <div
          className="panel years-container"
          style={{ maxHeight: year ? "1000px" : "100px" }}
        >
          {years.map((otherYear) => (
            <YearButton
              key={otherYear}
              year={otherYear}
              selectedYear={year}
              taxBehavior={taxBehavior}
              isLoading={isLoading}
              setSelectedYear={setYear}
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
                setSelectedName={setName}
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
      )}
      <NewYearButton
        taxBehavior={taxBehavior}
        setSelectedYear={setYear}
        setIsLoading={setIsLoading}
        setError={setError}
        setNewYear={setNewYear}
        setNames={setNames}
        isLoading={isLoading}
      />
    </>
  );
}
