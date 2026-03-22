import type TaxButton from "./TaxButton";
import type TaxField from "./TaxField";
import type TaxFile from "./TaxFile";

export type Steps =
  | "demographics"
  | "income"
  | "taxAndCredits"
  | "paymentsAndRefundableCredits";

export type FilingStatus =
  | "Single"
  | "MarriedFilingJointly"
  | "MarriedFilingSeparately"
  | "HeadOfHousehold"
  | "QualifyingWidow";

export class TaxStep {
  step: Steps;
  title: string;
  description: string;
  fields: TaxField[];
  files: TaxFile[];
  buttons: TaxButton[];

  constructor(
    step: Steps,
    title: string,
    description: string,
    fields: TaxField[],
    files: TaxFile[],
    buttons: TaxButton[],
  ) {
    this.step = step;
    this.title = title;
    this.description = description;
    this.fields = fields;
    this.files = files;
    this.buttons = buttons;
  }

  public getRequiredFields(): TaxField[] {
    return this.fields.filter((field) => field.isRequired);
  }
}
