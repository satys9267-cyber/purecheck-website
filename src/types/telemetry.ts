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

export interface MineralProfile {
  rating: string;
  tasteNote: string;
  description: string;
}

export interface WaterHardness {
  caco3Equivalent: number; // in mg/L or ppm CaCO3
  category: 'Soft' | 'Moderately Hard' | 'Hard' | 'Very Hard';
  badgeColor: string;
}

export interface AnomalyReport {
  status: 'STABLE' | 'DRIFT' | 'SPIKE' | 'DRY';
  label: string;
  isWarning: boolean;
  colorHex: string;
}

export interface PurityMetrics {
  purityPercent: number; // Filtration / RO Memory purity %
  category: WaterQualityCategory;
  categoryLabel: string;
  statusBadge: string;
  colorHex: string;
  glowClass: string;
  tdsQuality: string;
  
  // Physically derivable parameters from TDS & EC telemetry
  mineralProfile: MineralProfile;
  roFiltrationMemory: {
    purifiedPercent: number;
    membraneEfficiency: string;
  };
  salinity: {
    ppt: number;
    category: string;
  };
  anomaly: AnomalyReport;
  hardness: WaterHardness;
  ecValue: number; // in µS/cm
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
