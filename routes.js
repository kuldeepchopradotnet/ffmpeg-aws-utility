
// var homeController = require('./controllers/home.controller')();



// module.exports = function (app, upload) {

//     app.get('/', (req, res) => {
//         return homeController.get(req, res);
//     });

//     app.post('/upload', upload.single('file'), (req, res) => {
//         return homeController.uploadFile(req, res);
//     });

//     app.get('/get-file-s3', (req, res) => {
//         return homeController.getFileS3(req, res);
//     });

//     app.get('/get-stream-s3', (req, res) => {
//         return homeController.getStreamS3(req, res);
//     });

//     app.get('/list-objects', (req, res) => {
//         return homeController.listObjects(req, res);
//     });

//     app.get('/delete-objects', (req, res) => {
//         return homeController.deleteObjects(req, res);
//     });

//     app.get('/get-dynamo-s3', (req, res) => {
//         return homeController.getDynamoFile(req, res);
//     });

//     app.get('/get-dynamo-all', (req, res) => {
//         return homeController.getDynamoAllRec(req, res);
//     });
// }