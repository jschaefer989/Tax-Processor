import type { ContextMenuProps } from "../UI/General/ContextMenu";
import { DuplicateResponse } from "./DuplicateResponse";
import TaxProgress from "./TaxProgress";
import TaxResponse from "./TaxResponse";
import { Steps, TaxStep } from "./TaxStep";

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
  setError: React.Dispatch<React.SetStateAction<string | undefined>> = () => {};
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
  setDuplicateResponses: React.Dispatch<React.SetStateAction<DuplicateResponse[] | undefined>> =
    () => {};
  //#endregion State

  constructor(
    setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>,
    setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
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
    setDuplicateResponses: React.Dispatch<React.SetStateAction<DuplicateResponse[] | undefined>>,
  ) {
    this.setCurrentStep = setCurrentStep;
    this.setResponses = setResponses;
    this.setIsLoading = setIsLoading;
    this.setError = setError;
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
    this.steps = [];
  }

  getStep(step: Steps): TaxStep | undefined {
    return this.steps.find((s) => s.step === step);
  }

  getStepIndex(step: Steps): number {
    return this.steps.findIndex((s) => s.step === step);
  }

  getResponse(form: string, label: string, line: number): TaxResponse | undefined {
    return this.progress?.responses.find(
      (r) => r.form === form && r.label === label && r.line === line,
    );
  }

  getResponsesForLine(form: string, line: number): TaxResponse[] {
    return this.progress?.responses.filter(
      (r) => r.form === form && r.line === line,
    ) ?? [];
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
        this.setError(
          data.message ??
            "Unable to connect to database: " + response.statusText,
        );
        return false;
      }

      this.setNoDbConnection(false);
      this.setError(undefined);
      return true;
    } catch (err) {
      this.setNoDbConnection(true);
      this.setError(
        err instanceof Error ? err.message : "Unable to connect to database.",
      );
      return false;
    } finally {
      this.setIsLoading(false);
    }
  }

  async loadSteps() {
    try {
      this.setIsLoading(true);
      const response = await fetch("/api/steps");
      if (!response.ok) {
        throw new Error("Unable to load tax steps.");
      }
      const data = (await response.json()) as { steps: TaxStep[] };
      this.steps = data.steps;

      if (this.steps.length > 0) {
        this.setCurrentStep(this.steps[0].step);
      }
    } catch (err) {
      this.setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      this.setIsLoading(false);
    }
  }

  async resumeProgress(year: number, name: string) {
    if (this.steps.length === 0) {
      return;
    }
    try {
      this.setIsLoading(true);
      const response = await fetch(`/api/progress/${year}/${name}`);
      if (!response.ok) {
        if (response.status === 500) {
          this.setNoDbConnection(true);
          return;
        }
        if (response.status === 404) {
          return;
        }
        throw new Error("Unable to load saved progress.");
      }
      const saved = (await response.json()) as TaxProgress;
      if (saved.year !== year) {
        return;
      }
      this.setNoDbConnection(false);
      this.setCurrentStep(saved.currentStep as Steps);
      this.setResponses(
        saved.responses.map(
          (r) => new TaxResponse(r.form, r.label, r.line, r.value),
        ),
      );
      this.setLastSavedTime(new Date(saved.updatedAt));
    } catch (err) {
      this.setError(
        err instanceof Error ? err.message : "Unable to load saved progress.",
      );
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
      this.setError(
        err instanceof Error ? err.message : "Unable to save progress.",
      );
    } finally {
      this.setIsLoading(false);
    }
  }

  async deleteProgress(year: number, name: string) {
    try {
      if (!this.progress) {
        return;
      }
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

      const data = JSON.parse(responseText) as Array<{
        form: string;
        label: string;
        line: number;
        value: string;
      }>;
      const incomingResponses = data.map(
        (item) =>
          new TaxResponse(
            item.form as never,
            item.label as never,
            item.line,
            item.value,
          ),
      );
      this.setResponses((existingResponses) => {
        const duplicates = this.getDuplicateResponses(incomingResponses, existingResponses);
        if (duplicates.length > 0) {
          this.pendingFileResponses = incomingResponses;
          this.setDuplicateResponses(duplicates);
          return existingResponses;
        }
        return [...existingResponses, ...incomingResponses];
      });
    } catch (err) {
      this.setError(
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
  ): DuplicateResponse[]  {
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
            existing.value,  // current value
            incoming.value,  // new value (from file)
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
}
