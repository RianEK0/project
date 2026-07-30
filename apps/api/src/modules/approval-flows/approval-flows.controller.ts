import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApprovalRoutingService } from './approval-routing.service';

@ApiTags('Approval Flows')
@Controller({
  path: 'approval-flows',
  version: '1',
})
export class ApprovalFlowsController {
  constructor(private readonly approvalRoutingService: ApprovalRoutingService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      flowStatuses: this.approvalRoutingService.getFlowStatuses(),
      requestStatuses: this.approvalRoutingService.getRequestStatuses(),
      stepRoles: ['Department Manager', 'Finance Controller', 'COO', 'Procurement Head'],
      escalationPolicies: ['By amount threshold', 'By department', 'By timeout'],
    };
  }

  @Get('route-preview')
  getRoutePreview() {
    return this.approvalRoutingService.previewRoute({
      documentLabel: 'Purchase Request',
      amount: 125_000,
      requesterDepartment: 'OPERATIONS',
      steps: [
        { sequence: 1, approverRole: 'Department Manager', minAmount: 0, departmentScope: 'ANY' },
        {
          sequence: 2,
          approverRole: 'Finance Controller',
          minAmount: 50_000,
          departmentScope: 'ANY',
        },
        { sequence: 3, approverRole: 'COO', minAmount: 100_000, departmentScope: 'ANY' },
      ],
    });
  }
}
