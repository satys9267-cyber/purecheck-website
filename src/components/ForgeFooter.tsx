'use client';

import React from 'react';
import { ArrowUpRight, Droplet, Terminal, Database } from 'lucide-react';

interface ForgeFooterProps {
  onOpenFirmware: () => void;
  onOpenSettings: () => void;
}

export function ForgeFooter({ onOpenFirmware, onOpenSettings }: ForgeFooterProps) {
  return (
    <footer className="w-full bg-[#050506] border-t border-[#23272F] pt-20 pb-12 text-[#8E95A5]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* Massive Typographic Callout */}
        <div className="pb-16 border-b border-[#23272F]">
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[0.9] max-w-5xl mb-8">
            FORGING HEALTHIER LIVES THROUGH UNCOMPROMISING WATER PURITY.
          </h2>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-6 py-3.5 rounded bg-[#E87200] text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#FFA033] transition-all shadow-forge-glow active:scale-95"
            >
              <Database className="w-4 h-4" />
              <span>CONFIGURE FIREBASE RTDB</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenFirmware}
              className="flex items-center space-x-2 px-6 py-3.5 rounded bg-[#121417] border border-[#23272F] text-white font-mono font-bold text-xs uppercase tracking-wider hover:border-[#E87200] hover:text-[#FFA033] transition-all active:scale-95"
            >
              <Terminal className="w-4 h-4 text-[#E87200]" />
              <span>VIEW ESP8266 FIRMWARE SOURCE</span>
            </button>
          </div>
        </div>

        {/* Technical Specs & Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-b border-[#23272F] text-xs font-mono">
          
          <div>
            <span className="text-white uppercase font-bold tracking-widest block mb-3">
              ARCHITECTURE
            </span>
            <ul className="space-y-1.5 uppercase">
              <li>ESP8266EX Core @ 80MHz</li>
              <li>10-Bit Successive Approximation ADC</li>
              <li>Analog Pinout: A0 Single-Ended</li>
              <li>Operating Voltage: 3.3V System</li>
            </ul>
          </div>

          <div>
            <span className="text-white uppercase font-bold tracking-widest block mb-3">
              PROTOCOL
            </span>
            <ul className="space-y-1.5 uppercase">
              <li>Firebase Realtime Database</li>
              <li>Path: /devices/nodemcu_01</li>
              <li>JSON Payload Serialization</li>
              <li>Sub-Second WebSocket Polling</li>
            </ul>
          </div>

          <div>
            <span className="text-white uppercase font-bold tracking-widest block mb-3">
              STANDARDS
            </span>
            <ul className="space-y-1.5 uppercase">
              <li>World Health Organization (WHO)</li>
              <li>EPA Potability Guidelines</li>
              <li>NIST Traceable TDS Calibration</li>
              <li>Food-Grade 316 Stainless Steel</li>
            </ul>
          </div>

          <div>
            <span className="text-white uppercase font-bold tracking-widest block mb-3">
              NAVIGATION
            </span>
            <ul className="space-y-1.5 uppercase">
              <li><a href="#services" className="hover:text-white transition-colors">Services &amp; Capabilities</a></li>
              <li><a href="#benchmarks" className="hover:text-white transition-colors">Featured Benchmarks</a></li>
              <li><a href="#oscilloscope" className="hover:text-white transition-colors">Live Oscilloscope</a></li>
              <li><a href="#hardware" className="hover:text-white transition-colors">Hardware Registers</a></li>
              <li><a href="#hydration" className="hover:text-white transition-colors">Hydration Intake</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#8E95A5] gap-4">
          <div className="flex items-center space-x-2">
            <Droplet className="w-4 h-4 text-[#E87200]" />
            <span className="uppercase text-white/90">
              PURECHECK IOT PLATFORM © {new Date().getFullYear()} • ALL RIGHTS RESERVED
            </span>
          </div>
          <div className="uppercase">
            DESIGNED WITH FORGE STUDIOS ARCHITECTURAL MOTION SYSTEM
          </div>
        </div>

      </div>
    </footer>
  );
}
