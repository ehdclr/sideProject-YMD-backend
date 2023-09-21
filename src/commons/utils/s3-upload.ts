import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { extname } from 'path';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadS3 = async (
  file: Express.Multer.File,
  folderName: string,
): Promise<ManagedUpload.SendData> => {
  const { originalname, buffer } = file;

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(originalname);
  const newFilename = `${originalname}-${uniqueSuffix}- ${ext}`;

  return s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folderName}/${newFilename}`,
      Body: buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    })
    .promise();
};
