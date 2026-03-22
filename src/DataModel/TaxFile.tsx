import type { TaxForm } from "./TaxResponse";

export type ReadableForm = "Form 1099" | "Form 1099-DIV" | "Form 1099-INT" | "Form 1099-B";

export default class TaxFile {
  fromForm: ReadableForm;
  toForm: TaxForm;
  label: string;

  constructor(fromForm: ReadableForm, toForm: TaxForm, label: string) {
    this.fromForm = fromForm;
    this.toForm = toForm;
    this.label = label;
  }
}
