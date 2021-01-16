var awsServices = require('../aws-modules/base.aws')
var secretsmanager = awsServices.sm();

var confKeyName = ['prod', 'dev', 'local'][1]
var config = {}

function createSeckey(sName, value) {
    var params = {
        Name: sName,
        SecretString: value
    };
    console.log(sName);
    secretsmanager.createSecret(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
}
function putValueSeckey(sName, value) {
    secretsmanager.putSecretValue({
        SecretId: sName,
        SecretString: JSON.stringify(value)
    }, function (err, data) {
        if (err) console.log("putSecretValue", err);
        else console.log(data);
    });
}
function listSeckey() {
    var params = {
    };
    secretsmanager.listSecrets(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
}
function getSecrets(sName) {
    secretsmanager.getSecretValue({ SecretId: sName }, function (err, data) {
        let secrets;
        if (err) {
            if (err.code === 'DecryptionFailureException')
                throw err;
            else if (err.code === 'InternalServiceErrorException')
                throw err;
            else if (err.code === 'InvalidParameterException')
                throw err;
            else if (err.code === 'InvalidRequestException')
                throw err;
            else if (err.code === 'ResourceNotFoundException')
                throw err;
        }
        else {
            if ('SecretString' in data) {
                secrets = data.SecretString;
            } else {
                let buff = new Buffer(data.SecretBinary, 'base64');
                secrets = buff.toString('ascii');
            }
        }
        secrets = secrets ? JSON.parse(secrets) : {};
        console.log(secrets);
    });
}

module.exports = function () {
    return {
        createSeckey,
        putValueSeckey,
        listSeckey,
        getSecrets,
        confKeyName,
        config
    }
}