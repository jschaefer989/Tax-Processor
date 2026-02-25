export enum ReadableForm {
  Form1099 = "Form1099",
  Form1099DIV = "Form1099DIV",
  Form1099INT = "Form1099INT",
  Form1099B = "Form1099B",
}

export default class TaxFile {
  fromForm: ReadableForm;
  toForm: string;
  label: string;

  constructor(fromForm: ReadableForm, toForm: string, label: string) {
    this.fromForm = fromForm;
    this.toForm = toForm;
    this.label = label;
  }
}
