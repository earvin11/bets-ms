import { Controller, Get } from '@nestjs/common';
import { envs } from './config/envs';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): Record<string, string> {
    return {
      message: `${envs.seqWorkSpace.toLocaleUpperCase().trim()} OK`,
    };
  }
}
