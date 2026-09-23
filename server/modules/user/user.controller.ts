import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';

@Controller('api/user')
export class UserController {
  @Get('me')
  @NeedLogin()
  async getMe(@Req() req: Request) {
    const { userId, userName, userNameI18n } = req.userContext;
    return {
      userId,
      userName,
      userNameI18n,
    };
  }
}
