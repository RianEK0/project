import { HttpStatus, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type StorageLocationNode = {
  id: string;
  code: string;
  parentId: string | null;
};

@Injectable()
export class StorageLocationTreeService {
  buildPath(nodes: readonly StorageLocationNode[], targetId: string): string {
    const lineage = this.getLineage(nodes, targetId);

    return lineage.map((node) => node.code).join('/');
  }

  assertNoCircularReference(
    nodes: readonly StorageLocationNode[],
    nodeId: string,
    nextParentId: string | null,
  ): void {
    if (!nextParentId) {
      return;
    }

    const byId = new Map(nodes.map((node) => [node.id, node]));
    let currentId: string | null = nextParentId;

    while (currentId) {
      if (currentId === nodeId) {
        throw new AppException(
          ERROR_CODES.STORAGE_LOCATION_CIRCULAR_REFERENCE,
          'Storage location cannot be assigned into its own descendant.',
          HttpStatus.CONFLICT,
        );
      }

      currentId = byId.get(currentId)?.parentId ?? null;
    }
  }

  getDepth(nodes: readonly StorageLocationNode[], targetId: string): number {
    return this.getLineage(nodes, targetId).length - 1;
  }

  private getLineage(
    nodes: readonly StorageLocationNode[],
    targetId: string,
  ): StorageLocationNode[] {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const lineage: StorageLocationNode[] = [];
    let currentId: string | null = targetId;

    while (currentId) {
      const current = byId.get(currentId);

      if (!current) {
        throw new AppException(
          ERROR_CODES.STORAGE_LOCATION_NOT_FOUND,
          `Storage location ${targetId} was not found in the provided hierarchy.`,
          HttpStatus.NOT_FOUND,
        );
      }

      lineage.unshift(current);
      currentId = current.parentId;
    }

    return lineage;
  }
}
