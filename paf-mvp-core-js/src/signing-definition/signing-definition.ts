export const SIGN_SEP = '\u2063';

/**
 * Definition of how to get signature, signature domain and input string to sign
 */
export interface SigningDefinition<T, U = Partial<T>> {
  /**
   * How to get input string from unsigned data
   * @param data
   */
  getInputString(data: U): string;

  /**
   * How to get signature from signed data
   * @param data
   */
  getSignature(data: T): string;

  /**
   * How to get signer domain from signed data
   * @param data
   */
  getSignerDomain(data: T): string;
}
