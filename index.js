const aws = require('aws-sdk');
const config = require('../config');

aws.config.update({
    secretAccessKey: config.AWS_SECRET_KEY,
    accessKeyId: config.AWS_ACCESS_KEY,
    region: config.AWS_REGION
});

const s3 = new aws.S3({apiVersion: config.AWS_API_VERSION});

/**
 * @description Get Bucket List
 * @param {Object} params 
 * @param {Callback} callback
 * @returns {Object} Array of S3 Buckets
 */
function getBucketList(params = {}, callback) {
    s3.listBuckets(params, (err, resp) => {
        if (err) {
            console.log(err, err.stack);
            return callback(err);
        } else {
            console.log("success ", resp);
            return callback(null, resp);
        }
    });
}

/**
 * @description create S3 Bucket
 * @param {Object} params
 * @param {Callback} callback
 * @returns {Object} example { Location: 'http://file-uploads.s3.amazonaws.com/' }
 */
function createBucket(params, callback) {
    s3.createBucket(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
            return callback(err);
        } else {
            console.log(data);
            return callback(null, data);
        }
    });
}

/**
 * @description upload file in s3
 * @param {OctetStream} FileData binaryStream
 * @param {String} FileName Name of the file
 * @param {String} BucketName Name of the bucket
 * @param {String} ContentType Content Type of the file
 * @param {Object} options such as Metadata
 * @param {Callback} callback
 * @returns {Object} document { ETag: '"747b5d4162a166865de8790b3545df4a"',Location: 'https://file-uploads.s3.ap-south-1.amazonaws.com/s3.png',key: 's3.png', Key: 's3.png', Bucket: 'asylogic-file-uploads' }
 */
function upload(FileData, FileName, BucketName, ContentType, options = {}, callback) {
    let params = {
        Bucket: BucketName,
        Key: FileName,
        ContentType: ContentType,
        Body: FileData
    };
    if (options.Metadata) {
        params.Metadata = options.Metadata;
    }
    s3.upload(params, (err, data) => {
        if (err) {
            return callback(err);
        }
        console.log(`File ${FileName}, uploaded successfully at ${BucketName}`);
        return callback(null, data);
    });
}

/**
 * @description get file using file name
 * @param {String} FileName
 * @param {String} BucketName
 * @param {Callback} callback
 * @returns {undefined}
 */
function getDocument(FileName, BucketName, callback) {
    let params = {
        Bucket: BucketName,
        Key: FileName
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
}

/**
 * @description Get Signed URL. A user who does not have AWS credentials or permission to access an S3 object can be granted temporary access by using a presigned URL.
 * @param {String} BucketName
 * @param {String} key path
 * @param {String} FileName file
 * @param {Number} Expiry 60sec
 * @returns {String} url Signed URL with expiry
 */
function getSignedUrl(BucketName, key, FileName, Expiry = 60) {
    var params = {
        Bucket: BucketName,
        Key: key,
        Expires: Expiry
    };
    if (FileName) {
        params.ResponseContentDisposition = `attachment;filename=${FileName}`;
    }
    return s3.getSignedUrl('getObject', params);
}

//getBucketList();

//createBucket({
//    Bucket:"asylogic-file-uploads"
//});

//var params = {
//  Bucket: 'STRING_VALUE', /* required */
//  ACL: "private" | "public-read" | "public-read-write" | "authenticated-read",
//  CreateBucketConfiguration: {
//    LocationConstraint: "af-south-1" | "ap-east-1" | "ap-northeast-1" | "ap-northeast-2" | "ap-northeast-3" | "ap-south-1" | "ap-southeast-1" | "ap-southeast-2" | "ca-central-1" | "cn-north-1" | "cn-northwest-1" | "EU" | "eu-central-1" | "eu-north-1" | "eu-south-1" | "eu-west-1" | "eu-west-2" | "eu-west-3" | "me-south-1" | "sa-east-1" | "us-east-2" | "us-gov-east-1" | "us-gov-west-1" | "us-west-1" | "us-west-2"
//  },
//  GrantFullControl: 'STRING_VALUE',
//  GrantRead: 'STRING_VALUE',
//  GrantReadACP: 'STRING_VALUE',
//  GrantWrite: 'STRING_VALUE',
//  GrantWriteACP: 'STRING_VALUE',
//  ObjectLockEnabledForBucket: true || false,
//  ObjectOwnership: "BucketOwnerPreferred" | "ObjectWriter" | "BucketOwnerEnforced"
//};
//createBucket(params);

//getDocument('s3.png','file-uploads',((err, res)=>{
//   if(err) console.log("err : ",err);
//   else console.log("res : ",res);
//}));

//getSignedUrl('file-uploads','s3.png');

module.exports = {
    getBucketList,
    createBucket,
    upload,
    getDocument,
    getSignedUrl
};
