import TaxResponse, { type TaxFieldLabel, type TaxForm } from "./TaxResponse";

export class DuplicateResponse extends TaxResponse {
  newValue: string;

  constructor(
    form: TaxForm,
    label: TaxFieldLabel,
    line: number,
    value: string,
    newValue: string,
  ) {
    super(form, label, line, value);
    this.newValue = newValue;
  }
}
