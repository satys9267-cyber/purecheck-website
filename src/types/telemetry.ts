export interface RawNodeMCUTelemetry {
  deviceName: string;
  tds: number;
  voltage: number;
  ec: number;
  rssi: number;
  ip: string;
  lastSeen: number;
}

export type WaterQualityCategory = 'safe' | 'moderate' | 'unsafe';

export interface PurityMetrics {
  purityPercent: number;
  category: WaterQualityCategory;
  categoryLabel: string;
  statusBadge: string;
  colorHex: string;
  glowClass: string;
  tdsQuality: string;
  phValue: number;
  phQuality: string;
  temperatureC: number;
  temperatureQuality: string;
  healthRecommendation: string;
}

export interface TelemetryPoint {
  time: string;
  timestamp: number;
  tds: number;
  ec: number;
  voltage: number;
  purity: number;
}

export interface DeviceState {
  isOnline: boolean;
  statusText: string;
  signalStrength: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  signalBars: number;
}
