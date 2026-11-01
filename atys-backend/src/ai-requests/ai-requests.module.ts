import { Module } from '@nestjs/common';
import { AiRequestsController } from './ai-requests.controller.js';
import { AiRequestsService } from './ai-requests.service.js';

@Module({
  controllers: [AiRequestsController],
  providers: [AiRequestsService],
})
export class AiRequestsModule {}
