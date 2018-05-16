

Storm Runner Functional reporter for mocha testing framework 

### Prerequisites
run `npm install srf.reporter.mocha` 

Set the following environment variables:
* SRF_CLIENT_ID - Set your client id, the client id can be obtained from your srf account.
* SRF_CLIENT_SECRET - Set your client secret, the client secret can be obtained from your srf account.
* SRF_REPORTER_URL - Set SRF address for step reporting.


### Usage
`mocha --reporter srf.reporter.mocha`

For running reporter with debug prints run with `mocha --reporter experience.center.mocha.reporter`**`--reporter-options debugReport=true`**