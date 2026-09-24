import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';
import type { NotificationListResponse } from '../../../shared/api.interface';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser): Promise<NotificationListResponse> {
    return this.notificationsService.list(user.userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.markAsRead(user.userId, id);
    return { success: true };
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: AuthUser): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(user.userId);
    return { success: true };
  }
}
