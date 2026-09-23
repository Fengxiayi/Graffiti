import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PlatformModule } from '@lark-apaas/fullstack-nestjs-core';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ViewModule } from './modules/view/view.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { StrokesModule } from './modules/strokes/strokes.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    PlatformModule.forRoot(),
    // ====== @route-section: business-modules START ======
    ProjectsModule,
    StrokesModule,
    GalleryModule,
    NotificationsModule,
    FeedbackModule,
    AdminModule,
    UserModule,
    // ====== @route-section: business-modules END ======

    // ⚠️ @route-order: last
    // ViewModule is the fallback route module, must be registered last.
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
