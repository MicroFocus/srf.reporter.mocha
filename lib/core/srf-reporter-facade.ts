
import {RemoteExecutionContext, ReporterStep} from "./srf-reporter-types";
import {WorkerResponse} from "./sync-request/request-worker";
import {OptionsWithUrl} from "request";
import {SrfJsonLogger} from "./srf-json-logger";
import _ = require("lodash");

const SpawnSync = require("child_process").spawnSync;

const PROCESS_TIMEOUT = 1000 * 20;
const REQUEST_TIMEOUT = 1000 * 15;

export class SrfReporterFacade {

    constructor(private _srfReporterBaseUrl: string, private _logger: SrfJsonLogger) {}

    public createSession(remoteExecutionContext: RemoteExecutionContext) : string {
        const request: OptionsWithUrl  = {
            url: this._srfReporterBaseUrl + "/sessions",
            method: "POST",
            json: true,
            body: remoteExecutionContext,
            timeout: REQUEST_TIMEOUT
        };

        const response = this.requestSync(request);
        const sessionId = response && response.session;
        if (!sessionId)
            throw new Error("Failed to create execution session: Received undefined session id");

        return sessionId;
    }

    public reportStep(reporterStep: ReporterStep) : void {
        const request: OptionsWithUrl  = {
            url: this._srfReporterBaseUrl + "/reports",
            method: "POST",
            json: true,
            body: reporterStep,
            timeout: REQUEST_TIMEOUT
        };

        this.requestSync(request);
        return;
    }

    public deleteSession(sessionId: string) : void {
        const request: OptionsWithUrl  = {
            url: this._srfReporterBaseUrl +  "/sessions/" + sessionId,
            method: "DELETE",
            timeout: REQUEST_TIMEOUT
        };

        this.requestSync(request);
        return;
    }

    private requestSync(request: OptionsWithUrl) : any | undefined {
        const telegram = JSON.stringify(request);
        this._logger.debug(`SrfReporterFacade.requestSync: Sending request ${telegram}`);
        const res = SpawnSync(process.execPath, [require.resolve("./sync-request/request-worker.js")], {input: telegram, timeout: PROCESS_TIMEOUT} );

        if (res.status !== 0){
            const error = res.error /*Timeout*/ || new Error(res.stderr.toString());
            throw new Error(`Request execution failed with error: ${error.message}`);
        }

        const response: WorkerResponse = _.attempt(JSON.parse, res.stdout);
        if(_.isError(response))
            throw new Error(`Failed parsing request ${request.url} response`);

        let {httpStatus, data, error} = response;
        if (error || httpStatus >= 400) {
            error = error || data;
            throw new Error(`Received status code ${httpStatus} for request ${request.url} with error: ${JSON.stringify(error)}`);
        }

        return data;
    }


}