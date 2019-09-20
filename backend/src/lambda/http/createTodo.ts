import 'source-map-support/register';

import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createTodo } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodoRequest: CreateTodoRequest = JSON.parse(event.body);
  const item = await createTodo(newTodoRequest, event);

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