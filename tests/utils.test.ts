import { env, replaceWithEnvVar, runCommand, s3 } from '../src/utils';
import S3 from 'aws-sdk/clients/s3';
import * as child from 'child_process';

describe('[utils]', () => {
  describe('env()', () => {
    it('should return env variable', () => {
      const testVal = 'TestValue';
      process.env['TEST'] = testVal;
      expect(env('TEST')).toEqual(testVal);
    });
    it('should return empty string if variable does not exist', () =>
      expect(env('DOES_NOT_EXIST')).toEqual(''));
  });

  describe('replaceWithEnvVar()', () => {
    it('should replace with env variable', () => {
      process.env['STRING'] = 'string';
      expect(replaceWithEnvVar('this $STRING$ is replaced')).toEqual('this string is replaced');
    });
    it('should not replace if env variable does not exist', () => {
      expect(replaceWithEnvVar('this $DOES_NOT_EXIST$ is replaced')).toEqual(
        'this $DOES_NOT_EXIST$ is replaced'
      );
    });
  });

  describe('s3()', () => {
    it('should return an S3 instance', () => expect(typeof s3()).toEqual(typeof new S3()));
    it('should be possible to pass constructor args', () =>
      expect(s3({ region: 'us-east-1' }).config.region).toEqual('us-east-1'));
  });

  describe('runCommand()', () => {
    let actualChild: typeof child;
    beforeEach(() => {
      actualChild = jest.requireActual('child_process');
    });

    it('should return stdout', () => {
      const mock = {
        ...actualChild,
        spawnSync: jest.fn().mockImplementation(() => ({
          status: 0,
          stdout: {
            toString: () => 'test'
          }
        }))
      };
      const value = runCommand('ls', ['--al'], mock);
      expect(value).toEqual('test');
    });

    it('should throw if error', () => {
      const mock = {
        ...actualChild,
        spawnSync: jest.fn().mockImplementation(() => ({
          status: 1,
          stderr: {
            toString: () => 'test'
          }
        }))
      };

      expect(() => runCommand('ls', ['--al'], mock)).toThrow('test');
    });
  });
});
