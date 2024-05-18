const AWS = require('aws-sdk');
const awsConfig = require('../_configs/aws.config');
const fs = require('fs');
let bucket = awsConfig.bucketDev
let secretAccessKey = awsConfig.secretAccessKey
let accessKeyId = awsConfig.accessKeyId

exports.uploadToS3 = (files) => {
    return new Promise((resolve, reject) => {
        let s3Bucket = new AWS.S3({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            bucket: bucket,
        });
        if (files.profilePhoto) {
            const filePath = files.profilePhoto.filepath
            const blob = fs.readFileSync(filePath)
            var params = {
                Bucket: bucket,
                Key: `profile_photos/${Date.now() + "_" + files.profilePhoto.name}`,
                Body: blob,
                ContentType: files.profilePhoto.type
            };
            s3Bucket.upload(params, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result.Location);
                }
            });
        }
    });
}