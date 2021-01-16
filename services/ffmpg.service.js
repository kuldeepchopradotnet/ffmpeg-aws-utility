var fluent_ffmpeg = require("fluent-ffmpeg");


async function ffmpg() {
    'use strict';
    var cp = require('child_process');
    var proc = cp.spawn('ffmpeg', [
        '-hide_banner',
        '-f', 'rawvideo',
        '-pix_fmt', 'rgb24',
        '-s', '2x2',
        '-i', '-',
        '1.mp4'
    ]);
    let b1 = await getFileBuffer('test.mp4');
    console.log(b1);
    proc.stdin.write(b1[0]);
    proc.stdin.end();
    proc.stderr.pipe(process.stdout);
}


function createClips(cb) {
    readfileDir((err, files) => {
        try {
            if (err) throw err;
            else {
                sortDir(files);
                let clips = [];
                files.forEach(file => {
                    clips.push({
                        "fileName": path.join(__dirname, 'conf', file)
                    });
                });
                cb(clips);
            }
        } catch (error) {
            console.log('readDir_err', error);
        }
    });
}


async function mergeFilesAsync(files, folder, filename) {
    return new Promise((resolve, reject) => {

        var cmd = fluent_ffmpeg({ priority: 20 })
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
                resolve()
            })
            .on('end', function () {
                console.log(filename + ': Processing finished !');
                resolve()
            });

        for (var i = 0; i < files.length; i++) {
            cmd.input('conf/' + files[i]);
        }

        cmd.mergeToFile(folder + "/" + filename, folder);
    });
}



function concateVideo() {
    createClips((clips) => {
        try {
            console.log(clips);
            let videoConcat = videoStitch.concat;
            videoConcat({
                silent: true,
                overwrite: true
            }).clips(clips)
                .output('confs.mp4')
                .concat()
                .then((outputFileName) => {
                    console.log(outputFileName);
                    clips.forEach(file => {
                        deletefile(file.fileName);
                    })
                });
        } catch (error) {
            console.log("error_concate", error);
        }
    });
}
async function mergeFile(files) {
    var mergedVideo = fluent_ffmpeg();
    console.log(files);
    files.forEach(file => {
        mergedVideo.addInput('conf/' + file)
    })


    mergedVideo
        //.addInput('conf/filename-0.mp4')
        //.addInput('conf/filename-1.mp4')
        // .inputOptions(['-loglevel error','-hwaccel vdpau'])
        // .outputOptions('-c:v h264_nvenc')
        .on('error', function (err) {
            console.log('Error ' + err.message);
        })
        .on('end', function () {
            console.log('Finished!');
        })
        .concat('./mergedVideo8.mp4');
}

module.exports = function(){
    return {

    }
}