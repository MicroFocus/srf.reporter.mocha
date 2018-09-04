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

import Concat = require("concat-stream");
import Request = require("request");

export interface WorkerResponse {
    httpStatus: number;
    data?: any;
    error?: Error;
}

function respond(data: WorkerResponse) {
    process.stdout.write(JSON.stringify(data), function() {
        process.exit(0);
    });
}

process.stdin.pipe(Concat((stdin=>{
    const requestOptions: Request.OptionsWithUrl = JSON.parse(stdin.toString());
    Request(requestOptions, (error, response: Request.RequestResponse, body) => respond({error: error && error.message, httpStatus: response && response.statusCode, data: body}));
})));