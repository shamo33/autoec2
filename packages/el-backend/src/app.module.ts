import { Module } from '@nestjs/common';

import { AppController } from '#be/app.controller';
import { AppService } from '#be/app.service';
import { ConfigProvider } from '#be/config.provider';
import { EventBridgeProvider } from '#be/eventbridge.provider';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ConfigProvider, EventBridgeProvider],
})
export class AppModule {}
