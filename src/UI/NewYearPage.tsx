import { useCallback, useState } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";
import type TaxResponse from "../DataModel/TaxResponse";
import { Steps } from "../DataModel/TaxStep";
import NameButton from "./NameButton";
import HeaderTitle from "./HeaderTitle";

interface NewYearPageProps {
  readonly names: string[];
  readonly year: number;
  readonly name: string | undefined;
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
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
  readonly setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NewYearPage(props: NewYearPageProps) {
  const {
    names,
    year,
    taxBehavior,
    isLoading,
    name,
    setName,
    setIsLoading,
    setCurrentStep,
    setError,
    setResponses,
    setLastSavedTime,
    setNewYear,
  } = props;

  const [tempName, setTempName] = useState<string>("");

  const onInputNewName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTempName(event.target.value);
    },
    [],
  );

  const onStart = useCallback(async () => {
    if (!tempName.trim()) {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    await taxBehavior.loadSteps(setCurrentStep, setError);
    await taxBehavior.resumeProgress(
      year,
      tempName.trim(),
      setCurrentStep,
      setResponses,
      setError,
      setLastSavedTime,
    );
    setName(tempName.trim());
    setNewYear(false);
    setCurrentStep(Steps.Income);
    setIsLoading(false);
  }, [tempName, year]);

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
          setName={setName}
          setIsLoading={setIsLoading}
          setCurrentStep={setCurrentStep}
          setError={setError}
          setResponses={setResponses}
          setLastSavedTime={setLastSavedTime}
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
        <button
          className="new-taxpayer-form-button"
          onClick={onStart}
          disabled={isLoading || tempName.trim() === ""}
        >
          Begin
        </button>
      </div>
    </>
  );
}
