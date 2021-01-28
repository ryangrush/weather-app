const AWS = require("aws-sdk");
const s3 = new AWS.S3();

export default {

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