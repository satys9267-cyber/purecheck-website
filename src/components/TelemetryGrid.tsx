'use client';

import React from 'react';
import { Zap, Gauge, Wifi, Cpu, Clock, Network } from 'lucide-react';
import { RawNodeMCUTelemetry, DeviceState } from '@/types/telemetry';

interface TelemetryGridProps {
  telemetry: RawNodeMCUTelemetry;
  deviceState: DeviceState;
}

export function TelemetryGrid({ telemetry, deviceState }: TelemetryGridProps) {
  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return 'NEVER';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'SYNCED (JUST NOW)';
    if (seconds < 60) return `${seconds}S AGO`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}M AGO`;
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#23272F]">
        <div>
          <span className="text-white text-xs font-mono uppercase font-semibold">
            ESP8266 SENSOR ADC &amp; NETWORK DIAGNOSTICS
          </span>
        </div>

        <div className="text-[11px] font-mono text-[#E87200] bg-[#121417] border border-[#23272F] px-3 py-1 rounded">
          PATH: /devices/nodemcu_01
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Card 1: Analog Voltage */}
        <div className="forge-panel-interactive p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-[#8E95A5] text-[10px] font-mono uppercase mb-2">
            <span>VOLTAGE</span>
            <Zap className="w-3.5 h-3.5 text-[#E87200]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {Number(telemetry.voltage).toFixed(2)}
            <span className="text-xs text-[#8E95A5] ml-1">V</span>
          </div>
          <div className="text-[10px] font-mono text-[#8E95A5] mt-1 uppercase">
            ADC PIN: A0
          </div>
        </div>

        {/* Card 2: Electrical Conductivity (EC) */}
        <div className="forge-panel-interactive p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-[#8E95A5] text-[10px] font-mono uppercase mb-2">
            <span>EC CONDUCT</span>
            <Gauge className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {Number(telemetry.ec).toFixed(1)}
            <span className="text-xs text-[#8E95A5] ml-1">µS/cm</span>
          </div>
          <div className="text-[10px] font-mono text-[#8E95A5] mt-1 uppercase">
            SCALE: 2.0x TDS
          </div>
        </div>

        {/* Card 3: Wi-Fi RSSI */}
        <div className="forge-panel-interactive p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-[#8E95A5] text-[10px] font-mono uppercase mb-2">
            <span>WIFI RSSI</span>
            <Wifi className="w-3.5 h-3.5 text-[#E87200]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {telemetry.rssi}
            <span className="text-xs text-[#8E95A5] ml-1">dBm</span>
          </div>
          <div className="text-[10px] font-mono text-[#10B981] mt-1 uppercase">
            {deviceState.signalStrength} ({deviceState.signalBars}/4)
          </div>
        </div>

        {/* Card 4: Local LAN IP */}
        <div className="forge-panel-interactive p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-[#8E95A5] text-[10px] font-mono uppercase mb-2">
            <span>LAN IP</span>
            <Network className="w-3.5 h-3.5 text-[#FFA033]" />
          </div>
          <div className="text-base font-mono font-bold text-white truncate" title={telemetry.ip}>
            {telemetry.ip || '192.168.1.104'}
          </div>
          <div className="text-[10px] font-mono text-[#8E95A5] mt-2 uppercase">
            STATION MODE
          </div>
        </div>

        {/* Card 5: Heartbeat */}
        <div className="forge-panel-interactive p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-[#8E95A5] text-[10px] font-mono uppercase mb-2">
            <span>HEARTBEAT</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-sm font-mono font-bold text-white truncate">
            {formatLastSeen(telemetry.lastSeen)}
          </div>
          <div className="text-[10px] font-mono text-[#8E95A5] mt-2 uppercase">
            {deviceState.isOnline ? 'POLLING OK' : 'OFFLINE'}
          </div>
        </div>

        {/* Card 6: Architecture */}
        <div className="forge-panel-interactive p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-[#8E95A5] text-[10px] font-mono uppercase mb-2">
            <span>SOC ARCH</span>
            <Cpu className="w-3.5 h-3.5 text-[#E87200]" />
          </div>
          <div className="text-base font-mono font-bold text-white">
            ESP8266EX
          </div>
          <div className="text-[10px] font-mono text-[#8E95A5] mt-2 uppercase">
            80MHZ XTAL
          </div>
        </div>

      </div>
    </div>
  );
}
