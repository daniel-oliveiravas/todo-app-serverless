import 'source-map-support/register';
import * as uuid from 'uuid';

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createDynamoDBClient } from '../utils';
const docClient = createDynamoDBClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const todoId = uuid.v4();

  const newItem = {
    ...newTodo,
    todoId,
    createdAt: new Date().toISOString(),
    done: false
  }

  await docClient.put({
    TableName: TODOS_TABLE,
    Item: newItem
  }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newItem)
  }
}