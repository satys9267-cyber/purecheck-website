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

  // Online if reported within last 25 seconds (ESP sends every 3-10s)
  const isOnline = diffSeconds <= 25;

  let statusText = 'Online';
  if (diffSeconds <= 5) {
    statusText = 'Live Heartbeat (just now)';
  } else if (diffSeconds <= 25) {
    statusText = `Online (${diffSeconds}s ago)`;
  } else if (diffSeconds <= 120) {
    statusText = `Stale signal (${diffSeconds}s ago)`;
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
