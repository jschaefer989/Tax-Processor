import type TaxField from "./TaxField";
import type TaxFile from "./TaxFile";

export enum Steps {
  Demographics = "demographics",
  Income = "income",
  TaxAndCredits = "taxAndCredits",
  PaymentsAndRefundableCredits = "paymentsAndRefundableCredits",
}

export enum FilingStatus {
    single = "single",
    marriedFilingJointly = "marriedFilingJointly",
    marriedFilingSeparately = "marriedFilingSeparately",
    headOfHousehold = "headOfHousehold",
    qualifyingWidow = "qualifyingWidow",
}

export class TaxStep {
  step: Steps;
  title: string;
  description: string;
  fields: TaxField[];
  files: TaxFile[];

  constructor(
    step: Steps,
    title: string,
    description: string,
    fields: TaxField[],
    files: TaxFile[],
  ) {
    this.step = step;
    this.title = title;
    this.description = description;
    this.fields = fields;
    this.files = files;
  }

  public getRequiredFields(): TaxField[] {
    return this.fields.filter((field) => field.isRequired);
  }
}
