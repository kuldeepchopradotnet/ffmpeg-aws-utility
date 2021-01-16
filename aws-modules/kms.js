var awsServices = require('../aws-modules/base.aws')
var kms = awsServices.kms();
const KEY_ID = '<enter key>';

function createKey() {
    kms.createKey({}, (err, data) => {
        if (err) {
            console.log('createKey err', err);
        }
        else {
            console.log('createKey', data);
        }
    })

}

function encrypt(plainText) {
    kms.encrypt({
        KeyId: KEY_ID,
        Plaintext: plainText
    }, (err, data) => {
        if (err) {
            console.log('ecy err', err);
        }
        else {
            //console.log('ecy', data);
            //console.log('buffer len',data.cipherTextBlob.length);
            let ecyStr = data.CiphertextBlob.toString('base64');
            console.log('ecystr len', ecyStr.length);
            //let ecyStr = Buffer.from(data.CiphertextBlob).toString('utf-8');
            console.log(ecyStr);
        }
    })

}
function decrypt(cipherTextBlob) {
    kms.decrypt({
        KeyId: KEY_ID,
        CiphertextBlob: cipherTextBlob
    }, (err, data) => {
        if (err) {
            console.log('decrypt err', err);
        }
        else {
            console.log('decrypt', data);
            let dcy = data.Plaintext.toString();
            console.log(dcy);
        }
    })

}
function listAliase() {
    var params = {
    };
    kms.listAliases(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);
    })
}
function listKeys() {
    var params = {
    };
    kms.listKeys(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);
    })
}
function listGrant() {
    kms.listGrants({
        KeyId: KEY_ID
    }, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);
    })
}

function describeKey() {
    kms.describeKey({
        KeyId: KEY_ID
    }, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);
    })
}

module.exports = function () {
    return {
        createKey,
        encrypt,
        decrypt,
        listAliase,
        listKeys,
        listGrant,
        describeKey
    }
}