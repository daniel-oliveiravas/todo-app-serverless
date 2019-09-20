import { getS3Client } from '../lambda/utils';

const S3 = getS3Client();

const ATTACHMENT_S3_BUCKET = process.env.ATTACHMENT_S3_BUCKET;
const SIGNED_URL_EXPIRATION = process.env.SIGNED_URL_EXPIRATION;

export function generateUploadURL(todoId: string) {
    return S3.getSignedUrl('putObject', {
        Bucket: ATTACHMENT_S3_BUCKET,
        Key: todoId,
        Expires: SIGNED_URL_EXPIRATION
      });
}