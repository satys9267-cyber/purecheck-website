'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TelemetryPoint } from '@/types/telemetry';

interface LiveTrendChartProps {
  history: TelemetryPoint[];
  currentTds: number;
}

export function LiveTrendChart({ history, currentTds }: LiveTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<'tds' | 'ec' | 'purity'>('tds');

  const tdsValues = history.map((h) => h.tds);
  const minTds = tdsValues.length ? Math.min(...tdsValues) : 0;
  const maxTds = tdsValues.length ? Math.max(...tdsValues) : 0;
  const avgTds = tdsValues.length
    ? Math.round(tdsValues.reduce((a, b) => a + b, 0) / tdsValues.length)
    : 0;

  const metricConfigs = {
    tds: {
      label: 'TDS (ppm)',
      color: '#E87200',
      unit: 'ppm',
      dataKey: 'tds',
    },
    ec: {
      label: 'Conductivity',
      color: '#10B981',
      unit: 'µS/cm',
      dataKey: 'ec',
    },
    purity: {
      label: 'Purity Score',
      color: '#FFA033',
      unit: '%',
      dataKey: 'purity',
    },
  };

  const currentCfg = metricConfigs[activeMetric];

  return (
    <div className="forge-panel rounded-2xl p-6 sm:p-7 relative">
      
      {/* Corner crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#E87200]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#E87200]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4 border-b border-[#23272F]">
        <div>
          <span className="text-white text-sm font-mono uppercase font-semibold block">
            REAL-TIME BUFFER GRAPH
          </span>
          <p className="text-[11px] font-mono text-[#8E95A5] uppercase mt-0.5">
            ROLLING BUFFER: 30 TELEMETRY POINTS BUFFERED
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded bg-[#08090A] border border-[#23272F] text-xs font-mono">
          <button
            onClick={() => setActiveMetric('tds')}
            className={`px-3 py-1.5 rounded uppercase font-semibold transition-all ${
              activeMetric === 'tds'
                ? 'bg-[#E87200] text-black shadow-forge-glow'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            TDS PPM
          </button>
          <button
            onClick={() => setActiveMetric('ec')}
            className={`px-3 py-1.5 rounded uppercase font-semibold transition-all ${
              activeMetric === 'ec'
                ? 'bg-[#10B981] text-black'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            EC MICRO
          </button>
          <button
            onClick={() => setActiveMetric('purity')}
            className={`px-3 py-1.5 rounded uppercase font-semibold transition-all ${
              activeMetric === 'purity'
                ? 'bg-[#FFA033] text-black'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            PURITY PCT
          </button>
        </div>
      </div>

      {/* Buffer Statistics Strip */}
      <div className="grid grid-cols-3 gap-3 py-4 text-xs font-mono border-b border-[#23272F]">
        <div className="p-3 rounded bg-[#0A0C0E] border border-[#23272F]">
          <span className="text-[#8E95A5] block uppercase text-[10px]">MIN BUFFER</span>
          <span className="text-base font-bold text-white">
            {minTds} <span className="text-xs text-[#8E95A5]">ppm</span>
          </span>
        </div>
        <div className="p-3 rounded bg-[#0A0C0E] border border-[#23272F]">
          <span className="text-[#8E95A5] block uppercase text-[10px]">AVG BUFFER</span>
          <span className="text-base font-bold text-[#E87200]">
            {avgTds} <span className="text-xs text-[#8E95A5]">ppm</span>
          </span>
        </div>
        <div className="p-3 rounded bg-[#0A0C0E] border border-[#23272F]">
          <span className="text-[#8E95A5] block uppercase text-[10px]">PEAK BUFFER</span>
          <span className="text-base font-bold text-white">
            {maxTds} <span className="text-xs text-[#8E95A5]">ppm</span>
          </span>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 sm:h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forgeMetricGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentCfg.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentCfg.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#23272F" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#8E95A5"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#23272F' }}
            />
            <YAxis
              stroke="#8E95A5"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#23272F' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TelemetryPoint;
                  return (
                    <div className="rounded border border-[#23272F] bg-[#0B0C0E] p-3 shadow-2xl font-mono">
                      <div className="text-[10px] text-[#8E95A5] mb-1">{data.time}</div>
                      <div className="text-xs font-bold text-white">
                        {currentCfg.label}:{' '}
                        <span style={{ color: currentCfg.color }}>
                          {data[currentCfg.dataKey as keyof TelemetryPoint]} {currentCfg.unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8E95A5] mt-1">
                        PURITY: {data.purity}% • VOLTS: {data.voltage}V
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={currentCfg.dataKey}
              stroke={currentCfg.color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#forgeMetricGlow)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#8E95A5] pt-3 border-t border-[#23272F] uppercase">
        <span>SAMPLING RATE: 1HZ CONTINUOUS</span>
        <span className="flex items-center space-x-1.5 text-[#E87200]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E87200] animate-pulse" />
          <span>LIVE OSCILLOSCOPE</span>
        </span>
      </div>
    </div>
  );
}
