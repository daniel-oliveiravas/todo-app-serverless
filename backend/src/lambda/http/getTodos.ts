import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';


import { createLogger } from '../../utils/logger';
import { getTodos } from '../../businessLogic/todos';

const logger = createLogger('getTodos');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event:', event);

  const items = await getTodos(event);

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  }
});

handler.use(
  cors({
    credentials: true
  })
);
