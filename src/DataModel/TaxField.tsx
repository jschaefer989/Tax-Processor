
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
  id: string;
  label: string;
  type: TaxFieldType;
  helperText?: string;
  selectionOptions?: string[];

  constructor(
    id: string,
    label: string,
    type: TaxFieldType,
    constructionOptions?: ConstructionOptions,
  ) {
    this.id = id;
    this.label = label;
    this.type = type;
    this.helperText = constructionOptions?.helperText;
    this.selectionOptions = constructionOptions?.selectionOptions;
  }
}
