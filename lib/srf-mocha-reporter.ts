/*! (c) Copyright 2015 - 2018 Micro Focus or one of its affiliates. 
//
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Apache License 2.0 - Apache Software Foundation
// www.apache.org
// Apache License Version 2.0, January 2004 http://www.apache.org/licenses/ TERMS AND CONDITIONS FOR USE, REPRODUCTION ...
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
*/

import {Suite, Test, MochaRunner, MochaReporterOptions} from "./srf-mocha-types";
import {ReportContext} from "./report-context";
import chalk = require("chalk");
import _ = require("lodash");
import {LogSwitch, SrfJsonLogger} from "./core/srf-json-logger";
import {SrfReporterFacade} from "./core/srf-reporter-facade";
import {RemoteExecutionContext, ReporterStatuses, ReporterStep, StepRole} from "./core/srf-reporter-types";

const indentation = "   ";

export class SrfMochaReporter {
    private _srfReporterFacade: SrfReporterFacade;
    private _sessionId: string;
    private _logger;
    private _isCloudRun: boolean;
    private _reportContext: ReportContext;
    private _currentFile: string;

    constructor(runner: MochaRunner, options: MochaReporterOptions, private _reporterLogger: SrfJsonLogger) {
        // Reporter options usage: --reporter-options debugReport=true,srfUrl=http://www.srf.com
        let debugReport = options && options.reporterOptions && options.reporterOptions.debugReport;
        const runMode = options && options.reporterOptions && options.reporterOptions.mode;
        this._logger = debugReport === "true" ? new SrfJsonLogger(LogSwitch.ON) : new SrfJsonLogger(LogSwitch.OFF);
        this._isCloudRun = runMode === "cloud";
        this._reportContext = new ReportContext(runner.suite);

        process.on("uncaughtException", err => {
            process.stdout.write(err.stack);
            process.exit(1);
        });

        if (this._isCloudRun) {
            this._initCloudRunOptions(options);
        } else {
            this._initBurstOptions(options);
        }

        this.setRunnerHandlers(runner);
        this._logger.debug("SrfMochaReporter.constructor: Created with options:" + JSON.stringify(options));
    }

    private setRunnerHandlers(runner) {
        runner.on("pass", (test) => this.onPassedTest(test));
        runner.on("fail", (test, err) => this.onFailedTest(test, err));
        runner.on("test", (test)=> this.onTestBegin(test));
        runner.on("test end", (test) => this.onTestEnd(test));
        runner.on("suite", (suite) => this.onSuiteBegin(suite));
        runner.on("suite end", (suite) => this.onSuiteEnd(suite));
        runner.on("end", () => this.onEnd());
    }

    private onSuiteBegin(suite: Suite) {
        this._logger.debug("SrfMochaReporter.onSuiteBegin: Called with suit - " + suite.title);
        if (suite.root)
            return;

        const reporterStep = this._createReporterStep("suite-begin", suite.title, "success", suite.duration);
        this._srfReporterFacade.reportStep(reporterStep);

        if (this._isCloudRun)
            return;

        if (this._currentFile !== suite.file){
            this._currentFile = suite.file;
            logLn(chalk.cyan(`\nRunning test cases from ${this._currentFile}`));
        }

        logLn(chalk.cyan(`# ${suite.title}`));
    }

    private onTestBegin(test: Test) {
        this._logger.debug("SrfMochaReporter.onTestBegin: Called with test - " + test.title + "type" + test.type);
        const reporterStep = this._createReporterStep("test-begin", test.title, "success", test.duration);
        this._srfReporterFacade.reportStep(reporterStep);

        if (this._isCloudRun)
            return;

        //log(indentation + chalk.white(`${test.title} ... Executing`)); // if 'it' prints to console it wont look good
    }

    private onPassedTest(test: Test) {
        this._logger.debug("SrfMochaReporter.onPassedTest: Called with test - " + test.title);
        const reporterStep = this._createReporterStep("test-end", test.title, "success", test.duration);
        this._reporterLogger.log(reporterStep);
        this._srfReporterFacade.reportStep(reporterStep);

        if (this._isCloudRun)
            return;

        this._reportContext.passedTests.push(test);
        log(indentation + chalk.white(`${test.title} ... `) + chalk.green("Passed\t\t") + "\n");
    }

    private onFailedTest(test: Test, err) {
        this._logger.debug("SrfMochaReporter.onFailedTest: Test " + test.title + " failed on " + "type:" + test.type + " with err: " + err);
        const reporterStep = this._createReporterStep("test-end", test.title, "failed", test.duration, err.stack);
        this._reporterLogger.error(reporterStep);
        this._srfReporterFacade.reportStep(reporterStep);

        if (this._isCloudRun)
            return;

        test.error = err.stack;
        this._reportContext.failedTests.push(test);
        log(indentation + chalk.white(`${test.title} ... `) + chalk.red(`Failed: ${err.message}\n`));
    }

    private onSuiteEnd(suite: Suite) {
        this._logger.debug("SrfMochaReporter.onSuiteEnd: Called with suit - " + suite.title);

        if (suite.root)
            return;

        const status:ReporterStatuses = _.some(suite.tests, ["state", "failed"]) ? "failed" : "success";

        const reporterStep = this._createReporterStep("suite-end", suite.title, status, suite.duration);
        this._srfReporterFacade.reportStep(reporterStep);
    }

    private onTestEnd(test: Test) {
        this._logger.debug("SrfMochaReporter.onTestEnd: Called with test - " + test.title);
    }


    private _createReporterStep(role: StepRole, description: string, status: ReporterStatuses, duration: number, error: string = null): ReporterStep {
        this._logger.debug("SrfMochaReporter._createReporterStep:  role " + role, ", description: "+ description +
            ", status: " + status + "duration" + duration + "error:" + error);

        return {
            description: description,
            sessionId: this._sessionId,
            status: status,
            role: role,
            durationMs: duration,
            errors: error && [error]
        };
    }

    private _initCloudRunOptions(options: MochaReporterOptions) {
        this._logger.debug("SrfMochaReporter._initCloudRunOptions: called");

        const reporterUrl = process.env["SRF_REPORTER_URL"];
        if (!reporterUrl)
            throw new Error("SrfMochaReporter : Missing environment variable. Ensure that the SRF_REPORTER_URL environment variable exists.");

        this._srfReporterFacade = new SrfReporterFacade(reporterUrl, this._logger);

        if (!process.env["SRF_CLIENT_SECRET"])
            throw new Error("SrfMochaReporter : Missing environment variable. Ensure that the SRF_CLIENT_SECRET environment variable exists.");

        this._sessionId = process.env["SRF_CLIENT_SECRET"];
    }

    private _initBurstOptions(options: MochaReporterOptions) {
        this._logger.debug("SrfMochaReporter._initBurstOptions: called");

        let reporterUrl = options.reporterOptions.srfUrl || process.env["SRF_REPORTER_URL"];
        if (!reporterUrl)
            throw new Error("SrfMochaReporter : Missing environment variable. Ensure that the SRF_REPORTER_URL environment variable exists.");

        reporterUrl += reporterUrl.match(/\/$/) ? "rest/gateway/" : "/rest/gateway/";
        this._srfReporterFacade = new SrfReporterFacade(reporterUrl, this._logger);

        if (!process.env["SRF_CLIENT_ID"] || !process.env["SRF_CLIENT_SECRET"])
            throw new Error("SrfMochaReporter : Missing environment variables. Ensure that the SRF_CLIENT_ID/SRF_CLIENT_SECRET environment variables exist.");

        this._sessionId = this._createNewBurstSessionSync();
        process.env.SRF_CLIENT_SECRET = this._sessionId;
        process.env.ACCESS_TOKEN_SECRET = this._sessionId;

    }

    private onEnd() {
        this._logger.debug("SrfMochaReporter.onEnd: Called");
        if (this._isCloudRun) {
            return;
        }
        this._logger.log("SrfMochaReporter.onEnd: burst run, going to cleanSession");
        this._deleteSession(this._sessionId);

        if (this._isCloudRun)
            return;

        this._printReport();
    }

    private _deleteSession(sessionId: string) {
        this._logger.debug("SrfMochaReporter.deleteSession: called with session", sessionId);
        this._srfReporterFacade.deleteSession(sessionId);
    }

    private _createNewBurstSessionSync(): string {
        this._logger.debug("SrfMochaReporter._createNewBurstSessionSync: called");

        const executionContext: RemoteExecutionContext = {
            clientId: process.env["SRF_CLIENT_ID"],
            clientSecret: process.env["SRF_CLIENT_SECRET"]
        };
        const sessionId = this._srfReporterFacade.createSession(executionContext);

        if (!sessionId) {
            throw new Error("Failed to create SRF session");
        }
        return sessionId;
    }

    private _printReport() {
        this._printSummary();

        if(this._reportContext.failedTests.length > 0)
            this._printFailures();
    }

    private _printSummary() {
        const totalTests: number = this._reportContext.passedTests.length + this._reportContext.failedTests.length;
        logLn(chalk.white(`\n\nRan ${chalk.bold(totalTests.toString())} tests`));
        logLn(chalk.green(`Passed: ${this._reportContext.passedTests.length}`) + " " + chalk.red(`Failed: ${this._reportContext.failedTests.length}`));
    }

    private _printFailures() {
        logLn(chalk.white.underline.bold(`\nFailures:`));
        _.forEach(this._reportContext.failedTests, (failedTest: Test) => {
            logLn(chalk.cyan(`# ${failedTest.parent.title} - ${failedTest.title}`));
            logLn(chalk.red(`${failedTest.error}`));
        });
    }
}

function log(message) {
    process.stdout.write(`${message}\r`);
}

function logLn(message) {
    process.stdout.write(`${message}\n`);
}
