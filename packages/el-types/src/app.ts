import type { RendererEventHub } from '#types/renderer-event-manager';

export type FullscreenReceiver = (isFullscreen: boolean) => void;
export type FocusReceiver = (isActive: boolean) => void;

export interface AppApi {
  fullscreenEvent: RendererEventHub<FullscreenReceiver>;
  focusEvent: RendererEventHub<FocusReceiver>;
  isFullscreen: () => Promise<boolean>;
  isFocused: () => Promise<boolean>;
  close: () => void;
  toggleMaximize: () => void;
  minimize: () => void;
}
