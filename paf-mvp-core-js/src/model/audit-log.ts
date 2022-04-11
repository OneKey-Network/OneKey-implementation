import { AuditLog, IdsAndPreferences, Seed, TransmissionResponse, TransmissionResult } from './generated-model';
import { CurrentModelVersion } from './model';

export const buildAuditLog = (
  seed: Seed,
  data: IdsAndPreferences,
  response: TransmissionResponse,
  contentId: string
): AuditLog | undefined => {
  if (response.version != CurrentModelVersion) {
    return undefined;
  }
  const path = findTransactionPath(response, contentId);
  if (path === undefined) {
    return undefined;
  }
  return {
    version: CurrentModelVersion,
    data,
    seed,
    transaction_id: path.transactionId,
    transmissions: path.results,
  };
};

interface NodeTrack {
  node: TransmissionResponse;
  remainingChildren: TransmissionResponse[];
}
interface TransactionPath {
  /** All the transmission results participating to the contentId, in order. */
  results: TransmissionResult[];
  transactionId: string;
}

/**
 * Find a list a Transaction Result by considering the TransmissionResponse as
 * a tree data-structure and implementing an iterative Depth-First Search.
 */
const findTransactionPath = (response: TransmissionResponse, contentId: string): TransactionPath | undefined => {
  const stack: NodeTrack[] = [];
  let current: NodeTrack = { node: response, remainingChildren: [...response.children] };

  while (current !== undefined || stack.length > 0) {
    // Go to next leaf
    while (current != undefined) {
      stack.push(current);
      const content = current.node.contents.find((c) => c.content_id == contentId);
      if (content !== undefined) {
        return {
          results: stack.map(fromResponseToResult),
          transactionId: content.transaction_id,
        };
      }
      if (current.remainingChildren.length > 0) {
        const node = current.remainingChildren.pop();
        current = { node, remainingChildren: [...node.children] };
      } else {
        current = undefined;
      }
    }

    // Pop all the nodes without child because
    // we checked them in the depth search (above).
    // Once found we are ready to go in a depth search again.
    current = stack.pop();
    while (current?.remainingChildren.length == 0) {
      current = stack.pop(); // current = undefined; when there is no more element in the stack.
    }
  }

  return undefined;
};

const fromResponseToResult = (t: NodeTrack): TransmissionResult => {
  const { version, receiver, contents, status, details, source } = t.node;
  return { version, receiver, contents, status, details, source };
};
