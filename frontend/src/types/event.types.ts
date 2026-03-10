// event.types.ts
export interface ViolationEvent {
  id: string;
  plateNumber: string;
  violationType: string;
  location: string;
  speed: number;
  severity: 'Low' | 'Medium' | 'High';
  fine: number;
  isRepeatOffender: boolean;
  imageUrl: string;
  plateImageUrl: string;
  riskScore: number;
  timestamp: string;
  paid: boolean;
}

export interface EventSummary {
  totalViolations: number;
  helmetViolations: number;
  wrongSideDriving: number;
  overspeeding: number;
  repeatOffenders: number;
}
