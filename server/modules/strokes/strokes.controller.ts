import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { StrokesService } from './strokes.service';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';
import type {
  StrokeItem,
  StrokeListResponse,
  CreateStrokeRequest,
} from '../../../shared/api.interface';

@Controller('api/strokes')
export class StrokesController {
  constructor(private readonly strokesService: StrokesService) {}

  @Public()
  @Get(':projectId')
  async listByProject(
    @Param('projectId') projectId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ): Promise<StrokeListResponse> {
    return this.strokesService.listByProject(projectId, cursor, limit);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateStrokeRequest,
  ): Promise<StrokeItem> {
    return this.strokesService.create(user.userId, dto.projectId, dto.strokeData);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.strokesService.delete(user.userId, user.role, id);
    return { success: true };
  }
}
