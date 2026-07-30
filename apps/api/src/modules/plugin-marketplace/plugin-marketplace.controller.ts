import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PluginMarketplaceService } from './plugin-marketplace.service';

type PluginMarketplacePreviewBody = {
  marketplaceName?: string;
  installScope?: string;
  plugins?: Array<{
    id?: string;
    label?: string;
    vertical?: string;
    packageType?: string;
  }>;
};

@ApiTags('Plugin Marketplace')
@Controller({
  path: 'plugin-marketplace',
  version: '1',
})
export class PluginMarketplaceController {
  constructor(private readonly pluginMarketplaceService: PluginMarketplaceService) {}

  @Get()
  getFoundation() {
    return this.pluginMarketplaceService.getFoundation();
  }

  @Post('install-preview')
  preview(@Body() body: PluginMarketplacePreviewBody) {
    return this.pluginMarketplaceService.preview(body);
  }
}
