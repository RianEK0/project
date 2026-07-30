import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { type AiVisionScanMode } from '@nova/shared-types';

import { AiVisionService } from './ai-vision.service';

type UploadedBinaryFile = {
  originalname?: string;
  mimetype?: string;
  size?: number;
};

@ApiTags('AI Vision')
@Controller({
  path: 'ai-vision',
  version: '1',
})
export class AiVisionController {
  constructor(private readonly aiVisionService: AiVisionService) {}

  @Get()
  getFoundation() {
    return this.aiVisionService.getFoundation();
  }

  @Post('scan')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  scan(@UploadedFile() file: UploadedBinaryFile, @Body('scanMode') scanMode?: AiVisionScanMode) {
    return this.aiVisionService.scan({
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      sizeBytes: file?.size,
      scanMode,
    });
  }
}
