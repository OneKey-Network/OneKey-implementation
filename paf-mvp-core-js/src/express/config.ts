import path, { join } from 'path';
import fs from 'fs';
import { getTimeStampInSec } from '@core/timestamp';
import { isValidKey } from '@core/crypto/keys';
import { Identity } from '@core/express/identity-endpoint';
import { ClientNodeConfig } from '@operator-client/client-node';
import { OperatorConfig } from '@operator/operator-node';

export interface KeyPair {
  publicKeyPath: string;
  privateKeyPath: string;
  startDateTimeISOString: string;
  endDateTimeISOString?: string;
}

export interface IdentityConfig {
  name: string;
  keyPairs: KeyPair[];
  dpoEmailAddress: string;
  privacyPolicyUrl: string;
}

/**
 * Load keys from paths in the config object, and transform dates into timestamps in seconds
 * @param configPath
 * @param identity
 */
export const getKeys = async (
  configPath: string,
  identity: IdentityConfig
): Promise<{ publicKey: string; privateKey: string; start: number; end: number }[]> => {
  // Key paths are relative to the config file
  const relative = (dir: string) => join(path.dirname(configPath), dir);

  // Add start and end timestamp in seconds, and load key values
  return await Promise.all(
    identity.keyPairs.map(async (keyPair) => ({
      publicKey: (await fs.promises.readFile(relative(keyPair.publicKeyPath))).toString(),
      privateKey: (await fs.promises.readFile(relative(keyPair.privateKeyPath))).toString(),
      start: getTimeStampInSec(new Date(keyPair.startDateTimeISOString)),
      end: keyPair.endDateTimeISOString ? getTimeStampInSec(new Date(keyPair.endDateTimeISOString)) : undefined,
    }))
  );
};

export interface Parsed<T extends ClientNodeConfig | OperatorConfig> {
  config: T;
  identity: Omit<Identity, 'type'>;
  currentPrivateKey: string;
}

/**
 * Extract the config object, the Identity object, and the current private key from a config JSON file
 * @param configPath
 */
export const parseConfig = async <T extends ClientNodeConfig | OperatorConfig>(
  configPath: string
): Promise<Parsed<T>> => {
  const config = JSON.parse((await fs.promises.readFile(configPath)).toString()) as T;

  const keys = await getKeys(configPath, config.identity);

  const currentPrivateKey = keys.find((pair) => isValidKey(pair))?.privateKey;

  if (currentPrivateKey === undefined) {
    throw (
      `No valid keys found in ${configPath} with available dates:\n` +
      config.identity.keyPairs
        .map((pair) => [pair.startDateTimeISOString, pair.endDateTimeISOString].join(' - '))
        .join('\n')
    );
  }

  const identity: Omit<Identity, 'type'> = {
    name: config.identity.name,
    dpoEmailAddress: config.identity.dpoEmailAddress,
    privacyPolicyUrl: new URL(config.identity.privacyPolicyUrl),
    publicKeys: keys.map((pair) => ({
      publicKey: pair.publicKey,
      startTimestampInSec: pair.start,
      endTimestampInSec: pair.end,
    })),
  };

  return { config, identity, currentPrivateKey };
};
