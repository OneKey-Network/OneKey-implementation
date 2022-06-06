import { TcfCore } from '../src/tcfcore';
import { IabTcfCore } from './iabtcfcore';

const falseArray = [false, false, false, false, false, false, false, false, false, false, false, false];
const trueArray = [true, true, true, true, true, true, true, true, true, true, true, true];
const firstFalseArray = [false, true, true, true, true, true, true, true, true, true, true, true];

const realCoreString = 'CPYkmiwPYkmiwEGAAAENAwCAAP_AAAAAAAAAAAAAAAAA';

describe('testing Tcf file', () => {
  test('check real date', () => {
    const expectedDate = new IabTcfCore(realCoreString).getDate();
    const actualDate = getDate(new TcfCore(realCoreString));
    expect(actualDate).toEqual(expectedDate);
  });
  test('check current date', () => {
    const iab = new IabTcfCore(realCoreString);
    iab.setDate(new Date());
    const currentCoreString = iab.toString();
    const expectedDate = new IabTcfCore(currentCoreString).getDate();
    const actualDate = getDate(new TcfCore(currentCoreString));
    expect(actualDate).toEqual(expectedDate);
  });
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
  });
  test('set real all values to be true', () => {
    const coreString = setPurposesConsent(realCoreString, trueArray);
    checkArray(coreString, trueArray);
    showIABTCFCheck(coreString);
  });
  test('set real all values except the first one to true', () => {
    // Can't set the last two to false because these are not possible to set to false in the data model.
    const coreString = setPurposesConsent(realCoreString, firstFalseArray);
    checkArray(coreString, firstFalseArray);
    showIABTCFCheck(coreString);
  });
  test('set date to 1st April 2022', () => {
    checkDate(new Date(2022, 4, 1));
  });
  test('set date to 1st April 2122', () => {
    checkDate(new Date(2122, 4, 1));
  });
  test('clone', () => {
    const source = new TcfCore(realCoreString);
    const clone = source.clone();
    expect(source.toString()).toEqual(clone.toString());
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
 * Takes a base TCF core string and then sets the purpose consent flags to the value provided for both the IAB TL and
 * this projects implementation. Verifies that the returned strings are the same for both implementations.
 * @param base
 * @param purposes
 * @returns
 */
const setPurposesConsent = (base: string, purposes: boolean[]): string => {
  const a = new TcfCore(base);
  const b = new IabTcfCore(base);
  a.setPurposesConsent(purposes);
  b.setPurposesConsent(purposes);
  expect(a.toString()).toEqual(b.toString());
  return a.toString();
};

/**
 * Checks that the date encoded matches the date decoded.
 * @param date
 */
const checkDate = (date: Date) => {
  const a = new TcfCore(realCoreString);
  const b = new IabTcfCore(realCoreString);
  a.setDate(date);
  b.setDate(date);
  expect(getDate(a)).toEqual(date);
  expect(b.getDate()).toEqual(date);
  showIABTCFCheck(a.toString());
};

/**
 * Returns the date that the TCF string was created. Used only for testing purposes.
 * @remarks uses the parseInt method to avoid complexity with bit packing
 */
const getDate = (core: TcfCore) => {
  let str = '';
  for (let i = 0; i < TcfCore.dateLength; i++) {
    str += core.buffer[i + TcfCore.startCreated] ? '1' : '0';
  }
  return new Date(parseInt(str, 2) * 100);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const showIABTCFCheck = (coreString: string) => {
  // console.log('Test with https://iabtcf.com/#/decode <= ' + coreString);
};
