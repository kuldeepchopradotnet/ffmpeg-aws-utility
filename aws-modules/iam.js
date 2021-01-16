var awsServices = require('../modules/base.aws')
var iam = awsServices.iam();


function listRoles() {
    var params = {
        // Marker: 'STRING_VALUE',
        // MaxItems: 'NUMBER_VALUE',
        // PathPrefix: 'STRING_VALUE'
    };
    iam.listRoles(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

function createRole() {
    var policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "iam:AssumeRole",
                "iam:PutItem"
            ],
            "Resource": "*"
        }
        ]
    };


    var params = {
        AssumeRolePolicyDocument: JSON.stringify(policy),
        RoleName: 'temp-role', /* required */
        Description: 'used to provide temp credential for sts assume role',
    };
    iam.createRole(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}




module.exports = function () {
    return {
        listRoles,
        createRole
    }
}