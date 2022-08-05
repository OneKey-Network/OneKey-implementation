export enum ClientNodeErrorType {
  INVALID_RETURN_URL = 'INVALID_RETURN_URL',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ORIGIN = 'INVALID_ORIGIN',
  INVALID_REFERER = 'INVALID_REFERER',
  INVALID_JSON_BODY = 'INVALID_JSON_BODY',
}

export interface ClientNodeError {
  type: ClientNodeErrorType;
  details: string;
}

export enum OperatorErrorType {
  MISSING_PAF_PARAM = 'MISSING_PAF_PARAM',
  INVALID_RETURN_URL = 'INVALID_RETURN_URL',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ORIGIN = 'INVALID_ORIGIN',
  INVALID_REFERER = 'INVALID_REFERER',
}

export interface OperatorError {
  type: OperatorErrorType;
  details: string;
}
