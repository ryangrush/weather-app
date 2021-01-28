# NOTES

The purpose of this repo is to demonstrate a simple AWS Cloudformation deploy with some slight configuration. This demo uses a command-line tool to create/destroy the Cloudformation stack and associated resources - S3 Bucket, Lambda, API Gateway. It will then upload a sample ReactJS app to the S3 Bucket and return the URL to the hosted app. 

## INSTALL

- `cd web-app && yarn` (or `npm i`)
- `cd ../cli && yarn`
- rename ".env.default" to ".env" and fill in your AWS ID and Secret Key -OR- enter your credentials via the command-line prompt
- `node -r esm src/cli.js`

## USAGE

*Create*

`node -r esm src/cli.js -n <STACK NAME> -c`

URL to ReactJS app will display in terminal upon completion. 

*Update*

`node -r esm src/cli.js -n <STACK NAME> -u`

This command will rebuild web-app/ and upload it to S3.

*Destroy*

`node -r esm src/cli.js -n <STACK NAME> -d`


## MISC

If you wish to make changes to the CLI and rebuild the binaries run `cd cli && yarn run build`


## TODO

- configure webpack to successfully build compressed code in cli/dist/
- configure `pkg` to successfully build binaries in bin/
