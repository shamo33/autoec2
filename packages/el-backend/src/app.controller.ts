import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { AppService } from '#be/app.service';
import type { PostEventDto } from '#types/dto/event';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // WARNING:
  // このアプリ自体以外からのリクエストは想定しておらず、
  // 全体的にバリデーション・エラー処理は省略気味のため注意

  @Get('/has-config')
  async hasConfig() {
    return this.appService.hasConfig();
  }

  @Get('/events')
  async getEvents() {
    return await this.appService.getEvents();
  }

  @Post('/events')
  async postEvents(@Body() dto: PostEventDto) {
    return await this.appService.postEvent(dto);
  }

  @Delete('/events/:name')
  async deleteEvent(@Param('name') name: string) {
    return await this.appService.deleteEvent(name);
  }
}
