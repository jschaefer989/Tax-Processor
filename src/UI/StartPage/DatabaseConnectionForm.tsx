import { useState, useCallback } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import ExpandArrowIcon from "../General/ExpandArrowIcon";
import ExclamationMarkIcon from "../General/ExclamationMarkIcon";

interface DatabaseConnectionFormProps {
  readonly taxBehavior: TaxBehavior;
  readonly setYears: React.Dispatch<React.SetStateAction<number[]>>;
  readonly setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>;
  readonly isLoading: boolean;
}

export default function DatabaseConnectionForm(
  props: DatabaseConnectionFormProps,
) {
  const { taxBehavior, setYears, setNoDbConnection, isLoading } = props;

  // #region useState
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPort, setDbPort] = useState("5432");
  const [dbName, setDbName] = useState("");
  const [dbUsername, setDbUsername] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  // #endregion

  // #region useCallback
  const onConnectDatabase = useCallback(async () => {
    const parsedPort = Number.parseInt(dbPort, 10);
    const isConnected = await taxBehavior.testDatabaseConnection(
      dbHost.trim(),
      Number.isNaN(parsedPort) ? 5432 : parsedPort,
      dbName.trim(),
      dbUsername.trim(),
      dbPassword,
      setNoDbConnection,
      setError,
    );

    if (isConnected) {
      taxBehavior.loadYears(setYears, setError);
    }
  }, [
    dbHost,
    dbPort,
    dbName,
    dbUsername,
    dbPassword,
    taxBehavior,
    setNoDbConnection,
    setError,
    setYears,
  ]);
  // #endregion

  return (
    <>
      <button
        type="button"
        className="db-connection-toggle subtitle-chip subtitle-chip--error-soft"
        onClick={() => setShowForm(!showForm)}
        aria-expanded={showForm}
        aria-controls="db-connection-form"
      >
        <ExclamationMarkIcon />
        No database connection. Enter database details to test a connection.{" "}
        <ExpandArrowIcon className="expansion-arrow" />
      </button>
      {error && <p className="error">{error}</p>}
      <div
        id="db-connection-form"
        className={`db-connection-panel ${showForm ? "visible" : ""}`}
      >
        <div
          className={`new-taxpayer-form db-connection-form ${showForm ? "visible" : ""}`}
        >
          <label className="field">
            <span>Host</span>
            <input
              type="text"
              value={dbHost}
              onChange={(event) => setDbHost(event.target.value)}
              placeholder="localhost"
            />
          </label>
          <label className="field">
            <span>Port</span>
            <input
              type="number"
              value={dbPort}
              onChange={(event) => setDbPort(event.target.value)}
              placeholder="5432"
            />
          </label>
          <label className="field">
            <span>Database</span>
            <input
              type="text"
              value={dbName}
              onChange={(event) => setDbName(event.target.value)}
              placeholder="taxprocessor"
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={dbUsername}
              onChange={(event) => setDbUsername(event.target.value)}
              placeholder="postgres"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={dbPassword}
              onChange={(event) => setDbPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button
            style={{ marginTop: "0.75rem" }}
            type="button"
            onClick={onConnectDatabase}
            disabled={
              isLoading ||
              dbHost.trim() === "" ||
              dbName.trim() === "" ||
              dbUsername.trim() === ""
            }
          >
            Connect database
          </button>
        </div>
      </div>
    </>
  );
}
