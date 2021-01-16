// var fsService = require('../services/fs.service')();
// var s3Service = require('../modules/s3')();
// var dynomoService = require('../modules/dynamodb')();
// async function get(req, res) {
//     let html = await fsService.readFile('index.html');
//     return res.send(html);
// }

// async function getById(params, req, res) {
//     return res.send(params);
// }

// async function post(req, res) {

// }

// async function uploadFile(req, res) {
//     let prom = new Promise(async (resolve, rej) => {
//         try {
//             let result = false;
//             let file = req.file;
//             if (file) {
//                 const { originalname, mimetype, buffer } = file;
//                 result = await fsService.writeFile("conf/" + originalname, buffer);
//                 s3Service.upload(buffer, originalname, (err, data) => {
//                     if (err) throw err;
//                     console.log(data);
//                     result = true;
//                     resolve(result);
//                 }, mimetype)
//             }

//         } catch (error) {
//             console.log("uploadFile_error", error);
//             rej(error);
//         }
//     });
//     let result = await prom;
//     res.send({ result });
// }

// async function getStreamS3(req, res) {
//     try {
//         let key = req.query.id;
//         console.log(key);
//         if (key)
//             s3Service.streamObject(key, res);
//         else
//             throw new Error('key query is required')



//         // let stream = fsService.createReadStream('conf/'+key);
//         //  stream.pipe(res);
//         //let stream = fsService.bufferToStream(result.Body);
//         //stream.pipe(res);
//         //return res.type(result.ContentType).send(result.Body);
//         //return stream.pipe(res);



//     } catch (error) {
//         console.log('stream ', error);
//         return res.send({ status: false });
//     }
// }

// async function getFileS3(req, res) {
//     try {
//         let key = req.query.id;
//         if (key) {
//             var obj = await s3Service.getObject(key, res);
//             //obj.ContentType
//             return res.type('video/mp4').send(obj.Body);
//         }
//         else
//             throw new Error('key query is required')
//     } catch (error) {
//         console.log('getFileS3 ', error);
//         return res.send({ status: false });
//     }
// }

// async function getDynamoFile(req, res) {
//     try {
//         let key = req.query.id;
//         if (key) {
//             //var obj = await s3Service.getObject(key, res);
//             //obj.ContentType
//             let data = await dynomoService.filter(key);
//             return res.type('video/mp4').send(data);
//         }
//         else
//             throw new Error('key query is required')
//     } catch (error) {
//         console.log('getFileS3 ', error);
//         return res.send({ status: false });
//     }
// }

// async function getDynamoAllRec(req, res) {
//     try {
//         let data = await dynomoService.getAll();
//         return res.send(data);
//     } catch (error) {
//         console.log('getFileS3 ', error);
//         return res.send({ status: false, error });
//     }
// }




// async function listObjects(req, res) {
//     let list = await s3Service.listObjects();
//     return res.send(list);
// }

// async function deleteObjects(req, res) {
//     try {
//         let result = await s3Service.deleteObjects();
//         return res.send(result);
//     } catch (error) {
//         return res.send({ status: false });
//     }
// }

// module.exports = function () {
//     return {
//         get: get,
//         getById: getById,
//         post: post,
//         uploadFile: uploadFile,
//         getStreamS3: getStreamS3,
//         listObjects: listObjects,
//         getFileS3: getFileS3,
//         deleteObjects: deleteObjects,
//         getDynamoFile: getDynamoFile,
//         getDynamoAllRec
//     }
// }