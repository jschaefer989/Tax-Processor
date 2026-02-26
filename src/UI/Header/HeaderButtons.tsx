import { useEffect } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import DeleteButton from "./DeleteButton";
import LastSavedText from "./LastSavedText";
import SaveButton from "./SaveButton";

interface HeaderButtonsProps {
  readonly currentStep: Steps | undefined;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
  readonly setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly setToastMessage: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  readonly lastSavedTime: Date | undefined;
  readonly setLastSavedTime: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
  readonly year?: number;
  readonly name?: string;
  readonly noDbConnection: boolean;
}

export default function HeaderButtons(props: HeaderButtonsProps) {
  const {
    currentStep,
    responses,
    taxBehavior,
    isLoading,
    setIsLoading,
    setError,
    setToastMessage,
    lastSavedTime,
    setLastSavedTime,
    year,
    name,
    noDbConnection,
  } = props;  

  if (noDbConnection) {
    return (
      <div className="last-save-text-wrapper">
        <div className="last-save-text subtitle-chip subtitle-chip--error-soft">
          No database connection. Progress will not be saved.
        </div>
      </div>
    );
  }

  if (!year || !name) {
    setError("Year or name is missing. Cannot save progress.");
    return null;
  }

  return (
    <>
      {!isLoading ? (
        <div className="last-save-text-wrapper">
          <LastSavedText lastSavedTime={lastSavedTime} />
          <SaveButton
            currentStep={currentStep!}
            responses={responses}
            taxBehavior={taxBehavior}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
            setToastMessage={setToastMessage}
            setLastSavedTime={setLastSavedTime}
            year={year}
            name={name}
          />
          <DeleteButton
            taxBehavior={taxBehavior}
            lastSavedTime={lastSavedTime}
            year={year}
            name={name}
            isLoading={isLoading}
            setToastMessage={setToastMessage}
            setLastSavedTime={setLastSavedTime}
            setIsLoading={setIsLoading}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
