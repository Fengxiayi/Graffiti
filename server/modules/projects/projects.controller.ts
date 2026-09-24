import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';
import type {
  ProjectItem,
  ProjectListResponse,
  CreateProjectRequest,
  MyProjectsResponse,
} from '../../../shared/api.interface';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize: number,
  ): Promise<ProjectListResponse> {
    return this.projectsService.list(page, pageSize);
  }

  @Get('mine')
  async getMyProjects(@CurrentUser() user: AuthUser): Promise<MyProjectsResponse> {
    return this.projectsService.getMyProjects(user.userId);
  }

  @Public()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProjectItem> {
    return this.projectsService.getById(id);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProjectRequest,
  ): Promise<ProjectItem> {
    return this.projectsService.create(user.userId, dto);
  }
}
