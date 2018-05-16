
import {RemoteExecutionContext} from "./srf-reporter-types";

export class SrfReporterTypeGuard {

    public static isRemoteExecutionContext(arg: any) : arg is RemoteExecutionContext {
        if (!(<RemoteExecutionContext>arg).clientId)
            return false;

        return !!(<RemoteExecutionContext>arg).clientSecret;
    }
}