export type TaxForm =
  | "Form1040"
  | "Form8949Page1"
  | "Form8949Page2"
  | "ScheduleD";

export type TaxFieldLabel =
  | "oneA"
  | "oneB"
  | "oneC"
  | "oneD"
  | "oneE"
  | "oneF"
  | "oneG"
  | "oneH"
  | "twoA"
  | "twoB"
  | "twoD"
  | "twoE"
  | "twoG"
  | "twoH"
  | "threeA"
  | "threeB"
  | "threeD"
  | "threeE"
  | "threeG"
  | "threeH"
  | "seven"
  | "sevenA"
  | "eightD"
  | "eightE"
  | "eightG"
  | "eightH"
  | "nineD"
  | "nineE"
  | "nineG"
  | "nineH"
  | "tenD"
  | "tenE"
  | "tenG"
  | "tenH"
  | "twelveE"
  | "fifteen"
  | "sixteen"
  | "FilingStatus";

type ConstructionOptions = {
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
      case "oneA":
        return "1a";
      case "oneB":
        return "1b";
      case "oneC":
        return "1c";
      case "oneD":
        return "1d";
      case "oneE":
        return "1e";
      case "oneF":
        return "1f";
      case "oneG":
        return "1g";
      case "oneH":
        return "1h";
      case "twoA":
        return "2a";
      case "twoB":
        return "2b";
      case "twoD":
        return "2d";
      case "twoE":
        return "2e";
      case "twoG":
        return "2g";
      case "twoH":
        return "2h";
      case "threeA":
        return "3a";
      case "threeB":
        return "3b";
      case "threeD":
        return "3d";
      case "threeE":
        return "3e";
      case "threeG":
        return "3g";
      case "threeH":
        return "3h";
      case "seven":
        return "7";
      case "sevenA":
        return "7a";
      case "eightD":
        return "8d";
      case "eightE":
        return "8e";
      case "eightG":
        return "8g";
      case "eightH":
        return "8h";
      case "nineD":
        return "9d";
      case "nineE":
        return "9e";
      case "nineG":
        return "9g";
      case "nineH":
        return "9h";
      case "tenD":
        return "10d";
      case "tenE":
        return "10e";
      case "tenG":
        return "10g";
      case "tenH":
        return "10h";
      case "twelveE":
        return "12e";
      case "fifteen":
        return "15";
      case "sixteen":
        return "16";
      default:
        return this.label;
    }
  }

  getUserFriendlyForm(): string {
    switch (this.form) {
      case "Form1040":
        return "Form 1040";
      case "Form8949Page1":
        return "Form 8949 (Page 1)";
      case "Form8949Page2":
        return "Form 8949 (Page 2)";
      case "ScheduleD":
        return "Schedule D";
      default:
        return this.form;
    }
  }

  getFormLabelOrder(): number {
    switch (this.label) {
      case "oneA":
        return 1;
      case "oneB":
        return 2;
      case "oneC":
        return 3;
      case "oneD":
        return 4;
      case "oneE":
        return 5;
      case "oneF":
        return 6;
      case "oneG":
        return 7;
      case "oneH":
        return 8;
      case "twoA":
        return 9;
      case "twoB":
        return 10;
      case "twoD":
        return 11;
      case "twoE":
        return 12;
      case "twoG":
        return 13;
      case "twoH":
        return 14;
      case "threeA":
        return 15;
      case "threeB":
        return 16;
      case "threeD":
        return 17;
      case "threeE":
        return 18;
      case "threeG":
        return 19;
      case "threeH":
        return 20;
      case "seven":
        return 21;
      case "sevenA":
        return 21.1;
      case "eightD":
        return 22;
      case "eightE":
        return 23;
      case "eightG":
        return 24;
      case "eightH":
        return 25;
      case "nineD":
        return 26;
      case "nineE":
        return 27;
      case "nineG":
        return 28;
      case "nineH":
        return 29;
      case "tenD":
        return 30;
      case "tenE":
        return 31;
      case "tenG":
        return 32;
      case "tenH":
        return 33;
      case "twelveE":
        return 34;
      case "fifteen":
        return 35;
      case "sixteen":
        return 36;
      default:
        return Number.MAX_SAFE_INTEGER;
    }
  }

  getSubsection(): string | undefined {
    return this.subsection?.trim().toLowerCase();
  }

  isSkip(): boolean {
    switch (this.label) {
      case "FilingStatus":
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
