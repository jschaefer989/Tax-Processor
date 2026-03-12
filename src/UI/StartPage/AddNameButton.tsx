import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";

interface AddNameButtonProps {
  startBehavior: StartBehavior;
  isLoading: boolean;
}

export function AddNameButton(props: AddNameButtonProps) {
  const { startBehavior, isLoading } = props;

  const onClick = useCallback(() => {
    startBehavior.setNames([]);
    startBehavior.setNewYear(true);
  }, []);

  return (
    <button
      className="add-name-button"
      onClick={onClick}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : "Add a new taxpayer for this year"
      }
    >
      + Add year
    </button>
  );
}
