import { useCallback, useState } from "react";
import type { StartBehavior } from "../../api/StartBehavior";
import ExclamationMarkIcon from "../General/ExclamationMarkIcon";
import ExpandArrowIcon from "../General/ExpandArrowIcon";

type DatabaseConnectionFormProps = {
  readonly startBehavior: StartBehavior;
  readonly isLoading: boolean;
};

export default function DatabaseConnectionForm(
  props: DatabaseConnectionFormProps,
) {
  const { startBehavior, isLoading } = props;

  // #region useState
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPort, setDbPort] = useState("5432");
  const [dbName, setDbName] = useState("");
  const [dbUsername, setDbUsername] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [showForm, setShowForm] = useState(false);
  // #endregion

  // #region useCallback
  const onConnectDatabase = useCallback(async () => {
    const parsedPort = Number.parseInt(dbPort, 10);
    const isConnected = await startBehavior.taxBehavior.testDatabaseConnection(
      dbHost.trim(),
      Number.isNaN(parsedPort) ? 5432 : parsedPort,
      dbName.trim(),
      dbUsername.trim(),
      dbPassword,
    );

    if (isConnected) {
      startBehavior.loadYears();
    }
  }, [dbHost, dbPort, dbName, dbUsername, dbPassword]);

  const toggleFormVisibility = useCallback(() => {
    setShowForm((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onConnectDatabase();
      }
    },
    [onConnectDatabase],
  );
  // #endregion

  const isDisabled =
    isLoading ||
    dbHost.trim() === "" ||
    dbName.trim() === "" ||
    dbUsername.trim() === "";

  return (
    <>
      <button
        type="button"
        className="db-connection-toggle subtitle-chip subtitle-chip--error-soft"
        onClick={toggleFormVisibility}
        aria-expanded={showForm}
        aria-controls="db-connection-form"
      >
        <ExclamationMarkIcon />
        No database connection. Enter database details to test a connection.{" "}
        <ExpandArrowIcon className="expansion-arrow" />
      </button>
      <div
        id="db-connection-form"
        className={`db-connection-panel ${showForm ? "visible" : ""}`}
      >
        <div className={`db-connection-form ${showForm ? "visible" : ""}`}>
          <label className="field">
            <span>Host</span>
            <input
              type="text"
              value={dbHost}
              onChange={(event) => setDbHost(event.target.value)}
              placeholder="localhost"
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={dbUsername}
              onChange={(event) => setDbUsername(event.target.value)}
              placeholder="postgres"
              onKeyDown={handleKeyDown}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={dbPassword}
              onChange={(event) => setDbPassword(event.target.value)}
              placeholder="••••••••"
              onKeyDown={handleKeyDown}
            />
          </label>
          <button
            style={{ marginTop: "0.75rem" }}
            className={isDisabled ? "disabled" : "button"}
            type="button"
            onClick={onConnectDatabase}
            disabled={isDisabled}
            title={
              isLoading
                ? "Server is busy. Please wait..."
                : isDisabled
                  ? "Please fill in all required fields to enable the connect button"
                  : "Attempt to connect to the database with provided credentials"
            }
          >
            Connect database
          </button>
        </div>
      </div>
    </>
  );
}
