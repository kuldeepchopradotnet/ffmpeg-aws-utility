var ss = require('socket.io-stream');
var fsService = require('../services/fs.service')();


module.exports = function(socket) {

    ss(socket).on('profile-image', function (stream, data) {
        var filename = path.basename(data.name);
        console.log(filename);
        stream.pipe(fsService.createWriteStream('conf/' + filename, { flags: 'a' }));
    });

}