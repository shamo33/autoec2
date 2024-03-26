import type { RendererEventHub } from '#types/renderer-event-manager';

export type BackendInfoReceiver = (backendInfo: BackendInfo) => void;

export interface BackendInfo {
  port: number;
  token: string;
}

export interface BackendInfoApi {
  backendInfoEvent: RendererEventHub<BackendInfoReceiver>;
  getBackendInfo: () => Promise<BackendInfo | null>;
}
