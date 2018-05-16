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