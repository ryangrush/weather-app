# NOTES

The purpose of this repo is to demonstrate a simple AWS Cloudformation deploy with some slight configuration. This demo uses a command-line tool to create/destroy the Cloudformation stack and associated resources - S3 Bucket, Lambda, API Gateway.

## INSTALL

- `cd cli`
- `yarn` or `npm i`
- rename ".env.default" to ".env" and fill in your AWS ID and Secret Key
- `node -r esm src/cli.js`

## USAGE

*Create*

`node -r esm src/cli.js -n <STACK NAME> -c`

*Destroy*

`node -r esm src/cli.js -n <STACK NAME> -d`


## MISC

If you wish to make changes to the CLI and rebuild the binaries run `cd cli && yarn run build`