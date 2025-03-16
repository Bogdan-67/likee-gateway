import { Body, Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/video/info')
  async getVideoInfo(@Param('url') url: string) {
    return await this.appService.getVideoInfo(url);
  }
}
