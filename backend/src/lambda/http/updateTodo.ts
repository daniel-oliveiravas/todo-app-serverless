import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createDynamoDBClient } from '../utils'

const docClient = createDynamoDBClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const updateParams = {
    TableName: TODOS_TABLE,
    Key: {
      'todoId': todoId
    },
    UpdateExpression: 'set done = :done, dueDate = :dueDate, #name = :name',
    ExpressionAttributeValues: {
      ":done": updatedTodo.done,
      ":dueDate": updatedTodo.dueDate,
      ":name": updatedTodo.name
    },
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ReturnValues: 'ALL_NEW'
  };

  const updatedItem = await docClient.update(updateParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(updatedItem.Attributes)
  };
}
