import { contextBridge, ipcRenderer } from 'electron';

import { RendererEventManager } from '#preload/renderer-event-manager';
import type { AppApi, FocusReceiver, FullscreenReceiver } from '#types/app';

const fullscreenManager = new RendererEventManager<FullscreenReceiver>(
  'App',
  'app:fullscreenEvent'
);
const fullscreenEvent = fullscreenManager.createEventHub();

const focusManager = new RendererEventManager<FocusReceiver>('App', 'app:focusEvent');
const focusEvent = focusManager.createEventHub();

const isFullscreen = async (): Promise<boolean> => {
  return await ipcRenderer.invoke('app:isFullscreen');
};

const isFocused = async (): Promise<boolean> => {
  return await ipcRenderer.invoke('app:isFocused');
};

const close = () => {
  ipcRenderer.send('app:close');
};

const toggleMaximize = () => {
  ipcRenderer.send('app:toggleMaximize');
};

const minimize = () => {
  ipcRenderer.send('app:minimize');
};

export const exposeAppApiToRenderer = () => {
  contextBridge.exposeInMainWorld('app', {
    fullscreenEvent,
    focusEvent,
    isFullscreen,
    isFocused,
    close,
    toggleMaximize,
    minimize,
  } as AppApi);
};
