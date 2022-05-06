import { TcfCore } from '../src/tcfcore';

const falseArray = [false, false, false, false, false, false, false, false, false, false, false, false];
const trueArray = [true, true, true, true, true, true, true, true, true, true, true, true];
const lastFalseArray = [true, true, true, true, true, true, true, true, true, true, true, false];

const realCoreString = 'CPYDpDGPYDpDGBwAAAENAwCAAAAAAAAAAAAAAAAAAAAA';

describe('testing Tcf file', () => {
  test('empty string should result in exception', () => {
    expect(() => new TcfCore('')).toThrow();
  });
  test('short string should result in exception', () => {
    expect(() => new TcfCore(Buffer.from('0', 'hex').toString('base64url'))).toThrow();
  });
  test('long string should result in exception', () => {
    expect(() => new TcfCore(Buffer.from('00'.repeat(4097), 'hex').toString('base64url'))).toThrow();
  });
  test('set real all values to be false', () => {
    const coreString = setPurposesConsent(realCoreString, falseArray);
    checkArray(coreString, falseArray);
    // console.log('https://iabtcf.com/#/decode <= ' + coreString);
  });
  test('set real all values to be true', () => {
    const coreString = setPurposesConsent(realCoreString, trueArray);
    checkArray(coreString, trueArray);
    // console.log('https://iabtcf.com/#/decode <= ' + coreString);
  });
  test('set real all values except the last one to true', () => {
    const coreString = setPurposesConsent(realCoreString, lastFalseArray);
    checkArray(coreString, lastFalseArray);
    // console.log('https://iabtcf.com/#/decode <= ' + coreString);
  });
  test('set date to 1st April 2022', () => {
    checkDate(new Date(2022, 4, 1));
  });
  test('set date to 1st April 2122', () => {
    checkDate(new Date(2122, 4, 1));
  });
});

/**
 * Checks the purpose consent flags of the core TCF string provided.
 * @param tcString the core TCF string to be validated
 * @param expected the purpose consent flags expected to be present
 */
const checkArray = (tcString: string, expected: boolean[]) => {
  const a = new TcfCore(tcString).getPurposesConsent();
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== expected[i]) {
      throw Error(`Purpose consent '${i + 1}' check failed`);
    }
  }
};

/**
 * Takes a base TCF core string and then sets the purpose consent flags to the value provided.
 * @param base
 * @param purposes
 * @returns
 */
const setPurposesConsent = (base: string, purposes: boolean[]): string => {
  const a = new TcfCore(base);
  a.setPurposesConsent(purposes);
  return a.toString();
};

/**
 * Checks that the date encoded matches the date decoded.
 * @param date
 */
const checkDate = (date: Date) => {
  const a = new TcfCore(realCoreString);
  a.setDate(date);
  expect(a.getDate()).toEqual(date);
  // console.log('https://iabtcf.com/#/decode <= ' + a.toString());
};
