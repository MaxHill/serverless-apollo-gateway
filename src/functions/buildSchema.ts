import { s3 } from '../utils';
import SupergraphConfig from '../supergraphConfig.yml';
import {
  generateSuperGraph as GenerateSuperGraph,
  saveSuperGraphToS3 as SaveSuperGraphToS3
} from '../apollo';
import { CognitoIdentityCredentials } from 'aws-sdk';

export const createHandler =
  (
    supergraphConfig = SupergraphConfig,
    generateSuperGraph = GenerateSuperGraph,
    saveSuperGraphToS3 = SaveSuperGraphToS3
  ) =>
  async () => {
    try {
      const identity = new CognitoIdentityCredentials({
        IdentityPoolId: 'eu-north-1:fc7a6260-4900-4fbd-8cfe-efd9dc89970f'
      });
      console.log(identity);

      const supergraph = await generateSuperGraph(supergraphConfig);
      await saveSuperGraphToS3(supergraph, s3());

      return 'Supergraph updated!';
    } catch (err) {
      // Don't expose error but log it
      console.error(err);
      throw new Error('Something went wrong');
    }
  };

export const handler = createHandler();
