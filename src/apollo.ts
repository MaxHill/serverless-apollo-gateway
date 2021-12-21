import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloServer } from 'apollo-server-lambda';
import { S3 } from 'aws-sdk';
import { s3 as getS3, env, replaceWithEnvVar, runCommand } from './utils';
import { promises as Fs } from 'fs';

/**
 * Factory to create apolloGateway that adds api-key as header
 * @param _RemoteGraphQLDataSource
 * @param apolloGateway
 */
export const gatewayFactory =
  (_RemoteGraphQLDataSource = RemoteGraphQLDataSource, apolloGateway = ApolloGateway) =>
  (supergraphSdl: string) =>
    new apolloGateway({
      supergraphSdl,
      buildService: ({ url }) =>
        new _RemoteGraphQLDataSource({
          url,
          willSendRequest: ({ request }) => request.http?.headers.set('x-api-key', env('API_KEY'))
        })
    });

/**
 * Create apollo server handler
 * @param supergraphSdl
 * @param createGateway
 * @param apolloServer
 */
export const createApolloHandler = (
  supergraphSdl: string,
  createGateway = gatewayFactory(),
  apolloServer: typeof ApolloServer = ApolloServer
) => {
  const server = new apolloServer({
    gateway: createGateway(supergraphSdl),
    context: ({ event, context }) => ({
      headers: event.headers,
      functionName: context.functionName,
      event,
      context
    })
  });

  return server.createHandler();
};

/**
 * Fetch supergraph as string from s3 bucket
 * @param s3
 */
export const getSuperGraphFromS3 = async (s3: S3 = getS3()) => {
  const params = { Bucket: env('SUPERGRAPH_BUCKET_NAME'), Key: env('SUPERGRAPH_FILE_NAME') };
  const { Body } = await s3.getObject(params).promise();

  return Body?.toString() || '';
};

/**
 * Save supergraph string as text file in s3
 * @param Body
 * @param s3
 */
export const saveSuperGraphToS3 = async (Body: string, s3: S3 = getS3()) => {
  return s3
    .putObject({
      Bucket: env('SUPERGRAPH_BUCKET_NAME'),
      Key: env('SUPERGRAPH_FILE_NAME'),
      Body
    })
    .promise();
};

/**
 * Generate a supergraph from local file with rover binary
 * @param supergraphConfig
 * @param fs
 * @param run
 */
export const generateSuperGraph = async (
  supergraphConfig: string,
  fs: typeof Fs = Fs,
  run: typeof runCommand = runCommand
) => {
  await fs.writeFile('/tmp/supergraphConfig.yml', replaceWithEnvVar(supergraphConfig));

  return run('/opt/dist/rover', ['supergraph', 'compose', '--config', '/tmp/supergraphConfig.yml']);
};
