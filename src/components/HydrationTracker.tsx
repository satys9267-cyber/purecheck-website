'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, CheckCircle2 } from 'lucide-react';

interface HydrationTrackerProps {
  currentPurity: number;
}

export function HydrationTracker({ currentPurity }: HydrationTrackerProps) {
  const [consumedMl, setConsumedMl] = useState<number>(1450);
  const targetMl = 2500;
  const bottleCapacity = 750;
  const percentComplete = Math.min(100, Math.round((consumedMl / targetMl) * 100));

  const addIntake = (amount: number) => {
    setConsumedMl((prev) => Math.min(4000, prev + amount));
  };

  const resetIntake = () => {
    setConsumedMl(0);
  };

  const filterRemainingPercent = 86;

  return (
    <div className="forge-panel rounded-2xl p-6 sm:p-7 relative flex flex-col justify-between h-full">
      
      {/* Corner Crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#E87200]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#E87200]" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#23272F]">
          <div>
            <span className="text-white text-sm font-mono uppercase font-semibold block">
              DAILY HYDRATION
            </span>
            <p className="text-[11px] font-mono text-[#8E95A5] uppercase mt-0.5">
              VESSEL CAPACITY: 750ML
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#181B20] text-[#E87200] border border-[#23272F]">
            {percentComplete}%
          </span>
        </div>

        {/* Progress Display */}
        <div className="py-6">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline space-x-1.5 font-mono">
              <span className="font-display text-4xl sm:text-5xl font-black text-white leading-none">
                {consumedMl}
              </span>
              <span className="text-xs text-[#8E95A5] font-semibold uppercase">/ {targetMl} ML</span>
            </div>
            <span className="text-[11px] font-mono text-[#10B981] flex items-center space-x-1 uppercase font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OPTIMAL</span>
            </span>
          </div>

          {/* Level Bar */}
          <div className="h-3 w-full bg-[#08090A] border border-[#23272F] rounded p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#E87200] to-[#FFA033] rounded-sm transition-all duration-500 shadow-forge-glow"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
          <button
            onClick={() => addIntake(250)}
            className="flex items-center justify-center space-x-1 py-2 px-3 rounded bg-[#181B20] border border-[#23272F] hover:border-[#E87200] text-white/90 hover:text-white transition-all active:scale-95 uppercase font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-[#E87200]" />
            <span>+250ML</span>
          </button>
          <button
            onClick={() => addIntake(bottleCapacity)}
            className="flex items-center justify-center space-x-1 py-2 px-3 rounded bg-[#E87200] text-black font-bold hover:bg-[#FFA033] transition-all active:scale-95 uppercase shadow-forge-glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+1 VESSEL</span>
          </button>
          <button
            onClick={resetIntake}
            className="py-2 px-3 rounded bg-[#121417] border border-[#23272F] text-[#8E95A5] hover:text-white transition-all uppercase"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Filter Cartridge Life */}
      <div className="mt-6 pt-4 border-t border-[#23272F]">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2 uppercase">
          <span className="text-[#8E95A5]">CARTRIDGE LIFESPAN</span>
          <span className="text-[#10B981] font-bold">{filterRemainingPercent}% REMAINING</span>
        </div>
        <div className="h-2 w-full bg-[#08090A] border border-[#23272F] rounded-sm overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-sm"
            style={{ width: `${filterRemainingPercent}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-[#8E95A5] mt-2 uppercase">
          Approx. 129 liters of filtration capacity remaining.
        </p>
      </div>

    </div>
  );
}
