var ss = require('socket.io-stream');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000/user');


/**
 * Create read stream form blob/file and show percentage of upload
 * @param {*} blob 
 */
function creatReadStream(blob){
    var blobStream = ss.createBlobReadStream(blob);
    var size = 0;
    blobStream.on('data', function (chunk) {
        size += chunk.length;
        var per = Math.floor(size / blob.size * 100) + '%';
        console.log(per);
    });
    blobStream.on('close',()=>{
        console.log('close');
    })
    return blobStream;
}

/**
 * function send the blob stream to server using web socket and socket stream.
 * @param {*} data 
 */
function stream(blobParts,type,eventName,fileName) {
    var blob = new Blob([blobParts], { 'type': type });
    console.log('blob', blob);
    let blobStream = creatReadStream(blob);
    let stream = createBlobStream();
    blobStream.pipe(stream);
    sendStream(stream,eventName,fileName);
}

/**
 * Create ss stream
 */
function createBlobStream() {
    return ss.createStream();
}

/**
 * send stream to server
 * @param {*} stream 
 */
function sendStream(stream,eventName, filename) {
    ss(socket).emit(eventName, stream, { name: filename });
}



module.exports = function(){
    return {
        creatReadStream:creatReadStream,
        createBlobStream:createBlobStream,
        stream:stream
    }
}