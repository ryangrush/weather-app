import util from './util';

const { program } = require('commander');
const exec = require('await-exec')
const AWS = require('aws-sdk');
const cfn = require('cfn');
const s3Lambo = require('s3-lambo');
const path = require('path');


require('dotenv').config();

program.version('0.0.1');
program
  .requiredOption('-n, --name <type>', 'name of cloudformation stack')
  .option('-c, --create', 'create cloudformation stack')
  .option('-d, --destroy', 'destroy cloudformation stack')
  .option('-u, --update', 'update web-app')
  .parse(process.argv)

const options = program.opts();
const nameIsValid = options.name && !/^\-/.test(options.name);
const stackName = options.name;


(async function cli() {
  let AWSCredentials = await util.getAWSCredentials();

  AWS.config.update({
    region: 'us-east-1',
    accessKeyId: AWSCredentials.awsKeyId,
    secretAccessKey: AWSCredentials.awsSecretKey
  });

  if (options.create && nameIsValid) {
    if (!await cfn.stackExists(stackName)) {
      await cfn({
        name: stackName,
        template: path.join(__dirname, '/../../cloudformation/api-gateway-lambda.yml'),
        awsConfig: {
          region: 'us-east-1',
          accessKeyId: AWSCredentials.awsKeyId,
          secretAccessKey: AWSCredentials.awsSecretKey
        }
      });

      const gatewayInvokeURL = await util.getAPIGatewayInvokeURL(stackName);

      await exec(`cd ${path.join(__dirname, '../../web-app/')} && REACT_APP_LAMBDA_URL=${gatewayInvokeURL} yarn run build`);

      await s3Lambo.uploadDirectory({
        path: path.join(__dirname, '../../web-app/build'),
        params: {
          Bucket: `${stackName}-app`
        }
      });

      console.log(`FINISHED --- ${await util.getS3WebsiteURL(stackName)}`);
    }
    else {
      console.log(`ERROR - stack "${stackName}" already exists`);
    }
  }

  else if (options.destroy && nameIsValid) {
    if (await cfn.stackExists(stackName)) {
      await util.emptyS3Directory(`${stackName}-app`, '');
      await util.emptyS3Directory(`${stackName}-logs`, '');
      await cfn.delete(stackName);
    }
    else {
      console.log(`ERROR - stack "${stackName}" does not exists`);
    }
  }

  else if (options.update && nameIsValid) {
    if (await cfn.stackExists(stackName)) {
      await util.buildWebApp(stackName);
      await s3Lambo.uploadDirectory({
        path: path.join(__dirname, '../../web-app/build'),
        params: {
          Bucket: `${stackName}-app`
        }
      });

    }
    else {
      console.log(`ERROR - stack "${stackName}" does not exists`);
    }
  }

  else if (!nameIsValid) {
    console.log('"name" cannot start with a hyphen')
  }

  else if (!options.create && !options.destroy) {
    console.log('create or destroy must be specified, see "--help" for more info');
  }

})();
