'use client';

import React, { useState } from 'react';
import { RawNodeMCUTelemetry, DeviceState } from '@/types/telemetry';
import { computeHydrochemicalDerivations } from '@/lib/waterQuality';
import { Droplet, Zap, Thermometer, Sliders, Activity, ShieldCheck, AlertTriangle, Info, Sparkles, Scale, RefreshCw } from 'lucide-react';

interface ForgeFolioProps {
  telemetry: RawNodeMCUTelemetry;
  deviceState: DeviceState;
  history: { tds: number; ec: number; time: string }[];
  onManualOverride?: (tds: number, ec: number) => void;
}

export function ForgeFolio({ telemetry, deviceState, history, onManualOverride }: ForgeFolioProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualTds, setManualTds] = useState(telemetry.tds || 85);
  const [manualTemp, setManualTemp] = useState(25.0);

  // Active values depending on manual override vs live hardware telemetry
  const activeTds = manualMode ? manualTds : telemetry.tds;
  const activeTemp = manualMode ? manualTemp : 25.0; // standard reference temperature
  const activeEc = manualMode ? manualTds * 2.0 : telemetry.ec;

  // Temperature compensation calculation: EC_25 = EC_T / (1 + 0.02 * (T - 25))
  const tempCoeff = 1.0 + 0.02 * (activeTemp - 25.0);
  const compensatedTds = Number((activeTds / tempCoeff).toFixed(1));

  // Compute hydrochemical derivations
  const derived = computeHydrochemicalDerivations(compensatedTds, activeEc, activeTemp);

  // Radial gauge helper (SVG arc)
  const renderRadialGauge = (value: number, max: number, color: string, unit: string, label: string) => {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(1, Math.max(0, value / max));
    const strokeDashoffset = circumference - progress * (circumference * 0.75); // 270 degree arc

    return (
      <div className="flex flex-col items-center justify-center relative p-3">
        <svg className="w-28 h-28 transform -rotate-135" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#181B20"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Active Progress */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-2">
          <span className="font-mono text-xl font-black text-white">{value}</span>
          <span className="text-[9px] font-mono text-[#8E95A5] uppercase tracking-wider">{unit}</span>
        </div>

        <span className="text-[10px] font-mono text-[#8E95A5] uppercase tracking-widest mt-1 font-semibold">
          {label}
        </span>
      </div>
    );
  };

  // Sparkline generator from rolling history buffer
  const renderSparkline = (dataPoints: number[], color: string, height = 36) => {
    if (!dataPoints || dataPoints.length < 2) {
      return (
        <div className="h-9 w-full flex items-center justify-center text-[10px] font-mono text-[#8E95A5] border border-dashed border-[#23272F] rounded">
          STREAMING BUFFER STANDBY
        </div>
      );
    }

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints) || 1;
    const range = max - min || 1;
    const width = 160;

    const points = dataPoints
      .map((val, idx) => {
        const x = (idx / (dataPoints.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-9 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {/* Glowing pulse dot at latest point */}
        {dataPoints.length > 0 && (
          <circle
            cx={width}
            cy={height - ((dataPoints[dataPoints.length - 1] - min) / range) * (height - 6) - 3}
            r="3"
            fill={color}
            className="animate-ping opacity-75"
          />
        )}
      </svg>
    );
  };

  const tdsHistory = history.map((h) => h.tds);
  const ecHistory = history.map((h) => h.ec);

  return (
    <section id="featured-profile" className="w-full bg-[#08090A] border-b border-[#23272F] py-16 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Section Heading & Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-8 border-b border-[#23272F] gap-6">
          <div>
            <div className="flex items-center space-x-2 text-[#E87200] font-mono text-xs uppercase tracking-widest mb-2 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>HYDROCHEMICAL BENCHMARK SUITE</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-none">
              FEATURED PROFILE
            </h2>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <button
              onClick={() => {
                setManualMode(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border uppercase font-bold transition-all ${
                !manualMode
                  ? 'bg-[#E87200] text-black border-[#E87200] shadow-forge-glow'
                  : 'bg-[#121417] text-[#8E95A5] border-[#23272F] hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>LIVE ESP8266 STREAM</span>
              {deviceState.isOnline && (
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                setManualMode(true);
                setManualTds(telemetry.tds > 0 ? telemetry.tds : 124.5);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border uppercase font-bold transition-all ${
                manualMode
                  ? 'bg-[#E87200] text-black border-[#E87200] shadow-forge-glow'
                  : 'bg-[#121417] text-[#8E95A5] border-[#23272F] hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>MANUAL OVERRIDE CONTROLS</span>
            </button>
          </div>
        </div>

        {/* ================================================================================= */}
        {/* SECTION 1: REAL-TIME SENSOR TELEMETRY                                             */}
        {/* ================================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#23272F]">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-[#181B20] text-[#E87200] font-mono text-xs font-bold border border-[#23272F]">
                SECTION 01
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider">
                REAL-TIME SENSOR TELEMETRY
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8E95A5] uppercase hidden sm:inline-block">
              {manualMode ? 'MANUAL CALIBRATION ACTIVE' : deviceState.statusText}
            </span>
          </div>

          {/* Manual Override Sliders Bar (visible when Manual Override is toggled) */}
          {manualMode && (
            <div className="p-4 rounded-xl bg-[#121417] border border-[#E87200]/40 space-y-4 shadow-lg">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#FFA033] font-bold uppercase flex items-center space-x-2">
                  <Sliders className="w-4 h-4" />
                  <span>INTERACTIVE HYDRO-SIMULATION CONTROLS</span>
                </span>
                <span className="text-[#8E95A5] text-[11px]">ADJUST SLIDERS TO RE-CALCULATE ALL PARAMETERS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 font-mono">
                {/* TDS Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#8E95A5]">
                    <span>TDS INPUT:</span>
                    <span className="text-white font-bold">{manualTds} ppm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="5"
                    value={manualTds}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setManualTds(val);
                      if (onManualOverride) onManualOverride(val, val * 2.0);
                    }}
                    className="w-full accent-[#E87200] bg-[#181B20] h-1.5 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8E95A5]">
                    <span>0 ppm (Ultra Clean)</span>
                    <span>500 ppm (BIS Limit)</span>
                    <span>1000 ppm (Saline)</span>
                  </div>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#8E95A5]">
                    <span>WATER TEMPERATURE:</span>
                    <span className="text-white font-bold">{manualTemp.toFixed(1)}°C (Ref: 25°C)</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="0.5"
                    value={manualTemp}
                    onChange={(e) => setManualTemp(Number(e.target.value))}
                    className="w-full accent-[#38BDF8] bg-[#181B20] h-1.5 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8E95A5]">
                    <span>5°C (Chilled)</span>
                    <span>25°C (Standard Ref)</span>
                    <span>45°C (Warm)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Three Primary Telemetry Cards: TDS, EC, Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: TDS */}
            <div className="forge-panel-interactive p-6 rounded-2xl border border-[#23272F] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#E87200]">
                  <Droplet className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">TOTAL DISSOLVED SOLIDS</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#181B20] text-[#FFA033] border border-[#23272F]">
                  10-BIT ADC A0
                </span>
              </div>

              {renderRadialGauge(compensatedTds, 1000, '#E87200', 'ppm', 'TDS CONCENTRATION')}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8E95A5]">
                  <span>LIVE BUFFER SPARKLINE</span>
                  <span>{history.length} SAMPLES</span>
                </div>
                {renderSparkline(tdsHistory, '#E87200')}
              </div>
            </div>

            {/* Card 2: Electrical Conductivity */}
            <div className="forge-panel-interactive p-6 rounded-2xl border border-[#23272F] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#10B981]">
                  <Zap className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">ELECTRICAL CONDUCTIVITY</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#181B20] text-[#10B981] border border-[#23272F]">
                  IONIC MOBILITY
                </span>
              </div>

              {renderRadialGauge(activeEc, 2000, '#10B981', 'µS/cm', 'ELECTRICAL CONDUCTIVITY')}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8E95A5]">
                  <span>EC WAVEFORM STREAM</span>
                  <span>RATE: 1HZ</span>
                </div>
                {renderSparkline(ecHistory, '#10B981')}
              </div>
            </div>

            {/* Card 3: Water Temperature */}
            <div className="forge-panel-interactive p-6 rounded-2xl border border-[#23272F] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#38BDF8]">
                  <Thermometer className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">TEMPERATURE &amp; COMPENSATION</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#181B20] text-[#38BDF8] border border-[#23272F]">
                  25°C REF
                </span>
              </div>

              {renderRadialGauge(activeTemp, 50, '#38BDF8', '°C', 'COMPENSATED CORE TEMP')}

              <div className="p-3 rounded-lg bg-[#121417] border border-[#23272F] text-[11px] font-mono text-[#8E95A5] space-y-1">
                <div className="flex justify-between">
                  <span>TEMP COEFFICIENT (β):</span>
                  <span className="text-white font-bold">{tempCoeff.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ALGORITHM:</span>
                  <span className="text-[#38BDF8]">TDS_25 = TDS / (1 + 0.02·ΔT)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================================= */}
        {/* SECTION 2: TDS-DERIVED HYDROCHEMICAL CALCULATIONS                                 */}
        {/* ================================================================================= */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#23272F]">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-[#181B20] text-[#10B981] font-mono text-xs font-bold border border-[#23272F]">
                SECTION 02
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider">
                TDS-DERIVED CALCULATIONS &amp; WATER CHEMISTRY
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8E95A5] uppercase hidden sm:inline-block">
              WHO &amp; BIS IS 10500 COMPLIANT FORMULAS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. EC Conversion Factor (k) */}
            <div className="forge-panel-interactive p-5 rounded-xl border border-[#23272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">1. EC CONVERSION FACTOR (k)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B20] text-[#E87200] border border-[#23272F]">
                  ION MATRIX
                </span>
              </div>
              <div className="text-2xl font-mono font-black text-white flex items-baseline space-x-2">
                <span>{derived.ecConversionFactor}</span>
                <span className="text-xs font-mono text-[#8E95A5]">ppm / (µS/cm)</span>
              </div>
              <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono">
                <span className="text-[#8E95A5] block text-[10px] uppercase">FORMULA:</span>
                <code className="text-[#FFA033]">k = TDS / EC (Standard: 0.50–0.70)</code>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A5] leading-relaxed">
                Represents the specific ionisation coefficient of dissolved mineral species in solution.
              </p>
            </div>

            {/* 2. Salinity (PSU / ppt) */}
            <div className="forge-panel-interactive p-5 rounded-xl border border-[#23272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">2. SALINITY LEVEL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B20] text-cyan-400 border border-[#23272F]">
                  PSU INDEX
                </span>
              </div>
              <div className="text-2xl font-mono font-black text-white flex items-baseline space-x-2">
                <span>{derived.salinityPsu}</span>
                <span className="text-xs font-mono text-[#8E95A5]">ppt / PSU</span>
              </div>
              <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono">
                <span className="text-[#8E95A5] block text-[10px] uppercase">FORMULA:</span>
                <code className="text-cyan-400">Salinity (ppt) = TDS × 0.001</code>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A5] leading-relaxed">
                Freshwater potable range is strictly &lt; 0.5 ppt. Measured according to Practical Salinity Units.
              </p>
            </div>

            {/* 3. Water Hardness (CaCO3 & GPG) */}
            <div className="forge-panel-interactive p-5 rounded-xl border border-[#23272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">3. WATER HARDNESS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B20] text-blue-400 border border-[#23272F]">
                  {derived.hardnessClassification}
                </span>
              </div>
              <div className="flex items-baseline space-x-4">
                <div className="text-2xl font-mono font-black text-white">
                  {derived.hardnessMgL} <span className="text-xs text-[#8E95A5]">mg/L CaCO₃</span>
                </div>
                <div className="text-lg font-mono font-bold text-blue-400">
                  {derived.hardnessGpg} <span className="text-xs text-[#8E95A5]">GPG</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono">
                <span className="text-[#8E95A5] block text-[10px] uppercase">FORMULA:</span>
                <code className="text-blue-400">CaCO₃ = TDS × 0.65 | GPG = mg/L / 17.1</code>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A5] leading-relaxed">
                Quantifies dissolved polyvalent metallic cations (calcium and magnesium salts).
              </p>
            </div>

            {/* 4. Electrical Resistivity (kΩ·cm) */}
            <div className="forge-panel-interactive p-5 rounded-xl border border-[#23272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">4. ELECTRICAL RESISTIVITY</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B20] text-[#10B981] border border-[#23272F]">
                  IMPEDANCE
                </span>
              </div>
              <div className="text-2xl font-mono font-black text-white flex items-baseline space-x-2">
                <span>{derived.resistivityKOhmCm}</span>
                <span className="text-xs font-mono text-[#8E95A5]">kΩ·cm</span>
              </div>
              <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono">
                <span className="text-[#8E95A5] block text-[10px] uppercase">FORMULA:</span>
                <code className="text-[#10B981]">ρ = 1,000 / EC (Inverse of Conductance)</code>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A5] leading-relaxed">
                Ultra-pure demineralized water approaches 18.2 MΩ·cm. Lower values indicate higher mineral ionic density.
              </p>
            </div>

            {/* 5. Ionic Strength (mol/L) */}
            <div className="forge-panel-interactive p-5 rounded-xl border border-[#23272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">5. IONIC STRENGTH (I)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B20] text-purple-400 border border-[#23272F]">
                  RUSSELL APPROX
                </span>
              </div>
              <div className="text-2xl font-mono font-black text-white flex items-baseline space-x-2">
                <span>{derived.ionicStrengthMolL}</span>
                <span className="text-xs font-mono text-[#8E95A5]">mol/L</span>
              </div>
              <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono">
                <span className="text-[#8E95A5] block text-[10px] uppercase">FORMULA:</span>
                <code className="text-purple-400">I ≈ 2.5 × 10⁻⁵ × TDS (mol/L)</code>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A5] leading-relaxed">
                Hydrochemical measure of the total electrical field generated by ions in aqueous solution.
              </p>
            </div>

            {/* 6. Osmotic Pressure (bar) */}
            <div className="forge-panel-interactive p-5 rounded-xl border border-[#23272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">6. OSMOTIC PRESSURE (Π)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B20] text-amber-400 border border-[#23272F]">
                  MEMBRANE PSI
                </span>
              </div>
              <div className="text-2xl font-mono font-black text-white flex items-baseline space-x-2">
                <span>{derived.osmoticPressureBar}</span>
                <span className="text-xs font-mono text-[#8E95A5]">bar</span>
              </div>
              <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono">
                <span className="text-[#8E95A5] block text-[10px] uppercase">FORMULA:</span>
                <code className="text-amber-400">Π = (TDS / M) · R · T · i (van &apos;t Hoff)</code>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A5] leading-relaxed">
                Theoretical thermodynamic back-pressure required for reverse osmosis filtration across semi-permeable membranes.
              </p>
            </div>

          </div>

          {/* 7. Overall Purity & Potability Standard (WHO / BIS IS 10500 Banner) */}
          <div className="p-6 rounded-2xl bg-[#121417] border border-[#23272F] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  7. POTABILITY &amp; PURITY ACCORD: WHO / BIS IS 10500:2012
                </span>
              </div>
              <p className="text-xs font-mono text-[#8E95A5] leading-relaxed max-w-2xl">
                {derived.whoBisStatus.description} Indian Standard Drinking Water Specification requires acceptable limit of &le; 500 ppm, with permissible limit extended to 2,000 ppm in absence of an alternative source.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end font-mono">
              <span
                className="text-sm font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider"
                style={{
                  backgroundColor: `${derived.whoBisStatus.color}15`,
                  borderColor: derived.whoBisStatus.color,
                  color: derived.whoBisStatus.color,
                }}
              >
                {derived.whoBisStatus.tier}
              </span>
              <span className="text-[10px] text-[#8E95A5] mt-1.5">
                STATUS: {derived.whoBisStatus.compliant ? 'COMPLIANT POTABLE' : 'NON-POTABLE'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
