import { FieldSingle, Marketing, Model } from '../src/model';
import { PreferencesData } from '@core/model/generated-model';

let model: Model;

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
    expect(model.pref.value).toBe(Marketing.personalized);
    model.tcf.get(2).value = false;
    expect(model.pref.value).toBe(Marketing.custom);
    expect(model.pref.value).toBe(Marketing.custom);
  });
});

function checkPreferenceChanges(preference: PreferencesData) {
  model.onlyThisSiteEnabled = true;
  model.all.value = false;
  expect(model.onlyThisSite.disabled).toBe(true);
  model.pref.value = preference;
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
