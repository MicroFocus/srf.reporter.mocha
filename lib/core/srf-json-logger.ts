import _ = require("lodash");

export class SrfJsonLogger {

    constructor(private _logSwitch:LogSwitch = LogSwitch.ON) {}

    private jsonify(message) {
        var resultMessage = {
            timestamp: this.formattedDate(),
            type: "srfReporter"
        };

        switch (typeof message) {
            case "string":
                return JSON.stringify(_.extend(resultMessage, {message: message}));
            case "object":
                return JSON.stringify(_.extend(resultMessage, message));
            default:
                throw new Error("Got unknown message type " + typeof message);
        }
    }

    private formattedDate() {
        var d = new Date();
        return [d.getMonth() + 1,
                d.getDate(),
                d.getFullYear()].join("-") + "T" +
            [d.getHours(),
                d.getMinutes(),
                d.getSeconds()].join(":");
    }

    /* tslint:disable no-console*/
    public log(message) {
        if (this._logSwitch === LogSwitch.OFF)
            return;

        console.log(this.jsonify(message));
    };

    public debug(message) {
        if (this._logSwitch === LogSwitch.OFF)
            return;

        console.log(this.jsonify(message));
    };

    public error(message) {
        if (this._logSwitch === LogSwitch.OFF)
            return;

        console.error(this.jsonify(message));
    }
}

export enum LogSwitch {
    OFF = -1,
    ON = 1,
}

