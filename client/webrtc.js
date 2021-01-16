
var utils = require('../utils/utils')


let mediaRecorder;
let recordedBlobs;




async function getUserMedia(c) {
    let support = navigator.mediaDevices.getSupportedConstraints()
    console.log(support);
    const stream = await navigator.mediaDevices.getUserMedia(c);
    handleSuccess(stream);
    return stream;
}

function startRec() {
    recordedBlobs = [];
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not supported`);
            options = { mimeType: 'video/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.error(`${options.mimeType} is not supported`);
                options = { mimeType: '' };
            }
        }
    }

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
        return;
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        //console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    startRecording();
   // console.log('MediaRecorder started', mediaRecorder);
}

function stopRec() {
    stopRecording();
}

function startRecording() {
    mediaRecorder.start(4000);
}

function stopRecording() {
    mediaRecorder.stop();
}

function handleSuccess(stream) {
   // console.log('getUserMedia() got stream:', stream);
    window.stream = stream;
}


let fileCount = 0;
function handleDataAvailable(event) {
    fileCount++;
    if (event.data && event.data.size > 0) {
        //console.log("event.data.size", event.data.size);
        let fileName = 'testupload-' + fileCount + '.mp4'
        let blobUploader = {
            id: fileCount,
            //fileName: fileName,
            state: 'pending',
            isLast: false,
            data: event.data
        }
        // utils.localStorage.saveBlobLS(fileName, event.data);
        recordedBlobs.push(blobUploader);
    }
}

function getRecBlob() {
    return recordedBlobs
}

function removeFirstEleBlob() {
    let val = recordedBlobs.shift();
    return val ? true : false;
}


module.exports = function () {
    return {
        getUserMedia: getUserMedia,
        startRec: startRec,
        stopRec: stopRec,
        getRecBlob: getRecBlob,
        removeFirstEleBlob
    }
}