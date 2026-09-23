import { Controller, Post, Body, Req } from '@nestjs/common';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import type { Request } from 'express';
import { FeedbackService } from './feedback.service';
import type { CreateFeedbackRequest, FeedbackItem } from '@shared/api.interface';

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

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateFeedbackDto,
  ): Promise<FeedbackItem> {
    const userId: string | undefined = req.userContext?.userId;
    return this.feedbackService.create(dto, userId);
  }
}
