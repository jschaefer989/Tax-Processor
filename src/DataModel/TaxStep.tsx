import type TaxField from "./TaxField";

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

  constructor(
    step: Steps,
    title: string,
    description: string,
    fields: TaxField[],
  ) {
    this.step = step;
    this.title = title;
    this.description = description;
    this.fields = fields;
  }
}
