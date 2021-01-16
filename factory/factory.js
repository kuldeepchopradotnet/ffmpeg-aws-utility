var fs = require('fs');
const sm = require('../aws-modules/sm')();
const utils = require('../utils/utils');
const s3 = require('../aws-modules/s3')();
const kms = require('../aws-modules/kms')();
const batch = require('../aws-modules/batch')();
//const dynamodb = require('./modules/dynamodb')();
//var lambda = require('./modules/lambda')();
//var fileService = require('./services/fs.service')();
// var sts = require('./modules/sts')();
// var iam = require('./modules/iam')();
// var sm = require('./modules/sm')();
// var ses = require('./modules/ses')();
var ffmpeg = require('ffmpeg');
var path = require('path');
const concat = require('ffmpeg-concat')

const port = 3000
const FILE_NAME = '<file name of key s3>'
let tmpDir = path.join(__dirname, '../', 'temp');

var lmdaSwitch = {
    createFunction: 1,
    updateFunction: 3,
    invoke: 2,
    updateConfig: 4
}

var dynamoSwitch = {
    put: 1,
    query: 2,
    createTable: 3,
    deleteItem: 4,
    scan: 5,
    deleteTable: 6,
    delAll: 7,
    describeTable: 8
}

var s3Switch = {
    put: 'put',
    get: 'get',
    createBucket: 'createBucket'
}

var uploadId;
var type = 'video/mp4'
var multipartMap = {
    Parts: []
};
var partNumber = 0;
var limit = 50;
var readRecord = limit;
var keys = [];
var isMultiPartInit = false;
const webhook = ''
const fileNameC = ''
const mimeType = {
    mp4: 'video/mp4',
    wav: 'audio/wav'
}
const format = 'mp4'
function fsStat(path) {
    fs.stat(path, (err, data) => {
        if (err) console.log(err);
        else console.log(data);
    })
}

function authToken() {
    const credentials = Buffer.from('<id>' + ':' + '<secret>').toString('base64');
    console.log('token', credentials);
}

async function checkMultipartsS3AndComplete() {
    let uploadId = await s3.listMultipart(FILE_NAME);
    console.log(uploadId);
    if (uploadId) {
        let parts = await s3.listParts(FILE_NAME, uploadId)
        if (parts && parts.length > 0) {
            parts.forEach(p => {
                multipartMap.Parts.push({ PartNumber: p.PartNumber, ETag: p.ETag });
            })
        }
        if (multipartMap && multipartMap.Parts && multipartMap.Parts.length > 0) {
            partNumber = multipartMap.Parts.length;
            readRecord = ((partNumber * limit) + limit)
        }
    }
    console.log(multipartMap);
    console.log(partNumber);
    console.log(readRecord);
    await completePart(FILE_NAME, multipartMap, uploadId);
}


//#region Aws services Action
function awsServiceAction(action, invoke) {
    switch (action) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
    }
}

async function lambdaAction(btn) {
    switch (btn) {
        case 1:
            //var file = await fileService.readFile('lambda/function.zip');
            fs.readFile('lambda/dynamo-s3-file-upload/function.zip', (err, data) => {
                if (data) {
                    console.log(data)
                    lambda.createFunction(data);
                }
                // fs.writeFile('lambda/f2.zip',data,(err,data_2)=>{
                //     console.log('lambda/f2.zip',data_2);
                // })
            })

            //var buffer = Buffer.from(file);
            //console.log(file);
            //
            break;
        case 2:
            var payload = {
                fileName: FILE_NAME,
                webhook: '1'
            }
            lambda.invokeFunction(payload)
            break;
        case 3:
            fs.readFile('lambda/dynamo-s3-file-upload/function.zip', (err, data) => {
                if (data) {
                    console.log(data)
                    lambda.updateFunctionCode(data)
                }
            })
            break;
        case 4:
            lambda.updateConfigFunction();
            break;
    }
}

async function dynamodbAction(action) {

    switch (action) {
        case 1:
            let pn = 0;
            let stream = fs.createReadStream(FILE_NAME, { highWaterMark: 350 * 1024 })
            stream.on('data', (chunk) => {
                pn++;
                console.log('pn chunklen', pn, chunk.length);
                dynamodb.putItem(pn, FILE_NAME, chunk, (err, data) => {
                    if (err) {
                        console.log('putitem', err);
                    }
                    else {
                        console.log('putitem', data);
                        stream.resume();
                    }
                });
                stream.pause();

            }).on('end', function () {
                console.log("done");
            });

            // let file = fs.readFileSync('testfile.jpg')
            // if (!file) { return; }
            // for (var i = 1; i <= 10; i++) {
            //     dynamodb.putItem(i, FILE_NAME, file, (err, data) => {
            //         if (err) {
            //             console.log('putitem', err);
            //         }
            //         else {
            //             console.log('putitem', data);
            //         }
            //     });
            // }



            break;
        case 2:
            let resp = await dynamodb.queryData(FILE_NAME, limit)
            console.log("query response", resp);
            break;
        case 3:
            dynamodb.createTable1()
            break;
        case 4:
            dynamodb.deleteItem(FILE_NAME)
            break;
        case 5:
            dynamodb.scanData(FILE_NAME)
            break;
        case 6:
            dynamodb.deleteTable();
            break;
        case 7:
            dynamodb.deleteItems(FILE_NAME)
            break;
        case 8:
            dynamodb.describeTable();
            break;
    }

    //testuuid()
    //dynamodb.filter('new-test-upload.mp4')
    // for(var i = 0; i< 150;  i++){
    //     console.log(i);
    //     await dynamodb.delAll()
    // }

}

async function s3Action(action, key) {
    switch (action) {
        case 'put':
            //let file = Buffer.from("this is s3 local testing", 'utf8');
            let dir = path.join(__dirname, '../', 'temp');
            let filePath = path.join(dir, key);
            let file = fs.readFileSync(filePath)
            console.log('uploading.. .', (new Date()))
            s3.upload(file, key, (err, data) => {
                if (err) {
                    console.log("upload s3", err);
                }
                else {
                    console.log("upload s3 data", data);
                }
            }, 'video/mp4')
            break;
        case 'get':
            let data = await s3.getObject(key)
            console.log(data)
            if (data && data.ContentLength > 0) {
                console.log("[GET_OBJECT ContentLength]", data.ContentLength);
                fs.writeFileSync(key, data.Body)
            }
            break;
        case 'createBucket':
            s3.createBucket();
            break;
    }
}

function testuuid() {
    console.log("testing uuid");
    var arr = []
    for (var i = 0; i < 5000; i++) {
        var id = utils.uuid();
        var isRep = arr.includes(id);
        if (isRep) {
            console.log("repeated " + id);
        }
        arr.push(id);
    }
    //console.log(arr);


}
//#endregion

//#region  s3 upload from dynamodb

async function initS3MulUploadingDynamodb() {
    await getChucksAndUpload()
    console.log("finished");
}

async function geBufferDynamoDb() {
    let resp = await dynamodb.queryData(FILE_NAME, readRecord);
    console.log("geBufferDynamoDb");
    let bufferArr = [];
    if (resp && resp.length > 0) {
        for (let i = 0; i < resp.length; i++) {
            keys.push({
                Name: resp[i].Name,
                PartNumber: resp[i].PartNumber,
            });
            bufferArr.push(resp[i].Data)
        }

        let buffer = Buffer.concat(bufferArr);
        console.log("buffer len ", buffer.length);
        return buffer;
        // if(buffer.length < (5000 * 1024 )) {
        //     readRecord += limit;
        //     geBufferDynamoDb()
        // }
        // else {
        //     return buffer;
        // }
    }
    return null
}

async function getChucksAndUpload() {
    console.log('getChucksAndUpload partnumber con', readRecord)
    let buffer = await geBufferDynamoDb();
    if (buffer) {
        if (!isMultiPartInit) {
            uploadId = await createMultipart(FILE_NAME, type)
            console.log("uploadId", uploadId);
            isMultiPartInit = true;
        }
        partNumber++;
        console.log('partNumber', partNumber);
        let partRes = await uploadParts(buffer, FILE_NAME, partNumber, uploadId)
        multipartMap.Parts[partNumber] = partRes;
        console.log("del keys", keys.length)
        for (let i = 0; i < keys.length; i++) {
            await dynamodb.deleteItem(keys[i]);
        }
        keys = [];
        console.log("deleted");
        readRecord += limit;
        await getChucksAndUpload();
    }
    else {
        if (isMultiPartInit) {
            await completePart(FILE_NAME, multipartMap, uploadId);
            console.log("completed all parts uploading");
        }
    }
}

function createMultipart(name, type) {
    console.log("createMultipart...")
    return new Promise((res, rej) => {
        s3.createMultipartUpload(name, type, (err, data) => {
            if (err) { console.log("createMultipart", err) }
            else {
                console.log("createMultipart", data);
                // uploadId = data.UploadId;
                res(data.UploadId)
            }
        })
    })

}

function uploadParts(buffer, filename, partNumber, uploadId) {
    return new Promise((res, rej) => {
        console.log("uploadParts...")
        s3.uploadPart(buffer, filename, partNumber, uploadId, (err, data) => {
            if (err) {
                console.log("uploadParts", err);
                uploadParts(buffer, fileName, partNumber, uploadId);
            }
            else {
                console.log("uploadParts", data);
                res({
                    ETag: data.ETag,
                    PartNumber: partNumber
                });
            }
        })
    })
}

function completePart(key, multipartMap, uploadId) {
    return new Promise((res, rej) => {
        console.log("completePart...")
        s3.completeMultipartUpload(key, multipartMap, uploadId, (err, data) => {
            if (err) { console.log("completePart", err) }
            else {
                console.log("completePart", data);
                res(true);
            }
        })
    })
}

//#endregion

function main() {
    //console.log('factory_main');
}



//#region  Convert File using ffmpeg pack

function convertFile(ext) {
    //get file 
    //send to ffmeg converter 
    //save converted file back
    console.log('[Converter start]', (new Date()))
    let filename = '<filename>'
    let dir = path.join(__dirname, '../', 'temp');
    let filePath = path.join(dir, filename);
    converter(filePath, ext, (file, err) => {
        if (file) {
            console.log(file)
            console.log('[File_Converted] ', (new Date()))
        }
        else {
            console.log('[file_con_err]', err)
        }
    })


}

function converter(fileSrcpath, format, cb) {
    try {
        console.log('[fileSrcpath]', fileSrcpath)
        let tStamp = new Date().getTime();
        let tempFile = `temp_con${tStamp}.${format}`;

        new ffmpeg(fileSrcpath, async function (err, video) {
            if (video) {
                let tempath = path.join(__dirname, '../', 'temp');
                let mediaTempPath = path.join(tempath, tempFile);
                console.log('tmp', mediaTempPath)
                createFolderIfNotExist(tempath);
                video.addCommand('-f', format)
                if (format === 'wav') {
                    video.addCommand('-acodec', 'copy');
                    // video.addCommand('-ac', '1')
                }
                else {
                    // video.addCommand('-movflags', 'faststart')
                    // video.addCommand('-preset', 'veryfast')
                    // video.addCommand('-r', '24')
                    video.addCommand('-vcodec', 'copy')
                    // video.setVideoFrameRate(24)
                    // video.setAudioFrequency(44100)
                    // video.setAudioBitRate(128)
                    // video.addCommand('-b', '128k')
                }
                try {
                    let convFilePath = await saveConvertedFile(video, mediaTempPath);
                } catch (error) {
                    console.log('convFilePath', error)
                }


                // video.save(mediaTempPath, function (error, file) {
                //     cb(file, error);
                // });
            } else {
                console.log('error in ffmpeg', err)
                cb(null, err);
            }
        });
    } catch (err) {
        console.log('error in converter', err)
        cb(null, err);
    }
}


function saveConvertedFile(video, path) {
    return new Promise((res, rej) => {

        video.save(path, function (error, file) {
            if (error) {
                //console.log('saveConvertedFile', error)
                rej(error)
            }
            else {
                res(file)
            }
        });


    })
}



function createFolderIfNotExist(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function testKMS() {
    //kms.createKey();
    //kms.encrypt('Welcome@321');
    //kms.listAliase();
    //kms.listKeys();
    //kms.listGrant();
    //kms.describeKey();
    // let c = 'AQICA/WpNvMunxo1ZVv3R7RAAAAgzCBgAYJKoZIhvcNAQcGoHMwcQIBADBG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDCLJLJECVQIBEIA/WtRpcWQoHzWYSLAnUsw6VquAiEcRjPOFSbium0U4YbpLhywZwFw6FikUiccfapMbreSisLtpaX';
    // let cp = Buffer.from(c,'base64');
    // kms.decrypt(cp);
}

function testBatch() {
    //batch.submitJob('testJob', fileNameC, format, webhook, mimeType[format])
    //batch.describeJob(['<id>']);
}

function testSecretManager() {
    console.log(sm.confKeyName);
    //sm.createSeckey(sm.confKeyName,JSON.stringify(sm.config))
    //sm.putValueSeckey(sm.confKeyName,sm.config)
    //sm.listSeckey();
    sm.getSecrets(sm.confKeyName);
}

function testS3() {
    //let key = '<s3 key name>';
    let key = '';
    //initS3MulUploadingDynamodb();
    //checkAndInitUploading()
    //s3.listMultipart()
    //s3Action(s3Switch.get, key);
    //s3.listObjects();
    //s3.getPutSignedUrl(key);
    //s3.signedUrl(key);
    //s3.listBucket();
    //s3.headObject(key);
    //s3.listObjects()
    //s3.putcors();
    //s3.renameObject(key,'<new name>')
    //s3.listMultipart('<prefix>');
    //testS3CreateStream(key);
    //checkMultipartsS3AndComplete();
}


function testFetchAndUploadInPartLocally() {
    readFileStreamByte()
    function readFileStreamByte() {
        let filePath = path.join(tmpDir, '<filename>')
        let readStream = fs.createReadStream(filePath, {
            highWaterMark: (500000 * 1024)
        })

        readStream.on('data', async (chunk) => {
            readStream.pause();
            let chunkPath = await saveChunk(chunk);
            let convPath = await convertPart(chunkPath);
            readStream.resume();

        }).on('end', function () {
            console.log("done");
            //let resp = await completePart(FILE_NAME, multipartMap, uploadId);
            // c//onsole.log(resp);
        });

    }

    async function saveChunk(chunk) {
        let filePath = path.join(tmpDir, `chunk-${(new Date().getTime())}.mkv`)
        fs.writeFileSync(filePath, chunk);
        return filePath;
    }

    async function convertPart(chunkPath) {
        return new Promise((res, rej) => {
            let outpath = path.join(tmpDir, `conv-${(new Date().getTime())}.mp4`)
            try {
                var process = new ffmpeg(chunkPath);
                process.then(function (video) {
                    video.addCommand('-vcodec', 'copy');
                    video.save(outpath, function (error, file) {
                        if (error)
                            console.log('Video file: ' + error);
                        else
                            res(file);
                    });

                }, function (err) {
                    console.log('Error: ' + err);
                });
            } catch (e) {
                console.log(e.code);
                console.log(e.msg);
            }
        })
    }
    // async function savePart() { 
    //     return new Promise((res,rej)=>{
    //         let savePath = path.join(tmpDir, `conv-${(new Date().getTime())}`)
    //         fs.appendFile(savePath,)
    //     })
    // }


}

function testFetchAndUploadInPartsS3() {
    //get parts from s3 using read byte property
    // convert part ffmpeg 
    // upload back to s3 using multipart
}


function concateVideoTest() {
    let f1 = path.join(tmpDir, 'conv-1607167872323.mp4')
    let f2 = path.join(tmpDir, 'conv-1607167892449.mp4')
    let f3 = path.join(tmpDir, 'conv-1607167900220.mp4')
    let f4 = path.join(tmpDir, 'conv-1607167901803.mp4')
    let output = path.join(tmpDir, 'concate-new.mp4')
    var process = new ffmpeg(f1);
    process.then(function (video) {
        video.addInput(f2)
        video.addInput(f3)
        video.addInput(f4)
        video.addCommand('-vcodec', 'copy');
        video.save(output, function (error, file) {
            if (error)
                console.log('Video file: ' + error);
            else
                console.log('Video file: ' + file);
        });

    }, function (err) {
        console.log('Error: ' + err);
    });
}

async function concateVideo() {


    await concat({
        output: path.join(tmpDir, 'concate-new1.mp4'),
        videos: [
            path.join(tmpDir, 'conv-1607167872323.mp4'),
            path.join(tmpDir, 'conv-1607167892449.mp4'),
            path.join(tmpDir, 'conv-1607167900220.mp4'),
            path.join(tmpDir, 'conv-1607167901803.mp4')
        ],
        // transition: {
        //   name: 'directionalWipe',
        //   duration: 500
        // }
    })


}


function testS3CreateStream(key) {
    let filePath = path.join(tmpDir, key);
    let writeStream = fs.createWriteStream(filePath);
    //console.log('stream', writeStream)
    s3.createStream(key, writeStream)
    writeStream.on('error', function (err) {
        console.log(err);
    });
    writeStream.on('close', function (err) {
        console.log('close');
    });
}


function testFfmpegWithS3Url() {
    let filename = '<filename>'
    let dir = path.join(__dirname, '../', 'temp');

    function getPreSingedUrl() {
        return s3.signedUrl(filename);
        //let filePath = path.join(dir, filename);
        //return filePath;
    }
    function getPutPresignedUrl() {
        //let e = filename.split('.').pop()
        let putfileName = `temp-${new Date().getTime()}.mp4`;//fileName.replace(e, 'mp4')
        return s3.getPutSignedUrl(putfileName);
        // let filePath = path.join(dir, `temp-${new Date().getTime()}.mp4`);
        // return filePath
    }

    let inputUrl = getPreSingedUrl();
    let outputUrl = getPutPresignedUrl();

    convert(inputUrl, outputUrl);

    function convert(inputUrl, outputUrl) {
        console.log(inputUrl, outputUrl)
        try {
            var process = new ffmpeg(inputUrl);
            process.then(function (video) {
                video.addCommand('-vcodec', 'copy');
                //.setVideoSize('640x?', true, true, '#fff')
                //.setAudioCodec('libfaac')
                //.setAudioChannels(2)
                ///console.log('video', video)
                video.save(outputUrl, function (error, file) {
                    if (!error)
                        console.log('Video file: ' + file);
                });

            }, function (err) {
                console.log('Error: ' + err);
            });
        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
        }
    }
}

function testSes() {
    //ses.sendEmail();
}
function testIAM() {
    //iam.listRoles();
    //iam.createRole();
}
function testSTS() {
    //sts.assumeRole();
}
function testDynamoDb() {
    //dynamodbAction(dynamoSwitch.scan);
}
function testLambda() {
    //lambdaAction(lmdaSwitch.invoke);
}
function dolby() {
    //dolbyToken()
}
function fileSystem() {
    //fsStat('s3-test.webm');
}
var highWaterMarkSize = (500000 * 1024);

var writeStream

function startReadStreamINChunksTest() {
    // writeStream = fs.createWriteStream(filePath);
    // let a = fs.createWriteStream(filePath);
    // a
    // //console.log('stream', writeStream)
    // s3.createStream(key, writeStream)
    // writeStream.on('error', function (err) {
    //     console.log(err);
    // });
    // writeStream.on('close', function (err) {
    //     console.log('close');
    // });
    readStreamChunksSync(0, highWaterMarkSize);
}

async function testReadStream() {
    let fpath = path.join(tmpDir, 'test3g.mp4');
    await readFileChunksAndUpload(fpath)
    console.log('____exit____')
}

async function readFileChunksAndUpload(convertedFilePath) {
    console.log(convertedFilePath)
    return new Promise(async (resolve, reject) => {
        //uploadId = await createMultipart(key, contentType);
        let stream = fs.createReadStream(convertedFilePath, { highWaterMark: (500000 * 1024) });
        stream.on('data', async (chunk) => {
            console.log('______stream_pause______');
            stream.pause();
            console.log('chunk_size', chunk.length);
            partNumber++;
            console.log('stream_partNumber', partNumber);
            let partRes = await uploadPartstest('uploading')
            console.log('uploaded', partRes);
            stream.resume();
            console.log('______stream_resume______');
        }).on('end', async function () {
            await uploadPartstest('completing');
            console.log('completed__stream_end');
            resolve(true);
        }).on('close', async function () {
            console.log('stream_close');
        }).on('error', function (err) {
            console.log('error_read_stream', err);
            reject(error);
        });
    })

}

async function readStreamChunksSync(start, end) {
    // console.log('highWaterMarkSize', highWaterMarkSize)
    let chunk = await getStreamChunk(start, end);
    console.log('return data', chunk.length)
    partNumber++;
    if (chunk && chunk.length > 0) {
        let partRes = await uploadPartstest('uploading')
        appendStream(chunk)
        console.log(`partnumber: ${partNumber}_uploaded_${partRes}`);
        start = end + 1;
        end = end + highWaterMarkSize;
        await readStreamChunksSync(start, end)
    }
    else if (chunk && chunk.length === 0) {
        console.log('finalPart')
        await uploadPartstest('completing');
        console.log('completed_exit');
    }
}

async function appendStream(buffer) {
    let fpath = path.join(tmpDir, 'test3g1.mp4');
    console.log('buffer_append', buffer.length)
    fs.appendFileSync(fpath, buffer);

    // fs.appendFile(fpath, buffer, (err) => {
    //    if(err){
    //     console.log('err_append', err);
    //    }
    // })


}

async function getStreamChunk(start, end) {
    //console.log(start, end)
    return new Promise((res, rej) => {
        let fpath = path.join(tmpDir, 'test3g.mp4');
        let stream = fs.createReadStream(fpath, { start: start, end: end, highWaterMark: highWaterMarkSize });
        let chunks = [];
        stream.on('data', async (chunk) => {
            //console.log('Stream_data', chunk.length)
            chunks.push(chunk);
            //res(chunk)
        }).on('end', function () {
            let buffer = Buffer.concat(chunks);
            res(buffer)
        }).on('error', function (err) {
            console.log('err_stream', err)
            rej(err)
        });
    })

}

async function uploadPartstest(a) {
    console.log('....', a)
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(true);
        }, 3000);
    })

}

//#endregion

try {
    //startApp();
    convertFile('mp4');
    //testFfmpegWithS3Url();
    //testS3()
    //testFetchAndUploadInPartLocally()
    //concateVideoTest();
    //concateVideo();
    //testReadStream();
    //startReadStreamINChunksTest()
    //testSecretManager()

} catch (error) {
    console.log("main_errror", error);
}



module.exports = main
