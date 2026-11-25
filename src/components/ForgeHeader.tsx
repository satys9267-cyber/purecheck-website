'use client';

import React, { useState } from 'react';
import { Droplet, Settings, Menu, X, Terminal, Radio, Volume2, VolumeX } from 'lucide-react';
import { DeviceState } from '@/types/telemetry';

interface ForgeHeaderProps {
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

export function ForgeHeader({
  deviceState,
  deviceName,
  isSimulating,
  onToggleSimulating,
  onOpenSettings,
  onOpenFirmware,
  audioEnabled,
  onToggleAudio,
  firebaseActive,
}: ForgeHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#08090A]/95 border-b border-[#23272F] backdrop-blur-2xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Name of Web */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 bg-[#121417] border border-[#23272F] rounded group-hover:border-[#E87200] transition-colors">
              <Droplet className="w-5 h-5 text-[#E87200] fill-[#E87200]/20" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase group-hover:text-[#FFA033] transition-colors">
              PURECHECK
            </span>
          </a>

          {/* Right: Settings & Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#121417] border border-[#23272F] text-[#8E95A5] hover:text-white hover:border-[#E87200] transition-all text-xs font-mono uppercase"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-[#E87200]" />
              <span className="hidden sm:inline font-bold">Settings</span>
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#121417] border border-[#23272F] text-white hover:border-[#E87200] transition-all text-xs font-mono uppercase font-bold"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-4 h-4 text-[#E87200]" /> : <Menu className="w-4 h-4 text-white" />}
              <span className="hidden sm:inline">Menu</span>
            </button>

          </div>
        </div>
      </header>

      {/* Fullscreen Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#08090A]/98 backdrop-blur-3xl flex flex-col justify-between p-8 sm:p-16 animate-fadeIn">
          
          {/* Top Menu Bar */}
          <div className="flex items-center justify-between border-b border-[#23272F] pb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E87200]">
              NAVIGATION
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 rounded-full border border-[#23272F] flex items-center justify-center text-[#8E95A5] hover:text-white hover:border-[#E87200] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Typographic Links */}
          <div className="max-w-4xl mx-auto w-full py-8 space-y-4 sm:space-y-6">
            {[
              { num: '01', title: 'LIVE TELEMETRY', href: '#' },
              { num: '02', title: 'SERVICES & SENSORS', href: '#services' },
              { num: '03', title: 'BENCHMARK SOURCES', href: '#benchmarks' },
              { num: '04', title: 'OSCILLOSCOPE', href: '#oscilloscope' },
              { num: '05', title: 'HARDWARE SPECS', href: '#hardware' },
              { num: '06', title: 'DAILY HYDRATION', href: '#hydration' },
            ].map((item) => (
              <div key={item.num} className="group border-b border-[#23272F] pb-3">
                <a
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-baseline justify-between transition-transform duration-300 group-hover:translate-x-3"
                >
                  <div className="flex items-baseline space-x-4">
                    <span className="font-mono text-sm text-[#E87200] font-bold">[{item.num}]</span>
                    <span className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase group-hover:text-[#FFA033] transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#8E95A5] uppercase hidden sm:inline">EXPLORE →</span>
                </a>
              </div>
            ))}
          </div>

          {/* Quick Actions in Menu Drawer */}
          <div className="border-t border-[#23272F] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8E95A5] gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onToggleSimulating}
                className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#121417] border border-[#23272F] hover:border-[#E87200] text-white uppercase"
              >
                <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-[#E87200]' : 'text-slate-400'}`} />
                <span>{isSimulating ? 'DEMO SIMULATION' : 'FIREBASE LIVE'}</span>
              </button>

              <button
                onClick={onToggleAudio}
                className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#121417] border border-[#23272F] hover:border-[#E87200] text-white uppercase"
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#E87200]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>{audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenFirmware();
                }}
                className="text-[#E87200] hover:underline uppercase font-bold"
              >
                FIRMWARE SOURCE
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSettings();
                }}
                className="text-[#E87200] hover:underline uppercase font-bold"
              >
                FIREBASE SETTINGS
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
