import type { BackendInfo } from '#types/backend-info';

export const fetchBackend = async (backendInfo: BackendInfo, url: string, init?: RequestInit) => {
  init = init || {};
  init.headers = init.headers || {};
  (init.headers as Record<string, string>)['authorization'] = `Bearer ${backendInfo.token}`;
  const req = new Request(`http://localhost:${backendInfo.port}${url}`, init);
  const res = await fetch(req);
  return res;
};
