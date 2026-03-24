import { useEffect } from "react";
import type { TaxBehavior } from "../../api/TaxBehavior";
import { useStartBehavior } from "../../hooks/useStartBehavior";
import MissingDatabaseControls from "./MissingDatabaseControls";
import NewTaxpayerPopup from "./NewTaxpayerPopup";
import YearSelectionControls from "./YearSelectionControls";
import LogoutButton from "../Header/LogoutButton";
import StartTitle from "./StartTitle";

type StartPageProps = {
  readonly taxBehavior: TaxBehavior;
  readonly selectedYear: number | undefined;
  readonly selectedName: string | undefined;
  readonly isLoading: boolean;
  readonly noDbConnection: boolean;
};

export default function StartPage(props: StartPageProps) {
  const { taxBehavior, selectedYear, isLoading, noDbConnection } = props;

  const { years, names, newYear, startBehavior } =
    useStartBehavior(taxBehavior);

  // On initial load, check if we have a database connection and load the years if so
  useEffect(() => {
    if (selectedYear !== undefined) {
      return;
    }

    let isCancelled = false;

    const initialize = async () => {
      // Preserve an already-established connection state (for example,
      // after a successful manual connection test before auth).
      if (!noDbConnection) {
        await startBehavior.loadYears();
        return;
      }

      const hasDbConnection = await taxBehavior.checkDatabaseConnection();

      if (isCancelled) {
        return;
      }

      if (!hasDbConnection) {
        return;
      }

      await startBehavior.loadYears();
    };

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear, noDbConnection, startBehavior, taxBehavior]);

  // Reload the years whenever the selected year changes back to undefined
  // (e.g. after deleting a progress), or if we establish a database connection
  // after previously not having one
  useEffect(() => {
    if (selectedYear !== undefined || noDbConnection) {
      return;
    }

    startBehavior.loadYears();
  }, [selectedYear, noDbConnection, startBehavior]);

  if (newYear && selectedYear !== undefined) {
    return (
      <NewTaxpayerPopup startBehavior={startBehavior} year={selectedYear} />
    );
  }

  return (
    <StartTitle>
      {noDbConnection ? (
        <MissingDatabaseControls
          startBehavior={startBehavior}
          isLoading={isLoading}
        />
      ) : (
        <>
          <YearSelectionControls
            startBehavior={startBehavior}
            isLoading={isLoading}
            year={selectedYear}
            names={names}
            years={years}
          />
          <LogoutButton />
        </>
      )}
    </StartTitle>
  );
}
