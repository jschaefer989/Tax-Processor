export enum TaxForm {
  Form1040 = "Form1040",
  Form8949Page1 = "Form8949Page1",
  Form8949Page2 = "Form8949Page2",
  ScheduleD = "ScheduleD",
}

export enum TaxFieldLabel {
  oneA = "oneA",
  oneB = "oneB",
  oneC = "oneC",
  oneD = "oneD",
  oneE = "oneE",
  oneF = "oneF",
  oneG = "oneG",
  twoA = "twoA",
  twoB = "twoB",
  threeA = "threeA",
  threeB = "threeB",
  formCode = "formCode",
}

export const form1040LabelOrder = new Map<TaxFieldLabel, number>([
  [TaxFieldLabel.oneA, 1],
  [TaxFieldLabel.oneB, 2],
  [TaxFieldLabel.oneC, 3],
  [TaxFieldLabel.oneD, 4],
  [TaxFieldLabel.oneE, 5],
  [TaxFieldLabel.oneF, 6],
  [TaxFieldLabel.oneG, 7],
  [TaxFieldLabel.twoA, 8],
  [TaxFieldLabel.twoB, 9],
  [TaxFieldLabel.threeA, 10],
  [TaxFieldLabel.threeB, 11],
]);

export default class TaxResponse {
  form: TaxForm;
  label: TaxFieldLabel;
  line: number;
  value: string;

  constructor(
    form: TaxForm,
    label: TaxFieldLabel,
    line: number,
    value: string,
  ) {
    this.form = form;
    this.label = label;
    this.line = line;
    this.value = value;
  }

  getUserFriendlyLabel(): string {
    switch (this.label) {
      case TaxFieldLabel.oneA:
        return "1a";
      case TaxFieldLabel.oneB:
        return "1b";
      case TaxFieldLabel.oneC:
        return "1c";
      case TaxFieldLabel.oneD:
        return "1d";
      case TaxFieldLabel.oneE:
        return "1e";
      case TaxFieldLabel.oneF:
        return "1f";
      case TaxFieldLabel.oneG:
        return "1g";
      case TaxFieldLabel.twoA:
        return "2a";
      case TaxFieldLabel.twoB:
        return "2b";
      case TaxFieldLabel.threeA:
        return "3a";
      case TaxFieldLabel.threeB:
        return "3b";
      default:
        return this.label;
    }
  }

  getUserFriendlyForm(): string {
    switch (this.form) {
      case TaxForm.Form1040:
        return "Form 1040";
      case TaxForm.Form8949Page1:
        return "Form 8949 (Page 1)";
      case TaxForm.Form8949Page2:
        return "Form 8949 (Page 2)";
      case TaxForm.ScheduleD:
        return "Schedule D";
      default:
        return this.form;
    }
  }

  static sortByLabel(responses: TaxResponse[]): TaxResponse[] {
    return [...responses].sort((a, b) => {
      const aOrder = form1040LabelOrder.get(a.label) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = form1040LabelOrder.get(b.label) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
  }
}
