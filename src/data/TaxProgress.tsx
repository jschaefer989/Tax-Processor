import type TaxResponse from "./TaxResponse";
import type { Steps } from "./TaxStep";

export default class TaxProgress {
    year: number;
    name: string;
    updatedAt: Date;
    version: number;
    currentStep: Steps;
    responses: TaxResponse[];

    constructor(year: number, name: string, updatedAt: Date, version: number, currentStep: Steps, responses: TaxResponse[]) {
        this.year = year;
        this.name = name;
        this.updatedAt = updatedAt;
        this.version = version;
        this.currentStep = currentStep;
        this.responses = responses;
    }
}