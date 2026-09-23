import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { GalleryService } from './gallery.service';
import type {
  GalleryItem,
  GalleryListResponse,
  CreateGalleryRequest,
  GalleryCommentListResponse,
  CreateGalleryCommentRequest,
} from '@shared/api.interface';

@Controller('api/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async list(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<GalleryListResponse> {
    const pageNum: number = page ? parseInt(page, 10) : 1;
    const pageSizeNum: number = pageSize ? parseInt(pageSize, 10) : 12;
    const currentUserId: string | undefined = req.userContext?.userId;
    return this.galleryService.list(pageNum, pageSizeNum, currentUserId);
  }

  @Get('mine')
  @NeedLogin()
  async getMine(@Req() req: Request): Promise<{ items: GalleryItem[] }> {
    const { userId } = req.userContext;
    const items: GalleryItem[] = await this.galleryService.getMine(userId);
    return { items };
  }

  @Get(':id')
  async getById(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<GalleryItem> {
    const currentUserId: string | undefined = req.userContext?.userId;
    return this.galleryService.getById(id, currentUserId);
  }

  @Post()
  @NeedLogin()
  async create(
    @Req() req: Request,
    @Body() dto: CreateGalleryRequest,
  ): Promise<GalleryItem> {
    const { userId } = req.userContext;
    return this.galleryService.create(userId, dto);
  }

  @Post(':id/like')
  @NeedLogin()
  async toggleLike(
    @Req() req: Request,
    @Param('id') galleryId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const { userId } = req.userContext;
    return this.galleryService.toggleLike(userId, galleryId);
  }

  @Get(':id/comments')
  async listComments(
    @Param('id') galleryId: string,
  ): Promise<GalleryCommentListResponse> {
    return this.galleryService.listComments(galleryId);
  }

  @Post('comments')
  @NeedLogin()
  async createComment(
    @Req() req: Request,
    @Body() dto: CreateGalleryCommentRequest,
  ): Promise<{ id: string; galleryId: string; content: string; replyTo: string | null; creatorId: string; createdAt: string }> {
    const { userId } = req.userContext;
    return this.galleryService.createComment(userId, dto);
  }

  @Delete('comments/:id')
  @NeedLogin()
  async deleteComment(
    @Req() req: Request,
    @Param('id') commentId: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    await this.galleryService.deleteComment(userId, commentId);
    return { success: true };
  }
}
