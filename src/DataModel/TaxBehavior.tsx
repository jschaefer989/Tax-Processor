import TaxProgress from "./TaxProgress";
import TaxResponse from "./TaxResponse";
import { Steps, TaxStep } from "./TaxStep";

export class TaxBehavior {
  /** Static steps and associated fields loaded from the database for the user to populate */
  steps: TaxStep[];
  progress: TaxProgress | undefined = undefined;

  constructor() {
    this.steps = [];
  }

  getStep(step: Steps): TaxStep | undefined {
    return this.steps.find((s) => s.step === step);
  }

  getStepIndex(step: Steps): number {
    return this.steps.findIndex((s) => s.step === step);
  }

  async checkDatabaseConnection(
    setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>,
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/health/db");
      if (!response.ok) {
        setNoDbConnection(true);
        return false;
      }

      const data = (await response.json()) as { connected: boolean };
      setNoDbConnection(!data.connected);
      return data.connected;
    } catch {
      setNoDbConnection(true);
      return false;
    }
  }

  async testDatabaseConnection(
    host: string,
    port: number,
    database: string,
    username: string,
    password: string,
    setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
  ): Promise<boolean> {
    try {
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
        setNoDbConnection(true);
        setError(data.message ?? "Unable to connect to database: " + response.statusText);
        return false;
      }

      setNoDbConnection(false);
      setError(undefined);
      return true;
    } catch (err) {
      setNoDbConnection(true);
      setError(err instanceof Error ? err.message : "Unable to connect to database.");
      return false;
    }
  }

  async loadYears(
    setYears: (years: number[]) => void,
    setError: (error: string | undefined) => void,
  ) {
    try {
      const response = await fetch("/api/progress/years");
      if (!response.ok) {
        throw new Error("Unable to load tax years.");
      }
      const data = (await response.json()) as number[];
      setYears(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load tax years.",
      );
    }
  }

  async loadNames(
    year: number,
    setNames:  React.Dispatch<React.SetStateAction<string[]>>,
    setError: (error: string | undefined) => void,
  ) {
    try {
      const response = await fetch(`/api/progress/${year}/names`);
      if (!response.ok) {
        throw new Error("Unable to load saved progress names.");
      }
      const data = (await response.json()) as string[];
      setNames(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load saved progress names.",
      );
    }
  }

  async loadAllNames(
    setNames:  React.Dispatch<React.SetStateAction<string[]>>,
    setError: (error: string | undefined) => void,
  ) {
    try {
      const response = await fetch(`/api/progress/names`);
      if (!response.ok) {
        throw new Error("Unable to load all names.");
      }
      const data = (await response.json()) as string[];
      setNames(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load all names.",
      );
    }
  }

  async loadSteps(
    setCurrentStep: (step: Steps) => void,
    setError: (error: string | undefined) => void,
  ) {
    try {
      const response = await fetch("/api/steps");
      if (!response.ok) {
        throw new Error("Unable to load tax steps.");
      }
      const data = (await response.json()) as { steps: TaxStep[] };
      this.steps = [...data.steps];
      if (data.steps.length > 0) {
        setCurrentStep(data.steps[0].step as Steps);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async resumeProgress(
    year: number,
    name: string,
    setCurrentStep: React.Dispatch<React.SetStateAction<Steps | undefined>>,
    setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
    setLastSavedTime: React.Dispatch<React.SetStateAction<Date | undefined>>,
    setNoDbConnection:  React.Dispatch<React.SetStateAction<boolean>>,
  ) {
    if (this.steps.length === 0) {
      return;
    }
    try {
      const response = await fetch(`/api/progress/${year}/${name}`);
      if (!response.ok) {
        if (response.status === 500) {
          setNoDbConnection(true);
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
      setCurrentStep(saved.currentStep as Steps);
      setResponses(saved.responses.map((r) => new TaxResponse(r.id, r.value)));
      setLastSavedTime(new Date(saved.updatedAt));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load saved progress.",
      );
    }
  }

  async saveProgress(
    year: number,
    name: string,
    currentStep: Steps | undefined,
    responses: TaxResponse[],
    setError: (error: string | undefined) => void,
    setIsSaving: (saving: boolean) => void,
    setToastMessage: (message: string | undefined) => void,
    setLastSavedTime: (time: Date | undefined) => void,
  ) {
    if (!currentStep) {
      return;
    }

    try {
      setIsSaving(true);
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
      setLastSavedTime(savedTime);
      setToastMessage(`Saved at ${savedTime.toLocaleTimeString()}`);
      setTimeout(() => setToastMessage(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save progress.");
    } finally {
      setIsSaving(false);
    }
  }

  async deleteProgress(
    year: number,
    name: string,
    setIsDeleting: (loading: boolean) => void,
    setToastMessage: (message: string | undefined) => void,
  ) {
    try {
      if (!this.progress) {
        return;
      }
      setIsDeleting(true);
      const response = await fetch(`/api/progress/${year}/${name}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete progress.");
      }
      setToastMessage("Progress deleted.");
      setTimeout(() => setToastMessage(undefined), 3000);
    } catch {
      setToastMessage("Failed to delete progress.");
    } finally {
      setIsDeleting(false);
    }
  }
}
