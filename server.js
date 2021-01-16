const dotenv = require('dotenv');
dotenv.config();
const browserify = require('browserify-middleware');
var bodyParser = require('body-parser');
var routes = require('./routes');
var multer = require('multer');
var upload = multer();
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var ss = require('./socket/socket.events');
var factory = require('./factory/factory');

function socketio() {
    io.of('/user').on('connection', function (socket) {
        ss(socket);
    });
}

async function startApp() {
    socketio();
    app.use(`/index.js`, browserify('client/client.js', {
        standalone: '$myApp'
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    routes(app, upload);
    app.use(upload.array());
    http.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
}

try {
    factory();
} catch (error) {
    
}