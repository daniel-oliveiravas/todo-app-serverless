import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createDynamoDBClient } from '../utils'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

const docClient = createDynamoDBClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  await docClient.delete({
    TableName: TODOS_TABLE,
    Key: {
      'todoId': todoId
    },
    ConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    }
  }).promise();


  return {
    statusCode: 200,
    body: ''
  };
})

handler.use(
  cors({
    credentials: true
  })
);
