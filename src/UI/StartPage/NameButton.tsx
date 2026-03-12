import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";

interface NameButtonProps {
  readonly year?: number;
  readonly name: string;
  readonly startBehavior: StartBehavior;
  readonly isLoading: boolean;
}

export default function NameButton(props: NameButtonProps) {
  const { year, name, startBehavior, isLoading } = props;

  const onClick = useCallback(async () => {
    const { taxBehavior } = startBehavior;
    await taxBehavior.loadSteps();
    if (year) {
      await taxBehavior.resumeProgress(year, name);
    }
    taxBehavior.setName(name);
    taxBehavior.setShowStartPage(false);
  }, [name, year]);

  return (
    <button
      className="name-button"
      onClick={onClick}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : `Continue with ${name}`
      }
    >
      {name}
    </button>
  );
}
