const Sharp = require('sharp');
const aws = require('aws-sdk');
const s3 = new aws.S3();

exports.handler = async (event, context, callback) => {
  const BUCKET = event.Records[0].s3.bucket.name;

  /* Get the image data we will use from the first record in the event object */
  const KEY = event.Records[0].s3.object.key.replace('%3A', ':')
  const PARTS = KEY.split('/')

  /* Check to see if the base folder is already set to thumbnails, if it is we return so we do not have a recursive call. */
  const BASE_FOLDER = PARTS[1];

  /* Stores the main file name in a variable */
  let FILE = PARTS[PARTS.length - 1]

  //console.log("attempting to get the image with this key: ", KEY, "in this bucket: ", BUCKET);

  const image = await s3.getObject({ Bucket: BUCKET, Key: KEY }).promise();

  try {
    const res = await s3.headObject({ Key: KEY, Bucket: BUCKET }).promise()
    if (res.ContentLength > 83700) {
      const buffer = Sharp(image.Body).resize(300).toBuffer()
      await s3.putObject({ Bucket: BUCKET, Body: buffer, Key: KEY }).promise()
    }
  } finally {
    const buffer = await Sharp(image.Body).resize(60).toBuffer();
    return await s3.putObject({ Bucket: BUCKET, Body: buffer, Key: `public/thumbnails/${PARTS[1]}/thumbnail-${FILE}` }).promise();
  }
}