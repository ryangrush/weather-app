const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const inquirer = require('inquirer');
const exec = require('await-exec');
const path = require('path');


export default {

  buildWebApp: async function(stackName) {
    const gatewayInvokeURL = await this.getAPIGatewayInvokeURL(stackName);

    await exec(`cd ${path.join(__dirname, '../../web-app/')} && REACT_APP_LAMBDA_URL=${gatewayInvokeURL} yarn run build`);
  },

  emptyS3Directory: async function(bucket, dir) {
    const listParams = {
      Bucket: bucket,
      Prefix: dir
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
  },

  getAPIGatewayInvokeURL: function(stackName) {
    return new Promise((resolve, reject) => {
      new AWS.CloudFormation().describeStacks({StackName: stackName}, (err, data) => {
        var result = data.Stacks[0].Outputs.filter(obj => {
          return obj.OutputKey === 'apiGatewayInvokeURL'
        });

        resolve(result[0].OutputValue);
      });
    });
  },

  getAWSCredentials: function() {
    return new Promise((resolve, reject) => {
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'awsKeyId',
              message: 'AWS_ACCESS_KEY_ID',
              when: !process.env.AWS_ACCESS_KEY_ID
            },
            {
              type: 'input',
              name: 'awsSecretKey',
              message: 'AWS_SECRET_ACCESS_KEY',
              when: !process.env.AWS_SECRET_ACCESS_KEY
            }
          ])
          .then(answers => {
            if (process.env.AWS_ACCESS_KEY_ID) { answers.awsKeyId = process.env.AWS_ACCESS_KEY_ID }
            if (process.env.AWS_SECRET_ACCESS_KEY) { answers.awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY }
            
            resolve(answers);
          })
      }
      else {
        resolve({
          awsKeyId: process.env.AWS_ACCESS_KEY_ID,
          awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY
        })
      }
    });
  },

  getS3WebsiteURL: function(stackName) {
    return new Promise((resolve, reject) => {
      new AWS.CloudFormation().describeStacks({StackName: stackName}, (err, data) => {
        var result = data.Stacks[0].Outputs.filter(obj => {
          return obj.OutputKey === 's3WebsiteURL'
        });

        resolve(result[0].OutputValue);
      });
    });
  },


}