import type TaxField from "./TaxField";
import type TaxFile from "./TaxFile";

export enum Steps {
  Demographics = "demographics",
  Income = "income",
  TaxAndCredits = "taxAndCredits",
  PaymentsAndRefundableCredits = "paymentsAndRefundableCredits",
}

export enum FilingStatus {
    single = "Single",
    marriedFilingJointly = "Married Filing Jointly",
    marriedFilingSeparately = "Married Filing Separately",
    headOfHousehold = "Head of Household",
    qualifyingWidow = "Qualifying Widow(er)",
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
