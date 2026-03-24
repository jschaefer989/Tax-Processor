import type { TaxBehavior } from "../api/TaxBehavior";
import type ServerBehavior from "./ServerBehavior";

export class StartBehavior {
  setYears: React.Dispatch<React.SetStateAction<number[]>>;
  setNames: React.Dispatch<React.SetStateAction<string[]>>;
  setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  taxBehavior: TaxBehavior;
  serverBehavior: ServerBehavior;

  constructor(
    setYears: React.Dispatch<React.SetStateAction<number[]>>,
    setNames: React.Dispatch<React.SetStateAction<string[]>>,
    setNewYear: React.Dispatch<React.SetStateAction<boolean>>,
    taxBehavior: TaxBehavior,
  ) {
    this.setYears = setYears;
    this.setNames = setNames;
    this.setNewYear = setNewYear;
    this.taxBehavior = taxBehavior;
    this.serverBehavior = taxBehavior.serverBehavior;
  }

  async loadYears() {
    try {
      this.taxBehavior.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch("/api/progress/years");
      if (response.status === 401 || response.status === 403) {
        // Session is not authenticated (common during logout); avoid noisy toasts.
        this.setYears([]);
        this.taxBehavior.state.setToastMessage(undefined);
        return;
      }
      if (!response.ok) {
        throw new Error("Unable to load tax years.");
      }
      const data = (await response.json()) as number[];
      this.setYears(data);
      this.taxBehavior.state.setToastMessage(undefined);
    } catch (err) {
      this.taxBehavior.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to load tax years.",
      );
    } finally {
      this.taxBehavior.state.setIsLoading(false);
    }
  }

  async loadNames(
    year: number,
  ) {
    try {
      this.taxBehavior.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch(`/api/progress/${year}/names`);
      if (!response.ok) {
        throw new Error("Unable to load saved progress names.");
      }
      const data = (await response.json()) as string[];
      this.setNames(data);
      this.taxBehavior.state.setToastMessage(undefined);
    } catch (err) {
      this.taxBehavior.state.setToastMessage(
        err instanceof Error
          ? err.message
          : "Unable to load saved progress names.",
      );
    } finally {
      this.taxBehavior.state.setIsLoading(false);
    }
  }

  async loadAllNames(
  ) {
    try {
      this.taxBehavior.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch(`/api/progress/names`);
      if (!response.ok) {
        throw new Error("Unable to load all names.");
      }
      const data = (await response.json()) as string[];
      this.setNames(data);
      this.taxBehavior.state.setToastMessage(undefined);
    } catch (err) {
      this.taxBehavior.state.setToastMessage(
        err instanceof Error ? err.message : "Unable to load all names.",
      );
    } finally {
      this.taxBehavior.state.setIsLoading(false);
    }
  }

  async deleteYear(
    year: number,
  ) {
    try {
      this.taxBehavior.state.setIsLoading(true);
      const response = await this.serverBehavior.serverApiFetch(`/api/start/year/${encodeURIComponent(year)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      this.taxBehavior.state.setToastMessage("Year deleted.");
    } catch (err) {
      this.taxBehavior.state.setToastMessage(
        "Failed to delete year: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      this.taxBehavior.state.setIsLoading(false);
    }
  }

  async deleteName(year: number, name: string) {
    try {
        this.taxBehavior.state.setIsLoading(true);
        const response = await this.serverBehavior.serverApiFetch(`/api/start/name/${encodeURIComponent(year)}/${encodeURIComponent(name)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        this.taxBehavior.state.setToastMessage("Taxpayer deleted.");
    } catch (err) {
      this.taxBehavior.state.setToastMessage(
        "Failed to delete taxpayer: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      this.taxBehavior.state.setIsLoading(false);
    }
  }
}
