var awsServices = require('../aws-modules/base.aws')
var s3 = awsServices.s3Client();
var BUCKET = '<bucket>'

function putcors() {
    var params = {
        Bucket: BUCKET,
        CORSConfiguration: {
            CORSRules: [{
                AllowedHeaders: [
                    "*"
                ],
                AllowedMethods: [
                    "PUT",
                    "POST",
                    "DELETE"
                ],
                AllowedOrigins: [
                    "*"
                ],
                ExposeHeaders: [
                    "x-amz-server-side-encryption",
                    "ETag"
                ],
                MaxAgeSeconds: 3000
            }]
        }
    };
    s3.putBucketCors(params, (err, data) => {
        if (err) console.log(err);
        else console.log("done", data);
    })
}

function streamObject(key, location) {
    var params = {
        Bucket: BUCKET,
        Key: key,
    };
    let s3Stream = s3.getObject(params).createReadStream();
    s3Stream.on('error', function (err) {
        console.error(err);
    });
    s3Stream.pipe(location).on('error', function (err) {
        console.error('File Stream:', err);
    }).on('close', function () {
        console.log('Done.');
    });
}

async function getObject(key) {
    return new Promise((res, rej) => {
        try {
            var params = {
                Bucket: BUCKET,
                Key: key,
                //Range: "bytes=0-9"
            };
            s3.getObject(params, function (err, data) {
                if (err) {
                    console.log("getObject", err);
                    throw err;
                }
                else {
                    //console.log(data);
                    res(data);
                }
            });
        } catch (error) {
            rej(error);
        }
    })
}

/**
 * upload to s3
 * @param {*} file stream,string
 * @param {*} filename ,key
 * @param {*} cb {(err,data)=>void}
 * @param {*} contentType 
 */
async function upload(file, key, cb, contentType) {
    return s3.upload({
        Bucket: BUCKET,
        Key: key,
        Body: file,
        ContentType: contentType,
        //ACL: "public-read"
    }, cb);
}

function completeMultipartUpload(key, multipartMap, uploadId, cb) {
    var params = {
        Bucket: BUCKET,
        Key: key,
        MultipartUpload: multipartMap,
        UploadId: uploadId
    };
    s3.completeMultipartUpload(params, cb);
}

function createMultipartUpload(key, contentType, cb) {
    var params = {
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType
    };
    s3.createMultipartUpload(params, cb)
}

function uploadPart(file, key, partNumber, uploadId, cb) {
    var params = {
        Body: file,
        Bucket: BUCKET,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId
    };
    s3.uploadPart(params, cb);
}

function listObjects() {
    return new Promise((res, rej) => {
        s3.listObjects({
            Bucket: BUCKET,
            //Prefix: '<prefix>'
        }, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                rej(err);
            }
            else {
                let i = 0;
                for (let con of data.Contents) {
                    console.log(`${i++}. ${con.Key} =>${getSizeMB(con.Size)} MB =>${con.LastModified.toISOString()}`)
                }
                console.log('length', data.Contents.length)
            }
        });
    })
}

function getSizeMB(byte) {
    if (byte) {
        return (byte / (1024 * 1024)).toFixed(2)
    }
    return 0
}


async function deleteObjects() {
    let list = await listObjects();
    if (list && list.Contents) {
        listKeys = [];
        list.Contents.forEach(c => {
            listKeys.push({
                Key: c.Key
            });
        });

        return new Promise((res, rej) => {
            var params = {
                Bucket: BUCKET,
                Delete: {
                    Objects: listKeys,
                    Quiet: false
                }
            };
            s3.deleteObjects(params, function (err, data) {
                if (err) {
                    rej(err);
                    // console.log(err, err.stack);
                }
                else {
                    res(data);
                    //console.log(data);
                }
            });
        })
    }
}

function createBucket() {

    // var params = {
    //     Bucket: "examplebucket", 

    //     CreateBucketConfiguration: {
    //      LocationConstraint: "eu-west-1"
    //     }
    //    };
    //    s3.createBucket(params, function(err, data) {
    //      if (err) console.log(err, err.stack); // an error occurred
    //      else     console.log(data);           // successful response
    //      /*
    //      data = {
    //       Location: "http://examplebucket.<Region>.s3.amazonaws.com/"
    //      }
    //      */
    //    });



    s3.createBucket({
        Bucket: BUCKET, CreateBucketConfiguration: {
            LocationConstraint: "eu-west-1"
        }

    }, (err, data) => {
        if (err) {
            console.log("err create bucket", err);
        }
        else {
            console.log("create bucket data", data);
        }
    })
}

function listMultipart(key) {
    return new Promise((res, rej) => {
        s3.listMultipartUploads({
            Bucket: BUCKET,
            Prefix: key
        }, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                rej(err);
            }
            else {
                console.log(data);
                let uploadId = null;
                if (data && data.Uploads.length > 0) {
                    uploadId = data.Uploads[0].UploadId;
                }
                res(uploadId);
            }
        });
    })
}

function listParts(key, uploadId) {
    return new Promise((res, rej) => {
        var params = {
            Bucket: BUCKET,
            Key: key,
            UploadId: uploadId,
        };
        s3.listParts(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            }
            else {
                console.log(data);
                let parts = null;
                if (data.Parts && data.Parts.length) {
                    parts = data.Parts
                }
                res(parts);
            }           // successful response
        });
    })
}


function renameObject(oldKey, newKey) {
    s3.copyObject({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${oldKey}`,
        Key: newKey
    })
        .promise()
        .then((data) => {
            // Delete the old object

            //   s3.deleteObject({
            //     Bucket: BUCKET_NAME, 
            //     Key: OLD_KEY
            //   }).promise()
            console.log(data);
        })
        // Error handling is left up to reader
        .catch((e) => console.error(e))
}

function signedUrl(key) {
    var url = s3.getSignedUrl('getObject', {
        Bucket: BUCKET,
        Key: key,
        Expires: 43200
    });
    console.log('[GetUrl]: ', url);
    return url;
}

function getPutSignedUrl(key) {
    var params = { Bucket: BUCKET, Key: key };
    var url = s3.getSignedUrl('putObject', params);
    console.log('[PutUrl]: ', url);
    return url;
}

function listBucket() {
    s3.listBuckets((err, data) => {
        if (err) console.log(err);
        else console.log(data);
    })
}

function headObject(key) {
    var params = {
        Bucket: BUCKET,
        Key: key
    };
    s3.headObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

function createStream(key, writeStream) {
    s3.getObject({
        Bucket: BUCKET,
        Key: key,
        //Range: "bytes=0-9"
    }).createReadStream().pipe(writeStream);
}



module.exports = function () {
    return {
        getObject: getObject,
        upload: upload,
        streamObject: streamObject,
        putcors: putcors,
        completeMultipartUpload: completeMultipartUpload,
        uploadPart: uploadPart,
        createMultipartUpload: createMultipartUpload,
        listObjects: listObjects,
        deleteObjects: deleteObjects,
        createBucket: createBucket,
        listMultipart,
        listParts,
        renameObject,
        signedUrl,
        getPutSignedUrl,
        listBucket,
        headObject,
        createStream
    }
}