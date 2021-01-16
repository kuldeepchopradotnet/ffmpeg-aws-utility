var AWS = require('aws-sdk');
const utils = require('../utils/utils');
var awsConfig = utils.awsConfig();

let option = {
    region: '',
    apiVersion: ''
}

if (process.env.DEV !== 'true') {
    option['credentials'] = {
        accessKeyId: awsConfig.credentials.accessKeyId,
        secretAccessKey: awsConfig.credentials.secretAccessKey
    }
}
console.log('DEV',process.env.DEV);
function s3Client() {
    option.region = 'us-east-1'
    option.apiVersion = '2006-03-01'
    if (process.env.DEV === 'true') {
        option.region = 'eu-west-1'
        option['endpoint'] = 'http://localhost:5002'
        option['s3ForcePathStyle'] = true
    }
    // option.region = 'eu-west-1'
    // option['endpoint'] = 'http://localhost:5002'
    // option['s3ForcePathStyle'] = true
    return new AWS.S3(option);
}

function lambdaClient() {
    option.region = 'us-east-1'
    option.apiVersion = '2015-03-31'
    if (process.env.DEV === 'true') {
        option['endpoint'] = 'http://127.0.0.1:3001/';
    }
    return new AWS.Lambda(option);
}

function dynamoClient() { 
    option.region = 'us-west-2'
    option.apiVersion = '2012-08-10'
    if (process.env.DEV === 'true') {
        option['endpoint'] = 'http://localhost:8000';
    }
    var dbClient = new AWS.DynamoDB(option);
    var docClient = new AWS.DynamoDB.DocumentClient(option)
    return {
        dbClient,
        docClient
    }
}

function sts(){
    option.region = 'us-east-1'
    option.apiVersion = '2011-06-15'
    if (process.env.DEV === 'true') {
        option['endpoint'] = 'http://localhost:4566'
    }
    return new AWS.STS(option);
}

function iam(){
    option.region = 'us-east-1'
    option.apiVersion = '2010-05-08'
    if (process.env.DEV === 'true') {
        option['endpoint'] = 'http://localhost:4566'
    }
    return new AWS.IAM(option);
}


function sm(){
    option.region = 'us-west-1'
    option.apiVersion = '2017-10-17'
    if (process.env.DEV === 'true') {
        option['endpoint'] = 'http://localhost:4566'
    }
    return new AWS.SecretsManager(option);
}

function kms(){
    option.region = 'us-west-1'
    option.apiVersion = '2014-11-01'
    return new AWS.KMS(option);
}

function ses(){
    option.region = 'us-east-1'
    option.apiVersion = '2010-12-01'
    if (process.env.DEV === 'true') {
        option['endpoint'] = 'http://localhost:4566'
    }
    return new AWS.SES(option);
}


function batch(){
    option.region = 'us-east-1'
    option.apiVersion = '2016-08-10'
    return new AWS.Batch(option);
}



module.exports = function () {
    return {
        s3Client,
        lambdaClient,
        dynamoClient,
        sts,
        iam,
        sm,
        ses,
        batch,
        kms
    }
}();