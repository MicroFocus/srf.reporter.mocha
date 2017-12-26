import {SrfMochaReporter} from "./srf-mocha-reporter";
import {SrfJsonLogger, LogSwitch} from "experience.center.reporter.core";

class SrfReporterWrapper {
    private _srfMochaReporter:SrfMochaReporter;
    constructor(runner, options){
        var logger;
        if (process.env["SRF_JSON_LOGGER"]){ // Web execution
            logger = new SrfJsonLogger(LogSwitch.ON);
        } else {
            logger = new SrfJsonLogger(LogSwitch.OFF);
        }

        this._srfMochaReporter = new SrfMochaReporter(runner, options, logger);
    }
}

export = SrfReporterWrapper;

