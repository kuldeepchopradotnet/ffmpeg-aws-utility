const { v4: uuidv4 } = require('uuid');

function set(key, value) {
    if (key, value) {
        if (typeof value === 'object') {
            value = strJson(value)
        }
        localStorage.setItem(key, value);
    }
}

function get(key) {
    if (key) {
        return localStorage.getItem(key);
    }
}

function remove(key) {
    if (key)
        localStorage.removeItem(key);
}

function parseJson(jsonStr) {
    return JSON.parse(jsonStr);
}

function strJson(obj) {
    return JSON.stringify(obj);
}

function getBlob(blobParts, type) {
    return new Blob(blobParts, { 'type': type });
}

function blobTofile(blob, filename, type) {
    return new File(blob, filename, {
        type: type
    });
}

function mimeType(extension) {
    const mimes = [{ ext: 'mp4', type: 'video/mp4' },
    { ext: 'txt', type: 'text/plain' },
    { ext: 'webm', type: 'video/webm' }
    ]
    if (extension) {
        let res = mimes.filter(m => m.ext === extension)
        return res.length > 0 ? res[0].type : null
    }
    return null;
}


async function fileReaderAsync(file) {
    return new Promise((res, rej) => {
        try {
            var fr = new FileReader();
            fr.onload = function (e) {
                res(e.target.result);
            }
            fr.readAsDataURL(file);
        } catch (error) {
            rej(error)
        }
    })
}


async function saveBlobLS(fileName, blobParts) {
    try {
        var blob = getBlob([blobParts], 'video/mp4');
        var result = await fileReaderAsync(blob);
        localStorage[fileName] = result;
    } catch (error) {
        console.log('saveBlobLS ', error);
        throw error;
    }
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

async function blobAsBuffer(blob) {
    return await blob.arrayBuffer();
}

function getuuid() {
    return uuidv4();
}

function awsConfig() {
    return {
        region: 'us-west-2',
        credentials: {
            accessKeyId: '<enter accessKeyId>',
            secretAccessKey: '<enter secretAccessKey>'
        }
    }
}


function getFileName(extension) {
    //let id =  uuidv4();
    //return extension ? id + extension : id;
    return 'TestFile1' + (extension ? "." + extension : '.txt')
}

function getTimeCount() {
    var startDateTime = new Date();
    var startStamp = startDateTime.getTime();
    var newDate = new Date();
    var newStamp = newDate.getTime();
    return (cb) => {
        var formatTimeCounter = (val) => {
            return val = val < 10 ? `0${val}` : val;
        }
        newDate = new Date();
        newStamp = newDate.getTime();
        var diff = Math.round((newStamp - startStamp) / 1000);
        var d = Math.floor(diff / (24 * 60 * 60));
        diff = diff - (d * 24 * 60 * 60);
        var h = Math.floor(diff / (60 * 60));
        diff = diff - (h * 60 * 60);
        var m = Math.floor(diff / (60));
        diff = diff - (m * 60);
        var s = diff;
        var tStr = `${formatTimeCounter(h)}:${formatTimeCounter(m)}:${formatTimeCounter(s)}`
        cb(tStr);
    }
}


function getTimeCouter() {
    var recordCount = getTimeCount();
    var id = setInterval(() => {
        recordCount((time) => {
            document.getElementById("timetest").value = time;
        });
    }, 1000)
    console.log(id);
}



function testCase12to24() {
    function format12to24(time) {
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "PM" && hours < 12) hours = hours + 12;
        if (AMPM == "AM" && hours == 12) hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        console.log(sHours + ":" + sMinutes);
    }

    console.time("Time");
    console.log("6:24 pm");
    format12to24("6:24 pm");


    console.log("6:24 am");
    format12to24("6:24 am");


    console.log("12:24 pm");
    format12to24("12:24 pm");


    console.log("12:24 am");
    format12to24("12:24 am");


    console.log("1:24 am");
    format12to24("1:24 am");



    console.log("1:24 pm");
    format12to24("1:24 pm");
    console.timeEnd("Time");
}


function testCalculate1hour() {
    function dateTimeC(date) {
        var hours = date.getHours();
        var hours = (hours + 24) % 24;
        var mid = 'AM';
        if (hours == 0) {
            hours = 12;
        }
        else if (hours >= 12) {
            hours = hours % 12;
            mid = 'PM';
        }
        console.log(hours + ':00' + mid);
        if (hours == 12 && mid == 'PM') {
            console.log('end time 01:00 AM');
        }
        else {
            console.log('end time', (hours + 1 + ':00 ' + mid));
        }
    }

    console.log('%c Case 1', 'color:red');
    var date = new Date('06/01/2020 11:00:00');
    dateTimeC2(date)

    console.log('%c Case 2', 'color:red');
    var date = new Date('06/01/2020 00:20:00');
    dateTimeC2(date)

    console.log('%c Case 3', 'color:red');
    var date = new Date('06/01/2020 23:20:00');
    dateTimeC2(date)

    function dateTimeC2(date) {
        var dt = date;
        dt.setMinutes(00, 00, 00);
        console.log('start time ', dt.toLocaleTimeString());
        dt.setTime(dt.getTime() + (1 * 60 * 60 * 1000))
        console.log('end time ', dt.toLocaleTimeString())
    }

}

function convertAUrlTobolbUrl() {
    var xhr = new XMLHttpRequest;
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var recoveredBlob = xhr.response;
        var reader = new FileReader;
        reader.onload = function () {
            var blobAsDataUrl = reader.result;
            console.log(blobAsDataUrl);
            var blob = new Blob([blobAsDataUrl], { type: 'image/png' });
            var blobUrl = URL.createObjectURL(blob);
            console.log(blobUrl);
            window.location = blobUrl;
        };
        reader.readAsArrayBuffer(recoveredBlob);
    };
    xhr.open('GET', 'https://lh3.googleusercontent.com/-rVHj7pHpw4w/Xx1PM3oMc_I/AAAAAAAAAQk/_NIfSxIUiZsBl1tVzW5tv__qcGc2nVGKQCLcBGAsYHQ/s1600/1595756336067022-0.png');
    xhr.send();
}

function extension(filename) {
    let ex = (filename && filename.split('.').pop());
    console.log(ex);
}



function format12to24(time) {
    var t = time;
    if (!t) { return null; }
    var arr = t.split(":");
    var h = parseInt(arr[0]);
    if (t.includes("pm")) {
        var nH = h != 12 ? h + 12 : h;
        var t = t.replace(h, nH);
    }
    else {
        var nH = h != 12 ? h : h - 12;
        var t = t.replace(h, nH);
    }
    t = t.split(" ")[0];
    console.log(t);
    return t;
}


function timeStamp() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var secconds = date.getSeconds()
    var seedatetime = month + '' + day + '' + year + '' + hour + '' + minutes + '' + secconds;
    console.log(seedatetime);
}






module.exports = function () {
    return {
        localStorage: {
            set: set,
            get: get,
            remove: remove,
            saveBlobLS: saveBlobLS
        },
        Json: {
            parseJson: parseJson,
            strJson: strJson
        },
        file: {
            blobTofile: blobTofile,
            getBlob: getBlob,
            mimeType: mimeType,
            fileReaderAsync: fileReaderAsync,
            dataURLtoFile: dataURLtoFile,
            blobAsBuffer: blobAsBuffer
        },
        uuid: getuuid,
        awsConfig: awsConfig,
        getFileName: getFileName
    }
}();