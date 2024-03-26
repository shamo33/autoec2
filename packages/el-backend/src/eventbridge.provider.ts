import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { fromIni } from '@aws-sdk/credential-providers';
import { Inject, Injectable } from '@nestjs/common';

import { ConfigProvider } from '#be/config.provider';

@Injectable()
export class EventBridgeProvider {
  private static instance?: EventBridgeClient;

  constructor(@Inject(ConfigProvider) private readonly conf: ConfigProvider) {}

  get INSTANCE() {
    if (!EventBridgeProvider.instance) {
      if (!this.conf.INSTANCE) return;

      const credentials = fromIni({ profile: this.conf.INSTANCE.aws.profile });
      EventBridgeProvider.instance = new EventBridgeClient({
        region: this.conf.INSTANCE.aws.region,
        credentials,
      });
    }

    return EventBridgeProvider.instance!;
  }
}
