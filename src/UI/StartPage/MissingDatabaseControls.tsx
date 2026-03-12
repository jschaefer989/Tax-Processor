import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";
import BeginButton from "./BeginButton";
import DatabaseConnectionForm from "./DatabaseConnectionForm";
import { Steps } from "../../DataModel/TaxStep";

interface MissingDatabaseControlsProps {
  startBehavior: StartBehavior;
  isLoading: boolean;
  readonly error: string | undefined;
}

export default function MissingDatabaseControls(
  props: MissingDatabaseControlsProps,
) {
  const { startBehavior, isLoading, error } = props;

  const onStart = useCallback(async () => {
    startBehavior.taxBehavior.setError(undefined);
    await startBehavior.taxBehavior.loadSteps();
    startBehavior.taxBehavior.setCurrentStep(Steps.Income);
    startBehavior.taxBehavior.setShowStartPage(false);
  }, []);

  return (
    <>
      <BeginButton isLoading={isLoading} onStart={onStart} />
      <DatabaseConnectionForm
        startBehavior={startBehavior}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
