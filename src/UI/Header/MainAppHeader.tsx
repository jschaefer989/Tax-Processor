import type { TaxBehavior } from "../../api/TaxBehavior";
import type TaxResponse from "../../data/TaxResponse";
import type { Steps } from "../../data/TaxStep";
import HeaderButtons from "./HeaderButtons";
import HeaderTitle from "./HeaderTitle";
import StepTracker from "./StepTracker";

type HeaderProps = {
  readonly currentStep: Steps | undefined;
  readonly isLoading: boolean;
  readonly taxBehavior: TaxBehavior;
  readonly responses: TaxResponse[];
  readonly lastSavedTime: Date | undefined;
  readonly year?: number;
  readonly name?: string;
  readonly noDbConnection: boolean;
};

export default function MainAppHeader(props: HeaderProps) {
  const {
    currentStep,
    isLoading,
    taxBehavior,
    responses,
    lastSavedTime,
    year,
    name,
    noDbConnection,
  } = props;

  return (
    <>
      <div className="header-top">
        <HeaderTitle year={year?.toString()} name={name} />
        <div className="data-buttons">
          <HeaderButtons
            currentStep={currentStep}
            responses={responses}
            taxBehavior={taxBehavior}
            isLoading={isLoading}
            lastSavedTime={lastSavedTime}
            year={year}
            name={name}
            noDbConnection={noDbConnection}
          />
        </div>
      </div>

      <div className="panel">
        <div className="tabs-progress-wrapper">
          {currentStep ? (
            <StepTracker taxBehavior={taxBehavior} activeStep={currentStep} responses={responses} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </>
  );
}
