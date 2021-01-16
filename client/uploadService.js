async function uploadFile(file) {
    console.log("uploadFile.. .");
    var formData = new FormData();
    formData.append('file', file);
    var request = new XMLHttpRequest();
    request.open("POST", "http://localhost:3000/upload");
    request.send(formData);
    console.log("request.send.. .");
    request.onreadystatechange = function () {
        console.log("onreadystatechange", request);
        if (request.readyState === 4) {
            let response = JSON.parse(request.response)
            if (response.status) {
                console.log("response.status", response.status);
            }
            else {
                console.log("response.status", response.status);
            }
        }
    }
}



module.exports = uploadFile;