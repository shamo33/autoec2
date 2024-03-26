import { createGlobalState } from 'react-use';

import type { BackendInfo } from '#types/backend-info';

export const useBackendInfo = createGlobalState<BackendInfo | null>(null);
