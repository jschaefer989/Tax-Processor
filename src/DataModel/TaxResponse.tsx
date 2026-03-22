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
  oneH = "oneH",
  twoA = "twoA",
  twoB = "twoB",
  twoD = "twoD",
  twoE = "twoE",
  twoG = "twoG",
  twoH = "twoH",  
  threeA = "threeA",
  threeB = "threeB",
  threeD = "threeD",
  threeE = "threeE",
  threeG = "threeG",
  threeH = "threeH",
  seven = "seven",
  sevenA = "sevenA",
  eightD = "eightD",
  eightE = "eightE",
  eightG = "eightG",
  eightH = "eightH",
  nineD = "nineD",
  nineE = "nineE",
  nineG = "nineG",
  nineH = "nineH",
  tenD = "tenD",
  tenE = "tenE",
  tenG = "tenG",
  tenH = "tenH",
  twelveE = "twelveE",
  fifteen = "fifteen",
  sixteen = "sixteen",
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
      case TaxFieldLabel.oneH:
        return "1h";
      case TaxFieldLabel.twoA:
        return "2a";
      case TaxFieldLabel.twoB:
        return "2b";
      case TaxFieldLabel.twoD:
        return "2d";
      case TaxFieldLabel.twoE:
        return "2e";
      case TaxFieldLabel.twoG:
        return "2g";
      case TaxFieldLabel.twoH:
        return "2h";
      case TaxFieldLabel.threeA:
        return "3a";
      case TaxFieldLabel.threeB:
        return "3b";      
      case TaxFieldLabel.threeD:
        return "3d";
      case TaxFieldLabel.threeE:
        return "3e";
      case TaxFieldLabel.threeG:
        return "3g";
      case TaxFieldLabel.threeH:
        return "3h";
      case TaxFieldLabel.seven:
        return "7";
      case TaxFieldLabel.sevenA:
        return "7a";
      case TaxFieldLabel.eightD:
        return "8d";
      case TaxFieldLabel.eightE:
        return "8e";
      case TaxFieldLabel.eightG:
        return "8g";
      case TaxFieldLabel.eightH:
        return "8h";
      case TaxFieldLabel.nineD:
        return "9d";
      case TaxFieldLabel.nineE:
        return "9e";
      case TaxFieldLabel.nineG:
        return "9g";
      case TaxFieldLabel.nineH:
        return "9h";
      case TaxFieldLabel.tenD:
        return "10d";
      case TaxFieldLabel.tenE:
        return "10e";
      case TaxFieldLabel.tenG:
        return "10g";
      case TaxFieldLabel.tenH:
        return "10h";
      case TaxFieldLabel.twelveE:
        return "12e";
      case TaxFieldLabel.fifteen:
        return "15";
      case TaxFieldLabel.sixteen:
        return "16";
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
      case TaxFieldLabel.oneH:
        return 8;
      case TaxFieldLabel.twoA:
        return 9;
      case TaxFieldLabel.twoB:
        return 10;
      case TaxFieldLabel.twoD:
        return 11;
      case TaxFieldLabel.twoE:
        return 12;
      case TaxFieldLabel.twoG:
        return 13;
      case TaxFieldLabel.twoH:
        return 14;
      case TaxFieldLabel.threeA:
        return 15;
      case TaxFieldLabel.threeB:
        return 16;
      case TaxFieldLabel.threeD:
        return 17;
      case TaxFieldLabel.threeE:
        return 18;
      case TaxFieldLabel.threeG:
        return 19;
      case TaxFieldLabel.threeH:
        return 20;
      case TaxFieldLabel.seven:
        return 21;
      case TaxFieldLabel.sevenA:
        return 21.1;
      case TaxFieldLabel.eightD:
        return 22;
      case TaxFieldLabel.eightE:
        return 23;
      case TaxFieldLabel.eightG:
        return 24;
      case TaxFieldLabel.eightH:
        return 25;
      case TaxFieldLabel.nineD:
        return 26;
      case TaxFieldLabel.nineE:
        return 27;
      case TaxFieldLabel.nineG:
        return 28;
      case TaxFieldLabel.nineH:
        return 29;
      case TaxFieldLabel.tenD:
        return 30;
      case TaxFieldLabel.tenE:
        return 31;
      case TaxFieldLabel.tenG:
        return 32;
      case TaxFieldLabel.tenH:
        return 33;
      case TaxFieldLabel.twelveE:
        return 34;
      case TaxFieldLabel.fifteen:
        return 35;
      case TaxFieldLabel.sixteen:
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
