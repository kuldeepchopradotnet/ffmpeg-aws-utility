
var awsServices = require('../modules/base.aws')
var lambda = awsServices.lambdaClient();

const BUCKET = '<bucket>';
const FUNCTION = '<function name>';

function createFunction(Buffer) {
    var params = {
        // Code: {
        //     S3Bucket: BUCKET,
        //     S3Key: "function.zip"
        // },
        Code: {
            ZipFile: Buffer
        },
        Description: "data transformation from dynamodb and save to s3",
        Environment: {
            Variables: {
                "BUCKET": BUCKET,
            }
        },
        FunctionName: FUNCTION,
        Handler: "index.handler",
        MemorySize: 2048,
        Publish: true,
        Role: "<aws_lambda_role>",
        Runtime: "nodejs12.x",
        Tags: {
            "DEPARTMENT": "Assets"
        },
        Timeout: 900,
        TracingConfig: {
            Mode: "Active"
        }
    };
    lambda.createFunction(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response-
    });

}

function invokeFunction(payload) {
    var params = {
        FunctionName: FUNCTION,
        Payload: JSON.stringify(payload),
        InvocationType: "RequestResponse",   //"Event"|"RequestResponse"|"DryRun"|string;
        //Qualifier: "1",
    };
    lambda.invoke(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            //let nData = JSON.parse(data.Payload)
            console.log(data);
        }
    });
}

function updateFunctionCode(buffer) {
    var params = {
        FunctionName: FUNCTION,
        // DryRun: true || false,
        // Publish: true || false,
        // RevisionId: 'STRING_VALUE',
        // S3Bucket: 'STRING_VALUE',
        // S3Key: 'STRING_VALUE',
        // S3ObjectVersion: 'STRING_VALUE',
        ZipFile: buffer,

    };
    lambda.updateFunctionCode(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

function updateConfigFunction() {
    var params = {
        FunctionName: FUNCTION,
        Timeout: 900,
        MemorySize: 256
    }
    lambda.updateFunctionConfiguration(params, (err, data) => {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    })
}

module.exports = function () {
    return {
        createFunction,
        invokeFunction,
        updateFunctionCode,
        updateConfigFunction
    }
}