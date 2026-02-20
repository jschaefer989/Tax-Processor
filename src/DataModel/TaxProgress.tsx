import type TaxResponse from "./TaxResponse";
import type { Steps } from "./TaxStep";

export default class TaxProgress {
    year: number;
    name: string;
    updatedAt: Date;
    currentStep: Steps;
    responses: TaxResponse[];

    constructor(year: number, name: string, updatedAt: Date, currentStep: Steps, responses: TaxResponse[]) {
        this.year = year;
        this.name = name;
        this.updatedAt = updatedAt;
        this.currentStep = currentStep;
        this.responses = responses;
    }
}