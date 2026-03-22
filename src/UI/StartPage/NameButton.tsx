import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";
import ContextMenuOption from "../../DataModel/ContextMenuOption";

type NameButtonProps = {
  readonly year?: number;
  readonly name: string;
  readonly startBehavior: StartBehavior;
  readonly isLoading: boolean;
};

export default function NameButton(props: NameButtonProps) {
  const { year, name, startBehavior, isLoading } = props;

  const onClick = useCallback(async () => {
    const { taxBehavior } = startBehavior;
    const stepsLoaded = await taxBehavior.loadSteps();
    if (!stepsLoaded) {
      return;
    }

    if (year) {
      const progressLoaded = await taxBehavior.resumeProgress(year, name);
      if (!progressLoaded) {
        return;
      }
    }

    taxBehavior.state.setName(name);
    taxBehavior.state.setShowStartPage(false);
  }, [name, year, startBehavior]);

  const onDeleteName = useCallback(async () => {
    if (year === undefined) {
      console.error("Year is undefined. Cannot delete name without year.");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete this taxpayer data? This cannot be undone.",
    );
    if (confirmed) {
      await startBehavior.deleteName(year, name);
      startBehavior.taxBehavior.state.setName(undefined);
      
      startBehavior.setNames((prevNames) => {
        const newNames = prevNames.filter((prevName) => prevName !== name);
        if (newNames.length === 0) {
          startBehavior.setYears((prevYears) =>
            prevYears.filter((prevYear) => prevYear !== year),
          );
          startBehavior.taxBehavior.state.setYear(undefined);
        }
        return newNames;
      });
    }
  }, [year, name]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      startBehavior.taxBehavior.state.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption("Delete", onDeleteName, "Delete"),
        ],
      });
    },
    [onDeleteName],
  );

  return (
    <button
      className="name-button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : `Continue with ${name}`
      }
    >
      {name}
    </button>
  );
}
