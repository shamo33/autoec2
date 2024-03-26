import { contextBridge, ipcRenderer } from 'electron';

import { RendererEventManager } from '#preload/renderer-event-manager';
import type { BackendInfo, BackendInfoApi, BackendInfoReceiver } from '#types/backend-info';

const backendInfoManager = new RendererEventManager<BackendInfoReceiver>(
  'BackendInfo',
  'backendInfo:backendInfoEvent'
);
const backendInfoEvent = backendInfoManager.createEventHub();

const getBackendInfo = async (): Promise<BackendInfo | null> => {
  return await ipcRenderer.invoke('backendInfo:getBackendInfo');
};

export const exposeBackendInfoApiToRenderer = () => {
  contextBridge.exposeInMainWorld('backendInfo', {
    backendInfoEvent,
    getBackendInfo,
  } as BackendInfoApi);
};
