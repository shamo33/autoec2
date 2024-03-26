import 'reflect-metadata';

import { bootstrap as bootstrapBackend } from 'el-backend';
import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import serve from 'electron-serve';
import { resolve } from 'path';

import { initAppIpc } from '#main/api/app';
import { initBackendInfoIpc, setBackendInfo } from '#main/api/backend-info';
import { loadConfig } from '#main/config';
import type { Config } from '#types/config';

const loadUrl = !isDev ? serve({ directory: resolve(__dirname, '../renderer/out') }) : null;

let config: Config | undefined = undefined;

const openWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      // セキュリティ確保のため contextIsolation は false にしない
      // contextIsolation: false,
      preload: resolve(__dirname, '../preload.js'),
    },
  });

  const url = isDev ? 'http://localhost:8000/' : 'app://-';

  // 相互接続用の API の登録
  initBackendInfoIpc(mainWindow);
  // アプリスクリーン関連の API の登録・初期化
  initAppIpc(mainWindow);

  // macOS: フルスクリーン時のみ OS 標準のウィンドウボタンを有効にする
  if (mainWindow.setWindowButtonVisibility) {
    mainWindow.on('enter-full-screen', () => {
      mainWindow.setWindowButtonVisibility(true);
    });
    mainWindow.on('leave-full-screen', () => {
      mainWindow.setWindowButtonVisibility(false);
    });
  }

  if (loadUrl) {
    await loadUrl(mainWindow);
  }

  try {
    config = await loadConfig();
  } catch (e) {
    console.error(e);
  }

  mainWindow.loadURL(url);
};

app.on('ready', async () => {
  await openWindow();

  const [, backendInfo] = await bootstrapBackend(config);
  console.log(backendInfo);
  setBackendInfo(backendInfo);
});

app.on('window-all-closed', app.quit);
