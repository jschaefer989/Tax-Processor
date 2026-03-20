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
  twoE = "twoE",
  FilingStatus = "FilingStatus",
}

interface ConstructionOptions {
  fromCode?: string;
  subsection?: string;
}

export default class TaxResponse {
  form: TaxForm;
  label: TaxFieldLabel;
  line: number;
  value: string;
  formCode?: string;
  subsection?: string;

  constructor(
    form: TaxForm,
    label: TaxFieldLabel,
    line: number,
    value: string,
    constructionOptions?: ConstructionOptions,
  ) {
    this.form = form;
    this.label = label;
    this.line = line;
    this.value = value;
    this.formCode = constructionOptions?.fromCode;
    this.subsection = constructionOptions?.subsection;
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
      case TaxFieldLabel.twoE:
        return "2e";
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

  getFormLabelOrder(): number {
    switch (this.label) {
      case TaxFieldLabel.oneA:
        return 1;
      case TaxFieldLabel.oneB:
        return 2;
      case TaxFieldLabel.oneC:
        return 3;
      case TaxFieldLabel.oneD:
        return 4;
      case TaxFieldLabel.oneE:
        return 5;
      case TaxFieldLabel.oneF:
        return 6;
      case TaxFieldLabel.oneG:
        return 7;
      case TaxFieldLabel.twoA:
        return 8;
      case TaxFieldLabel.twoB:
        return 9;
      case TaxFieldLabel.threeA:
        return 10;
      case TaxFieldLabel.threeB:
        return 11;
      case TaxFieldLabel.twoE:
        return 12;
      default:
        return Number.MAX_SAFE_INTEGER;
    }
  }

  getSubsection(): string | undefined {
    return this.subsection?.trim().toLowerCase();
  }

  isSkip(): boolean {
    switch (this.label) {
      case TaxFieldLabel.FilingStatus:
        return true;
      default:
        return false;
    }
  }

  static sortByLabel(responses: TaxResponse[]): TaxResponse[] {
    return [...responses].sort((a, b) => {
      const aOrder = a.getFormLabelOrder();
      const bOrder = b.getFormLabelOrder();
      return aOrder - bOrder;
    });
  }
}
