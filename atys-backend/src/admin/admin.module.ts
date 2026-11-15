import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminGuard],
})
export class AdminModule {}
