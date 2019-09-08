import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

import * as middy from 'middy';
import { secretsManager } from 'middy/middlewares';

const logger = createLogger('auth');

const AUTH_0_SECRET_ID = process.env.AUTH_0_SECRET_ID;
const AUTH_0_SECRET_FIELD = process.env.AUTH_0_SECRET_FIELD;

export const handler = middy(async (
  event: CustomAuthorizerEvent,
  context
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  const certificate = convertCertificate(context.AUTH0_SECRET[AUTH_0_SECRET_FIELD]);
  try {
    const jwtToken = verifyToken(event.authorizationToken, certificate);
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
});

function convertCertificate(certificate: string): string {
  var beginCert = "-----BEGIN CERTIFICATE-----";
  var endCert = "-----END CERTIFICATE-----";

  certificate = certificate.replace("\n", "");
  certificate = certificate.replace(beginCert, "");
  certificate = certificate.replace(endCert, "");

  var result = beginCert;
  while (certificate.length > 0) {
    if (certificate.length > 64) {
      result += "\n" + certificate.substring(0, 64);
      certificate = certificate.substring(64, certificate.length);
    }
    else {
      result += "\n" + certificate;
      certificate = "";
    }
  }

  if (result[result.length] != "\n") {
    result += "\n";
  }
  result += endCert + "\n";
  return result;
}

function verifyToken(authHeader: string, certificate: string): JwtPayload {
  const token = getToken(authHeader);
  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }

  const split = authHeader.split(' ');
  const token = split[1];
  return token;
}


handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 90000,
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: AUTH_0_SECRET_ID
    }
  })
);