const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const express = require('express');
const router = express.Router();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
  region:process.env.region
});

const s3 = new AWS.S3();

// Configure multer middleware for file uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket:process.env.AWS_BUCKET_NAME,
    acl: 'public-read', // Set ACL for uploaded files
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Set key for uploaded files
    }
  })
});


module.exports = upload