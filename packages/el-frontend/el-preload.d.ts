import type { AppApi } from '#types/app';
import type { BackendInfoApi } from '#types/backend-info';

declare global {
  // eslint-disable-next-line no-var
  var app: AppApi;
  // eslint-disable-next-line no-var
  var backendInfo: BackendInfoApi;
}
