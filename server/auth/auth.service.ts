import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, count } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { AppDatabase } from '../database/database.module';
import { users } from '../database/schema';
import type { JwtPayload } from './guards/jwt-auth.guard';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserInfo,
} from '../../shared/api.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: AppDatabase,
    private readonly jwtService: JwtService,
  ) {}

  private mapUser(row: typeof users.$inferSelect): UserInfo {
    return {
      userId: row.id,
      userName: row.username,
      nickname: row.nickname,
      role: row.role === 'admin' ? 'admin' : 'user',
    };
  }

  private signToken(user: UserInfo): string {
    const payload: JwtPayload = {
      sub: user.userId,
      username: user.userName,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private isConfiguredAdmin(username: string): boolean {
    const admins = (process.env.ADMIN_USERNAME || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return admins.includes(username);
  }

  async register(dto: RegisterRequest): Promise<AuthResponse> {
    const username = dto.username.trim();
    if (username.length < 2 || username.length > 50) {
      throw new ConflictException('账号长度需在 2-50 个字符之间');
    }
    if (dto.password.length < 6) {
      throw new ConflictException('密码至少 6 位');
    }

    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (existing.length > 0) {
      throw new ConflictException('该账号已被注册');
    }

    // 角色判定：配置的管理员账号，或系统首个注册用户
    const [{ total }] = await this.db.select({ total: count() }).from(users);
    const role: 'user' | 'admin' =
      this.isConfiguredAdmin(username) || total === 0 ? 'admin' : 'user';

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const [inserted] = await this.db
      .insert(users)
      .values({
        username,
        password: passwordHash,
        nickname: dto.nickname?.trim() || null,
        role,
      })
      .returning();

    const user = this.mapUser(inserted);
    return { token: this.signToken(user), user };
  }

  async login(dto: LoginRequest): Promise<AuthResponse> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, dto.username.trim()))
      .limit(1);

    if (!row) {
      throw new UnauthorizedException('账号或密码错误');
    }
    const matched = await bcrypt.compare(dto.password, row.password);
    if (!matched) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const user = this.mapUser(row);
    return { token: this.signToken(user), user };
  }

  async me(userId: string): Promise<UserInfo> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.mapUser(row);
  }
}
