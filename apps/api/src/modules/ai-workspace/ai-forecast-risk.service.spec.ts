import { describe, expect, it } from 'vitest';

import { AiForecastRiskService } from './ai-forecast-risk.service';

describe('AiForecastRiskService', () => {
  const service = new AiForecastRiskService();

  it('marks forecast and risk capabilities as ready when coverage is strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      forecastCoveragePct: 92,
      anomalyCoveragePct: 89,
      financeSignalCoveragePct: 90,
      capabilities: [
        {
          key: 'DEMAND_FORECASTING',
          label: 'Demand Forecasting',
          readinessPct: 91,
          modelReady: true,
          routeCount: 3,
          primaryUseCase: 'Demand trend planning for purchasing and production',
          nextFocus: 'Expand scenario templates by product family.',
        },
        {
          key: 'FRAUD_DETECTION',
          label: 'Fraud Detection',
          readinessPct: 89,
          modelReady: true,
          routeCount: 2,
          primaryUseCase: 'Detect unusual payment, approval, or exception patterns',
          nextFocus: 'Add investigator workflows and suppression rules.',
        },
        {
          key: 'CASH_FLOW_PREDICTION',
          label: 'Cash Flow Prediction',
          readinessPct: 90,
          modelReady: true,
          routeCount: 3,
          primaryUseCase: 'Forecast liquidity pressure and collection timing',
          nextFocus: 'Expand receivable aging scenario handling.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a forecast capability when the model is not ready', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      forecastCoveragePct: 48,
      anomalyCoveragePct: 45,
      financeSignalCoveragePct: 52,
      capabilities: [
        {
          key: 'FRAUD_DETECTION',
          label: 'Fraud Detection',
          readinessPct: 72,
          modelReady: false,
          routeCount: 2,
          primaryUseCase: 'Surface suspicious financial and approval behavior',
          nextFocus: 'Complete labeled-signal review policy.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
