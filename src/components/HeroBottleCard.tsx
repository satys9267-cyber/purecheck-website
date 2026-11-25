'use client';

import React, { useEffect, useRef } from 'react';
import { Droplet, Activity, Thermometer, ShieldCheck, AlertTriangle, AlertOctagon, Radio } from 'lucide-react';
import { RawNodeMCUTelemetry, PurityMetrics } from '@/types/telemetry';
import gsap from 'gsap';

interface HeroBottleCardProps {
  telemetry: RawNodeMCUTelemetry;
  metrics: PurityMetrics;
  isOnline: boolean;
}

export function HeroBottleCard({ telemetry, metrics, isOnline }: HeroBottleCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min(100, Math.max(0, metrics.purityPercent));

  useEffect(() => {
    if (scoreRef.current) {
      gsap.fromTo(
        scoreRef.current,
        { scale: 0.95, opacity: 0.8 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [metrics.purityPercent]);

  const renderStatusIcon = () => {
    switch (metrics.category) {
      case 'safe':
        return <ShieldCheck className="w-4 h-4 text-[#10B981]" />;
      case 'moderate':
        return <AlertTriangle className="w-4 h-4 text-[#FF7A00]" />;
      case 'unsafe':
        return <AlertOctagon className="w-4 h-4 text-[#EF4444]" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-[#23272F] bg-[#0E1013] p-6 sm:p-8 overflow-hidden shadow-forge-subtle"
    >
      {/* Atmospheric Glow */}
      <div
        className="absolute -top-32 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: metrics.category === 'safe' ? '#10B981' : '#E87200' }}
      />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#23272F] gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#181B20] border border-[#23272F] text-[#E87200]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white text-sm font-mono uppercase tracking-wider font-semibold">
              ACTIVE VESSEL PROBE
            </h3>
            <p className="text-[11px] font-mono text-[#8E95A5] uppercase">
              DEVICE: {telemetry.deviceName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#121417] border border-[#23272F] text-[11px] font-mono text-white/90 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-2 animate-ping" />
            LIVE HEARTBEAT
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
        
        {/* Left Column: Smart Bottle CAD (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-2">
          <div className="relative flex items-center justify-center w-full max-w-[280px] h-[340px]">
            <div
              className="absolute w-64 h-64 rounded-full border border-dashed border-[#23272F] animate-radar-sweep pointer-events-none"
              style={{ animationDuration: '30s' }}
            />

            <div className="relative z-10 flex items-center justify-center space-x-5">
              <div className="relative flex flex-col items-center group">
                <div className="w-11 h-7 bg-gradient-to-r from-[#2A2E35] via-[#484F5B] to-[#202328] rounded-t-sm shadow-md border-b border-[#E87200]/60 relative">
                  <div className="absolute top-1 inset-x-2 h-0.5 bg-white/20" />
                </div>
                
                <div
                  className="w-14 h-3 rounded-sm my-0.5 transition-all duration-700 shadow-lg relative"
                  style={{
                    backgroundColor: metrics.category === 'safe' ? '#10B981' : '#E87200',
                    boxShadow: `0 0 20px ${metrics.category === 'safe' ? '#10B981' : '#E87200'}80`,
                  }}
                >
                  <div className="absolute inset-x-0 top-0.5 h-0.5 bg-white/40" />
                </div>

                <div className="w-12 h-5 bg-gradient-to-r from-[#202328] via-[#353B45] to-[#1E2125] border-x border-[#23272F]" />

                <div className="relative w-22 h-56 rounded-b-xl overflow-hidden border border-[#2A2E38] bg-gradient-to-r from-[#171A1F] via-[#2D333D] to-[#14161A] shadow-2xl flex flex-col justify-between p-2.5">
                  <div className="z-10 flex flex-col items-center justify-center my-auto">
                    <span className="font-display text-[12px] font-black tracking-widest text-[#F4F5F7]/90 uppercase [writing-mode:vertical-rl] rotate-180 select-none">
                      PURECHECK
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E87200] mt-1.5 animate-pulse" />
                  </div>

                  <div className="absolute bottom-4 inset-x-2.5 h-20 rounded-lg overflow-hidden border border-[#23272F] bg-[#0A0C0E]/70 backdrop-blur-sm">
                    <div
                      className="absolute inset-x-0 bottom-0 transition-all duration-700 opacity-90"
                      style={{
                        height: `${Math.min(95, Math.max(35, percentage))}%`,
                        backgroundColor: metrics.category === 'safe' ? '#10B981' : '#E87200',
                        filter: `drop-shadow(0 -4px 10px ${metrics.category === 'safe' ? '#10B981' : '#E87200'}80)`,
                      }}
                    />
                  </div>

                  <div className="absolute bottom-0 inset-x-0 h-3 bg-[#111317] border-t border-[#23272F] flex items-center justify-center">
                    <span className="text-[7px] font-mono text-[#8E95A5] uppercase tracking-wider">A0 PROBE</span>
                  </div>
                </div>

                <div className="w-16 h-2 bg-[#E87200]/20 blur-sm rounded-full mt-1.5" />
              </div>

              {/* Companion App Mockup */}
              <div className="relative w-16 h-36 rounded-lg bg-[#050506] border-2 border-[#23272F] p-1 shadow-2xl flex flex-col items-center justify-between">
                <div className="w-4 h-0.5 bg-[#23272F] rounded-full mt-0.5" />
                <div className="w-full flex-1 rounded bg-[#0A0C0E] flex flex-col items-center justify-center p-1 border border-[#23272F]">
                  <Droplet className="w-4 h-4 text-[#E87200] animate-pulse" />
                  <span className="text-[8px] font-mono text-[#E87200] font-bold mt-1 uppercase">SYNC</span>
                  <span className="text-[6px] font-mono text-[#8E95A5] uppercase">NODE_01</span>
                </div>
                <div className="w-5 h-0.5 bg-[#23272F] rounded-full mb-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Water Quality Score (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
          <div className="flex items-baseline justify-center lg:justify-start space-x-3">
            <span
              ref={scoreRef}
              className="font-display text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight uppercase leading-none transition-colors duration-700"
              style={{
                color: metrics.category === 'safe' ? '#F4F5F7' : metrics.category === 'moderate' ? '#FFA033' : '#EF4444',
              }}
            >
              {metrics.purityPercent}%
            </span>
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#E87200] uppercase tracking-wider">
              PURE
            </span>
          </div>

          <div
            className="inline-flex items-center space-x-2.5 px-4 py-2 rounded border text-xs sm:text-sm font-mono font-bold uppercase tracking-wider shadow-md transition-all duration-500"
            style={{
              backgroundColor: metrics.category === 'safe' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(232, 114, 0, 0.12)',
              borderColor: metrics.category === 'safe' ? '#10B981' : '#E87200',
              color: metrics.category === 'safe' ? '#10B981' : '#FFA033',
            }}
          >
            {renderStatusIcon()}
            <span>{metrics.statusBadge}</span>
          </div>

          <div className="w-full max-w-md pt-2 space-y-2.5">
            <div className="relative h-4 w-full bg-[#121417] border border-[#23272F] p-0.5 rounded overflow-visible">
              <div className="h-full w-full flex overflow-hidden rounded-sm">
                <div className="w-[70%] h-full bg-[#EF4444] opacity-80" />
                <div className="w-[20%] h-full bg-[#E87200] opacity-85" />
                <div className="w-[10%] h-full bg-[#10B981] opacity-95" />
              </div>

              <div
                ref={needleRef}
                className="absolute -top-3.5 transition-all duration-700 ease-out flex flex-col items-center pointer-events-none -translate-x-1/2 z-20"
                style={{ left: `${percentage}%` }}
              >
                <div className="px-1.5 py-0.5 rounded bg-white text-black font-mono font-black text-[9px] shadow-lg">
                  {metrics.purityPercent}%
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 text-center text-[10px] font-mono text-[#8E95A5] pt-0.5">
              <div className="border-r border-[#23272F] pr-1">
                <span className="text-[#EF4444] font-bold block">&lt; 70%</span>
                <span className="text-[9px] uppercase">UNSAFE</span>
              </div>
              <div className="border-r border-[#23272F] px-1">
                <span className="text-[#FFA033] font-bold block">70–89%</span>
                <span className="text-[9px] uppercase">MODERATE</span>
              </div>
              <div className="pl-1">
                <span className="text-[#10B981] font-bold block">90–100%</span>
                <span className="text-[9px] uppercase">SAFE POTABLE</span>
              </div>
            </div>

            <p className="text-xs font-mono text-[#8E95A5] pt-1 uppercase tracking-wide leading-relaxed">
              {metrics.healthRecommendation}
            </p>
          </div>
        </div>

        {/* Right Column: Calculated Readings Tiles (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-3 w-full">
          <div className="forge-panel-interactive p-4 rounded-xl flex items-center justify-between border border-[#23272F]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded bg-[#181B20] text-[#E87200] border border-[#23272F]">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8E95A5] block">TDS CONCENTRATION</span>
                <div className="text-xl font-mono font-bold text-white flex items-baseline space-x-1">
                  <span>{telemetry.tds}</span>
                  <span className="text-xs text-[#8E95A5]">ppm</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#181B20] text-[#FFA033] border border-[#23272F]">
              {metrics.tdsQuality}
            </span>
          </div>

          <div className="forge-panel-interactive p-4 rounded-xl flex items-center justify-between border border-[#23272F]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded bg-[#181B20] text-[#10B981] border border-[#23272F]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8E95A5] block">ACIDITY / ALKALINITY</span>
                <div className="text-xl font-mono font-bold text-white flex items-baseline space-x-1">
                  <span>{metrics.phValue}</span>
                  <span className="text-xs text-[#8E95A5]">pH</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#181B20] text-[#10B981] border border-[#23272F]">
              {metrics.phQuality}
            </span>
          </div>

          <div className="forge-panel-interactive p-4 rounded-xl flex items-center justify-between border border-[#23272F]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded bg-[#181B20] text-blue-400 border border-[#23272F]">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8E95A5] block">CORE TEMPERATURE</span>
                <div className="text-xl font-mono font-bold text-white flex items-baseline space-x-1">
                  <span>{metrics.temperatureC}</span>
                  <span className="text-xs text-[#8E95A5]">°C</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#181B20] text-blue-400 border border-[#23272F]">
              {metrics.temperatureQuality}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
