import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';

import { ProjectsService } from './projects.service';
import type {
  ProjectItem,
  ProjectListResponse,
  CreateProjectRequest,
  MyProjectsResponse,
} from '@shared/api.interface';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize: number,
  ): Promise<ProjectListResponse> {
    return this.projectsService.list(page, pageSize);
  }

  @Get('mine')
  @NeedLogin()
  async getMyProjects(@Req() req: Request): Promise<MyProjectsResponse> {
    const { userId } = req.userContext;
    return this.projectsService.getMyProjects(userId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProjectItem> {
    return this.projectsService.getById(id);
  }

  @Post()
  @NeedLogin()
  async create(
    @Req() req: Request,
    @Body() dto: CreateProjectRequest,
  ): Promise<ProjectItem> {
    const { userId } = req.userContext;
    return this.projectsService.create(userId, dto);
  }
}
