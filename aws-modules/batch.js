var awsServices = require('./base.aws')
var batch = awsServices.batch();
const jobDef = '<job defination>'
const jobQueue = '<job queue>'

function computeEnv() { }
function createQueue() { }
function createJobDefination() { }
function createJob() { }
function submitJob(jobName, filename, format, webhook, mimeType) {

    batch.submitJob({
        jobName: jobName,
        jobQueue: jobQueue,
        jobDefinition: jobDef,
        timeout: {
            attemptDurationSeconds: 3600
        },
        parameters: {
            fileName: filename,
            webhook: webhook,
            format: format,
            MimeType: mimeType
        }
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(data)
        }
    })

}

function describeJob(jobsArr) {
    var params = {
        jobs: jobsArr
    };
    batch.describeJobs(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            let res = JSON.stringify(data, null, 4)
            console.log(res);           // successful response
        }

    })
}


module.exports = function () {
    return {
        submitJob,
        describeJob
    }
}