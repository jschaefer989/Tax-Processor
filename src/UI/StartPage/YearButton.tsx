import React, { useCallback } from "react";
import ContextMenuOption, {
  ContextMenuIcon,
} from "../../DataModel/ContextMenuOption";
import type { StartBehavior } from "../../DataModel/StartBehavior";

interface YearButtonProps {
  readonly year: number;
  readonly selectedYear: number | undefined;
  readonly startBehavior: StartBehavior;
  readonly isLoading: boolean;
}

export default function YearButton(props: YearButtonProps) {
  const { year, selectedYear, startBehavior, isLoading } = props;

  //#region useCallback
  const onClick = useCallback(async () => {
    const { taxBehavior } = startBehavior;
    if (selectedYear === year) {
      taxBehavior.state.setYear(undefined);
    } else {
      taxBehavior.state.setIsLoading(true);
      await startBehavior.loadNames(year);
      taxBehavior.state.setYear(year);
      taxBehavior.state.setIsLoading(false);
    }
  }, [year, selectedYear]);

  const onDeleteYear = useCallback(async () => {
    const { taxBehavior } = startBehavior;
    const confirmed = window.confirm(
      "Are you sure you want to delete this year and all associated tax returns? This cannot be undone.",
    );
    if (confirmed) {
      await startBehavior.deleteYear(year);
      startBehavior.setYears((prevYears) =>
        prevYears.filter((year) => year !== year),
      );
      if (selectedYear === year) {
        taxBehavior.state.setYear(undefined);
        startBehavior.setNames([]);
      }
    }
  }, [year, selectedYear]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      startBehavior.taxBehavior.state.setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          new ContextMenuOption("Delete", onDeleteYear, ContextMenuIcon.Delete),
        ],
      });
    },
    [onDeleteYear],
  );
  //#endregion useCallback

  const isSelected = selectedYear === year;

  return (
    <button
      className={`year-button ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      disabled={isLoading && !isSelected}
      onContextMenu={onContextMenu}
      title={
        isLoading && !isSelected
          ? "Server is busy. Please wait..."
          : `Select tax year ${year}`
      }
    >
      {year}
    </button>
  );
}
