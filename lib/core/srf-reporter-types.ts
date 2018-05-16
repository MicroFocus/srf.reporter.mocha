

export interface ReporterStep {
    description: string;
    status: ReporterStatuses;
    sessionId: string;
    role: StepRole;
    errors?: string[];
    durationMs?: number;
}

export interface RemoteExecutionContext {
    clientId: string;
    clientSecret: string;
}

export type StepRole = "test-begin" | "test-end" | "suite-begin" | "suite-end";
export type ReporterStatuses = "success" | "failed" | "errored";

export type ReporterMode = "burst" | "cloud";

export interface SrfReporterOptions {
    mode?: ReporterMode;
    srfUrl?: string;
}

