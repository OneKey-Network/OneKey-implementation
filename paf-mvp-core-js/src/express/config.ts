import path, { join } from 'path';
import fs from 'fs';
import { getTimeStampInSec } from '@core/timestamp';

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
      end: getTimeStampInSec(new Date(keyPair.endDateTimeISOString)),
    }))
  );
};
