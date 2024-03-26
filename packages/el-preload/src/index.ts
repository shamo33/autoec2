import { exposeAppApiToRenderer } from '#preload/app';
import { exposeBackendInfoApiToRenderer } from '#preload/backend-info';

process.once('loaded', () => {
  exposeBackendInfoApiToRenderer();
  exposeAppApiToRenderer();
});
