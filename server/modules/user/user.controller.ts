import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';

@Controller('api/user')
export class UserController {
  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return {
      userId: user.userId,
      userName: user.username,
      role: user.role,
    };
  }
}
