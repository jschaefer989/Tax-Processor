import type { TaxBehavior } from "./TaxBehavior";

export class StartBehavior {
  setYears: React.Dispatch<React.SetStateAction<number[]>>;
  setNames: React.Dispatch<React.SetStateAction<string[]>>;
  setNewYear: React.Dispatch<React.SetStateAction<boolean>>;
  taxBehavior: TaxBehavior;

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

  }

  async loadYears() {
    try {
      this.taxBehavior.setIsLoading(true);
      const response = await fetch("/api/progress/years");
      if (!response.ok) {
        throw new Error("Unable to load tax years.");
      }
      const data = (await response.json()) as number[];
      this.setYears(data);
    } catch (err) {
      this.taxBehavior.setError(
        err instanceof Error ? err.message : "Unable to load tax years.",
      );
    } finally {
      this.taxBehavior.setIsLoading(false);
    }
  }

  async loadNames(
    year: number,
  ) {
    try {
      this.taxBehavior.setIsLoading(true);
      const response = await fetch(`/api/progress/${year}/names`);
      if (!response.ok) {
        throw new Error("Unable to load saved progress names.");
      }
      const data = (await response.json()) as string[];
      this.setNames(data);
    } catch (err) {
      this.taxBehavior.setError(
        err instanceof Error
          ? err.message
          : "Unable to load saved progress names.",
      );
    } finally {
      this.taxBehavior.setIsLoading(false);
    }
  }

  async loadAllNames(
  ) {
    try {
      this.taxBehavior.setIsLoading(true);
      const response = await fetch(`/api/progress/names`);
      if (!response.ok) {
        throw new Error("Unable to load all names.");
      }
      const data = (await response.json()) as string[];
      this.setNames(data);
    } catch (err) {
      this.taxBehavior.setError(
        err instanceof Error ? err.message : "Unable to load all names.",
      );
    } finally {
      this.taxBehavior.setIsLoading(false);
    }
  }

  async deleteYear(
    year: number,
  ) {
    try {
      this.taxBehavior.setIsLoading(true);
      const response = await fetch(`/api/start/year/${encodeURIComponent(year)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      this.taxBehavior.setToastMessage("Year deleted.");
    } catch (err) {
      this.taxBehavior.setToastMessage(
        "Failed to delete year: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      this.taxBehavior.setIsLoading(false);
    }
  }

  async deleteName(year: number, name: string) {
    try {
        this.taxBehavior.setIsLoading(true);
        const response = await fetch(`/api/start/name/${encodeURIComponent(year)}/${encodeURIComponent(name)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        this.taxBehavior.setToastMessage("Taxpayer deleted.");
    } catch (err) {
      this.taxBehavior.setToastMessage(
        "Failed to delete taxpayer: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      this.taxBehavior.setIsLoading(false);
    }
  }
}
