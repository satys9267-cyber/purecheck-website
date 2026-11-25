'use client';

import React from 'react';
import { Droplet, Activity, Settings, Volume2, VolumeX, Radio, Terminal } from 'lucide-react';
import { DeviceState } from '@/types/telemetry';

interface NavbarProps {
  deviceState: DeviceState;
  deviceName: string;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onOpenSettings: () => void;
  onOpenFirmware: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  firebaseActive: boolean;
}

export function Navbar({
  deviceState,
  deviceName,
  isSimulating,
  onToggleSimulating,
  onOpenSettings,
  onOpenFirmware,
  audioEnabled,
  onToggleAudio,
  firebaseActive,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#23272F] bg-[#08090A]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Forge Studios Identity */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Architectural Brand Glyph */}
            <div className="relative flex items-center justify-center w-11 h-11 bg-[#121417] border border-[#23272F] rounded-lg group hover:border-[#E87200] transition-colors">
              <Droplet className="w-5 h-5 text-[#E87200] fill-[#E87200]/20" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#E87200]" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                  PURECHECK
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181B20] text-[#E87200] border border-[#E87200]/30 uppercase font-semibold">
                  SYS_V1.0
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#8E95A5] hidden md:block tracking-wider uppercase">
                &quot;Pure Water, Pure Life: Your Health in Every Drop.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Controls & Telemetry State */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Live NodeMCU Telemetry State Pill */}
          <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#121417] border border-[#23272F] text-xs font-mono">
            <span className="relative flex h-2 w-2">
              {deviceState.isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  deviceState.isOnline ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                }`}
              />
            </span>
            <span className="text-white/80 uppercase font-semibold">{deviceName}</span>
            <span className="text-[#8E95A5]">//</span>
            <span className={deviceState.isOnline ? 'text-[#10B981] font-bold uppercase' : 'text-[#EF4444] uppercase'}>
              {deviceState.statusText}
            </span>
          </div>

          {/* Mode Selector */}
          <button
            onClick={onToggleSimulating}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
              isSimulating
                ? 'bg-[#E87200]/15 text-[#FFA033] border-[#E87200]/50 shadow-forge-glow'
                : 'bg-[#121417] text-white/90 border-[#23272F] hover:border-[#E87200]'
            }`}
            title="Toggle between Live Hardware stream and Demo Simulation"
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-[#E87200] animate-pulse' : 'text-white/60'}`} />
            <span>{isSimulating ? '[ DEMO_MODE ]' : firebaseActive ? '[ FIREBASE_LIVE ]' : '[ SYNCING ]'}</span>
          </button>

          {/* Audio Chime Mute/Unmute */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-lg border transition-all ${
              audioEnabled
                ? 'bg-[#E87200]/20 border-[#E87200]/50 text-[#FFA033]'
                : 'bg-[#121417] border-[#23272F] text-[#8E95A5] hover:text-white hover:border-white/20'
            }`}
            title={audioEnabled ? 'Water quality audio alert: ENABLED' : 'Water quality audio alert: MUTED'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Firmware C++ Modal Button */}
          <button
            onClick={onOpenFirmware}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121417] border border-[#23272F] text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white hover:border-[#E87200] transition-all"
            title="ESP8266 NodeMCU Firmware Source"
          >
            <Terminal className="w-3.5 h-3.5 text-[#E87200]" />
            <span>Firmware</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#121417] border border-[#23272F] text-[#8E95A5] hover:text-white hover:border-[#E87200] transition-all"
            title="Configure Firebase Realtime Database"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
}
