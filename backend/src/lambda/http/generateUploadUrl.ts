import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getS3Client } from '../utils';

const ATTACHMENT_S3_BUCKET = process.env.ATTACHMENT_S3_BUCKET;
const SIGNED_URL_EXPIRATION = process.env.SIGNED_URL_EXPIRATION;

const S3 = getS3Client();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  const url = await S3.getSignedUrl('putObject', {
    Bucket: ATTACHMENT_S3_BUCKET,
    Key: todoId,
    Expires: SIGNED_URL_EXPIRATION
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      attachmentUrl: url
    })
  };
}
