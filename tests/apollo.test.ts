import {
  createApolloHandler,
  generateSuperGraph,
  getSuperGraphFromS3,
  saveSuperGraphToS3
} from '../src/apollo';
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServer } from 'apollo-server-lambda';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { promises as fs } from 'fs';

describe('[apollo]', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.restore();
  });
  describe('createApolloHandler', () => {
    let mockGateway: typeof ApolloGateway;
    let mockServer: typeof ApolloServer;
    beforeEach(() => {
      mockGateway = jest.fn().mockImplementation(() => ({ testVal: 'someVal' }));
      mockServer = jest.fn().mockImplementation(() => ({
        createHandler: () => 'mockHandler'
      }));
    });

    it('should initiate gateway with supergraphSdl', () => {
      createApolloHandler('test', mockGateway, mockServer);
      expect(mockGateway).toHaveBeenCalledWith({ supergraphSdl: 'test' });
    });

    it('should initiate server with gateway', () => {
      createApolloHandler('test', mockGateway, mockServer);
      expect(mockServer).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway: { testVal: 'someVal' }
        })
      );
    });
    it('should return create handler', () => {
      const handler = createApolloHandler('test', mockGateway, mockServer);
      expect(handler).toEqual('mockHandler');
    });
  });

  describe('getSuperGraphFromS3()', () => {
    beforeEach(() => {
      process.env['SUPERGRAPH_BUCKET_NAME'] = 'bucket-name';
      process.env['SUPERGRAPH_FILE_NAME'] = 'file-name.txt';
    });
    it('should return the content of the file', async () => {
      AWSMock.mock('S3', 'getObject', (params: GetObjectRequest, callback) => {
        callback(null, { Body: 'testString' });
      });
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      const result = await getSuperGraphFromS3(s3);

      expect(result).toEqual('testString');
    });

    it('should fetch from specified bucket', async () => {
      AWSMock.mock('S3', 'getObject', (params: GetObjectRequest, callback) => {
        expect(params.Bucket).toEqual(process.env['SUPERGRAPH_BUCKET_NAME']);
        callback(null, {});
      });
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      await getSuperGraphFromS3(s3);
    });

    it('should fetch the correct file', async () => {
      AWSMock.mock('S3', 'getObject', (params: GetObjectRequest, callback) => {
        expect(params.Key).toEqual(process.env['SUPERGRAPH_FILE_NAME']);
        callback(null, {});
      });
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      await getSuperGraphFromS3(s3);
    });
  });
  describe('getSuperGraphFromS3()', () => {
    beforeEach(() => {
      process.env['SUPERGRAPH_BUCKET_NAME'] = 'bucket-name';
      process.env['SUPERGRAPH_FILE_NAME'] = 'file-name.txt';
    });
    it('should put file with correct filename', async () => {
      AWSMock.mock('S3', 'putObject', (params: PutObjectRequest, callback) => {
        expect(params.Key).toEqual(process.env['SUPERGRAPH_FILE_NAME']);
        callback(null, {});
      });
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      await saveSuperGraphToS3('body', s3);
    });
    it('should put file in correct bucket', async () => {
      AWSMock.mock('S3', 'putObject', (params: PutObjectRequest, callback) => {
        expect(params.Bucket).toEqual(process.env['SUPERGRAPH_BUCKET_NAME']);
        callback(null, {});
      });
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      await saveSuperGraphToS3('body', s3);
    });
    it('should put correct content in file', async () => {
      AWSMock.mock('S3', 'putObject', (params: PutObjectRequest, callback) => {
        expect(params.Body).toEqual('body');
        callback(null, {});
      });
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      await saveSuperGraphToS3('body', s3);
    });
  });

  describe('generateSuperGraph()', () => {
    it('should write the file with replaced values', async () => {
      process.env['VALUE'] = 'value';
      const fsSpy = jest.spyOn(fs, 'writeFile');
      const run = jest.fn();
      await generateSuperGraph('test $VALUE$', fs, run);

      expect(fsSpy).toHaveBeenCalledWith('/tmp/supergraphConfig.yml', 'test value');
    });

    it('should return run output', async () => {
      jest.spyOn(fs, 'writeFile');
      const run = jest.fn(() => 'test-value');
      const result = await generateSuperGraph('test', fs, run);

      expect(result).toEqual('test-value');
    });

    it('should run the right command', async () => {
      jest.spyOn(fs, 'writeFile');
      const run = jest.fn(() => 'test-value');
      await generateSuperGraph('test', fs, run);

      expect(run).toHaveBeenCalledWith('/opt/dist/rover', [
        'supergraph',
        'compose',
        '--config',
        '/tmp/supergraphConfig.yml'
      ]);
    });
  });
});
