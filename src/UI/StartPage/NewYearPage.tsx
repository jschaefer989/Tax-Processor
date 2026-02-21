import { useCallback, useState } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import { Steps } from "../../DataModel/TaxStep";
import NameButton from "./NameButton";
import HeaderTitle from "../HeaderTitle";
import BeginButton from "./BeginButton";

interface NewYearPageProps {
  readonly names: string[];
  readonly year: number;
  readonly name: string | undefined;
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
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
  readonly setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NewYearPage(props: NewYearPageProps) {
  const {
    names,
    year,
    taxBehavior,
    isLoading,
    name,
    setSelectedName,
    setIsLoading,
    setCurrentStep,
    setError,
    setResponses,
    setLastSavedTime,
    setNewYear,
    setNoDbConnection,
    setShowStartPage,
  } = props;

  const [tempName, setTempName] = useState<string>("");

  const onInputNewName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTempName(event.target.value);
    },
    [],
  );

  return (
    <>
      <HeaderTitle year={year.toString()} name={name} />
      {names.map((name) => (
        <NameButton
          key={name}
          name={name}
          year={year}
          taxBehavior={taxBehavior}
          isLoading={isLoading}
          setSelectedName={setSelectedName}
          setIsLoading={setIsLoading}
          setCurrentStep={setCurrentStep}
          setError={setError}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
          setNoDbConnection={setNoDbConnection}
          setShowStartPage={setShowStartPage}
        />
      ))}
      <div className="new-taxpayer-form">
        <label className="field">
          <span>New taxpayer</span>
          <input
            id="new-name-input"
            type="text"
            placeholder="Enter taxpayer name"
            onChange={(event) => onInputNewName(event)}
          />
        </label>
        <BeginButton
          tempName={tempName}
          year={year}
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
        />
      </div>
    </>
  );
}
