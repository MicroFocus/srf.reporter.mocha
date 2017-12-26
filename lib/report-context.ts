import Dictionary = _.Dictionary;
import {Test} from "./srf-mocha-types";

export class ReportContext {

    public passedTests: Test[];
    public failedTests: Test[];

    constructor(public rootSuite) {
        this.passedTests = [];
        this.failedTests = [];
    }
}                             
