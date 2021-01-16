var fs = require('fs');
const path = require('path');
const toStream = require('buffer-to-stream')


 function bufferToStream(buffer){
    const readable = toStream(buffer)
    return readable;
    // readable.on('readable', () => {
    //   let chunk
    //   while ((chunk = reader.read()) !== null) {
    //     console.log('got data', chunk)
    //   }
    // })
    // readable.on('end', () => console.log('done'))
}

async function readfile(filename) {
    return new Promise((res, rej) => {
        fs.readFile(filename, 'binary', function (err, data) {
            if (err) rej(err);
            res(data);
        });
    })
}

function createReadStream(filename) {
    let stream = fs.createReadStream(filename);
    return stream;
}

function writeFile(filename, data) {
    return new Promise((res, rej) => {
        fs.writeFile(filename, data, (err) => {
            if (err) rej(err);
            res(true);
        });
    })
}

function appendFile(filename, buffer) {
    fs.appendFile(filename, buffer, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

function createWriteStream(filename,option={}) {
    let res;
    if(option){
        res = fs.createWriteStream(filename,option);
    }
    res = fs.createWriteStream(filename);
    return res;
}


function deletefile(filename) {
    try {
        fs.unlink(filename, (err) => {
            if (err) {
                throw err;
            }
            console.log('unlink file');
        });
    } catch (error) {
        console.log("delete_file_error", error);
    }
}

function sortDir(files) {
    var customSort = function (a, b) {
        return (Number(a.match(/(\d+)/g)[0]) - Number((b.match(/(\d+)/g)[0])));
    }
    files.sort(customSort);
}

function readfileDir(cb) {
    let dir = path.join(__dirname, 'conf');
    fs.readdir(dir, (err, files) => {
        cb(err, files);
    })
}


function getFileBuffer(filename) {
    return new Promise((res, rej) => {
        let chunks = [];
        fs.createReadStream(filename).on('data', (c) => {
            chunks.push(c);
        }).on('close', () => {
            res(chunks);
        });
    })
}

async function concateBuff() {
    let ck1 = await getFileBuffer('conf/blob-0.txt');
    let ck2 = await getFileBuffer('conf/blob-1.txt');
    let ck3 = ck2.concat(ck1);
    let b1 = Buffer.concat(ck3);
    fs.writeFile('txt.mp4', b1, (err) => {
        if (err) console.log(err);
        console.log("result done");
    });
}


module.exports = function(){
    return {
        readFile: readfile,
        createReadStream: createReadStream,
        writeFile: writeFile,
        appendFile: appendFile,
        createWriteStream:createWriteStream,
        getFileBuffer: getFileBuffer,
        deletefile:deletefile,
        sortDir:sortDir,
        readfileDir:readfileDir,
        bufferToStream:bufferToStream
    }
}