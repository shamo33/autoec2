import { BrowserWindow, ipcMain } from 'electron';

import type { BackendInfo } from '#types/backend-info';

let targetWindow: BrowserWindow | undefined = undefined;
let backendInfo: BackendInfo | undefined = undefined;

export const setBackendInfo = (info: BackendInfo) => {
  backendInfo = info;
  targetWindow!.webContents.send('backendInfo:backendInfoEvent', info);
};

export const initBackendInfoIpc = (window: BrowserWindow) => {
  targetWindow = window;

  ipcMain.handle('backendInfo:getBackendInfo', () => {
    return backendInfo;
  });
};
