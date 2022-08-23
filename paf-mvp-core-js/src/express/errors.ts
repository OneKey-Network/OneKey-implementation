export class UnableToIdentifySignerError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnableToIdentifySignerError.prototype);
  }
}
export class SignatureVerificationError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SignatureVerificationError.prototype);
  }
}
