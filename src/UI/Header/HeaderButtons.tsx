import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import LastSavedText from "./LastSavedText";
import { ReturnButton } from "./ReturnButton";
import SaveButton from "./SaveButton";

interface HeaderButtonsProps {
  readonly currentStep: Steps | undefined;
  readonly responses: TaxResponse[];
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
  readonly lastSavedTime: Date | undefined;
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
    lastSavedTime,
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
    taxBehavior.setError("Year or name is missing. Cannot save progress.");
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
            year={year}
            name={name}
          />
          <ReturnButton isLoading={isLoading} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
