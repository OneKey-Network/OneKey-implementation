import { HttpService, IHttpClient, RedirectingError } from '@onekey/frontend/services/http.service';

describe('HttpService', () => {
  const defaultUrl = 'https://test.com';
  let httpService: HttpService;
  let httpClient: IHttpClient;

  beforeEach(() => {
    httpClient = {
      fetch: jest.fn((_input: RequestInfo | URL, _init?: RequestInit) => Promise.resolve(new Response())),
      abortInProgressFetch: jest.fn(),
      redirect: jest.fn(),
    };
    httpService = new HttpService(httpClient);
  });

  test('One redirect', () => {
    const redirecting = httpService.redirect(defaultUrl);

    expect(redirecting).toBeTruthy();
    expect(httpService.isRedirecting).toBeTruthy();
    expect(httpClient.redirect).toHaveBeenCalled();
    expect(httpClient.abortInProgressFetch).toHaveBeenCalled();
  });

  test('Second redirect rejected', () => {
    httpService.redirect(defaultUrl);

    const redirecting = httpService.redirect('http://test2.com');

    expect(redirecting).toBeFalsy();
    expect(httpService.isRedirecting).toBeTruthy();
    expect(httpClient.redirect).toHaveBeenCalled();
    expect(httpClient.redirect).toHaveBeenLastCalledWith(defaultUrl); // The first argument of the first call
  });

  const fetchCases = [
    {
      description: 'POST json',
      execution: async (): Promise<Response> => {
        return await httpService.postJson(defaultUrl, { test: 'testValue' });
      },
    },
    {
      description: 'POST text',
      execution: async (): Promise<Response> => {
        return await httpService.postText(defaultUrl, 'this is a test');
      },
    },
    {
      description: 'GET',
      execution: async (): Promise<Response> => {
        return await httpService.get(defaultUrl);
      },
    },
    {
      description: 'DELETE',
      execution: async (): Promise<Response> => {
        return await httpService.deleteHttp(defaultUrl);
      },
    },
  ];

  test.each(fetchCases)('"$description" executes correctly', ({ execution }) => {
    return expect(execution()).resolves.toEqual(new Response());
  });

  test.each(fetchCases)('"$description" rejected after redirect', ({ execution }) => {
    httpService.redirect('http://test1.com');
    return expect(execution()).rejects.toThrow(RedirectingError);
  });
});
