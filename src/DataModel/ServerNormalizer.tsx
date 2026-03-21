import { FieldCalculationCallback } from "./TaxButton";
import { TaxFieldType } from "./TaxField";
import { TaxFieldLabel } from "./TaxResponse";
import { Steps } from "./TaxStep";

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
  oneH: TaxFieldLabel.oneH,
  twoA: TaxFieldLabel.twoA,
  twoB: TaxFieldLabel.twoB,
  twoD: TaxFieldLabel.twoD,
  twoE: TaxFieldLabel.twoE,
  twoG: TaxFieldLabel.twoG,
  twoH: TaxFieldLabel.twoH,
  threeA: TaxFieldLabel.threeA,
  threeB: TaxFieldLabel.threeB,
  threeD: TaxFieldLabel.threeD,
  threeE: TaxFieldLabel.threeE,
  threeG: TaxFieldLabel.threeG,
  threeH: TaxFieldLabel.threeH,
  seven: TaxFieldLabel.seven,
  eightD: TaxFieldLabel.eightD,
  eightE: TaxFieldLabel.eightE,
  eightG: TaxFieldLabel.eightG,
  eightH: TaxFieldLabel.eightH,
  nineD: TaxFieldLabel.nineD,
  nineE: TaxFieldLabel.nineE,
  nineG: TaxFieldLabel.nineG,
  nineH: TaxFieldLabel.nineH,
  tenD: TaxFieldLabel.tenD,
  tenE: TaxFieldLabel.tenE,
  tenG: TaxFieldLabel.tenG,
  tenH: TaxFieldLabel.tenH,
  twelveE: TaxFieldLabel.twelveE,
  fifteen: TaxFieldLabel.fifteen,
  sixteen: TaxFieldLabel.sixteen,
  filingStatus: TaxFieldLabel.FilingStatus,
  FilingStatus: TaxFieldLabel.FilingStatus,
  "1a": TaxFieldLabel.oneA,
  "1b": TaxFieldLabel.oneB,
  "1c": TaxFieldLabel.oneC,
  "1d": TaxFieldLabel.oneD,
  "1e": TaxFieldLabel.oneE,
  "1f": TaxFieldLabel.oneF,
  "1g": TaxFieldLabel.oneG,
  "1h": TaxFieldLabel.oneH,
  "2a": TaxFieldLabel.twoA,
  "2b": TaxFieldLabel.twoB,
  "2d": TaxFieldLabel.twoD,
  "2e": TaxFieldLabel.twoE,
  "2g": TaxFieldLabel.twoG,
  "2h": TaxFieldLabel.twoH,
  "3a": TaxFieldLabel.threeA,
  "3b": TaxFieldLabel.threeB,
  "3d": TaxFieldLabel.threeD,
  "3e": TaxFieldLabel.threeE,
  "3g": TaxFieldLabel.threeG,
  "3h": TaxFieldLabel.threeH,
  "7": TaxFieldLabel.seven,
  "8d": TaxFieldLabel.eightD,
  "8e": TaxFieldLabel.eightE,
  "8g": TaxFieldLabel.eightG,
  "8h": TaxFieldLabel.eightH,
  "9d": TaxFieldLabel.nineD,
  "9e": TaxFieldLabel.nineE,
  "9g": TaxFieldLabel.nineG,
  "9h": TaxFieldLabel.nineH,
  "10d": TaxFieldLabel.tenD,
  "10e": TaxFieldLabel.tenE,
  "10g": TaxFieldLabel.tenG,
  "10h": TaxFieldLabel.tenH,
  "12e": TaxFieldLabel.twelveE,
  "15": TaxFieldLabel.fifteen,
  "16": TaxFieldLabel.sixteen,
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
  TaxableIncome: FieldCalculationCallback.TaxableIncome,
  taxableIncome: FieldCalculationCallback.TaxableIncome,
  Tax: FieldCalculationCallback.Tax,
  tax: FieldCalculationCallback.Tax,
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
    callback: string | FieldCalculationCallback,
  ): FieldCalculationCallback {
    return CALLBACK_MAP[callback] ?? (callback as FieldCalculationCallback);
  }

  static serializeCalculationCallbackForApi(
    callback: FieldCalculationCallback,
  ): string {
    return callback.charAt(0).toUpperCase() + callback.slice(1);
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
