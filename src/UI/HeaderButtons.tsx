import { useState } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";
import type TaxResponse from "../DataModel/TaxResponse";
import type { Steps } from "../DataModel/TaxStep";
import SaveButton from "./SaveButton";
import DeleteButton from "./DeleteButton";

interface HeaderButtonsProps {
  readonly currentStep: Steps | undefined;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
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
    setError,
    setToastMessage,
    lastSavedTime,
    setLastSavedTime,
    year,
    name,
    noDbConnection,
  } = props;

  //#region useState
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  //#endregion useState

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
          <div className="last-save-text">
            {lastSavedTime
              ? `Last saved ${new Date(lastSavedTime).toLocaleString()}`
              : "Not saved yet"}
          </div>
          <SaveButton
            currentStep={currentStep!}
            responses={responses}
            taxBehavior={taxBehavior}
            isSaving={isSaving}
            isDeleting={isDeleting}
            setIsSaving={setIsSaving}
            setError={setError}
            setToastMessage={setToastMessage}
            setLastSavedTime={setLastSavedTime}
            year={year}
            name={name}
          />
          <DeleteButton
            taxBehavior={taxBehavior}
            isSaving={isSaving}
            isDeleting={isDeleting}
            lastSavedTime={lastSavedTime}
            year={year}
            name={name}
            setIsDeleting={setIsDeleting}
            setToastMessage={setToastMessage}
            setLastSavedTime={setLastSavedTime}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
