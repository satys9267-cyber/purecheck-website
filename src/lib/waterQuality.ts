import { RawNodeMCUTelemetry, PurityMetrics, DeviceState, MineralProfile, WaterHardness, AnomalyReport } from '@/types/telemetry';

/**
 * Calculates water purity metrics based on WHO and EPA potable water guidelines,
 * strictly deriving only physically calculable parameters from TDS (ppm) & EC (µS/cm).
 *
 * Parameters derived:
 * 1. Mineralisation / Taste Profile
 * 2. Filtration / RO Memory (kitni purified / purity %)
 * 3. Salinity (in ppt / freshwater index)
 * 4. Anomaly Detection (sensor state & contamination spikes)
 * 5. Water Hardness (Indirect CaCO3 equivalent in mg/L)
 * 6. Electrical Conductivity (EC in µS/cm)
 */
export function calculateWaterPurity(tds: number, voltage?: number, ec?: number): PurityMetrics {
  const safeTds = Math.max(0, Number(tds) || 0);

  // If no hardware connected, or TDS probe in air / 0 reading
  if (safeTds === 0 && (!voltage || voltage < 0.01)) {
    return {
      purityPercent: 0,
      category: 'unsafe',
      categoryLabel: 'Awaiting Hardware Signal',
      statusBadge: 'NO PROBE DATA (0 PPM)',
      colorHex: '#8E95A5',
      glowClass: '',
      tdsQuality: 'Standby / 0 ppm',
      mineralProfile: {
        rating: 'Standby',
        tasteNote: 'No Reading',
        description: 'Waiting for live telemetry from ESP8266 probe.',
      },
      roFiltrationMemory: {
        purifiedPercent: 0,
        membraneEfficiency: 'Standby',
      },
      salinity: {
        ppt: 0,
        category: 'Freshwater (0.00 ppt)',
      },
      anomaly: {
        status: 'DRY',
        label: 'Awaiting Water Sample',
        isWarning: false,
        colorHex: '#8E95A5',
      },
      hardness: {
        caco3Equivalent: 0,
        category: 'Soft',
        badgeColor: '#8E95A5',
      },
      ecValue: 0,
      healthRecommendation: 'Submerge TDS probe in water sample or connect ESP8266 to begin real-time analysis.',
    };
  }

  let purity = 100;
  let category: 'safe' | 'moderate' | 'unsafe' = 'safe';
  let categoryLabel = 'Safe for Drinking';
  let statusBadge = 'SAFE FOR DRINKING';
  let colorHex = '#10B981'; // emerald
  let glowClass = 'shadow-glow-emerald';
  let tdsQuality = 'Ideal';
  let healthRecommendation = 'Water is pure and balanced. Safe for hydration.';

  if (safeTds <= 50) {
    purity = Math.round(92 + (safeTds / 50) * 6);
    tdsQuality = 'Low Minerals';
    category = 'safe';
    categoryLabel = 'Ultra Clean';
    statusBadge = 'SAFE FOR DRINKING';
    healthRecommendation = 'Very low mineral content. Safe and ultra clean.';
  } else if (safeTds <= 150) {
    purity = Math.round(98 - Math.abs(safeTds - 85) * 0.08);
    purity = Math.min(100, Math.max(90, purity));
    tdsQuality = 'Ideal';
    category = 'safe';
    categoryLabel = 'Optimal Purity';
    statusBadge = 'SAFE FOR DRINKING';
    healthRecommendation = 'Optimal mineral balance for everyday human hydration.';
  } else if (safeTds <= 250) {
    const factor = (safeTds - 150) / 100;
    purity = Math.round(90 - factor * 10);
    tdsQuality = 'Good';
    if (purity >= 90) {
      category = 'safe';
      statusBadge = 'SAFE FOR DRINKING';
    } else {
      category = 'moderate';
      statusBadge = 'MODERATE QUALITY';
      colorHex = '#F59E0B';
      glowClass = 'shadow-glow-amber';
    }
    categoryLabel = 'Acceptable Minerals';
    healthRecommendation = 'Acceptable drinking water with noticeable mineral profile.';
  } else if (safeTds <= 350) {
    const factor = (safeTds - 250) / 100;
    purity = Math.round(79 - factor * 12);
    tdsQuality = 'Elevated Solids';
    category = purity >= 70 ? 'moderate' : 'unsafe';
    statusBadge = purity >= 70 ? 'MODERATE QUALITY' : 'UNSAFE / FILTER NEEDED';
    colorHex = purity >= 70 ? '#F59E0B' : '#F43F5E';
    glowClass = purity >= 70 ? 'shadow-glow-amber' : 'shadow-glow-rose';
    categoryLabel = 'Fair Quality';
    healthRecommendation = 'High mineral hardness. Filtration is strongly suggested.';
  } else {
    const factor = Math.min(1, (safeTds - 350) / 350);
    purity = Math.round(65 - factor * 45);
    purity = Math.max(12, purity);
    tdsQuality = 'High Solids / Poor';
    category = 'unsafe';
    statusBadge = 'UNSAFE / DO NOT CONSUME';
    colorHex = '#F43F5E';
    glowClass = 'shadow-glow-rose';
    categoryLabel = 'Unsafe Water';
    healthRecommendation = 'Total dissolved solids exceed safe drinking standards. Boil or filter immediately.';
  }

  // 1. Mineralisation / Taste Profile
  let mineralProfile: MineralProfile;
  if (safeTds < 50) {
    mineralProfile = {
      rating: 'Ultra Low',
      tasteNote: 'Crisp & Neutral',
      description: 'Demineralized baseline; typical of deep multistage reverse osmosis.',
    };
  } else if (safeTds <= 150) {
    mineralProfile = {
      rating: 'Optimal Sweet Spot',
      tasteNote: 'Refreshing & Crisp',
      description: 'Ideal ratio of essential electrolytes, producing a smooth, pleasant finish.',
    };
  } else if (safeTds <= 250) {
    mineralProfile = {
      rating: 'Balanced Mineral',
      tasteNote: 'Smooth & Round',
      description: 'Noticeable mineral presence, standard for natural mountain spring water.',
    };
  } else if (safeTds <= 400) {
    mineralProfile = {
      rating: 'High Mineral',
      tasteNote: 'Heavy & Dry',
      description: 'Elevated calcium and bicarbonate ions; slight mineral mouthfeel.',
    };
  } else {
    mineralProfile = {
      rating: 'Excessive',
      tasteNote: 'Chalky / Bitter',
      description: 'Excessive mineral concentrations impairing taste and potability.',
    };
  }

  // 2. Filtration / RO Memory (kitni purified / purity %)
  // Evaluates membrane rejection efficiency compared to typical raw feed (450 ppm)
  const rawBaseline = 450;
  const rejectionCalc = Math.round(Math.max(15, Math.min(99, ((rawBaseline - safeTds) / rawBaseline) * 100)));
  const membraneEfficiency =
    safeTds <= 150
      ? '98% Retention (Optimal)'
      : safeTds <= 250
      ? '88% Retention (Nominal)'
      : safeTds <= 350
      ? '72% Retention (Depleted)'
      : 'Bypass / Filter Expired';

  // 3. Salinity (derived from TDS: 1 ppt = 1,000 ppm)
  const salinityPpt = Number((safeTds * 0.001).toFixed(2));
  const salinityCategory =
    salinityPpt < 0.5
      ? 'Freshwater (<0.5 ppt)'
      : salinityPpt < 1.0
      ? 'Marginal (0.5–1.0 ppt)'
      : 'Brackish (>1.0 ppt)';

  // 4. Anomaly Detection
  let anomaly: AnomalyReport;
  if (safeTds < 2 && (voltage ?? 0) < 0.05) {
    anomaly = {
      status: 'DRY',
      label: 'Probe Air Gap / Dry',
      isWarning: true,
      colorHex: '#F59E0B',
    };
  } else if (safeTds > 400) {
    anomaly = {
      status: 'SPIKE',
      label: 'Contamination Spike',
      isWarning: true,
      colorHex: '#F43F5E',
    };
  } else if (safeTds > 260) {
    anomaly = {
      status: 'DRIFT',
      label: 'Slight Drift Detected',
      isWarning: false,
      colorHex: '#FFA033',
    };
  } else {
    anomaly = {
      status: 'STABLE',
      label: 'Nominal / Pure Flow',
      isWarning: false,
      colorHex: '#10B981',
    };
  }

  // 5. Water Hardness (Indirect CaCO3 calculation: ~0.65 x TDS)
  const caco3Equivalent = Math.round(safeTds * 0.65);
  let hardnessCategory: 'Soft' | 'Moderately Hard' | 'Hard' | 'Very Hard' = 'Soft';
  let hardnessBadge = '#10B981';

  if (caco3Equivalent <= 60) {
    hardnessCategory = 'Soft';
    hardnessBadge = '#10B981';
  } else if (caco3Equivalent <= 120) {
    hardnessCategory = 'Moderately Hard';
    hardnessBadge = '#38BDF8';
  } else if (caco3Equivalent <= 180) {
    hardnessCategory = 'Hard';
    hardnessBadge = '#F59E0B';
  } else {
    hardnessCategory = 'Very Hard';
    hardnessBadge = '#F43F5E';
  }

  // 6. Electrical Conductivity (EC in µS/cm)
  // Physically: EC ≈ TDS * 2.0 µS/cm
  const ecValue = ec && ec > 0 ? Math.round(ec) : Math.round(safeTds * 2.0);

  return {
    purityPercent: purity,
    category,
    categoryLabel,
    statusBadge,
    colorHex,
    glowClass,
    tdsQuality,
    mineralProfile,
    roFiltrationMemory: {
      purifiedPercent: rejectionCalc,
      membraneEfficiency,
    },
    salinity: {
      ppt: salinityPpt,
      category: salinityCategory,
    },
    anomaly,
    hardness: {
      caco3Equivalent,
      category: hardnessCategory,
      badgeColor: hardnessBadge,
    },
    ecValue,
    healthRecommendation,
  };
}

export function evaluateDeviceState(telemetry: RawNodeMCUTelemetry | null): DeviceState {
  if (!telemetry || !telemetry.lastSeen) {
    return {
      isOnline: false,
      statusText: 'No Data Received',
      signalStrength: 'Poor',
      signalBars: 0,
    };
  }

  const now = Date.now();
  const diffSeconds = Math.round((now - telemetry.lastSeen) / 1000);

  // Online if reported within last 15 seconds (ESP sends every 3s)
  const isOnline = diffSeconds <= 15;

  let statusText = 'Online';
  if (diffSeconds <= 4) {
    statusText = 'Live Heartbeat (just now)';
  } else if (diffSeconds <= 15) {
    statusText = `Online (${diffSeconds}s ago)`;
  } else if (diffSeconds <= 60) {
    statusText = `Signal Lost (${diffSeconds}s ago)`;
  } else {
    const mins = Math.round(diffSeconds / 60);
    statusText = `Offline (${mins} min ago)`;
  }

  // RSSI calculation (e.g. -58 dBm)
  let signalStrength: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  let signalBars = 2;

  if (telemetry.rssi >= -60) {
    signalStrength = 'Excellent';
    signalBars = 4;
  } else if (telemetry.rssi >= -70) {
    signalStrength = 'Good';
    signalBars = 3;
  } else if (telemetry.rssi >= -80) {
    signalStrength = 'Fair';
    signalBars = 2;
  } else {
    signalStrength = 'Poor';
    signalBars = 1;
  }

  return {
    isOnline,
    statusText,
    signalStrength,
    signalBars,
  };
}

export interface DerivedHydrochemistry {
  ecConversionFactor: number; // k = TDS / EC
  salinityPsu: number; // ppt / PSU
  hardnessMgL: number; // mg/L CaCO3
  hardnessGpg: number; // Grains Per Gallon
  hardnessClassification: string;
  resistivityKOhmCm: number; // kOhm*cm = 1000 / EC
  ionicStrengthMolL: number; // mol/L = 2.5e-5 * TDS
  osmoticPressureBar: number; // bar
  whoBisStatus: {
    compliant: boolean;
    tier: 'Desirable Potable (WHO)' | 'Acceptable (BIS IS 10500)' | 'Permissible Limit' | 'Non-Compliant / Unsafe';
    color: string;
    description: string;
  };
}

export function computeHydrochemicalDerivations(tds: number, ec?: number, tempC: number = 25.0): DerivedHydrochemistry {
  const safeTds = Math.max(0, Number(tds) || 0);
  const safeEc = ec && ec > 0 ? ec : (safeTds > 0 ? safeTds * 2.0 : 0);

  // 1. EC Conversion Factor k = TDS / EC
  const k = safeEc > 0 ? Number((safeTds / safeEc).toFixed(3)) : 0.500;

  // 2. Salinity (PSU / ppt)
  const salinityPsu = Number((safeTds * 0.001).toFixed(3));

  // 3. Water Hardness
  const hardnessMgL = Math.round(safeTds * 0.65);
  const hardnessGpg = Number((hardnessMgL / 17.1).toFixed(1));
  let hardnessClassification = 'Soft (<3.5 GPG)';
  if (hardnessGpg > 10.5) hardnessClassification = 'Very Hard (>10.5 GPG)';
  else if (hardnessGpg > 7.0) hardnessClassification = 'Hard (7.0–10.5 GPG)';
  else if (hardnessGpg > 3.5) hardnessClassification = 'Moderately Hard (3.5–7.0 GPG)';

  // 4. Electrical Resistivity (kOhm * cm)
  const resistivityKOhmCm = safeEc > 0 ? Number((1000.0 / safeEc).toFixed(2)) : 0;

  // 5. Ionic Strength (mol/L) - Russell approximation
  const ionicStrengthMolL = Number((2.5e-5 * safeTds).toFixed(5));

  // 6. Osmotic Pressure (bar) at tempC
  const kelvin = tempC + 273.15;
  const osmoticPressureBar = Number(((safeTds / 58440.0) * 0.08314 * kelvin * 1.8).toFixed(3));

  // 7. WHO / BIS IS 10500
  let tier: 'Desirable Potable (WHO)' | 'Acceptable (BIS IS 10500)' | 'Permissible Limit' | 'Non-Compliant / Unsafe' = 'Desirable Potable (WHO)';
  let compliant = true;
  let color = '#10B981';
  let description = 'Ideal mineralisation meeting WHO and BIS standards.';

  if (safeTds === 0) {
    tier = 'Desirable Potable (WHO)';
    compliant = true;
    color = '#8E95A5';
    description = 'No dissolved solids registered. Standby state.';
  } else if (safeTds < 50) {
    tier = 'Desirable Potable (WHO)';
    compliant = true;
    color = '#38BDF8';
    description = 'Ultra-low solids. Safe and potable, demineralized profile.';
  } else if (safeTds <= 150) {
    tier = 'Desirable Potable (WHO)';
    compliant = true;
    color = '#10B981';
    description = 'Sweet spot for human hydration and cellular absorption.';
  } else if (safeTds <= 500) {
    tier = 'Acceptable (BIS IS 10500)';
    compliant = true;
    color = '#10B981';
    description = 'Within BIS IS 10500 Acceptable Requirement Limit (500 ppm).';
  } else if (safeTds <= 2000) {
    tier = 'Permissible Limit';
    compliant = true;
    color = '#FFA033';
    description = 'Exceeds desirable threshold; within BIS Permissible Limit in absence of alternative source.';
  } else {
    tier = 'Non-Compliant / Unsafe';
    compliant = false;
    color = '#EF4444';
    description = 'Exceeds maximum permissible limit (2000 ppm). Unsafe for human consumption.';
  }

  return {
    ecConversionFactor: k,
    salinityPsu,
    hardnessMgL,
    hardnessGpg,
    hardnessClassification,
    resistivityKOhmCm,
    ionicStrengthMolL,
    osmoticPressureBar,
    whoBisStatus: {
      compliant,
      tier,
      color,
      description,
    },
  };
}
