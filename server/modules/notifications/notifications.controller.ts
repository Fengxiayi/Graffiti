import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { NotificationsService } from './notifications.service';
import type { NotificationListResponse } from '@shared/api.interface';

@Controller('api/notifications')
@NeedLogin()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: Request): Promise<NotificationListResponse> {
    const { userId } = req.userContext;
    return this.notificationsService.list(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    await this.notificationsService.markAsRead(userId, id);
    return { success: true };
  }

  @Post('read-all')
  async markAllAsRead(@Req() req: Request): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }
}
