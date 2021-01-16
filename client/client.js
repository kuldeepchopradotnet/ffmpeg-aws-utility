const utils = require('../utils/utils');
var wrtc = require('./webrtc')();
var s3Service = require('../modules/s3')();
// var firehoseService = require('../modules/firehose')();
const dynamodbService = require('../modules/dynamodb')();
const lamdaService = require('../modules/lambda')();


var intervalId;
var recState;
const FILE_NAME = '<file name>';
var type = 'video/webm'
var uploadId;
var multipartMap = {
    Parts: []
};
var partNumber = 0;
async function openUserMedia() {
    var c1 = {
        video: {
            width:
            {
                min: 1280,
                max: 1920
            }
            ,
            height:
            {
                min: 720,
                max: 1080
            }
            ,
            aspectRatio: 1.7777777778,
        },
        audio: true,
    }

    let stream = await wrtc.getUserMedia(c1);
    document.querySelector('#videoId').srcObject = stream;
}

function startRec() {
    recState = 'on'
    wrtc.startRec();
    readerBlobLs();
    /**
     * step 1. multipart upload
     * createMultipart(fileName, type);
     */

}

function stopRec() {
    recState = 'off'
    wrtc.stopRec();
}

function readerBlobLsOLD() {
    intervalId = setInterval(() => {
        var blobRecArr = wrtc.getRecBlob();
        let blobPending = blobRecArr.filter(x => x.state === 'process' || x.state === 'failed' || x.state === 'pending')
        if (recState === 'off' && blobPending.length === 0) {
            console.log(recState);
            clearInterval(intervalId);
            var payload = {
                fileName: FILE_NAME
            }
            lamdaService.invokeFunction(payload);
            alert("recording uploaded.")
            /**
             *   uncomment code to directly upload s3 using multipart step3.
             *   completePart(fileName, multipartMap, uploadId);
             */
        }

        /**
         * uncomment to stream blob/chunk to firehose
         * streaDataFirehose(blobRecArr);
         */

        /**
         * upload data blob/chunk to dynamodb
         */
        uploadFileDynamo(blobRecArr);

    }, 2000);
    console.log("intervalId", intervalId)
}

//#region UPLOAD Service
/**
 * concept of localstorage
 * @param {*} blobRecArr 
 */
// async function uploadDataFirehoseDepricated(blobRecArr) {
//     blobRecArr.forEach(async e => {
//         if (e.state === 'failed' || e.state === 'pending') {
//             //upload file
//             console.log(e);
//             //let fileUrl = utils.localStorage.get(e.fileName);
//             //let file = utils.file.dataURLtoFile(fileUrl, e.fileName);
//             var blob = utils.file.getBlob([e.data], type);
//             //var file = utils.file.blobTofile([blob],fileName,type)
//             var buffer = await blob.arrayBuffer();
//             //var buffer = await utils.file.blobAsBuffer(blob)
//             //console.log("file", file);
//             e.state = 'process';
//             firehoseService.putRecord(buffer, (err, data) => {
//                 debugger;
//                 if (err) {
//                     console.log(err);
//                     e.state = 'failed';
//                 }
//                 else {
//                     e.state = 'uploaded';
//                     e.data = null;
//                     console.log(data);
//                     console.log("data sent");
//                 }
//             })

//             //uploadParts(file, fileName, e.id, uploadId, e);



//             // s3Service.upload(file, e.fileName,(err,data)=>{
//             //     if(err) console.log(err)
//             //     else
//             //         console.log('s3Service.upload',data);
//             // },'video/mp4')
//         }
//     });
// }

/**
 * upload to db
 * @param {*} blobRecArr 
 */
async function uploadFileDynamo(blobRecArr) {
    blobRecArr.forEach(async e => {
        if (e.state === 'failed' || e.state === 'pending') {
            var blob = utils.file.getBlob([e.data], type);
            var buffer = await blob.arrayBuffer();
            e.state = 'process';
            let partNumber = e.id//.toString();
            dynamodbService.putItem(partNumber, FILE_NAME, buffer, (err, data) => {
                if (err) {
                    e.state = 'failed'
                }
                else {
                    console.log(data);
                    e.state = 'uploaded'
                }
            })
        }
    });
}


/**
 * upload using part upload to s3
 * @param {*} blobRecArr 
 */
async function uploadPartsS3(blobRecArr) {
    blobRecArr.forEach(async e => {
        if (e.state === 'failed' || e.state === 'pending') {
            var blob = utils.file.getBlob([e.data], type);
            var buffer = await blob.arrayBuffer();
            e.state = 'process';
            uploadParts(file, FILE_NAME, e.id, uploadId, e);
        }
    });
}



/**
 * s3 multipart upload
 * @param {*} name 
 * @param {*} type 
 */
function createMultipart(name, type) {
    return new Promise((res, rej) => {
        s3Service.createMultipartUpload(name, type, (err, data) => {
            if (err) {
                console.log("createMultipart", err)
                rej(err);
            }
            else {
                console.log("createMultipart", data);
                uploadId = data.UploadId;
                res(true);
            }
        })
    })
}

function uploadParts(buffer, FILE_NAME, partNumber, uploadId, el) {
    console.log("uploadParts...")
    s3Service.uploadPart(buffer, FILE_NAME, partNumber, uploadId, (err, data) => {
        if (err) {
            console.log("uploadParts", err);
            el.state = 'failed'
        }
        else {
            console.log("uploadParts", data);
            console.log("el", el);
            el.state = 'uploaded'
            multipartMap.Parts[el.id] = {
                ETag: data.ETag,
                PartNumber: el.id
            };
        }
    })
}

function completePart(key, multipartMap, uploadId) {
    return new Promise((res, rej) => {
        s3Service.completeMultipartUpload(key, multipartMap, uploadId, (err, data) => {
            if (err) {
                console.log("completePart", err);
                rej(err);
            }
            else {
                console.log("completePart", data);
                res(true);
            }
        })
    })
}

/**
 * stream to firehose
 */
// var uploadChunkId = 1;
// async function streaDataFirehose(blobRecArr) {
//     let filterBlob = blobRecArr.filter(e => e.id === uploadChunkId);
//     console.log("uploadChunkId", uploadChunkId);
//     if (filterBlob && filterBlob.length > 0) {
//         let firstBlob = filterBlob[0];
//         if (firstBlob.state === 'pending' || firstBlob.state === 'failed') {
//             firstBlob.state = 'process';
//             var blob = utils.file.getBlob([firstBlob.data], type);
//             console.log('firstBlob.state', firstBlob.state);
//             var arrBuffer = await blob.arrayBuffer();
//             firehoseService.putRecord(arrBuffer, (err, data) => {
//                 if (err) {
//                     console.log(err);
//                     firstBlob.state = 'failed';
//                 }
//                 else {
//                     firstBlob.state = 'uploaded';
//                     firstBlob.data = null;
//                     uploadChunkId++;
//                     console.log(data);
//                     console.log("data sent");
//                 }
//             })
//         }
//     }
// }
//#endregion

var tempBlob = null;
var blobArr = [];
const CHUCK_SIZE = 5242999;
//let blob = new Blob([]);
let nextBlob = true;
var finalUpload = false;

function readerBlobLs() {
    var id = setInterval(() => {
        //console.log('reading')
        var blobRecArr = wrtc.getRecBlob();
        if (blobRecArr && blobRecArr.length > 0 && nextBlob) {
            nextBlob = false;
            processBlob(blobRecArr[0].data);
        }
        else if (recState === 'off' && blobRecArr.length === 0) {
           // debugger;
            clearInterval(id);
            if (tempBlob) {
                pushBlobArr(tempBlob);
                //blobArr.push(tempBlob);
            }
            // console.log('[blobArr]', blobArr);
            // let dwnBlob = new Blob(blobArr, { type: type })

            // let url = URL.createObjectURL(dwnBlob);
            // window.open(url);
            finalUpload = true;

        }
    }, 1000);
}

function processBlob(blob) {
    // debugger;
    //console.log('[processBlob]')
    if (tempBlob) {
        console.log('[Temp YES]')
        var reqSize = CHUCK_SIZE - tempBlob.size;
        if (blob.size < reqSize) {
            console.log('[BLOB < ReqSize]')
            tempBlob = new Blob([tempBlob, blob], { type: type });
        }
        else {
            console.log('[BLOB > ReqSize]')
            let fBlob = blob.slice(0, reqSize)
            blob = blob.slice(reqSize);
            tempBlob = new Blob([tempBlob, fBlob], { type: type }); //tempBlob + fBlob;
            //blobArr.push(tempBlob);
            pushBlobArr(tempBlob);
            tempBlob = null;
            if (blob.size < CHUCK_SIZE) {
                console.log('[BLOB < 5]')
                tempBlob = blob;
            }
            else {
                console.log('[BLOB > 5]')
                sliceBlob(blob)
            }
        }
    }
    else {
        console.log('[Temp NO]')
        if (blob.size < CHUCK_SIZE) {
            console.log('[BLOB < 5]')
            tempBlob = blob;
        }
        else {
            console.log('[BLOB > 5]')
            sliceBlob(blob)
        }
    }
    removeUploadBlob();

}

function removeUploadBlob() {
    let res = wrtc.removeFirstEleBlob();
    if (res) {
        nextBlob = true;
    }
}

function sliceBlob(blob) {
    var start = 0, end = 0, bSize = 0, sSize = 0;
    bSize = blob.size;
    sSize = CHUCK_SIZE;
    end = sSize
    var len = Math.ceil((blob.size / sSize))
    for (let i = 0; i < len; i++) {
        var newBlob = blob.slice(start, end, this.mimeType);
        if (newBlob.size === sSize) {
            //blobArr.push(newBlob);
            pushBlobArr(newBlob);
            start = end;
            end = end + sSize
        }
        else {
            tempBlob = newBlob;
        }
    }
}
var uploadActive = false;
var nextUploadBlob = true;

async function pushBlobArr(blob) {
    if (!uploadActive) {
        uploadActive = true;
        await createMultipart(FILE_NAME, type);
        uploadBlob();
    }


    blobArr.push(blob);
}


async function uploadBlob() {

    let id = setInterval(async () => {

        if (uploadActive && nextUploadBlob) {
            if (blobArr && blobArr.length > 0) {
                nextUploadBlob = false;
                let blob = blobArr[0];
                //debugger;
                //let buffer = await blob.arrayBuffer();
                partNumber++;
                console.log('start upload part',partNumber);
                console.log('size',blob.size)
                await uploadBlobParts(blob, FILE_NAME, partNumber, uploadId);
                blobArr.shift();
                nextUploadBlob = true;
            }
            else if (finalUpload && blobArr.length === 0) {
                clearInterval(id);
                console.log('start complete part')
                await completePart(FILE_NAME, multipartMap, uploadId)
            }
        }

    }, 1000);
}


async function uploadBlobParts(buffer, filename, partNumber, uploadId) {
    return new Promise((res, rej) => {
        s3Service.uploadPart(buffer, filename, partNumber, uploadId, (err, data) => {
            if (err) {
                console.log("uploadParts", err);
                 uploadBlobParts(buffer, filename, partNumber, uploadId)
                //res(true);
            }
            else {
                console.log("uploadParts", data);
                multipartMap.Parts[partNumber] = {
                    ETag: data.ETag,
                    PartNumber: partNumber
                };
                res(true);
            }
        })
    });
}




function init() {
    return {
        openUserMedia: openUserMedia,
        startRec: startRec,
        stopRec: stopRec
    }
}

module.exports = init()