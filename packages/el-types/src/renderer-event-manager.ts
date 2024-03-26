export type RendererEventReceiver = (...args: any[]) => void;

export interface RendererEventHub<T extends RendererEventReceiver> {
  addReceiver: (receiver: T) => number;
  removeReceiver: (receiverId: number) => void;
}
