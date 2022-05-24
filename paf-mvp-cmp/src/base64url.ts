// Modified version of IAB TL implementation
// https://github.com/InteractiveAdvertisingBureau/iabtcf-es/blob/master/modules/core/src/encoder/Base64Url.ts

export class Base64Url {
  /**
   * Base 64 URL character set.  Different from standard Base64 char set
   * in that '+' and '/' are replaced with '-' and '_'.
   */
  private static DICT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  private static REVERSE_DICT: Map<string, number> = new Map([
    ['A', 0],
    ['B', 1],
    ['C', 2],
    ['D', 3],
    ['E', 4],
    ['F', 5],
    ['G', 6],
    ['H', 7],
    ['I', 8],
    ['J', 9],
    ['K', 10],
    ['L', 11],
    ['M', 12],
    ['N', 13],
    ['O', 14],
    ['P', 15],
    ['Q', 16],
    ['R', 17],
    ['S', 18],
    ['T', 19],
    ['U', 20],
    ['V', 21],
    ['W', 22],
    ['X', 23],
    ['Y', 24],
    ['Z', 25],
    ['a', 26],
    ['b', 27],
    ['c', 28],
    ['d', 29],
    ['e', 30],
    ['f', 31],
    ['g', 32],
    ['h', 33],
    ['i', 34],
    ['j', 35],
    ['k', 36],
    ['l', 37],
    ['m', 38],
    ['n', 39],
    ['o', 40],
    ['p', 41],
    ['q', 42],
    ['r', 43],
    ['s', 44],
    ['t', 45],
    ['u', 46],
    ['v', 47],
    ['w', 48],
    ['x', 49],
    ['y', 50],
    ['z', 51],
    ['0', 52],
    ['1', 53],
    ['2', 54],
    ['3', 55],
    ['4', 56],
    ['5', 57],
    ['6', 58],
    ['7', 59],
    ['8', 60],
    ['9', 61],
    ['-', 62],
    ['_', 63],
  ]);

  /**
   * log2(64) = 6
   */
  private static BASIS = 6;
  private static LCM = 24;

  /**
   * encodes an arbitrary-length bitfield array into base64url
   *
   * @static
   * @param str - arbitrary-length bitfield string to be encoded to base64url
   * @return base64url encoded result
   */
  public static encode(array: boolean[]): string {
    // Convert the array to a string.
    let str = Base64Url.toString(array);

    /**
     * Pad the end of the string to the least common multiple of 6 (basis for base64) and 8 (one byte).
     */
    const padding = str.length % this.LCM;
    str += padding ? '0'.repeat(this.LCM - padding) : '';
    let result = '';
    for (let i = 0; i < str.length; i += this.BASIS) {
      result += this.DICT[parseInt(str.substr(i, this.BASIS), 2)];
    }
    return result;
  }

  /**
   * decodes a base64url encoded bitfield string
   *
   * @static
   * @param str - base64url encoded bitfield string to be decoded
   * @return bitfield array
   */
  public static decode(str: string): boolean[] {
    /**
     * should contain only characters from the base64url set
     */
    if (!/^[A-Za-z0-9\-_]+$/.test(str)) {
      throw 'Invalidly encoded Base64URL string';
    }

    let result = '';
    for (let i = 0; i < str.length; i++) {
      /**
       * index the binary value of the character from out reverse map
       */
      const strBits = this.REVERSE_DICT.get(str[i]).toString(2);

      /**
       * Since a bit string converted to an integer on encoding will lose
       * leading zeros – pad to the left for those missing leading zeros
       */
      result += '0'.repeat(this.BASIS - strBits.length) + strBits;
    }

    return Base64Url.toArray(result);
  }

  /**
   * Converts a boolean array to a string of 1s and 0s.
   * @param array
   * @returns string of 1s and 0s
   */
  private static toString(array: boolean[]): string {
    let str = '';
    array.forEach((i) => (str += i ? '1' : '0'));
    return str;
  }

  /**
   * Converts a string of 1s and 0s to a boolean array.
   * @param str of 1s and 0s
   * @returns array of boolean flags
   */
  private static toArray(str: string): boolean[] {
    const array: boolean[] = [];
    for (let i = 0; i < str.length; i++) {
      array[i] = str[i] === '1';
    }
    return array;
  }
}
