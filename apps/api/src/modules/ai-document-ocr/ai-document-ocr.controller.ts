import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { type AiOcrDocumentType } from '@nova/shared-types';

import { AiDocumentOcrService } from './ai-document-ocr.service';

type UploadedBinaryFile = {
  originalname?: string;
  mimetype?: string;
  size?: number;
};

@ApiTags('AI Document OCR')
@Controller({
  path: 'ai-document-ocr',
  version: '1',
})
export class AiDocumentOcrController {
  constructor(private readonly aiDocumentOcrService: AiDocumentOcrService) {}

  @Get()
  getFoundation() {
    return this.aiDocumentOcrService.getFoundation();
  }

  @Post('extract')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  extract(
    @UploadedFile() file: UploadedBinaryFile,
    @Body('documentType') documentType?: AiOcrDocumentType,
  ) {
    return this.aiDocumentOcrService.extract({
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      sizeBytes: file?.size,
      documentType,
    });
  }
}
