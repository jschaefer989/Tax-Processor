import type { StartBehavior } from "../../api/StartBehavior";
import BeginButton from "./BeginButton";
import DatabaseConnectionForm from "./DatabaseConnectionForm";

type MissingDatabaseControlsProps = {
  startBehavior: StartBehavior;
  isLoading: boolean;
};

export default function MissingDatabaseControls(
  props: MissingDatabaseControlsProps,
) {
  const { startBehavior, isLoading } = props;

  return (
    <>
      <BeginButton isLoading={isLoading} startBehavior={startBehavior} />
      <DatabaseConnectionForm
        startBehavior={startBehavior}
        isLoading={isLoading}
      />
    </>
  );
}
