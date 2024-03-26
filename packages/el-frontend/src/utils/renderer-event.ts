import { useEffect } from 'react';

import type { RendererEventHub, RendererEventReceiver } from '#types/renderer-event-manager';

export const useRendererEvent = <T extends RendererEventReceiver>(
  eventHubFactory: () => RendererEventHub<T>,
  receiver: T
) => {
  useEffect(() => {
    const eventHub = eventHubFactory();
    const receiverId = eventHub.addReceiver(receiver);
    return () => {
      eventHub.removeReceiver(receiverId);
    };
  }, []);
};
