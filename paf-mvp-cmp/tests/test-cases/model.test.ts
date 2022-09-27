import { FieldSingle, Marketing, Model } from '../../src/model';
import { Identifier, Preferences, PreferencesData } from '@onekey/core';

let model: Model;

const signedPersonalized = <Preferences>{
  data: Marketing.personalized,
  version: '0.1',
  source: {
    domain: 'test.com',
    signature: 'signature',
    timestamp: 12345,
  },
};

const signedStandard = <Preferences>{
  data: Marketing.standard,
  version: '0.1',
  source: {
    domain: 'test.com',
    signature: 'signature',
    timestamp: 12345,
  },
};

const testIdentifier = <Identifier>{
  version: '0.1',
  type: 'paf_browser_id',
  persisted: true,
  value: 'ABC',
  source: {
    domain: 'test.com',
    signature: 'signature',
    timestamp: 12345,
  },
};

describe('testing model', () => {
  beforeEach(() => {
    model = new Model();
  });
  test('field all true, check all customized true', () => {
    model.all.value = true;
    expect(model.all.value).toBe(true);
    model.customFields.forEach((f) => expect(f.value).toBe(true));
  });
  test('field all false, check all customized false', () => {
    model.all.value = false;
    expect(model.all.value).toBe(false);
    model.changableFields.forEach((f) => {
      expect(f.value).toBe(false);
    });
  });
  test('one customized false, all field false', () => {
    model.all.value = true;
    expect(model.all.value).toBe(true);
    model.tcf.get(3).value = false;
    expect(model.all.value).toBe(false);
  });
  test('personalized true, all customized true', () => {
    model.pref.value = Marketing.personalized;
    expect(model.all.value).toBe(true);
    model.customFields.forEach((f) => expect(f.value).toBe(true));
  });
  test('standard true, some customized true and some personalized false', () => {
    model.pref.value = Marketing.standard;
    expect(model.all.value).toBe(false);
    expect(model.tcf.get(1).value).toBe(true);
    expect(model.tcf.get(2).value).toBe(true);
    expect(model.tcf.get(3).value).toBe(true);
    expect(model.tcf.get(4).value).toBe(true);
    expect(model.tcf.get(5).value).toBe(true);
    expect(model.tcf.get(6).value).toBe(true);
    expect(model.tcf.get(11).value).toBe(true);
    expect(model.tcf.get(12).value).toBe(true);
    expect(model.tcf.get(7).value).toBe(false);
    expect(model.tcf.get(8).value).toBe(false);
    expect(model.tcf.get(9).value).toBe(false);
    expect(model.tcf.get(10).value).toBe(false);
  });
  test('customized results in this site only', () => {
    model.onlyThisSiteEnabled = true;
    model.onlyThisSite.value = false;
    model.all.value = true;
    expect(model.onlyThisSite.value).toBe(false);
    model.tcf.get(5).value = false;
    expect(model.onlyThisSite.value).toBe(true);
  });
  test("check purpose 11 can't be turned off", () => {
    expect(model.tcf.get(11).value).toBe(true);
    model.tcf.get(11).value = false;
    expect(model.tcf.get(11).value).toBe(true);
  });
  test("check purpose 12 can't be turned off", () => {
    expect(model.tcf.get(12).value).toBe(true);
    model.tcf.get(12).value = false;
    expect(model.tcf.get(12).value).toBe(true);
  });
  test('check setting purposes to standard enables toggling this site only', () => {
    customFieldChanges(model.standardFields, Marketing.standard);
  });
  test('check setting custom then standard enables toggling this site only', () => {
    checkPreferenceChanges(Marketing.standard);
  });
  test('check setting custom then personalized enables toggling this site only', () => {
    checkPreferenceChanges(Marketing.personalized);
  });
  test('check setting purposes to personalized enables toggling this site only', () => {
    customFieldChanges(model.personalizedFields, Marketing.personalized);
  });
  test('check setting customized marketing results in this site only toggle being disabled', () => {
    model.onlyThisSiteEnabled = true;
    model.all.value = true;
    model.customFields.forEach((f) => expect(f.value).toBe(true));
    expect(model.pref.value).toBe(Marketing.personalized);
    model.tcf.get(2).value = false;
    expect(model.pref.value).toBe(Marketing.custom);
  });
  test('check model can save when single field set', () => {
    // No field values have been set in the model so it shouldn\'t be possible to save.
    expect(model.canSave.value).toBe(false);
    model.pref.value = Marketing.personalized;
    expect(model.canSave.value).toBe(true);
  });
  test('check 11 and 12 custom fields disabled', () => {
    expect(model.tcf.get(11).disabled).toBe(true);
    expect(model.tcf.get(12).disabled).toBe(true);
  });
  test('check 1 to 10 custom fields enabled', () => {
    model.changableFields.forEach((f) => expect(f.disabled).toBe(false));
  });
  test('has changed for the preferences field', () => {
    model.pref.value = Marketing.personalized;
    expect(model.pref.hasChanged).toBe(true);
  });
  test('has changed against persisted for the preferences field', () => {
    model.pref.persistedValue = Marketing.personalized;
    expect(model.pref.hasChanged).toBe(false);
    model.pref.value = Marketing.standard;
    expect(model.pref.hasChanged).toBe(true);
  });
  test('has changed against signed persisted for the preferences field', () => {
    model.pref.persistedSignedValue = signedPersonalized;
    model.changableFields.forEach((f) => expect(f.hasChanged).toBe(false));
    expect(model.pref.persistedValue).toBe(Marketing.personalized);
    model.pref.value = Marketing.standard;
    expect(model.pref.hasChanged).toBe(true);
    expect(model.pref.persistedValue).toBe(Marketing.personalized);
    expect(model.pref.value).toBe(Marketing.standard);
  });
  test('has changed for this site only field when custom field changes', () => {
    model.onlyThisSiteEnabled = true;
    model.onlyThisSite.persistedValue = false;
    model.pref.persistedSignedValue = signedStandard;
    expect(model.onlyThisSite.value).toBe(false);
    expect(model.onlyThisSite.disabled).toBe(false);
    model.tcf.get(1).value = false;
    expect(model.onlyThisSite.value).toBe(true);
    expect(model.onlyThisSite.disabled).toBe(true);
    expect(model.onlyThisSite.hasChanged).toBe(true);
  });
  test('has changed for this site only field varies as other fields change', () => {
    model.onlyThisSiteEnabled = true;
    model.all.value = false;
    model.onlyThisSite.persistedValue = true;
    expect(model.onlyThisSite.value).toBe(true);
    expect(model.onlyThisSite.disabled).toBe(true);
    expect(model.onlyThisSite.hasChanged).toBe(false);
    // Note this will reset the persisted value because it is signed persisted data.
    model.pref.persistedSignedValue = signedStandard;
    expect(model.onlyThisSite.value).toBe(false);
    expect(model.onlyThisSite.disabled).toBe(false);
    expect(model.onlyThisSite.hasChanged).toBe(false);
    model.onlyThisSite.value = true;
    expect(model.onlyThisSite.value).toBe(true);
    expect(model.onlyThisSite.disabled).toBe(false);
    expect(model.onlyThisSite.hasChanged).toBe(true);
    model.onlyThisSite.value = false;
    model.all.value = false;
    expect(model.onlyThisSite.value).toBe(true);
    expect(model.onlyThisSite.disabled).toBe(true);
    expect(model.onlyThisSite.hasChanged).toBe(true);
  });
  test('reset of the onlyThisSite value does not reset the persisted value if set', () => {
    model.onlyThisSite.persistedValue = true;
    expect(model.onlyThisSite.value).toBe(true);
    expect(model.onlyThisSite.disabled).toBe(false);
    expect(model.onlyThisSite.hasChanged).toBe(false);
    model.reset();
    expect(model.onlyThisSite.value).toBe(false);
    expect(model.onlyThisSite.disabled).toBe(false);
    expect(model.onlyThisSite.hasChanged).toBe(true);
    expect(model.onlyThisSite.persistedValue).toBe(true);
  });
  test('reset of the pref value does not reset the persisted value if set', () => {
    model.pref.persistedValue = Marketing.personalized;
    expect(model.pref.value).toBe(Marketing.personalized);
    expect(model.pref.hasChanged).toBe(false);
    model.reset();
    expect(model.pref.value).toBe(Marketing.notSet);
    expect(model.pref.disabled).toBe(false);
    expect(model.pref.hasChanged).toBe(true);
    expect(model.pref.persistedValue).toBe(Marketing.personalized);
  });
  test('reset of the RID value does not reset the persisted value if set', () => {
    model.rid.persistedValue = testIdentifier;
    expect(model.rid.value).toBe(testIdentifier);
    expect(model.rid.hasChanged).toBe(false);
    model.reset();
    expect(model.rid.value).toBe(null);
    expect(model.rid.disabled).toBe(false);
    expect(model.rid.hasChanged).toBe(true);
    expect(model.rid.persistedValue).toBe(testIdentifier);
  });
});

function checkPreferenceChanges(preference: PreferencesData) {
  // Enable the this site only feature.
  model.onlyThisSiteEnabled = true;
  // Set all the custom changable fields to false.
  model.all.value = false;
  // All the changable model fields should be false.
  model.changableFields.forEach((f) => expect(f.value).toBe(false));
  // This site only should be disabled.
  expect(model.onlyThisSite.disabled).toBe(true);
  // Set the preferences.
  model.pref.value = preference;
  // Check this site only is no longer disabled.
  expect(model.onlyThisSite.disabled).toBe(false);
}

/**
 * Sets customized toggles to true and verifies that the expected marketing is set and the this site only toggle is
 * enabled.
 */
function customFieldChanges(customized: FieldSingle[], expected: Marketing) {
  // Enable this site only functionality.
  model.onlyThisSiteEnabled = true;
  // Set all the custom fields to false.
  model.all.value = false;
  // Check all the changable model custom fields are false.
  model.changableFields.forEach((f) => expect(f.value).toBe(false));
  // Check that the this site only toggle is disabled.
  expect(model.onlyThisSite.disabled).toBe(true);
  // Check that custom marketing is set.
  expect(model.pref.value).toBe(Marketing.custom);
  // Change only customised fields to true.
  customized.forEach((i) => (i.value = true));
  // Check that expected marketing is now set.
  expect(model.pref.value).toBe(expected);
  // Check that the this site only toggle is enabled.
  expect(model.onlyThisSite.disabled).toBe(false);
}
