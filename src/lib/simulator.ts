import { RawNodeMCUTelemetry } from '@/types/telemetry';

export type SimulationProfile = 'spring' | 'filtered' | 'tap' | 'hard' | 'unsafe';

export interface ProfileConfig {
  name: string;
  label: string;
  baseTds: number;
  baseVoltage: number;
  baseEc: number;
  description: string;
}

export const SIMULATION_PROFILES: Record<SimulationProfile, ProfileConfig> = {
  spring: {
    name: 'Mountain Spring',
    label: 'Natural Alpine Spring (Pristine 96% Purity)',
    baseTds: 85.0,
    baseVoltage: 0.42,
    baseEc: 170.0,
    description: 'Matches the exact reading shown on PureCheck smart bottle reference screen.',
  },
  filtered: {
    name: 'RO Filtered',
    label: 'Multi-Stage Reverse Osmosis (124.5 ppm)',
    baseTds: 124.5,
    baseVoltage: 0.62,
    baseEc: 249.0,
    description: 'Matches the exact default ESP8266 telemetry schema.',
  },
  tap: {
    name: 'City Tap Water',
    label: 'Standard Municipal Tap Water (210 ppm)',
    baseTds: 210.0,
    baseVoltage: 0.95,
    baseEc: 420.0,
    description: 'Treated city supply with acceptable mineral trace.',
  },
  hard: {
    name: 'Hard Mineral Water',
    label: 'High Mineral / Well Source (295 ppm)',
    baseTds: 295.0,
    baseVoltage: 1.35,
    baseEc: 590.0,
    description: 'Moderate water purity, heavy calcium/magnesium content.',
  },
  unsafe: {
    name: 'Contaminated Source',
    label: 'Contaminated / Unfiltered Stream (560 ppm)',
    baseTds: 560.0,
    baseVoltage: 2.15,
    baseEc: 1120.0,
    description: 'Dangerous levels of dissolved solids, filter alarm triggered!',
  },
};

/**
 * Creates a simulated telemetry packet with slight natural analog fluctuations
 */
export function generateSimulatedTelemetry(profile: SimulationProfile = 'spring'): RawNodeMCUTelemetry {
  const cfg = SIMULATION_PROFILES[profile] || SIMULATION_PROFILES.spring;
  
  // Natural sensor jitter (+/- 2.5%)
  const jitterFactor = 1 + (Math.random() - 0.5) * 0.05;
  const tds = Number((cfg.baseTds * jitterFactor).toFixed(1));
  const voltage = Number((cfg.baseVoltage * jitterFactor).toFixed(2));
  const ec = Number((cfg.baseEc * jitterFactor).toFixed(1));

  // Wi-Fi signal jitter (-55 to -63 dBm)
  const rssi = Math.floor(-55 - Math.random() * 8);

  return {
    deviceName: 'PureCheck-NodeMCU-01',
    tds,
    voltage,
    ec,
    rssi,
    ip: '192.168.1.142',
    lastSeen: Date.now(),
  };
}
