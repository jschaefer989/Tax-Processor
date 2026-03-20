import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { Steps } from "../../DataModel/TaxStep";
import ErrorMessage from "../General/ErrorMessage";
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
        <ErrorMessage text="No database connection. Progress will not be saved." />
      </div>
    );
  }

  if (!year || !name) {    
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
