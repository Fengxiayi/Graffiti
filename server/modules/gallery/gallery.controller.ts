import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { GalleryService } from './gallery.service';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';
import type {
  GalleryItem,
  GalleryListResponse,
  CreateGalleryRequest,
  GalleryCommentListResponse,
  CreateGalleryCommentRequest,
} from '../../../shared/api.interface';

@Controller('api/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Public()
  @Get()
  async list(
    @CurrentUser() user: AuthUser | undefined,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<GalleryListResponse> {
    const pageNum: number = page ? parseInt(page, 10) : 1;
    const pageSizeNum: number = pageSize ? parseInt(pageSize, 10) : 12;
    return this.galleryService.list(pageNum, pageSizeNum, user?.userId);
  }

  @Get('mine')
  async getMine(@CurrentUser() user: AuthUser): Promise<{ items: GalleryItem[] }> {
    const items: GalleryItem[] = await this.galleryService.getMine(user.userId);
    return { items };
  }

  @Public()
  @Get(':id')
  async getById(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id') id: string,
  ): Promise<GalleryItem> {
    return this.galleryService.getById(id, user?.userId);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateGalleryRequest,
  ): Promise<GalleryItem> {
    return this.galleryService.create(user.userId, dto);
  }

  @Post(':id/like')
  async toggleLike(
    @CurrentUser() user: AuthUser,
    @Param('id') galleryId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    return this.galleryService.toggleLike(user.userId, galleryId);
  }

  @Public()
  @Get(':id/comments')
  async listComments(
    @Param('id') galleryId: string,
  ): Promise<GalleryCommentListResponse> {
    return this.galleryService.listComments(galleryId);
  }

  @Post('comments')
  async createComment(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateGalleryCommentRequest,
  ): Promise<{
    id: string;
    galleryId: string;
    content: string;
    replyTo: string | null;
    creatorId: string;
    createdAt: string;
  }> {
    return this.galleryService.createComment(user.userId, dto);
  }

  @Delete('comments/:id')
  async deleteComment(
    @CurrentUser() user: AuthUser,
    @Param('id') commentId: string,
  ): Promise<{ success: boolean }> {
    await this.galleryService.deleteComment(user.userId, user.role, commentId);
    return { success: true };
  }
}
