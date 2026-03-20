import type { TaxForm, TaxFieldLabel } from "./TaxResponse";

export enum FieldCalculationCallback {
  StandardDeduction = "standardDeduction",
  Tax = "tax",
}

export default class TaxButton {
  form: TaxForm;
  taxFieldLabel: TaxFieldLabel;
  label: string;
  subsection?: string;
  calculationCallback: FieldCalculationCallback;

  constructor(
    form: TaxForm,
    taxFieldLabel: TaxFieldLabel,
    label: string,    
    calculationCallback: FieldCalculationCallback,    
    subsection?: string,
  ) {
    this.form = form;
    this.taxFieldLabel = taxFieldLabel;
    this.label = label;
    this.calculationCallback = calculationCallback;
    this.subsection = subsection;
  }
}