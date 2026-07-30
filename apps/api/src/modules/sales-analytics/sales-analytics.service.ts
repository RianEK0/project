import { Injectable } from '@nestjs/common';

export type SalesAnalyticsSnapshot = {
  orderCount: number;
  deliveredCount: number;
  invoicedCount: number;
  returnedCount: number;
  collectedAmount: number;
  invoicedAmount: number;
  openOrderValue: number;
  overdueReceivable: number;
};

export type SalesAnalyticsRiskSignal = 'HEALTHY' | 'WATCH' | 'AT_RISK';

export type SalesAnalyticsSummary = {
  fillRate: number;
  invoiceRate: number;
  returnRate: number;
  collectionRate: number;
  openOrderValue: number;
  overdueReceivable: number;
  riskSignal: SalesAnalyticsRiskSignal;
};

@Injectable()
export class SalesAnalyticsService {
  summarize(snapshot: SalesAnalyticsSnapshot): SalesAnalyticsSummary {
    const fillRate =
      snapshot.orderCount === 0
        ? 0
        : this.round((snapshot.deliveredCount / snapshot.orderCount) * 100);
    const invoiceRate =
      snapshot.orderCount === 0
        ? 0
        : this.round((snapshot.invoicedCount / snapshot.orderCount) * 100);
    const returnRate =
      snapshot.deliveredCount === 0
        ? 0
        : this.round((snapshot.returnedCount / snapshot.deliveredCount) * 100);
    const collectionRate =
      snapshot.invoicedAmount === 0
        ? 0
        : this.round((snapshot.collectedAmount / snapshot.invoicedAmount) * 100);

    return {
      fillRate,
      invoiceRate,
      returnRate,
      collectionRate,
      openOrderValue: this.round(snapshot.openOrderValue),
      overdueReceivable: this.round(snapshot.overdueReceivable),
      riskSignal: this.toRiskSignal(fillRate, collectionRate, snapshot.overdueReceivable),
    };
  }

  private toRiskSignal(
    fillRate: number,
    collectionRate: number,
    overdueReceivable: number,
  ): SalesAnalyticsRiskSignal {
    if (overdueReceivable > 0 && collectionRate < 80) {
      return 'AT_RISK';
    }
    if (overdueReceivable > 0 || fillRate < 85 || collectionRate < 90) {
      return 'WATCH';
    }

    return 'HEALTHY';
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
