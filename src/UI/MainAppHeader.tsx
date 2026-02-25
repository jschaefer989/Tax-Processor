import type { TaxBehavior } from "../DataModel/TaxBehavior";
import type TaxResponse from "../DataModel/TaxResponse";
import type { Steps } from "../DataModel/TaxStep";
import HeaderButtons from "./HeaderButtons";
import HeaderTitle from "./HeaderTitle";
import StepTracker from "./StepTracker";

interface HeaderProps {
  readonly currentStep: Steps | undefined;
  readonly isLoading: boolean;
  readonly setCurrentStep: (step: Steps) => void;
  readonly taxBehavior: TaxBehavior;
  readonly responses: TaxResponse[];
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

export default function MainAppHeader(props: HeaderProps) {
  const {
    currentStep,
    isLoading,
    setCurrentStep,
    taxBehavior,
    responses,
    setError,
    setToastMessage,
    lastSavedTime,
    setLastSavedTime,
    year,
    name,
    noDbConnection,
  } = props;

  return (
    <header>
      <div className="header-top">
        <HeaderTitle year={year?.toString()} name={name} />
        <div className="data-buttons">
          <HeaderButtons
            currentStep={currentStep}
            responses={responses}
            taxBehavior={taxBehavior}
            isLoading={isLoading}
            setError={setError}
            setToastMessage={setToastMessage}
            lastSavedTime={lastSavedTime}
            setLastSavedTime={setLastSavedTime}
            year={year}
            name={name}
            noDbConnection={noDbConnection}
          />
        </div>
      </div>

      <div className="panel">
        <div className="tabs-progress-wrapper">
          {currentStep && !isLoading ? (
            <StepTracker
              activeStep={currentStep}
              setActiveStep={setCurrentStep}
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </header>
  );
}
