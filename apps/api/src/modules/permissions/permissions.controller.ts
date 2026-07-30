import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { initialPermissions } from '@nova/shared-types';

import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Permissions')
@Controller({
  path: 'permissions',
  version: '1',
})
export class PermissionsController {
  @Public()
  @Get()
  listPermissions() {
    return {
      permissions: initialPermissions,
    };
  }
}

