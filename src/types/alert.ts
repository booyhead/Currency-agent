export type AlertCondition = 'ABOVE_OR_EQUAL' | 'BELOW_OR_EQUAL';

export interface PriceAlert {
  id: string;
  currencyCode: string;
  targetRate: number; // in MAD
  condition: AlertCondition;
  createdAt: string;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  currentRateAtTrigger?: number;
}
