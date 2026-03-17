import type SelectionOption from "./SelectionOption";
import type { TaxFieldLabel, TaxForm } from "./TaxResponse";

export enum TaxFieldType {
  Text = "text",
  Number = "number",
  Currency = "currency",
  Date = "date",
  Select = "select",
}

export enum FieldCalculationCallback
{
    StandardDeduction = "standardDeduction",
}


interface ConstructionOptions {
  helperText?: string;
  selectionOptions?: SelectionOption[];
  subsection?: string;
  calculationCallback?: FieldCalculationCallback;
}

export default class TaxField {
  form: TaxForm;
  taxFieldLabel: TaxFieldLabel;
  label: string;
  type: TaxFieldType;
  helperText?: string;
  selectionOptions?: SelectionOption[];
  subsection?: string;
  calculationCallback?: FieldCalculationCallback;

  constructor(
    form: TaxForm,
    taxFieldLabel: TaxFieldLabel,
    label: string,
    type: TaxFieldType,
    constructionOptions?: ConstructionOptions,
  ) {
    this.form = form;
    this.taxFieldLabel = taxFieldLabel;
    this.label = label;
    this.type = type;
    this.helperText = constructionOptions?.helperText;
    this.selectionOptions = constructionOptions?.selectionOptions;
    this.subsection = constructionOptions?.subsection;
    this.calculationCallback = constructionOptions?.calculationCallback;
  }
}
