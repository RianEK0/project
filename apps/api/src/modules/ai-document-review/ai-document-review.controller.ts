import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { type AiDocumentReviewType } from '@nova/shared-types';

import { AiDocumentReviewService } from './ai-document-review.service';

type UploadedBinaryFile = {
  originalname?: string;
  mimetype?: string;
  size?: number;
};

@ApiTags('AI Document Review')
@Controller({
  path: 'ai-document-review',
  version: '1',
})
export class AiDocumentReviewController {
  constructor(private readonly aiDocumentReviewService: AiDocumentReviewService) {}

  @Get()
  getFoundation() {
    return this.aiDocumentReviewService.getFoundation();
  }

  @Post('analyze')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  analyze(
    @UploadedFile() file: UploadedBinaryFile,
    @Body('documentType') documentType?: AiDocumentReviewType,
  ) {
    return this.aiDocumentReviewService.analyze({
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      sizeBytes: file?.size,
      documentType,
    });
  }
}
