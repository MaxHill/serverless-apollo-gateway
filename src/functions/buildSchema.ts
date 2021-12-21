import { env, runCommand, s3 } from '../utils';
import SupergraphConfig from '../supergraphConfig.yml';
import {
  generateSuperGraph as GenerateSuperGraph,
  saveSuperGraphToS3 as SaveSuperGraphToS3
} from '../apollo';

export const createHandler =
  (
    supergraphConfig = SupergraphConfig,
    generateSuperGraph = GenerateSuperGraph,
    saveSuperGraphToS3 = SaveSuperGraphToS3
  ) =>
  async () => {
    try {
      const supergraph = await generateSuperGraph(supergraphConfig);
      await saveSuperGraphToS3(supergraph, s3());

      return {
        statusCode: 200,
        body: 'Supergraph updated!'
      };
    } catch (err) {
      // Don't expose error but log it
      console.error(err);
      throw new Error('Something went wrong');
    }
  };

export const handler = createHandler();
