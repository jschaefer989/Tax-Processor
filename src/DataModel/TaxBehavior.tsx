import { DuplicateResponse } from "./DuplicateResponse";
import ServerNormalizer, { type StepResponse, FILING_STATUS_TO_API } from "./ServerNormalizer";
import type { StateSetters } from "./StateManager";
import StateManager from "./StateManager";
import TaxField, { FieldCalculationCallback } from "./TaxField";
import TaxFile, { ReadableForm } from "./TaxFile";
import TaxProgress from "./TaxProgress";
import TaxResponse, { TaxForm } from "./TaxResponse";
import { Steps, TaxStep } from "./TaxStep";

export class TaxBehavior {
  /** Static steps and associated fields loaded from the database for the user to populate */
  steps: TaxStep[];
  progress: TaxProgress | undefined = undefined;
  /** Incoming responses from a file upload that are held until the duplicate popup is confirmed or cancelled */
  pendingFileResponses: TaxResponse[] = [];
  state: StateManager;

  constructor(
    stateSetters: StateSetters
  ) {
    this.state = new StateManager(stateSetters);
    this.steps = [];
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
      const response = await fetch("/api/health/db");
      if (!response.ok) {
        this.state.setNoDbConnection(true);
        return false;
      }

      const data = (await response.json()) as { connected: boolean };
      this.state.setNoDbConnection(!data.connected);
      return data.connected;
    } catch {
      this.state.setNoDbConnection(true);
      return false;
    } finally {
      this.state.setIsLoading(false);
    }
  }

  async getDatabaseConnectionStatus(): Promise<boolean> {
    try {
      const response = await fetch("/api/health/db");
      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { connected: boolean };
      return data.connected;
    } catch {
      return false;
    }
  }

  async refreshDbConnectionState(): Promise<boolean> {
    const connected = await this.getDatabaseConnectionStatus();
    this.state.setNoDbConnection(!connected);
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
      const response = await fetch("/api/health/db/test", {
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
      this.state.setNoDbConnection(true);
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
      const response = await fetch("/api/steps");
      if (!response.ok) {
        throw new Error("Unable to load tax steps.");
      }
      const data = (await response.json()) as StepResponse;
      this.steps = data.steps.map(
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
                    calculationCallback: ServerNormalizer.normalizeCalculationCallback(
                      field.calculationCallback,
                    ),
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
      const response = await fetch(`/api/progress/${year}/${name}`);
      if (!response.ok) {
        if (response.status === 404) {
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
      this.state.setNoDbConnection(false);
      this.state.setCurrentStep(ServerNormalizer.normalizeStep(saved.currentStep));
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
        responses: TaxResponse[];
      } = {
        year,
        name,
        currentStep: ServerNormalizer.serializeStepForApi(currentStep),
        responses,
      };
      const response = await fetch("/api/progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Unable to save progress.");
      }
      const saved = (await response.json()) as TaxProgress;
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
      const response = await fetch(`/api/progress/${year}/${name}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
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
      const response = await fetch("/api/steps/file", {
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
    value: string,
  ): Promise<string | undefined> {
    try {
      this.state.setIsLoading(true);
      const formData = new FormData();
      const callbackForApi =
        callback === FieldCalculationCallback.StandardDeduction
          ? "StandardDeduction"
          : callback;
      formData.append("calculationCallback", callbackForApi);
      formData.append("value", FILING_STATUS_TO_API[value] ?? value);
      const response = await fetch("/api/steps/calculate-field", {
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

      return JSON.parse(responseText);
    } catch (err) {
      this.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to upload file.",
      );
    } finally {
      this.state.setIsLoading(false);
    }
  }
  //#endregion API Calls

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
}
