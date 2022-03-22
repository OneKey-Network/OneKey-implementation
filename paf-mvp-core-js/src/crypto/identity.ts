import {Timestamp} from '@core/model/generated-model';

export interface KeyInfo {
    start: Date;
    end?: Date;
    publicKey: string;
}

export const fromIdentityResponse = (identityKey: { key: string; start: Timestamp; end?: Timestamp; }): KeyInfo => ({
    publicKey: identityKey.key,
    start: new Date(identityKey.start),
    end: new Date(identityKey.end),
});
