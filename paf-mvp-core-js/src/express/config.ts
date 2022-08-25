import path, { join } from 'path';
import fs from 'fs';
import { getTimeStampInSec } from '@core/timestamp';
import { isValidKey } from '@core/crypto/keys';
import { PublicKeyInfo } from '@core/crypto/identity';

/**
 * The representation of a pair of public and private keys, in JSON
 */
export interface KeyPairJSONConfig {
  publicKeyPath: string;
  privateKeyPath: string;
  startDateTimeISOString: string;
  endDateTimeISOString?: string;
}

/**
 * A pair of public, private key and a start and end timestamp
 */
interface ParsedKeyPair extends PublicKeyInfo {
  privateKey: string;
}

/**
 * The representation of an "identity" config, in JSON
 */
export interface IdentityJSONConfig {
  name: string;
  keyPairs: KeyPairJSONConfig[];
  /**
   * Email address of the Data Protection Officer
   */
  dpoEmailAddress: string;
  privacyPolicyUrl: string;
}

/**
 * The JSON configuration of a OneKey Node
 */
export interface JSONConfig {
  identity: IdentityJSONConfig;
  host: string;
  redirectResponseTimeoutInMs: number;
}

export interface IdentityConfig {
  name: string;
  publicKeys: PublicKeyInfo[];
  type: 'vendor' | 'operator';
  dpoEmailAddress: string;
  privacyPolicyUrl: URL;
}

/**
 * The parsed configuration of a OneKey node
 */
export interface Config {
  identity: Omit<IdentityConfig, 'type'>;
  host: string;
  currentPrivateKey: string;
}

/**
 * Extract the config object, the Identity object, and the current private key from a config JSON file
 * @param configPath
 */
export const parseConfig = async (configPath: string): Promise<Config> => {
  const { identity, host, ...rest } = JSON.parse((await fs.promises.readFile(configPath)).toString()) as JSONConfig;

  const keys = await getKeys(configPath, identity);

  const currentPrivateKey = keys.find((pair) =>
    isValidKey({
      start: pair.startTimestampInSec,
      end: pair.endTimestampInSec,
    })
  )?.privateKey;

  if (currentPrivateKey === undefined) {
    throw (
      `No valid keys found in ${configPath} with available dates:\n` +
      identity.keyPairs.map((pair) => [pair.startDateTimeISOString, pair.endDateTimeISOString].join(' - ')).join('\n')
    );
  }

  const parsedIdentity: Omit<IdentityConfig, 'type'> = {
    name: identity.name,
    dpoEmailAddress: identity.dpoEmailAddress,
    privacyPolicyUrl: new URL(identity.privacyPolicyUrl),
    publicKeys: keys.map((pair) => ({
      publicKey: pair.publicKey,
      startTimestampInSec: pair.startTimestampInSec,
      endTimestampInSec: pair.endTimestampInSec,
    })),
  };

  return {
    identity: parsedIdentity,
    host,
    currentPrivateKey,
    ...rest,
  };
};

/**
 * Load keys from paths in the config object, and transform dates into timestamps in seconds
 * @param configPath
 * @param identity
 */
export const getKeys = async (configPath: string, identity: IdentityJSONConfig): Promise<ParsedKeyPair[]> => {
  // Key paths are relative to the config file
  const relative = (dir: string) => join(path.dirname(configPath), dir);

  // Add start and end timestamp in seconds, and load key values
  return await Promise.all(
    identity.keyPairs.map(async (keyPair) => ({
      publicKey: (await fs.promises.readFile(relative(keyPair.publicKeyPath))).toString(),
      privateKey: (await fs.promises.readFile(relative(keyPair.privateKeyPath))).toString(),
      startTimestampInSec: getTimeStampInSec(new Date(keyPair.startDateTimeISOString)),
      endTimestampInSec: keyPair.endDateTimeISOString
        ? getTimeStampInSec(new Date(keyPair.endDateTimeISOString))
        : undefined,
    }))
  );
};
