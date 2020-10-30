// dependencies
const AWS = require('aws-sdk');
const sharp = require('sharp');

// get reference to S3 client
const s3 = new AWS.S3();

const thumbnail_width = 80;

exports.handler = async (event, context, callback) => {
    const BUCKET = event.Records[0].s3.bucket.name;

    /* Get the image data we will use from the first record in the event object */
    const KEY = event.Records[0].s3.object.key;
    const PARTS = KEY.split('/');
    
    /* Check to see if the base folder is already set to thumbnails, if it is we return so we do not have a recursive call. */
    const BASE_FOLDER = PARTS[0];
    if (BASE_FOLDER === 'thumbnails') return;
    
    /* Stores the main file name in a variable */
    let FILE = PARTS[PARTS.length - 1]
    
    s3.getObject({ Bucket: BUCKET, Key: KEY }).promise()
        .then(image => {
            // Use the Sharp module to resize the image and save in a buffer.
            sharp(image.Body).resize(thumbnail_width).toBuffer().promise()
            .then((buffer) => {
                s3.putObject({ Bucket: BUCKET, Body: buffer, Key: `thumbnails/thumbnail-${FILE}` }).promise()
                .then(() => { callback(null) })
                .catch(err => { callback(err) })
            })
            .catch(err => { 
                console.log('error in step 2 of resizing image: ', err)
                callback(err) 
            })
        })
        .catch(err => {
        console.log('error resizing image: ', err)
        callback(err)
        })
};