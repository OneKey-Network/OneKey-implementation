import { IdentifierDefinition } from '@core/crypto';
import { PublicKeyInfo } from '@core/crypto/identity';
import { PublicKeyStore } from '@core/crypto/key-store';
import { privateKeyFromString } from '@core/crypto/keys';
import { Signer } from '@core/crypto/signer';
import { Config } from '@core/express';
import { Log } from '@core/log';
import {
  AuditLog,
  GetIdentityResponse,
  IdBuilder,
  Identifier,
  IdsAndPreferences,
  PreferencesData,
  Seed,
  Timestamp,
  TransmissionContents,
  TransmissionDetails,
  TransmissionResponse,
  TransmissionStatus,
} from '@core/model';
import { CurrentModelVersion } from '@core/model/model';
import { getTimeStampInSec } from '@core/timestamp';
import { OperatorClient } from '@operator-client/operator-client';
import { v4 as uuidv4 } from 'uuid';
import { IdentityResolverMap } from '../../src/identity-resolver';
import { SeedDefinition, SignedSeedSignatureContainer } from '../../src/signing-definitions';
import ECDSA from 'ecdsa-secp256r1';
import { IECDSA } from 'ecdsa-secp256r1';

/**
 * See the documentation for logic details.
 * https://github.com/prebid/addressability-framework/blob/main/mvp-spec/ad-auction.md
 */

/**
 * Parameters passed to the method that builds a new configuration.
 */
export interface ConfigParams {
  name: string; // Human readable name of the organization
  host: string; // Domain name of the node
  type: 'vendor' | 'operator'; // Type of the node
  dpoEmailAddress?: string; // Optional email address. If not provided dpo@[host] will be used
  privacyPolicyUrl?: URL; // Optional privacy url. If not provided https://[host]/privacy.html will be used
}

export interface OpenRTBNode extends ConfigParams {
  children: OpenRTBNode[]; // The children of this node if any
}

export const AutomobileExample = <OpenRTBNode>{
  name: 'automobiles',
  host: 'automobiles.example',
  type: 'operator',
  children: [
    {
      name: 'United States',
      host: 'united-states.example',
      type: 'vendor',
      children: [
        {
          name: 'Ford',
          host: 'ford.example',
          type: 'vendor',
          children: [
            {
              name: 'Model T',
              host: 'model-t.example',
              type: 'vendor',
            },
            {
              name: 'Mustang',
              host: 'mustang.example',
              type: 'vendor',
            },
            {
              name: 'Model 18',
              host: 'model-18.example',
              type: 'vendor',
            },
          ],
        },
        {
          name: 'Duesenberg',
          host: 'duesenberg.example',
          type: 'vendor',
          children: [
            {
              name: 'Model SJ',
              host: 'model-sj.example',
              type: 'vendor',
            },
          ],
        },
        {
          name: 'Jeep',
          host: 'jeep.example',
          type: 'vendor',
          children: [
            {
              name: 'MD',
              host: 'mb.example',
              type: 'vendor',
            },
          ],
        },
        {
          name: 'Oldsmobile',
          host: 'oldsmobile.example',
          type: 'vendor',
          children: [
            {
              name: '"Rocket 88"',
              host: 'rocket-88.example',
              type: 'vendor',
            },
          ],
        },
        {
          name: 'Chevrolet',
          host: 'chevrolet.example',
          type: 'vendor',
          children: [
            {
              name: 'Corvette"',
              host: 'corvette.example',
              type: 'vendor',
            },
          ],
        },
        {
          name: 'Chrysler',
          host: 'Chrysler.example',
          type: 'vendor',
          children: [
            {
              name: 'Minivan',
              host: 'minivan.example',
              type: 'vendor',
            },
          ],
        },
        {
          name: 'Tesla',
          host: 'tesla.example',
          type: 'vendor',
          children: [
            {
              name: 'Model S',
              host: 'model-s.example',
              type: 'vendor',
            },
            {
              name: 'Model X',
              host: 'model-x.example',
              type: 'vendor',
            },
            {
              name: 'Model 3',
              host: 'model-3.example',
              type: 'vendor',
            },
            {
              name: 'Model Y',
              host: 'model-y.example',
              type: 'vendor',
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Used to build a mock audit log for testing and demo purposes.
 */
export class AuditLogMock {
  /**
   * Used to sign the transmission responses against the seed.
   */
  private static readonly seedDefinition = new SeedDefinition();

  /**
   * Public key store used for validation.
   */
  private readonly publicKeyStore = new PublicKeyStore();

  /**
   * Store of client and configuration information across the mock.
   */
  private readonly clientAndConfigStore: ConfigAndClientStore;

  /**
   * Constructs a new instance of the mock audit log.
   * @param log
   */
  constructor(private readonly log: Log) {
    this.clientAndConfigStore = new ConfigAndClientStore(log, this);
  }

  /**
   *
   * @returns an identity resolver that can be used for demos and testing
   */
  public GetIdentityResolverMap(): IdentityResolverMap {
    return this.clientAndConfigStore.GetIdentityResolverMap();
  }

  /**
   * Builds the config and the client in a single operation for the parameters provided.
   * @param params instance of new client parameters
   * @returns
   */
  public BuildConfigAndClient(params: ConfigParams): ConfigAndClient {
    const config = AuditLogMock.BuildConfig(params);
    const client = this.BuildOperatorClient(config);
    return { config, client, params };
  }

  /**
   * Builds a mock audit log for testing and demo purposes.
   * @param rootNode for the tree of participants
   * @param data preference data value for personalized marketing
   * @returns a valid audit log
   */
  public BuildAuditLog(rootNode: OpenRTBNode, data: PreferencesData): AuditLog {
    // Use a single content and transaction id for a mock audit log.
    const contents = [{ content_id: uuidv4(), transaction_id: uuidv4() }];

    // Get the root client and config.
    const root = this.clientAndConfigStore.getOrAdd(rootNode);

    // Build the ids and preferences.
    const id = AuditLogMock.NewId(root.config);
    const idsAndPreferences = AuditLogMock.SignIdentifiersAndPreferencesData(root.client, [id], data);

    // Build the seed for the audit log from the transaction ids, and ids and preferences.
    const seed = AuditLogMock.BuildSeed(root.client, [contents[0].transaction_id], idsAndPreferences);

    // Get the responses for all the children of the root node.
    const responseTrees: TransmissionResponse[] = [];
    for (let i = 0; i < rootNode.children.length; i++) {
      responseTrees.push(
        this.BuildTransmissionResponses(idsAndPreferences, seed, contents, rootNode.children[i], rootNode)
      );
    }

    // Turn them into a list.
    // TODO: Remove when the audit log can support a hierarchy of responses.
    const responseList: TransmissionResponse[] = [];
    responseTrees.forEach((current) => this.AddToList(responseList, current));

    // Finally build the audit log.
    return {
      version: CurrentModelVersion,
      data: idsAndPreferences,
      seed,
      transaction_id: contents[0].transaction_id,
      transmissions: responseList,
    };
  }

  /**
   *
   * @param list that all the response results will be added to
   * @param current the current node being added
   * @returns
   */
  private AddToList(list: TransmissionResponse[], current: TransmissionResponse): TransmissionResponse[] {
    list.push(current);
    if (current.children?.length > 0) {
      current.children.forEach((child) => this.AddToList(list, child));
    }
    return list;
  }

  /**
   * Builds a transmission response for the current node and its parent.
   * @param idsAndPreferences
   * @param seed
   * @param contents
   * @param currentNode
   * @param parentNode
   * @returns
   */
  private BuildTransmissionResponses(
    idsAndPreferences: IdsAndPreferences,
    seed: Seed,
    contents: TransmissionContents,
    currentNode: OpenRTBNode,
    parentNode: OpenRTBNode
  ): TransmissionResponse {
    const children: TransmissionResponse[] = [];
    if (currentNode.children?.length > 0) {
      for (let i = 0; i < currentNode.children.length; i++) {
        children.push(
          this.BuildTransmissionResponses(idsAndPreferences, seed, contents, currentNode.children[i], currentNode)
        );
      }
    }
    return AuditLogMock.BuildTransmissionResponse(
      idsAndPreferences,
      seed,
      currentNode?.children?.length === 0
        ? contents
        : [
            {
              transaction_id: contents[0].transaction_id,
              content_id: null,
            },
          ],
      this.clientAndConfigStore.getOrAdd(currentNode),
      this.clientAndConfigStore.getOrAdd(parentNode),
      'success',
      'mocked',
      children
    );
  }

  /**
   * Creates a transmission response for inclusion in the audit log.
   * @param idsAndPreferences
   * @param seed
   * @param contents ids
   * @param sender used to provide the details
   * @param receiver used to sign the transmission response
   * @param status string
   * @param details string
   * @param children responses if any
   * @returns a transmission response
   */
  private static BuildTransmissionResponse(
    idsAndPreferences: IdsAndPreferences,
    seed: Seed,
    contents: TransmissionContents,
    sender: ConfigAndClient,
    receiver: ConfigAndClient,
    status: TransmissionStatus,
    details: TransmissionDetails,
    children: TransmissionResponse[]
  ): TransmissionResponse {
    const currentPrivateKey = <IECDSA>privateKeyFromString(sender.config.currentPrivateKey);
    const signer = new Signer<SignedSeedSignatureContainer>(currentPrivateKey, AuditLogMock.seedDefinition);
    const response = {
      version: CurrentModelVersion,
      receiver: receiver.config.host,
      contents,
      status,
      details,
      source: {
        timestamp: getTimeStampInSec(),
        domain: sender.config.host,
        signature: signer.sign({ idsAndPreferences, seed }),
      },
      children,
    };
    (<any>response).toSign = signer.toSign;
    return response;
  }

  /**
   * Builds a new seed from the client for the transaction ids, identifiers and preferences provided.
   * @param client
   * @param transaction_ids
   * @param idsAndPreferences
   * @returns
   */
  private static BuildSeed(
    client: OperatorClient,
    transaction_ids: string[],
    idsAndPreferences: IdsAndPreferences
  ): Seed {
    const seed = client.buildSeed(transaction_ids, idsAndPreferences);
    (<any>seed).toSign = client.seedSigner.toSign;
    return seed;
  }

  /**
   * Signs the preferences with the identifiers.
   * @param client to perform the signing
   * @param identifiers to combine with the preferences
   * @param data boolean value for personalized marketing
   * @returns signed identifiers and preferences
   */
  private static SignIdentifiersAndPreferencesData(
    client: OperatorClient,
    identifiers: Identifier[],
    data: PreferencesData
  ): IdsAndPreferences {
    const preferences = client.buildPreferences(identifiers, data);
    (<any>preferences).toSign = client.prefsSigner.toSign;
    return { identifiers, preferences };
  }

  /**
   * Creates a new Id for the configuration provided.
   * @param config
   * @returns
   */
  private static NewId(config: Config): Identifier {
    const privateKey = privateKeyFromString(config.currentPrivateKey);
    const signer = new Signer(privateKey, new IdentifierDefinition());
    return new IdBuilder(config.host, config.currentPrivateKey, signer).generateNewId();
  }

  /**
   * Builds a new operator client for the config provided.
   * @param config
   */
  private BuildOperatorClient(config: Config): OperatorClient {
    return new OperatorClient(config.host, config.host, config.currentPrivateKey, this.publicKeyStore);
  }

  /**
   * Builds a new client config for the parameters provided.
   * @param params instance of new client parameters
   */
  private static BuildConfig(params: ConfigParams): Config {
    const privateKey = ECDSA.generateKey();
    const currentPrivateKey = <string>privateKey.toPEM();
    const publicKey = <string>privateKey.asPublic().toPEM();
    return <Config>{
      identity: {
        name: params.name,
        publicKeys: [
          {
            startTimestampInSec: getTimeStampInSec(),
            publicKey,
          },
        ],
        type: params.type,
        dpoEmailAddress: params.dpoEmailAddress ?? `dpo@${params.host}`,
        privacyPolicyUrl: params.privacyPolicyUrl ?? new URL(`https:\\\\${params.host}\\privacy.html`),
      },
      host: params.host,
      currentPrivateKey,
    };
  }
}

interface ConfigAndClient {
  config: Config; // The config used to create the client
  client: OperatorClient; // The client created from the config
  params: ConfigParams; // The parameters that formed the config and client
}

interface GetIdentityResponsePublicKey {
  key: string;
  start: Timestamp;
  end?: Timestamp;
}

class ConfigAndClientStore {
  // Map of hosts to config and clients.
  private map = new Map<string, ConfigAndClient>();

  /**
   *
   * @param log
   * @param mock instance for use with the store
   */
  constructor(private readonly log: Log, private readonly mock: AuditLogMock) {}

  /**
   * Returns the exist config and client if available, or adds a new one and returns that
   * @param params to be used to find the existing data or to add if does not exist
   * @returns a unique config and client for the parameters across the instance of the store
   */
  public getOrAdd(params: ConfigParams): ConfigAndClient {
    let result = this.map.get(params.host);
    if (result === undefined) {
      result = this.mock.BuildConfigAndClient(params);
      this.map.set(params.host, result);
    }
    return result;
  }

  public GetIdentityResolverMap(): IdentityResolverMap {
    const map = new Map<string, GetIdentityResponse>();
    this.map.forEach((v, k) =>
      map.set(k, {
        version: CurrentModelVersion,
        name: v.params.name,
        type: v.params.type,
        dpo_email: v.config.identity.dpoEmailAddress,
        privacy_policy_url: v.config.identity.privacyPolicyUrl.toString(),
        keys: ConfigAndClientStore.TransformPublicKeys(v.config.identity.publicKeys),
      })
    );
    return new IdentityResolverMap(this.log, map);
  }

  private static TransformPublicKeys(keys: PublicKeyInfo[]): GetIdentityResponsePublicKey[] {
    const transformed: GetIdentityResponsePublicKey[] = [];
    keys.forEach((k) =>
      transformed.push({
        key: k.publicKey,
        start: k.startTimestampInSec,
        end: k.endTimestampInSec,
      })
    );
    return transformed;
  }
}
