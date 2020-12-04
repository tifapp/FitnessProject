const Sharp = require('sharp');
const aws = require('aws-sdk');
const s3 = new aws.S3();

const WIDTH = 100;
const HEIGHT = 100;

exports.handler = (event, context, callback) => {
  const BUCKET = event.Records[0].s3.bucket.name;

  /* Get the image data we will use from the first record in the event object */
  const KEY = event.Records[0].s3.object.key.replace('%3A', ':')
  const PARTS = KEY.split('/')

  /* Check to see if the base folder is already set to thumbnails, if it is we return so we do not have a recursive call. */
  const BASE_FOLDER = PARTS[1];
  if (BASE_FOLDER === 'thumbnails') return

  /* Stores the main file name in a variable */
  let FILE = PARTS[PARTS.length - 1]

  console.log("attempting to get the image with this key: ", KEY, "in this bucket: ", BUCKET);

  s3.getObject({ Bucket: BUCKET, Key: KEY }).promise()
    .then(image => {
      // Use the Sharp module to resize the image and save in a buffer.
      Sharp(image.Body).resize(60).toBuffer()
        .then((buffer) => {
          s3.putObject({ Bucket: BUCKET, Body: buffer, Key: `public/thumbnails/${PARTS[1]}/thumbnail-${FILE}` }).promise()
            .then(() => { callback(null) })
            .catch(err => {
              console.log('error storing and resizing image: ', err)
              callback(err)
            })
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
}