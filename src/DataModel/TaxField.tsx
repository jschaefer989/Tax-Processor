import type { TaxFieldLabel, TaxForm } from "./TaxResponse";

enum TaxFieldType {
  Text = "text",
  Number = "number",
  Currency = "currency",
  Date = "date",
  Select = "select",
}

interface ConstructionOptions {
  helperText?: string;
  selectionOptions?: string[];
}

export default class TaxField {
  form: TaxForm;
  taxFieldLabel: TaxFieldLabel;
  label: string;
  type: TaxFieldType;
  helperText?: string;
  selectionOptions?: string[];

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
  }
}
