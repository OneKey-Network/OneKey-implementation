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
