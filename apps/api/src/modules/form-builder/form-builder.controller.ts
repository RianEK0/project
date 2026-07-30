import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FormBuilderService } from './form-builder.service';

type FormBuilderPreviewBody = {
  name?: string;
  artifactType?: string;
  layoutMode?: string;
  fields?: Array<{
    id?: string;
    label?: string;
    type?: string;
    required?: boolean;
    section?: string;
  }>;
};

@ApiTags('Form Builder')
@Controller({
  path: 'form-builder',
  version: '1',
})
export class FormBuilderController {
  constructor(private readonly formBuilderService: FormBuilderService) {}

  @Get()
  getFoundation() {
    return this.formBuilderService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: FormBuilderPreviewBody) {
    return this.formBuilderService.preview(body);
  }
}
