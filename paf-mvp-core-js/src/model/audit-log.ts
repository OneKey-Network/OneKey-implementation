import { AuditLog, TransmissionRequest, TransmissionResponse, TransmissionResult } from './generated-model';
import { CurrentModelVersion } from './model';

export const buildAuditLog = (
  request: TransmissionRequest,
  response: TransmissionResponse,
  contentId: string
): AuditLog | undefined => {
  if (request.version != CurrentModelVersion) {
    return undefined;
  }
  if (response.version != CurrentModelVersion) {
    return undefined;
  }
  const path = findTransactionPath(response, contentId);
  if (path === undefined) {
    return undefined;
  }
  return {
    version: CurrentModelVersion,
    data: request.data,
    seed: request.seed,
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

const findTransactionPath = (response: TransmissionResponse, contentId: string): TransactionPath | undefined => {
  const stack: NodeTrack[] = [];
  let current: NodeTrack = { node: response, remainingChildren: [...response.children] };

  while (current !== undefined || stack.length > 0) {
    // Go to next leaf (depth search)
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
    // We stop when there are a child to stack in
    // search in depth.
    current = stack.pop();
    while (stack.length > 0 && current.remainingChildren.length == 0) {
      current = stack.pop();
    }
    if (current.remainingChildren.length == 0) {
      current = undefined;
    }
  }

  return undefined;
};

const fromResponseToResult = (t: NodeTrack): TransmissionResult => {
  return {
    version: t.node.version,
    receiver: t.node.receiver,
    contents: t.node.contents,
    status: t.node.status,
    details: t.node.details,
    source: t.node.source,
  };
};
