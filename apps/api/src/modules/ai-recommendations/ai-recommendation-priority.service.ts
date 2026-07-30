import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiRecommendationPriorities,
  aiRequestStatuses,
  type AiRecommendationPriority,
  type AiRequestStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type RecommendationCandidate = {
  title: string;
  impactScore: number;
  urgencyScore: number;
  confidenceScore: number;
};

export type RecommendationPriorityPreview = {
  title: string;
  weightedScore: number;
  priority: AiRecommendationPriority;
  ranking: number;
};

@Injectable()
export class AiRecommendationPriorityService {
  getStatuses(): AiRequestStatus[] {
    return [...aiRequestStatuses];
  }

  getPriorities(): AiRecommendationPriority[] {
    return [...aiRecommendationPriorities];
  }

  rank(items: RecommendationCandidate[]): RecommendationPriorityPreview[] {
    items.forEach((item) => this.assertScoreRange(item));

    return [...items]
      .map((item) => ({
        title: item.title,
        weightedScore: Number(
          (item.impactScore * 0.5 + item.urgencyScore * 0.3 + item.confidenceScore * 0.2).toFixed(
            2,
          ),
        ),
      }))
      .sort((left, right) => right.weightedScore - left.weightedScore)
      .map((item, index) => ({
        title: item.title,
        weightedScore: item.weightedScore,
        priority: this.scoreToPriority(item.weightedScore),
        ranking: index + 1,
      }));
  }

  private assertScoreRange(item: RecommendationCandidate): void {
    const scores = [item.impactScore, item.urgencyScore, item.confidenceScore];

    if (scores.some((score) => score < 0 || score > 100)) {
      throw new AppException(
        ERROR_CODES.AI_RECOMMENDATION_SCORE_INVALID,
        `Recommendation scores for "${item.title}" must stay within 0-100.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private scoreToPriority(weightedScore: number): AiRecommendationPriority {
    if (weightedScore >= 85) {
      return 'CRITICAL';
    }

    if (weightedScore >= 70) {
      return 'HIGH';
    }

    if (weightedScore >= 50) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
