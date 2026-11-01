import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AiRequestsModule } from './ai-requests/ai-requests.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AiRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
