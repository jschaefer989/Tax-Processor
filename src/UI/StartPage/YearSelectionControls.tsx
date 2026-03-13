import type { StartBehavior } from "../../DataModel/StartBehavior";
import { ExpandContent } from "../General/ExpandContent";
import { AddNameButton } from "./AddNameButton";
import NameButton from "./NameButton";
import NewYearButton from "./NewYearButton";
import YearButton from "./YearButton";

interface YearSelectionControlsProps {
  startBehavior: StartBehavior;
  isLoading: boolean;
  year: number | undefined;
  names: string[];
  years: number[];
}

export default function YearSelectionControls(
  props: YearSelectionControlsProps,
) {
  const { startBehavior, isLoading, year, names, years } = props;

  return (
    <>
      <p className="subtitle">Pick a tax year to begin.</p>
      {years && years.length > 0 && (
        <div className="years-container">
          {years.map((otherYear) => (
            <YearButton
              key={otherYear}
              year={otherYear}
              selectedYear={year}
              startBehavior={startBehavior}
              isLoading={isLoading}
            />
          ))}
          <ExpandContent expanded={!!year}>
            <div className="names-list">
              {names?.map((name) => (
                <NameButton
                  key={name}
                  year={year}
                  name={name}
                  startBehavior={startBehavior}
                  isLoading={isLoading}
                />
              ))}
              <AddNameButton startBehavior={startBehavior} isLoading={isLoading} />
            </div>
          </ExpandContent>
        </div>
      )}
      <NewYearButton startBehavior={startBehavior} isLoading={isLoading} />
    </>
  );
}
