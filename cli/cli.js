// TODO

// - make stackname a cli variable, not hardcoded
// - add checks for is_empty/is_exists for running create/destory
// - check if AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY is needed where its needed
// - logging
// - jazz up the weather frontend a little

// - remove unnecessary files
// - readme
// - create binary
// - push to git


import util from './util';

// const inquirer = require('inquirer');
const { program } = require('commander');
const exec = require('await-exec')
const AWS = require("aws-sdk");
const cfn = require('cfn');
const s3Lambo = require('s3-lambo');


// AWS credentials
require('dotenv').config();

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})


program.version('0.0.1');
program
  .requiredOption('-n, --name <type>', 'name of cloudformation stack')
  .option('-c, --create', 'create cloudformation stack')
  .option('-d, --destroy', 'destroy cloudformation stack')
  .parse(process.argv)

const options = program.opts();
const nameIsValid = options.name && !/^\-/.test(options.name);
const stackName = options.name;


if (options.create && nameIsValid) {
  (async function createCloudformation() {
    if (!await cfn.stackExists(stackName)) {
      await cfn({
        name: stackName,
        template: __dirname + '/../cloudformation/api-gateway-lambda.yml',
        awsConfig: {
          region: 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const gatewayInvokeURL = await util.getAPIGatewayInvokeURL(stackName);

      await exec(`cd ../web-app && REACT_APP_LAMBDA_URL=${gatewayInvokeURL} yarn run build`);

      await s3Lambo.uploadDirectory({
        path: '../web-app/build',
        params: {
          Bucket: `${stackName}-app`
        }
      });

      console.log(`FINISHED --- ${await util.getS3WebsiteURL(stackName)}`);
    }
    else {
      console.log(`ERROR - stack "${stackName}" already exists`);
    }
  })();
}

else if (options.destroy && nameIsValid) {
  (async function destroyCloudformation() {
    if (await cfn.stackExists(stackName)) {
      await util.emptyS3Directory(`${stackName}-app`, '');
      await util.emptyS3Directory(`${stackName}-logs`, '');
      await cfn.delete(stackName);
    }
    else {
      console.log(`ERROR - stack "${stackName}" does not exists`);
    }
  })();
}

else if (!nameIsValid) {
  console.log('"name" cannot start with a hyphen')
}

else if (!options.create && !options.destroy) {
  console.log('create or destroy must be specified, see "--help" for more info');
}

