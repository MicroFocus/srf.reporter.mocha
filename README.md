
Storm Runner Functional reporter for mocha testing framework 

### Prerequisites
run `npm install srf.reporter.mocha` 

Set the following environment variables:
* SRF_CLIENT_ID - Set your client id, the client id can be obtained from your srf account.
* SRF_CLIENT_SECRET - Set your client secret, the client secret can be obtained from your srf account.
* SRF_REPORTER_URL - Set SRF address for step reporting. (can also be set in reporter options)


### Usage
`mocha --reporter srf.reporter.mocha`

####Reporter Options
* **srfUrl** i.e. https://ftaas-eu1.saas.hpe.com (Caution, url varies between regions)
* **debugReport** **true | false**  Reporter logs in verbose mode

Usage example

`mocha --reporter srf.reporter.mocha --reporter-options debugReport=true`