import SelectionOption from "./SelectionOption";
import { FieldCalculationCallback, TaxFieldType } from "./TaxField";
import { TaxFieldLabel } from "./TaxResponse";
import { FilingStatus, Steps } from "./TaxStep";

export interface StepResponse {
  steps: StepDto[];
  standardDeductions: Record<FilingStatus, number>;
}

export interface StepDto {
  step: Steps;
  title: string;
  description: string;
  fields: TaxFieldDto[];
  files: TaxFileDto[];
}

export interface TaxFieldDto {
  form: string;
  taxFieldLabel: string;
  label: string;
  type: string;
  isRequired: boolean;
  helperText?: string;
  selectionOptions?: SelectionOption[];
  subsection?: string;
  calculationCallback?: FieldCalculationCallback;
}

export interface TaxFileDto {
  fromForm: string;
  toForm: string;
  label: string;
}

export const STEP_MAP: Record<string, Steps> = {
  demographics: Steps.Demographics,
  Demographics: Steps.Demographics,
  income: Steps.Income,
  Income: Steps.Income,
  taxAndCredits: Steps.TaxAndCredits,
  TaxAndCredits: Steps.TaxAndCredits,
  paymentsAndRefundableCredits: Steps.PaymentsAndRefundableCredits,
  PaymentsAndRefundableCredits: Steps.PaymentsAndRefundableCredits,
};

export const FIELD_LABEL_MAP: Record<string, TaxFieldLabel> = {
  oneA: TaxFieldLabel.oneA,
  oneB: TaxFieldLabel.oneB,
  oneC: TaxFieldLabel.oneC,
  oneD: TaxFieldLabel.oneD,
  oneE: TaxFieldLabel.oneE,
  oneF: TaxFieldLabel.oneF,
  oneG: TaxFieldLabel.oneG,
  twoA: TaxFieldLabel.twoA,
  twoB: TaxFieldLabel.twoB,
  threeA: TaxFieldLabel.threeA,
  threeB: TaxFieldLabel.threeB,
  twoE: TaxFieldLabel.twoE,
  skip: TaxFieldLabel.Skip,
  Skip: TaxFieldLabel.Skip,
  "1a": TaxFieldLabel.oneA,
  "1b": TaxFieldLabel.oneB,
  "1c": TaxFieldLabel.oneC,
  "1d": TaxFieldLabel.oneD,
  "1e": TaxFieldLabel.oneE,
  "1f": TaxFieldLabel.oneF,
  "1g": TaxFieldLabel.oneG,
  "2a": TaxFieldLabel.twoA,
  "2b": TaxFieldLabel.twoB,
  "2e": TaxFieldLabel.twoE,
  "3a": TaxFieldLabel.threeA,
  "3b": TaxFieldLabel.threeB,
};

export const FIELD_TYPE_MAP: Record<string, TaxFieldType> = {
  Text: TaxFieldType.Text,
  text: TaxFieldType.Text,
  Number: TaxFieldType.Number,
  number: TaxFieldType.Number,
  Currency: TaxFieldType.Currency,
  currency: TaxFieldType.Currency,
  Date: TaxFieldType.Date,
  date: TaxFieldType.Date,
  Select: TaxFieldType.Select,
  select: TaxFieldType.Select,
};

export const CALLBACK_MAP: Record<string, FieldCalculationCallback> = {
  StandardDeduction: FieldCalculationCallback.StandardDeduction,
  standardDeduction: FieldCalculationCallback.StandardDeduction,
};

export const FILING_STATUS_TO_API: Record<string, string> = {
  single: "Single",
  Single: "Single",
  marriedFilingJointly: "MarriedFilingJointly",
  "Married Filing Jointly": "MarriedFilingJointly",
  MarriedFilingJointly: "MarriedFilingJointly",
  marriedFilingSeparately: "MarriedFilingSeparately",
  "Married Filing Separately": "MarriedFilingSeparately",
  MarriedFilingSeparately: "MarriedFilingSeparately",
  headOfHousehold: "HeadOfHousehold",
  "Head of Household": "HeadOfHousehold",
  HeadOfHousehold: "HeadOfHousehold",
  qualifyingWidow: "QualifyingWidow",
  "Qualifying Widow(er)": "QualifyingWidow",
  QualifyingWidow: "QualifyingWidow",
};

export default class ServerNormalizer {
  static normalizeStep(step: string | Steps): Steps {
    return STEP_MAP[step] ?? (step as Steps);
  }

  static normalizeFieldLabel(label: string | TaxFieldLabel): TaxFieldLabel {
    return FIELD_LABEL_MAP[label] ?? (label as TaxFieldLabel);
  }

  static normalizeFieldType(type: string | TaxFieldType): TaxFieldType {
    return FIELD_TYPE_MAP[type] ?? (type as TaxFieldType);
  }

  static normalizeCalculationCallback(
    callback?: string | FieldCalculationCallback,
  ): FieldCalculationCallback | undefined {
    if (!callback) {
      return undefined;
    }
    return CALLBACK_MAP[callback] ?? (callback as FieldCalculationCallback);
  }

  static serializeStepForApi(step: Steps): string {
    switch (step) {
      case Steps.Demographics:
        return "Demographics";
      case Steps.Income:
        return "Income";
      case Steps.TaxAndCredits:
        return "TaxAndCredits";
      case Steps.PaymentsAndRefundableCredits:
        return "PaymentsAndRefundableCredits";
    }
  }
}
