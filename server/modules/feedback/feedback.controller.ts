import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsOptional, MaxLength } from 'class-validator';

import { FeedbackService } from './feedback.service';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';
import type { CreateFeedbackRequest, FeedbackItem } from '../../../shared/api.interface';

class CreateFeedbackDto implements CreateFeedbackRequest {
  @IsString()
  @MaxLength(2000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contact?: string;
}

@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Public()
  @Post()
  async create(
    @CurrentUser() user: AuthUser | undefined,
    @Body() dto: CreateFeedbackDto,
  ): Promise<FeedbackItem> {
    return this.feedbackService.create(dto, user?.userId);
  }
}
