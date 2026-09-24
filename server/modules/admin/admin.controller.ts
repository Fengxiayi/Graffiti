import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { AdminService } from './admin.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import type {
  AdminProjectListResponse,
  AdminFeedbackListResponse,
  GalleryListResponse,
  UpdateFeedbackStatusRequest,
} from '../../../shared/api.interface';

class SetHiddenDto {
  @IsBoolean()
  @Type(() => Boolean)
  isHidden!: boolean;
}

class SetPinnedDto {
  @IsBoolean()
  @Type(() => Boolean)
  isPinned!: boolean;
}

class UpdateFeedbackStatusDto implements UpdateFeedbackStatusRequest {
  @IsString()
  @IsIn(['pending', 'processing', 'completed'])
  status!: string;
}

@UseGuards(AdminGuard)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Projects ────────────────────────────────────────────────

  @Get('projects')
  async listProjects(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize: number,
  ): Promise<AdminProjectListResponse> {
    return this.adminService.listProjects(page, pageSize);
  }

  @Patch('projects/:id/hidden')
  async setProjectHidden(
    @Param('id') id: string,
    @Body() dto: SetHiddenDto,
  ): Promise<void> {
    return this.adminService.setProjectHidden(id, dto.isHidden);
  }

  @Patch('projects/:id/pinned')
  async setProjectPinned(
    @Param('id') id: string,
    @Body() dto: SetPinnedDto,
  ): Promise<void> {
    return this.adminService.setProjectPinned(id, dto.isPinned);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteProject(id);
  }

  // ─── Gallery ─────────────────────────────────────────────────

  @Get('gallery')
  async listGallery(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize: number,
  ): Promise<GalleryListResponse> {
    return this.adminService.listGallery(page, pageSize);
  }

  @Patch('gallery/:id/pinned')
  async setGalleryPinned(
    @Param('id') id: string,
    @Body() dto: SetPinnedDto,
  ): Promise<void> {
    return this.adminService.setGalleryPinned(id, dto.isPinned);
  }

  @Delete('gallery/:id')
  async deleteGalleryItem(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteGalleryItem(id);
  }

  @Delete('gallery/comments/:id')
  async deleteGalleryComment(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteGalleryComment(id);
  }

  // ─── Feedbacks ───────────────────────────────────────────────

  @Get('feedbacks')
  async listFeedbacks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize: number,
  ): Promise<AdminFeedbackListResponse> {
    return this.adminService.listFeedbacks(page, pageSize);
  }

  @Patch('feedbacks/:id/status')
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackStatusDto,
  ): Promise<void> {
    return this.adminService.updateFeedbackStatus(id, dto.status);
  }
}
