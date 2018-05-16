import {SrfMochaReporter} from "./srf-mocha-reporter";
import {LogSwitch, SrfJsonLogger} from "./core/srf-json-logger";

class SrfReporterWrapper {
    private _srfMochaReporter:SrfMochaReporter;
    constructor(runner, options){
        let logger;

        if (process.env["SRF_JSON_LOGGER"]){
            logger = new SrfJsonLogger(LogSwitch.ON);
        } else {
            logger = new SrfJsonLogger(LogSwitch.OFF);
        }

        this._srfMochaReporter = new SrfMochaReporter(runner, options, logger);
    }
}

export = SrfReporterWrapper;

