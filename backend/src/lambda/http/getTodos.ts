import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createDynamoDBClient, getUserId } from '../utils';

const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_USER_ID_INDEX = process.env.TODO_USER_ID_INDEX;

const docClient = createDynamoDBClient();

import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event:', event);

  const userId = getUserId(event);

  const result = await docClient.query({
    TableName: TODOS_TABLE,
    IndexName: TODOS_USER_ID_INDEX,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise();

  const items = result.Items;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(items)
  }
}
