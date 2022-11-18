import { client, operator, participant } from '@onekey/core/routes';

describe('Routes', () => {
  test('participant routes', () => {
    expect(participant.identity.rest).toEqual('/paf/v1/identity');
  });

  test('operator routes', () => {
    expect(operator.read.redirect).toEqual('/paf/v1/redirect/get-ids-prefs');
    expect(operator.delete.rest).toEqual('/paf/v1/ids-prefs');
    expect(operator.write.rest).toEqual('/paf/v1/ids-prefs');
  });

  test('client routes', () => {
    expect(client.read.redirect).toEqual('/paf-proxy/v1/redirect/get-ids-prefs');
    expect(client.createSeed.rest).toEqual('/paf-proxy/v1/seed');
    expect(client.verifyTransmission.rest).toEqual('/paf-proxy/v1/verify/transmissionResult');
  });
});
