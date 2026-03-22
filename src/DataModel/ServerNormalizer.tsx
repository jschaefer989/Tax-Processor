import { type FieldCalculationCallback } from "./TaxButton";
import { type TaxFieldType } from "./TaxField";
import { type TaxFieldLabel } from "./TaxResponse";
import { type Steps } from "./TaxStep";

const STEP_TO_API_MAP: Record<Steps, string> = {
  demographics: "Demographics",
  income: "Income",
  taxAndCredits: "TaxAndCredits",
  paymentsAndRefundableCredits: "PaymentsAndRefundableCredits",
};

export const STEP_MAP: Record<string, Steps> = {
  demographics: "demographics",
  Demographics: "demographics",
  income: "income",
  Income: "income",
  taxAndCredits: "taxAndCredits",
  TaxAndCredits: "taxAndCredits",
  paymentsAndRefundableCredits: "paymentsAndRefundableCredits",
  PaymentsAndRefundableCredits: "paymentsAndRefundableCredits",
};

export const FIELD_LABEL_MAP: Record<string, TaxFieldLabel> = {
  oneA: "oneA",
  oneB: "oneB",
  oneC: "oneC",
  oneD: "oneD",
  oneE: "oneE",
  oneF: "oneF",
  oneG: "oneG",
  oneH: "oneH",
  twoA: "twoA",
  twoB: "twoB",
  twoD: "twoD",
  twoE: "twoE",
  twoG: "twoG",
  twoH: "twoH",
  threeA: "threeA",
  threeB: "threeB",
  threeD: "threeD",
  threeE: "threeE",
  threeG: "threeG",
  threeH: "threeH",
  seven: "seven",
  eightD: "eightD",
  eightE: "eightE",
  eightG: "eightG",
  eightH: "eightH",
  nineD: "nineD",
  nineE: "nineE",
  nineG: "nineG",
  nineH: "nineH",
  tenD: "tenD",
  tenE: "tenE",
  tenG: "tenG",
  tenH: "tenH",
  twelveE: "twelveE",
  fifteen: "fifteen",
  sixteen: "sixteen",
  filingStatus: "FilingStatus",
  FilingStatus: "FilingStatus",
  "1a": "oneA",
  "1b": "oneB",
  "1c": "oneC",
  "1d": "oneD",
  "1e": "oneE",
  "1f": "oneF",
  "1g": "oneG",
  "1h": "oneH",
  "2a": "twoA",
  "2b": "twoB",
  "2d": "twoD",
  "2e": "twoE",
  "2g": "twoG",
  "2h": "twoH",
  "3a": "threeA",
  "3b": "threeB",
  "3d": "threeD",
  "3e": "threeE",
  "3g": "threeG",
  "3h": "threeH",
  "7": "seven",
  "8d": "eightD",
  "8e": "eightE",
  "8g": "eightG",
  "8h": "eightH",
  "9d": "nineD",
  "9e": "nineE",
  "9g": "nineG",
  "9h": "nineH",
  "10d": "tenD",
  "10e": "tenE",
  "10g": "tenG",
  "10h": "tenH",
  "12e": "twelveE",
  "15": "fifteen",
  "16": "sixteen",
};

export const FIELD_TYPE_MAP: Record<string, TaxFieldType> = {
  Text: "text",
  text: "text",
  Number: "number",
  number: "number",
  Currency: "currency",
  currency: "currency",
  Date: "date",
  date: "date",
  Select: "select",
  select: "select",
};

export const CALLBACK_MAP: Record<string, FieldCalculationCallback> = {
  StandardDeduction: "standardDeduction",
  standardDeduction: "standardDeduction",
  TaxableIncome: "taxableIncome",
  taxableIncome: "taxableIncome",
  Tax: "tax",
  tax: "tax",
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
    return STEP_TO_API_MAP[step] ?? step;
  }
}
