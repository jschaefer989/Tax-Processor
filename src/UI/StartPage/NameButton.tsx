import { useCallback } from "react";
import type { StartBehavior } from "../../DataModel/StartBehavior";
import ContextMenuOption, {
  ContextMenuIcon,
} from "../../DataModel/ContextMenuOption";

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
      startBehavior.taxBehavior.setName(undefined);
      
      startBehavior.setNames((prevNames) => {
        const newNames = prevNames.filter((prevName) => prevName !== name);
        if (newNames.length === 0) {
          startBehavior.setYears((prevYears) =>
            prevYears.filter((prevYear) => prevYear !== year),
          );
          startBehavior.taxBehavior.setYear(undefined);
        }
        return newNames;
      });
    }
  }, [year, name]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      startBehavior.taxBehavior.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption("Delete", onDeleteName, ContextMenuIcon.Delete),
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
