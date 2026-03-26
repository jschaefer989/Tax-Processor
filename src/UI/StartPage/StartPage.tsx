import { useEffect, useLayoutEffect, useState } from "react";
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
  const [hasInitialized, setHasInitialized] = useState(false);

  const { years, names, newYear, startBehavior } =
    useStartBehavior(taxBehavior);

  // On initial load, check if we have a database connection and load the years if so
  useLayoutEffect(() => {
    if (selectedYear !== undefined) {
      setHasInitialized(true);
      return;
    }

    let isDisposed = false;

    const initialize = async () => {
      // Preserve an already-established connection state (for example,
      // after a successful manual connection test before auth).
      if (!noDbConnection) {
        await startBehavior.loadYears();
        if (!isDisposed) {
          setHasInitialized(true);
        }
        return;
      }

      const hasDbConnection = await taxBehavior.checkDatabaseConnection();

      if (isDisposed) {
        return;
      }

      if (!hasDbConnection) {
        if (!isDisposed) {
          setHasInitialized(true);
        }
        return;
      }

      await startBehavior.loadYears();
      if (!isDisposed) {
        setHasInitialized(true);
      }
    };

    initialize();

    return () => {
      isDisposed = true;
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

  if (!hasInitialized) {
    return (
      <StartTitle>
        <div style={{ textAlign: "center", color: "var(--muted)" }}>
          Loading...
        </div>
      </StartTitle>
    );
  }

  return (
    <>
      <div className="data-buttons">
        <LogoutButton taxBehavior={taxBehavior} isLoading={isLoading} />
      </div>
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
          </>
        )}
      </StartTitle>
    </>
  );
}
