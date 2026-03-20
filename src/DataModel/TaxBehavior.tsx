import type { ContextMenuProps } from "../UI/General/ContextMenu";
import { DuplicateResponse } from "./DuplicateResponse";
import type SelectionOption from "./SelectionOption";
import TaxField from "./TaxField";
import type { FieldCalculationCallback, TaxFieldType } from "./TaxField";
import TaxFile, { ReadableForm } from "./TaxFile";
import TaxProgress from "./TaxProgress";
import TaxResponse, { TaxFieldLabel, TaxForm } from "./TaxResponse";
import { FilingStatus, Steps, TaxStep } from "./TaxStep";

interface StepResponse {
  steps: StepDto[];
  standardDeductions: Record<FilingStatus, number>;
}

//#region DTOs
interface StepDto {
  step: Steps;
  title: string;
  description: string;
  fields: TaxFieldDto[];
  files: TaxFileDto[];
}

interface TaxFieldDto {
  form: string;
  taxFieldLabel: string;
  label: string;
  type: string;
  isRequired: boolean;
  helperText?: string;
  selectionOptions?: SelectionOption[];
  subsection?: string;
  calculationCallback?: FieldCalculationCallback;
}

interface TaxFileDto {
  fromForm: string;
  toForm: string;
  label: string;
}
//#endregion DTOs

export class TaxBehavior {
  /** Static steps and associated fields loaded from the database for the user to populate */
  steps: TaxStep[];
  progress: TaxProgress | undefined = undefined;
  /** Incoming responses from a file upload that are held until the duplicate popup is confirmed or cancelled */
  pendingFileResponses: TaxResponse[] = [];

  //#region State
  setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>> =
    () => {};
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>> = () => {};
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>> =
    () => {};
  setYear: React.Dispatch<React.SetStateAction<number | undefined>> = () => {};
  setName: React.Dispatch<React.SetStateAction<string | undefined>> = () => {};
  setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setShowStartPage: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setPanelExpanded: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>> = () => {};
  setToastMessage: React.Dispatch<React.SetStateAction<string | undefined>> =
    () => {};
  setContextMenu: React.Dispatch<
    React.SetStateAction<ContextMenuProps | undefined>
  > = () => {};
  setDuplicateResponses: React.Dispatch<
    React.SetStateAction<DuplicateResponse[] | undefined>
  > = () => {};
  setLastTimeTriedAdvancing: React.Dispatch<React.SetStateAction<Date | undefined>> = () => {};
  //#endregion State

  constructor(
    setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>,
    setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>>,
    setYear: React.Dispatch<React.SetStateAction<number | undefined>>,
    setName: React.Dispatch<React.SetStateAction<string | undefined>>,
    setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>,
    setShowStartPage: React.Dispatch<React.SetStateAction<boolean>>,
    setPanelExpanded: React.Dispatch<React.SetStateAction<boolean>>,
    setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>,
    setToastMessage: React.Dispatch<React.SetStateAction<string | undefined>>,
    setContextMenu: React.Dispatch<
      React.SetStateAction<ContextMenuProps | undefined>
    >,
    setDuplicateResponses: React.Dispatch<
      React.SetStateAction<DuplicateResponse[] | undefined>
    >,
    setLastTimeTriedAdvancing: React.Dispatch<React.SetStateAction<Date | undefined>>,
  ) {
    this.setCurrentStep = setCurrentStep;
    this.setResponses = setResponses;
    this.setIsLoading = setIsLoading;
    this.setLastSavedTime = setLastSavedTime;
    this.setYear = setYear;
    this.setName = setName;
    this.setNoDbConnection = setNoDbConnection;
    this.setShowStartPage = setShowStartPage;
    this.setPanelExpanded = setPanelExpanded;
    this.setSidebarExpanded = setSidebarExpanded;
    this.setToastMessage = setToastMessage;
    this.setContextMenu = setContextMenu;
    this.setDuplicateResponses = setDuplicateResponses;
    this.setLastTimeTriedAdvancing = setLastTimeTriedAdvancing;
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

  getMissingFieldsForStep(step: Steps): TaxField[] {
    const stepInfo = this.getStep(step);
    if (!stepInfo) {
      return [];
    }

    const requiredFields = stepInfo.getRequiredFields();
    console.log(`Checking required fields for step ${step}:`, requiredFields);
    const missingFields: TaxField[] = [];
    
    for (const field of requiredFields) {
      const response = this.getResponse(field.form, field.label);
      if (!response || response.value === undefined || response.value === "") {
        missingFields.push(field);
      }
    }
    console.log(`Missing fields for step ${step}:`, missingFields);
    return missingFields;
  }

  //#region API Calls
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      this.setIsLoading(true);
      const response = await fetch("/api/health/db");
      if (!response.ok) {
        this.setNoDbConnection(true);
        return false;
      }

      const data = (await response.json()) as { connected: boolean };
      this.setNoDbConnection(!data.connected);
      return data.connected;
    } catch {
      this.setNoDbConnection(true);
      return false;
    } finally {
      this.setIsLoading(false);
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
    this.setNoDbConnection(!connected);
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
      this.setIsLoading(true);
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
        this.setNoDbConnection(true);
        this.setToastMessage(
          data.message ??
            "Unable to connect to database: " + response.statusText,
        );
        return false;
      }

      this.setNoDbConnection(false);
      this.setToastMessage(undefined);
      return true;
    } catch (err) {
      this.setNoDbConnection(true);
      this.setToastMessage(
        err instanceof Error ? err.message : "Unable to connect to database.",
      );
      return false;
    } finally {
      this.setIsLoading(false);
    }
  }

  async loadSteps(): Promise<boolean> {
    try {
      this.setIsLoading(true);
      const response = await fetch("/api/steps");
      if (!response.ok) {
        throw new Error("Unable to load tax steps.");
      }
      const data = (await response.json()) as StepResponse;
      this.steps = data.steps.map(
        (step) =>
          new TaxStep(
            step.step,
            step.title,
            step.description,
            step.fields.map(field => new TaxField(
              field.form as TaxForm,
              field.taxFieldLabel as TaxFieldLabel, 
              field.label,
              field.type as TaxFieldType, 
              {
                isRequired: field.isRequired,
                helperText: field.helperText,
                selectionOptions: field.selectionOptions,
                subsection: field.subsection,
                calculationCallback: field.calculationCallback,
              }
            )),
            step.files.map(
              (file) =>
                new TaxFile(
                  file.fromForm as ReadableForm,
                  file.toForm,
                  file.label,
                ),
            ),
          ),
      );

      if (this.steps.length > 0) {
        this.setCurrentStep(this.steps[0].step);
      }
      this.setNoDbConnection(false);
      this.setToastMessage(undefined);
      return true;
    } catch (err) {
      await this.refreshDbConnectionState();
      this.setToastMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      return false;
    } finally {
      this.setIsLoading(false);
    }
  }

  async resumeProgress(year: number, name: string): Promise<boolean> {
    if (this.steps.length === 0) {
      return false;
    }
    try {
      this.setIsLoading(true);
      const response = await fetch(`/api/progress/${year}/${name}`);
      if (!response.ok) {
        if (response.status === 404) {
          this.setNoDbConnection(false);
          this.setToastMessage(undefined);
          return true;
        }
        throw new Error("Unable to load saved progress.");
      }
      const saved = (await response.json()) as TaxProgress;
      if (saved.year !== year) {
        return false;
      }
      this.setNoDbConnection(false);
      this.setCurrentStep(saved.currentStep as Steps);
      this.setResponses(
        saved.responses.map(
          (response) =>
            new TaxResponse(
              response.form,
              response.label,
              response.line,
              response.value,
              { fromCode: response.formCode, subsection: response.subsection },
            ),
        ),
      );
      this.setLastSavedTime(new Date(saved.updatedAt));
      this.setToastMessage(undefined);
      return true;
    } catch (err) {
      await this.refreshDbConnectionState();
      this.setToastMessage(
        err instanceof Error ? err.message : "Unable to load saved progress.",
      );
      return false;
    } finally {
      this.setIsLoading(false);
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
      this.setIsLoading(true);
      const payload: Partial<TaxProgress> = {
        year,
        name,
        currentStep: this.getStep(currentStep)?.step,
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
      this.setLastSavedTime(savedTime);
      this.setToastMessage(`Saved at ${savedTime.toLocaleTimeString()}`);
    } catch (err) {
      this.setToastMessage(
        err instanceof Error ? err.message : "Unable to save progress.",
      );
    } finally {
      this.setIsLoading(false);
    }
  }

  async deleteProgress(year: number, name: string) {
    try {
      this.setIsLoading(true);
      const response = await fetch(`/api/progress/${year}/${name}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      this.setToastMessage("Progress deleted.");
    } catch (err) {
      this.setToastMessage(
        "Failed to delete progress: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      this.setIsLoading(false);
    }
  }

  async uploadTaxFile(file: File, formType: string) {
    try {
      this.setIsLoading(true);
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
          new TaxResponse(item.form, item.label, item.line, item.value, {
            fromCode: item.formCode,
            subsection: item.subsection,
          }),
      );
      this.setResponses((existingResponses) => {
        const duplicates = this.getDuplicateResponses(
          incomingResponses,
          existingResponses,
        );
        if (duplicates.length > 0) {
          this.pendingFileResponses = incomingResponses;
          this.setDuplicateResponses(duplicates);
          return existingResponses;
        }
        return [...existingResponses, ...incomingResponses];
      });
    } catch (err) {
      this.setToastMessage(
        err instanceof Error ? err.message : "Unable to upload file.",
      );
    } finally {
      this.setIsLoading(false);
    }
  }

  async calculateFieldRequest(
    callback: FieldCalculationCallback,
    value: string,
  ): Promise<string | undefined> {
    try {
      this.setIsLoading(true);
      const formData = new FormData();
      formData.append("calculationCallback", callback);
      formData.append("value", value);
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
      this.setToastMessage(
        err instanceof Error ? err.message : "Unable to upload file.",
      );
    } finally {
      this.setIsLoading(false);
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
    this.setDuplicateResponses(undefined);
    this.setResponses((prevResponses) => {
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
    this.setDuplicateResponses(undefined);
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
      .map(([line, responsesForLine]) => [
        line,
        TaxResponse.sortByLabel(responsesForLine),
      ] as const);

    return new Map<number, TaxResponse[]>(sortedEntries);
  }
}
