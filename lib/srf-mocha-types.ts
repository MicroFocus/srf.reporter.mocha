import {ITest, ISuite} from "mocha";
import {EventEmitter} from "events";
import {SrfReporterOptions} from "experience.center.reporter.core";

export interface Test extends ITest {
    type: string;
    duration: number;
    error?: Error;
    parent: Suite;
}

export interface Suite extends ISuite {
    duration: number;
    root: boolean;
    file: string;
    tests: Test[];
}

export interface MochaRunner extends EventEmitter{
    suite: Suite;
}

export interface MochaReporterOptions {
    reporterOptions: { debugReport: "true"} & SrfReporterOptions;
}
