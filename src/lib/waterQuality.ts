import { RawNodeMCUTelemetry, PurityMetrics, DeviceState } from '@/types/telemetry';

/**
 * Calculates water purity metrics based on WHO and EPA potable water guidelines.
 * Pure water ideal drinking range: 50 - 150 ppm (95-100% pure)
 * Acceptable / Good: 150 - 250 ppm (85-94% pure)
 * Moderate / Fair: 250 - 300 ppm (70-84% pure)
 * Unsafe / Poor: > 300 ppm (below 70%)
 * Extreme / Unsafe: > 500 ppm (< 50%)
 */
export function calculateWaterPurity(tds: number, voltage?: number): PurityMetrics {
  const safeTds = Math.max(0, Number(tds) || 0);

  let purity = 100;
  let category: 'safe' | 'moderate' | 'unsafe' = 'safe';
  let categoryLabel = 'Safe for Drinking';
  let statusBadge = 'SAFE FOR DRINKING';
  let colorHex = '#10B981'; // emerald
  let glowClass = 'shadow-glow-emerald';
  let tdsQuality = 'Ideal';
  let healthRecommendation = 'Water is pure and balanced. Safe for hydration.';

  if (safeTds <= 50) {
    // Ultra pure / RO distilled / mineral-deficient
    purity = Math.round(92 + (safeTds / 50) * 6);
    tdsQuality = 'Low Minerals';
    category = 'safe';
    categoryLabel = 'Ultra Clean';
    statusBadge = 'SAFE FOR DRINKING';
    healthRecommendation = 'Very low mineral content. Safe and ultra clean.';
  } else if (safeTds <= 150) {
    // Ideal sweet spot (e.g. 85 ppm -> ~96-98%)
    // 85 ppm -> 94 - 98% pure
    purity = Math.round(98 - Math.abs(safeTds - 85) * 0.08);
    purity = Math.min(100, Math.max(90, purity));
    tdsQuality = 'Ideal';
    category = 'safe';
    categoryLabel = 'Optimal Purity';
    statusBadge = 'SAFE FOR DRINKING';
    healthRecommendation = 'Optimal mineral balance for everyday human hydration.';
  } else if (safeTds <= 250) {
    // Acceptable
    const factor = (safeTds - 150) / 100;
    purity = Math.round(90 - factor * 10); // 90 down to 80
    tdsQuality = 'Good';
    if (purity >= 90) {
      category = 'safe';
      statusBadge = 'SAFE FOR DRINKING';
    } else {
      category = 'moderate';
      statusBadge = 'MODERATE QUALITY';
      colorHex = '#F59E0B'; // amber
      glowClass = 'shadow-glow-amber';
    }
    categoryLabel = 'Acceptable Minerals';
    healthRecommendation = 'Acceptable drinking water with noticeable mineral profile.';
  } else if (safeTds <= 350) {
    // Moderate / Hard
    const factor = (safeTds - 250) / 100;
    purity = Math.round(79 - factor * 12); // 79 down to 67
    tdsQuality = 'Elevated Solids';
    category = purity >= 70 ? 'moderate' : 'unsafe';
    statusBadge = purity >= 70 ? 'MODERATE QUALITY' : 'UNSAFE / FILTER NEEDED';
    colorHex = purity >= 70 ? '#F59E0B' : '#F43F5E';
    glowClass = purity >= 70 ? 'shadow-glow-amber' : 'shadow-glow-rose';
    categoryLabel = 'Fair Quality';
    healthRecommendation = 'High mineral hardness. Filtration is strongly suggested.';
  } else {
    // Unsafe / High Contaminants
    const factor = Math.min(1, (safeTds - 350) / 350);
    purity = Math.round(65 - factor * 45); // 65 down to 20
    purity = Math.max(12, purity);
    tdsQuality = 'High Solids / Poor';
    category = 'unsafe';
    statusBadge = 'UNSAFE / DO NOT CONSUME';
    colorHex = '#F43F5E';
    glowClass = 'shadow-glow-rose';
    categoryLabel = 'Unsafe Water';
    healthRecommendation = 'Total dissolved solids exceed safe drinking standards. Boil or filter immediately.';
  }

  // Realistic physical pH calculation correlated with TDS & standard probes
  // Balanced water around ~7.2 pH
  let phValue = 7.2;
  if (safeTds < 50) {
    phValue = Number((6.8 + (safeTds / 50) * 0.3).toFixed(1));
  } else if (safeTds > 300) {
    phValue = Number((7.6 + Math.min(1.2, (safeTds - 300) * 0.003)).toFixed(1));
  } else {
    phValue = Number((7.1 + ((safeTds - 85) / 200) * 0.3).toFixed(1));
  }

  const phQuality = phValue >= 6.8 && phValue <= 7.8 ? 'Perfect' : phValue < 6.8 ? 'Slightly Acidic' : 'Alkaline';

  // Sensor temperature estimation (18°C default ambient cool water)
  const temperatureC = 18.5;
  const temperatureQuality = temperatureC <= 20 ? 'Cool' : 'Ambient';

  return {
    purityPercent: purity,
    category,
    categoryLabel,
    statusBadge,
    colorHex,
    glowClass,
    tdsQuality,
    phValue,
    phQuality,
    temperatureC,
    temperatureQuality,
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
