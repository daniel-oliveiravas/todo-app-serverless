import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

import * as AWS from 'aws-sdk'

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}

export function getS3Client() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local S3 instance')
    return new AWS.S3({
      s3ForcePathStyle: true,
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    });
  }

  return new AWS.S3({
    signatureVersion: 'v4'
  });
}