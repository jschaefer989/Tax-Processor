import { useEffect } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import { useStartBehavior } from "../../hooks/useStartBehavior";
import MissingDatabaseControls from "./MissingDatabaseControls";
import NewTaxpayerPopup from "./NewTaxpayerPopup";
import YearSelectionControls from "./YearSelectionControls";

interface StartPageProps {
  readonly taxBehavior: TaxBehavior;
  readonly selectedYear: number | undefined;
  readonly selectedName: string | undefined;
  readonly isLoading: boolean;
  readonly noDbConnection: boolean;
  readonly error: string | undefined;
}

export default function StartPage(props: StartPageProps) {
  const {
    taxBehavior,
    selectedYear,
    selectedName,
    isLoading,
    noDbConnection,
    error,
  } = props;

  const { years, names, newYear, startBehavior } =
    useStartBehavior(taxBehavior);

  useEffect(() => {
    if (selectedYear) {
      return;
    }
    let isCancelled = false;

    const initialize = async () => {
      const hasDbConnection = await taxBehavior.checkDatabaseConnection();

      if (isCancelled) {
        return;
      }

      if (!hasDbConnection) {
        return;
      }

      startBehavior.loadYears();
    };

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear]);

  if (newYear && selectedYear !== undefined) {
    return (
      <NewTaxpayerPopup startBehavior={startBehavior} year={selectedYear} />
    );
  }

  return (
    <div className="start-page">
      <p className="eyebrow">Tax Clarity</p>
      <h1>File with clarity, step by step.</h1>
      {noDbConnection ? (
        <MissingDatabaseControls
          startBehavior={startBehavior}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <YearSelectionControls
          startBehavior={startBehavior}
          isLoading={isLoading}
          year={selectedYear}
          names={names}
          years={years}
        />
      )}
    </div>
  );
}
