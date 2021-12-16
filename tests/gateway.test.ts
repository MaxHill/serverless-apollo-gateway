import { createHandler } from '../src/functions/gateway';
import supergraphConfig from '../src/supergraphConfig.yml';

describe('[gateway]', () => {
  it('should fetch supergraph', async () => {
    const getSuperGraph = jest.fn();
    const createApolloHandler = jest.fn(() => async () => undefined);

    const handler = createHandler(getSuperGraph, createApolloHandler);

    await handler(<never>{}, <never>{}, () => undefined);

    expect(getSuperGraph).toHaveBeenCalled();
  });

  it('should fetch return handler', async () => {
    const getSuperGraph = jest.fn();
    const createApolloHandler = jest.fn(() => async () => 'apollo-handler');
    const handler = createHandler(getSuperGraph, createApolloHandler);

    const response = await handler(<never>{}, <never>{}, () => undefined);

    expect(response).toEqual('apollo-handler');
  });

  it('should not expose errors', async () => {
    const getSuperGraph = jest.fn(() => {
      throw new Error('Should not be exposed');
    });
    const createApolloHandler = jest.fn(() => async () => undefined);
    jest.spyOn(console, 'error').mockImplementation();
    const handler = createHandler(getSuperGraph, createApolloHandler);

    await expect(handler(<never>{}, <never>{}, () => undefined)).rejects.toThrow(
      'Something went wrong'
    );
  });

  it('should log error', async () => {
    const internalError = new Error('Should not be exposed');
    const getSuperGraph = jest.fn(() => {
      throw internalError;
    });
    const createApolloHandler = jest.fn(() => async () => undefined);
    const errorLog = jest.spyOn(console, 'error').mockImplementation();
    const handler = createHandler(getSuperGraph, createApolloHandler);

    await expect(handler(<never>{}, <never>{}, () => undefined)).rejects.toThrow();

    expect(errorLog).toHaveBeenCalledWith(internalError);
  });
});
