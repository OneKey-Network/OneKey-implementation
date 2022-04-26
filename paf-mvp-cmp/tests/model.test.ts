import { Marketing, Model } from '../src/model';

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
    model.customFields.forEach((f) => expect(f.value).toBe(false));
  });
  test('one customized false, all field false', () => {
    model.all.value = true;
    expect(model.all.value).toBe(true);
    model.tcf.get(1).value = false;
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
    model.all.value = true;
    expect(model.onlyThisSite.value).toBe(false);
    model.tcf.get(5).value = false;
    expect(model.onlyThisSite.value).toBe(true);
  });
});
