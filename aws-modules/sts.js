var awsServices = require('../modules/base.aws')
var sts = awsServices.sts();

function assumeRole() {
  var params = {
    RoleArn: '<Role>',
    RoleSessionName: '<Role Session Name>',
  };
  sts.assumeRole(params, function (err, data) {
    if (err) console.log(err, err.stack); 
    else console.log(data);  
  });
}

module.exports = function () {
  return {
    assumeRole
  }
}