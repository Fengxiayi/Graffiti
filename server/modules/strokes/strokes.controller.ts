import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';

import { StrokesService } from './strokes.service';
import type {
  StrokeItem,
  StrokeListResponse,
  CreateStrokeRequest,
} from '@shared/api.interface';

@Controller('api/strokes')
export class StrokesController {
  constructor(private readonly strokesService: StrokesService) {}

  @Get(':projectId')
  async listByProject(
    @Param('projectId') projectId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ): Promise<StrokeListResponse> {
    return this.strokesService.listByProject(projectId, cursor, limit);
  }

  @Post()
  @NeedLogin()
  async create(
    @Req() req: Request,
    @Body() dto: CreateStrokeRequest,
  ): Promise<StrokeItem> {
    const { userId } = req.userContext;
    return this.strokesService.create(userId, dto.projectId, dto.strokeData);
  }

  @Delete(':id')
  @NeedLogin()
  async delete(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('isAdmin') isAdmin?: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    await this.strokesService.delete(userId, id, isAdmin === 'true');
    return { success: true };
  }
}
