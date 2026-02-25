import type TaxField from "./TaxField";
import type TaxFile from "./TaxFile";

export enum Steps {
  Income = "income",
  TaxAndCredits = "taxAndCredits",
  PaymentsAndRefundableCredits = "paymentsAndRefundableCredits",
  RefundOwe = "refundOwe",
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
}
