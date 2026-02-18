// analytics.types.ts
export interface ViolationDistribution {
  type: string;
  count: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface LocationAnalysis {
  location: string;
  count: number;
}
