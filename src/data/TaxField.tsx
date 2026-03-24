import type SelectionOption from "./SelectionOption";
import type { TaxFieldLabel, TaxForm } from "./TaxResponse";

export type TaxFieldType = "text" | "number" | "currency" | "date" | "select" | "button";

type ConstructionOptions = {
  isRequired?: boolean;
  helperText?: string;
  selectionOptions?: SelectionOption[];
  subsection?: string;
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
  }
}
