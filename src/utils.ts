import S3 from 'aws-sdk/clients/s3';
import * as child from 'child_process';

/**
 * Get env variable or empty string
 * @param prop
 */
export const env = (prop: string) => process.env[prop] || '';

/**
 * Replace part of string that's between two '$' with env variable with same name.
 * Example: $THIS = 'that' 'replace $THIS$ with env' => 'replace that with env'
 * @param string
 */
export const replaceWithEnvVar = (string: string) =>
  string.replace(/\$(.*)\$/g, (key, m) => (env(m).length ? env(m) : key));

/**
 * Get s3 instance
 */
export const s3 = (config: S3.Types.ClientConfiguration = {}) =>
  new S3({ ...{ apiVersion: '2006-03-01' }, ...config });

/**
 * Run command in child_process and return the result synchronous
 * @param cmd
 * @param args
 * @param childProcess
 */
export const runCommand = (
  cmd: string,
  args: string[] = [],
  childProcess: typeof child = child
): string => {
  const process = childProcess.spawnSync(cmd, args, { stdio: 'pipe' });
  if (process.status) {
    throw new Error(process.stderr.toString());
  }
  return process.stdout?.toString() || '';
};
