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
  isRequired?: boolean;
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
  isRequired: boolean = false;
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
    this.isRequired = constructionOptions?.isRequired ?? false;
    this.helperText = constructionOptions?.helperText;
    this.selectionOptions = constructionOptions?.selectionOptions;
    this.subsection = constructionOptions?.subsection;
    this.calculationCallback = constructionOptions?.calculationCallback;
  }
}
