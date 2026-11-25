'use client';

import React from 'react';
import { SIMULATION_PROFILES, SimulationProfile } from '@/lib/simulator';
import { FlaskConical, Play, Pause, Zap } from 'lucide-react';

interface SimulationBarProps {
  currentProfile: SimulationProfile;
  onSelectProfile: (profile: SimulationProfile) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onGeneratePulse: () => void;
}

export function SimulationBar({
  currentProfile,
  onSelectProfile,
  isPaused,
  onTogglePause,
  onGeneratePulse,
}: SimulationBarProps) {
  return (
    <div className="rounded-xl border border-[#E87200]/40 bg-[#121417] p-4 shadow-forge-glow mb-6 relative">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        
        {/* Left: Simulation Notice */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#181B20] border border-[#E87200]/40 text-[#E87200]">
            <FlaskConical className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-[#FFA033] uppercase tracking-wider">
                HARDWARE SIMULATOR ACTIVE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E87200] text-black uppercase font-bold">
                DEMO LAB
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#8E95A5] uppercase">
              SELECT BENCHMARK WATER PROFILE TO SIMULATE ESP8266 SENSOR OSCILLATIONS:
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={onTogglePause}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border uppercase font-semibold transition-all ${
              isPaused
                ? 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#181B20] border-[#23272F] text-white/80 hover:border-[#E87200]'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            onClick={onGeneratePulse}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#E87200] text-black font-bold uppercase transition-all hover:bg-[#FFA033]"
            title="Trigger an immediate instant reading"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>PING PULSE</span>
          </button>
        </div>
      </div>

      {/* Preset Profile Chips */}
      <div className="flex flex-wrap gap-2 pt-3 font-mono text-xs">
        {(Object.keys(SIMULATION_PROFILES) as SimulationProfile[]).map((key) => {
          const item = SIMULATION_PROFILES[key];
          const isSelected = currentProfile === key;
          return (
            <button
              key={key}
              onClick={() => onSelectProfile(key)}
              className={`px-3 py-1.5 rounded text-xs uppercase transition-all border ${
                isSelected
                  ? 'bg-[#E87200] text-black border-[#E87200] font-bold shadow-forge-glow'
                  : 'bg-[#08090A] text-[#8E95A5] border-[#23272F] hover:border-[#E87200] hover:text-white'
              }`}
            >
              <span>{item.name}</span>
              <span className="ml-1 opacity-75 font-mono">({item.baseTds}PPM)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
