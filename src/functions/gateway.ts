import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback } from 'aws-lambda';
import {
  createApolloHandler as CreateApolloHandler,
  getSuperGraphFromS3 as GetSuperGraphFromS3
} from '../apollo';

export const createHandler =
  (getSuperGraphFromS3 = GetSuperGraphFromS3, createApolloHandler = CreateApolloHandler) =>
  async (
    event: APIGatewayEvent,
    context: Context,
    callback: Callback
  ): Promise<APIGatewayProxyHandler> => {
    try {
      const supergraphSdl = await getSuperGraphFromS3();
      return createApolloHandler(supergraphSdl)(event, context, callback);
    } catch (err) {
      // Don't expose error but log it
      console.error(err);
      throw new Error('Something went wrong');
    }
  };

export const handler = createHandler();
