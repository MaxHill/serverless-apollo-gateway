import { createHandler } from '../src/functions/buildSchema';
import supergraphConfig from '../src/supergraphConfig.yml';

describe('[buildSchema]', () => {
  it('should generate the supergraph', async () => {
    const generate = jest.fn().mockReturnValue('');
    const save = jest.fn();
    const handler = createHandler(supergraphConfig, generate, save);

    await handler();

    expect(generate).toHaveBeenCalledWith(supergraphConfig);
  });

  it('should save the supergraph to s3', async () => {
    const generate = jest.fn().mockReturnValue('result');
    const save = jest.fn();
    const handler = createHandler(supergraphConfig, generate, save);

    await handler();

    expect(save).toHaveBeenCalledWith('result', expect.anything());
  });

  it('should not expose errors', async () => {
    const generate = jest.fn().mockReturnValue('');
    const save = jest.fn(() => {
      throw new Error('Should not be exposed');
    });
    jest.spyOn(console, 'error').mockImplementation();
    const handler = createHandler(supergraphConfig, generate, save);

    await expect(handler()).rejects.toThrow('Something went wrong');
  });

  it('should log errors', async () => {
    const internalError = new Error('Should not be exposed');
    const generate = jest.fn().mockReturnValue('');
    const save = jest.fn(() => {
      throw internalError;
    });
    const errorLog = jest.spyOn(console, 'error').mockImplementation();
    const handler = createHandler(supergraphConfig, generate, save);

    await expect(handler()).rejects.toThrow();

    expect(errorLog).toHaveBeenCalledWith(internalError);
  });
});
