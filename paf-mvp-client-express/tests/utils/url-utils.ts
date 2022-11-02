import { decodeBase64, QSParam } from '@onekey/core/query-string';

export const parseUrlString = (urlString: string): { path: string; queryParams: any } => {
  const url = new URL(urlString);
  return {
    path: url.pathname,
    queryParams: url.searchParams.get(QSParam.paf)
      ? JSON.parse(decodeBase64(url.searchParams.get(QSParam.paf)))
      : undefined,
  };
};
