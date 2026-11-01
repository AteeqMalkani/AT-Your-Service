import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiRequestsService } from './ai-requests.service.js';
import { PrepareRequestDto, PrepareRequestDtoSchema } from './dto/prepare-request.dto.js';
import { ContinueRequestDto, ContinueRequestDtoSchema } from './dto/continue-request.dto.js';
import { LaunchRequestDto, LaunchRequestDtoSchema } from './dto/launch-request.dto.js';

@Controller('ai-requests')
export class AiRequestsController {
  constructor(private readonly aiRequestsService: AiRequestsService) {}

  @Post('prepare')
  async prepare(@Body() body: any) {
    const result = PrepareRequestDtoSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException('Invalid input for prepare request');
    }
    return this.aiRequestsService.prepareRequest(result.data);
  }

  @Post('continue')
  async continue(@Body() body: any) {
    const result = ContinueRequestDtoSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException('Invalid input for continue request');
    }
    return this.aiRequestsService.continueRequest(result.data);
  }

  @Post('launch')
  async launch(@Body() body: any) {
    const result = LaunchRequestDtoSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException('Invalid input for launch request');
    }
    return this.aiRequestsService.launchRequest(result.data);
  }
}
