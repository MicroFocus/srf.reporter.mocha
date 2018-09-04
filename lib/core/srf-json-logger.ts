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

