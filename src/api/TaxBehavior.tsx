import { DuplicateResponse } from "../data/DuplicateResponse";
import type { StateSetters } from "../data/StateManager";
import StateManager from "../data/StateManager";
import TaxButton, { type FieldCalculationCallback } from "../data/TaxButton";
import TaxField from "../data/TaxField";
import TaxFile, { type ReadableForm } from "../data/TaxFile";
import TaxProgress from "../data/TaxProgress";
import TaxResponse, { type TaxFieldLabel, type TaxForm } from "../data/TaxResponse";
import { TaxStep, type Steps } from "../data/TaxStep";
import ServerBehavior, { ServerDownError } from "./ServerBehavior";
import ServerNormalizer from "./ServerNormalizer";

// TODO: the APIs in this file could use more modularization

export class TaxBehavior {
  /** Static steps and associated fields loaded from the database for the user to populate */
  steps: TaxStep[];
  progress: TaxProgress | undefined = undefined;
  /** Incoming responses from a file upload that are held until the duplicate popup is confirmed or cancelled */
  pendingFileResponses: TaxResponse[] = [];
  progressVersion: number | undefined = undefined;
  state: StateManager;
  serverBehavior: ServerBehavior;

  constructor(stateSetters: StateSetters, serverBehavior: ServerBehavior) {
    this.state = new StateManager(stateSetters);
    this.steps = [];
    this.serverBehavior = serverBehavior;

  }

  getStep(step: Steps): TaxStep | undefined {
    return this.steps.find((s) => s.step === step);
  }

  getStepIndex(step: Steps): number {
    return this.steps.findIndex((s) => s.step === step);
  }

  getResponse(
    form: string,
    label: string,
    line?: number,
  ): TaxResponse | undefined {
    return this.progress?.responses.find(
      (response) =>
        response.form === form &&
        response.label === label &&
        (line === undefined || response.line === line),
    );
  }

  getResponsesForLine(form: string, line: number): TaxResponse[] {
    return (
      this.progress?.responses.filter(
        (r) => r.form === form && r.line === line,
      ) ?? []
    );
  }

  getMissingFieldsForStep(step: Steps, responses: TaxResponse[]): TaxField[] {
    const stepInfo = this.getStep(step);
    if (!stepInfo) {
      return [];
    }

    const missingFields: TaxField[] = [];
    for (const field of stepInfo.getRequiredFields()) {
      const response = responses.find(
        (response) =>
          response.form === field.form &&
          response.label === field.taxFieldLabel,
      );
      if (!response || !response.value || response.value.trim() === "") {
        missingFields.push(field);
      }
    }
    return missingFields;
  }

  //#region API Calls
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      this.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch("/api/health/db");
      if (!response.ok) {
        this.state.setNoDbConnection(true);
        return false;
      }

      const data = (await response.json()) as { connected: boolean };
      this.state.setNoDbConnection(!data.connected);
      return data.connected;
    } catch (err) {
      if (!(err instanceof ServerDownError)) {
        this.state.setNoDbConnection(true);
      }
      return false;
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async getDatabaseConnectionStatus(): Promise<boolean | undefined> {
    try {
      const response = await this.serverBehavior.serverApiFetch("/api/health/db");
      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { connected: boolean };
      return data.connected;
    } catch (err) {
      if (err instanceof ServerDownError) {
        return undefined;
      }
      return false;
    }
  }

  async refreshDbConnectionState(): Promise<boolean | undefined> {
    const connected = await this.getDatabaseConnectionStatus();
    if (connected !== undefined) {
      this.state.setNoDbConnection(!connected);
    }
    return connected;
  }

  async testDatabaseConnection(
    host: string,
    port: number,
    database: string,
    username: string,
    password: string,
  ): Promise<boolean> {
    try {
      this.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch("/api/health/db/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host,
          port,
          database,
          username,
          password,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        this.state.setNoDbConnection(true);
        this.state.setToastMessage(
          data.message ??
            "Unable to connect to database: " + response.statusText,
        );
        return false;
      }

      this.state.setNoDbConnection(false);
      this.state.setToastMessage(undefined);
      return true;
    } catch (err) {
      if (!(err instanceof ServerDownError)) {
        this.state.setNoDbConnection(true);
      }
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to connect to database.",
      );
      return false;
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async loadSteps(): Promise<boolean> {
    try {
      this.state.setIsLoading(true);
      this.progressVersion = undefined;
      const response = await this.serverBehavior.serverApiFetch("/api/steps");
      if (!response.ok) {
        throw new Error("Unable to load tax steps.");
      }
      const data = (await response.json()) as TaxStep[];
      this.steps = data.map(
        (step) =>
          new TaxStep(
            ServerNormalizer.normalizeStep(step.step),
            step.title,
            step.description,
            step.fields.map(
              (field) =>
                new TaxField(
                  field.form as TaxForm,
                  ServerNormalizer.normalizeFieldLabel(field.taxFieldLabel),
                  field.label,
                  ServerNormalizer.normalizeFieldType(field.type),
                  {
                    isRequired: field.isRequired,
                    helperText: field.helperText,
                    selectionOptions: field.selectionOptions,
                    subsection: field.subsection,
                  },
                ),
            ),
            step.files.map(
              (file) =>
                new TaxFile(
                  file.fromForm as ReadableForm,
                  file.toForm as TaxForm,
                  file.label,
                ),
            ),
            step.buttons.map(
              (button) =>
                new TaxButton(
                  button.form as TaxForm,
                  ServerNormalizer.normalizeFieldLabel(button.taxFieldLabel),
                  button.label,
                  ServerNormalizer.normalizeCalculationCallback(
                    button.calculationCallback,
                  ),
                  button.subsection,
                  button.helperText,
                ),
            ),
          ),
      );

      if (this.steps.length > 0) {
        this.state.setCurrentStep(this.steps[0].step);
      }
      this.state.setNoDbConnection(false);
      this.state.setToastMessage(undefined);
      return true;
    } catch (err) {
      await this.refreshDbConnectionState();
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      return false;
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async resumeProgress(year: number, name: string): Promise<boolean> {
    if (this.steps.length === 0) {
      return false;
    }
    try {
      this.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch(`/api/progress/${year}/${name}`);
      if (!response.ok) {
        if (response.status === 404) {
          this.progressVersion = undefined;
          this.state.setNoDbConnection(false);
          this.state.setToastMessage(undefined);
          return true;
        }
        throw new Error("Unable to load saved progress.");
      }
      const saved = (await response.json()) as TaxProgress;
      if (saved.year !== year) {
        return false;
      }
      this.progressVersion = saved.version;
      this.state.setNoDbConnection(false);
      this.state.setCurrentStep(
        ServerNormalizer.normalizeStep(saved.currentStep),
      );
      this.state.setResponses(
        saved.responses.map(
          (response) =>
            new TaxResponse(
              response.form,
              ServerNormalizer.normalizeFieldLabel(response.label),
              response.line,
              response.value,
              { fromCode: response.formCode, subsection: response.subsection },
            ),
        ),
      );
      this.state.setLastSavedTime(new Date(saved.updatedAt));
      this.state.setToastMessage(undefined);
      return true;
    } catch (err) {
      await this.refreshDbConnectionState();
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to load saved progress.",
      );
      return false;
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async saveProgress(
    year: number,
    name: string,
    currentStep: Steps | undefined,
    responses: TaxResponse[],
  ) {
    if (!currentStep) {
      return;
    }

    try {
      this.state.setIsLoading(true);
      const payload: {
        year: number;
        name: string;
        currentStep: string;
        expectedVersion?: number;
        responses: TaxResponse[];
      } = {
        year,
        name,
        currentStep: ServerNormalizer.serializeStepForApi(currentStep),
        expectedVersion: this.progressVersion,
        responses,
      };
      const response = await this.serverBehavior.serverApiFetch("/api/progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 409) {
          const data = (await response.json().catch(() => ({}))) as {
            message?: string;
          };
          const message =
            data.message ??
            "This return was changed in another session. Reload and try again.";

          // TODO: Consider a more robust way to detect deleted progress rather than relying on message text
          if (message.toLowerCase().includes("deleted")) {
            this.returnToStartPage();
            this.progressVersion = undefined;
          }

          throw new Error(message);
        }

        throw new Error("Unable to save progress.");
      }
      const saved = (await response.json()) as TaxProgress;
      this.progressVersion = saved.version;
      const savedTime = new Date(saved.updatedAt);
      this.state.setLastSavedTime(savedTime);
      this.state.setToastMessage(`Saved at ${savedTime.toLocaleTimeString()}`);
    } catch (err) {
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to save progress.",
      );
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async deleteProgress(year: number, name: string) {
    try {
      this.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch(`/api/progress/${year}/${name}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      this.progressVersion = undefined;
      this.state.setToastMessage("Progress deleted.");
    } catch (err) {
      this.state.setToastMessage(
        "Failed to delete progress: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async uploadTaxFile(file: File, formType: string) {
    try {
      this.state.setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("form", formType);
      const response = await this.serverBehavior.serverApiFetch("/api/steps/file", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText) as { message?: string };
          throw new Error(errorData.message ?? "Unable to upload file.");
        } catch {
          throw new Error(
            `Server error: ${responseText || response.statusText}`,
          );
        }
      }

      if (!responseText) {
        throw new Error("Server returned an empty response.");
      }

      const data = JSON.parse(responseText) as TaxResponse[];
      const incomingResponses = data.map(
        (item) =>
          new TaxResponse(
            item.form,
            ServerNormalizer.normalizeFieldLabel(item.label),
            item.line,
            item.value,
            {
              fromCode: item.formCode,
              subsection: item.subsection,
            },
          ),
      );
      this.state.setResponses((existingResponses) => {
        const duplicates = this.getDuplicateResponses(
          incomingResponses,
          existingResponses,
        );
        if (duplicates.length > 0) {
          this.pendingFileResponses = incomingResponses;
          this.state.setDuplicateResponses(duplicates);
          return existingResponses;
        }
        return [...existingResponses, ...incomingResponses];
      });
    } catch (err) {
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to upload file.",
      );
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async calculateFieldRequest(
    callback: FieldCalculationCallback,
    responses: TaxResponse[],
  ): Promise<string | undefined> {
    try {
      this.state.setIsLoading(true);
      const callbackForApi =
        ServerNormalizer.serializeCalculationCallbackForApi(callback);
      const response = await this.serverBehavior.serverApiFetch("/api/steps/calculate-field", {
        method: "POST",
        body: JSON.stringify({
          calculationCallback: callbackForApi,
          responses,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText) as { message?: string };
          throw new Error(errorData.message ?? "Unable to calculate field.");
        } catch {
          throw new Error(
            `Server error: ${responseText || response.statusText}`,
          );
        }
      }

      if (!responseText) {
        throw new Error("Server returned an empty response.");
      }

      const parsedValue = JSON.parse(responseText);
      return parsedValue === undefined || parsedValue === null
        ? undefined
        : String(parsedValue);
    } catch (err) {
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to calculate field.",
      );
    } finally {
      this.state.setIsLoading(false);
    }
  }
  //#endregion API Calls

  returnToStartPage() {
    this.state.setYear(undefined);
    this.state.setCurrentStep(undefined);
    this.state.setResponses([]);
    this.state.setShowStartPage(true);
  }

  getDuplicateResponses(
    incomingResponses: TaxResponse[],
    existingResponses: TaxResponse[],
  ): DuplicateResponse[] {
    const duplicates: DuplicateResponse[] = [];
    for (const incoming of incomingResponses) {
      const existing = existingResponses.find(
        (r) =>
          r.form === incoming.form &&
          r.label === incoming.label &&
          r.line === incoming.line,
      );
      if (existing) {
        duplicates.push(
          new DuplicateResponse(
            incoming.form,
            incoming.label,
            incoming.line,
            existing.value, // current value
            incoming.value, // new value (from file)
          ),
        );
      }
    }
    return duplicates;
  }

  confirmPendingFileResponses() {
    const pending = this.pendingFileResponses;
    this.pendingFileResponses = [];
    this.state.setDuplicateResponses(undefined);
    this.state.setResponses((prevResponses) => {
      const existingResponses = [...prevResponses];
      for (const newResponse of pending) {
        const existingIndex = existingResponses.findIndex(
          (existingResponse) =>
            existingResponse.form === newResponse.form &&
            existingResponse.label === newResponse.label &&
            existingResponse.line === newResponse.line,
        );
        if (existingIndex !== -1) {
          existingResponses[existingIndex].value = newResponse.value;
        } else {
          existingResponses.push(newResponse);
        }
      }
      return existingResponses;
    });
  }

  cancelPendingFileResponses() {
    this.pendingFileResponses = [];
    this.state.setDuplicateResponses(undefined);
  }

  static getResponsesByLine(
    responses: TaxResponse[],
  ): Map<number, TaxResponse[]> {
    const responsesByLine = new Map<number, TaxResponse[]>();

    for (const response of responses) {
      if (responsesByLine.has(response.line)) {
        const existingResponse = responsesByLine.get(response.line);
        if (!existingResponse) {
          throw new Error(
            `Expected existing response for line ${response.line}`,
          );
        }
        responsesByLine.set(response.line, [...existingResponse, response]);
      } else {
        responsesByLine.set(response.line, [response]);
      }
    }

    const sortedEntries = Array.from(responsesByLine.entries())
      .sort(([leftLine], [rightLine]) => leftLine - rightLine)
      .map(
        ([line, responsesForLine]) =>
          [line, TaxResponse.sortByLabel(responsesForLine)] as const,
      );

    return new Map<number, TaxResponse[]>(sortedEntries);
  }

  updateResponses(
    form: TaxForm,
    label: TaxFieldLabel,
    line: number,
    value: string,
    subsection?: string,
  ) {
    this.state.setResponses((previousResponses) => {
      const existingIndex = previousResponses.findIndex(
        (response) =>
          response.form === form &&
          response.label === label &&
          response.line === line,
      );

      // If the response for this field already exists, update it.
      if (existingIndex !== -1) {
        const updatedResponse = [...previousResponses];

        // Remove the response if the value is empty
        if (value.trim() === "") {
          updatedResponse.splice(existingIndex, 1);
          return updatedResponse;
          // Otherwise, update the existing response
        } else {
          updatedResponse[existingIndex] = new TaxResponse(
            form,
            label,
            line,
            value,
            {
              subsection,
            },
          );
          return updatedResponse;
        }

        // Otherwise, add a new response.
      } else {
        // Don't add a response if the value is empty
        if (value.trim() === "") {
          return previousResponses;
        } else {
          const newResponse = new TaxResponse(form, label, line, value, {
            subsection,
          });
          return [...previousResponses, newResponse];
        }
      }
    });
  }
}
