import 'source-map-support/register';
import * as uuid from 'uuid';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createDynamoDBClient, getUserId } from '../utils';
const docClient = createDynamoDBClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const todoId = uuid.v4();
  const userId = getUserId(event);

  const item = {
    ...newTodo,
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    done: false
  }

  await docClient.put({
    TableName: TODOS_TABLE,
    Item: item
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ item })
  }
});

handler.use(
  cors({
    credentials: true
  })
);