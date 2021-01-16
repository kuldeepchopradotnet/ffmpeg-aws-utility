var awsServices = require('./base.aws')
var ses = awsServices.ses();

function sendEmail() {
  var params = {
    Destination: { /* required */
      // BccAddresses: [
      //   'STRING_VALUE',
      //   /* more items */
      // ],
      // CcAddresses: [
      //   'STRING_VALUE',
      //   /* more items */
      // ],
      ToAddresses: [
        'example@gmail.com',
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Data: 'testing mail body', /* required */
          //  Charset: 'STRING_VALUE'
        },
        // Text: {
        //   Data: 'STRING_VALUE', /* required */
        //   Charset: 'STRING_VALUE'
        // }
      },
      Subject: { /* required */
        Data: 'tesing mail', /* required */
        // Charset: 'STRING_VALUE'
      }
    },
    Source: '<mail address>', /* required */
    //ConfigurationSetName: 'STRING_VALUE',
    // ReplyToAddresses: [
    //   'STRING_VALUE',
    //   /* more items */
    // ],
    //ReturnPath: 'STRING_VALUE',
    // ReturnPathArn: 'STRING_VALUE',
    // SourceArn: 'STRING_VALUE',
    // Tags: [
    //   {
    //     Name: 'STRING_VALUE', /* required */
    //     Value: 'STRING_VALUE' /* required */
    //   },
    /* more items */
    // ]
  };
  console.log(params);
  ses.sendEmail(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
  });
}



module.exports = function () {
  return {
    sendEmail
  }
}