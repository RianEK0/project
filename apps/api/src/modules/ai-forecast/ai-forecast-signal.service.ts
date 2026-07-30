import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiForecastHorizons,
  aiModelModes,
  aiRequestStatuses,
  type AiForecastHorizon,
  type AiModelMode,
  type AiRequestStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type ForecastInput = {
  metric: string;
  horizon: AiForecastHorizon;
  history: number[];
};

export type ForecastSignalPreview = {
  metric: string;
  horizon: AiForecastHorizon;
  baseline: number;
  projectedValue: number;
  averageDelta: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  confidence: 'MEDIUM' | 'HIGH';
};

@Injectable()
export class AiForecastSignalService {
  getStatuses(): AiRequestStatus[] {
    return [...aiRequestStatuses];
  }

  getHorizons(): AiForecastHorizon[] {
    return [...aiForecastHorizons];
  }

  getModelModes(): AiModelMode[] {
    return [...aiModelModes];
  }

  previewForecast(input: ForecastInput): ForecastSignalPreview {
    if (input.history.length < 3) {
      throw new AppException(
        ERROR_CODES.AI_FORECAST_HISTORY_TOO_SHORT,
        'AI forecast preview requires at least three history points.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const deltas = input.history.slice(1).map((value, index) => {
      const previousValue = input.history[index] ?? value;

      return value - previousValue;
    });
    const averageDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
    const baseline = input.history[input.history.length - 1] ?? 0;
    const projectedValue = Math.max(
      baseline + averageDelta * this.getHorizonMultiplier(input.horizon),
      0,
    );

    return {
      metric: input.metric,
      horizon: input.horizon,
      baseline,
      projectedValue: Number(projectedValue.toFixed(2)),
      averageDelta: Number(averageDelta.toFixed(2)),
      trend: averageDelta > 0 ? 'UP' : averageDelta < 0 ? 'DOWN' : 'FLAT',
      confidence: input.history.length >= 6 ? 'HIGH' : 'MEDIUM',
    };
  }

  private getHorizonMultiplier(horizon: AiForecastHorizon): number {
    switch (horizon) {
      case '7_DAYS':
        return 1;
      case '30_DAYS':
        return 2;
      case '90_DAYS':
        return 3;
      case '12_MONTHS':
        return 4;
    }
  }
}
