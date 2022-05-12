export enum ClientNodeErrorType {
  INVALID_RETURN_URL = 'INVALID_RETURN_URL',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ClientNodeError {
  type: ClientNodeErrorType;
  details: string;
}

export enum OperatorErrorType {
  INVALID_RETURN_URL = 'INVALID_RETURN_URL',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface OperatorError {
  type: OperatorErrorType;
  details: string;
}
