'use client';

import React from 'react';

export function ForgeTicker() {
  const items = [
    'REAL-TIME TELEMETRY STREAM',
    'MOLECULAR PURITY 94%',
    'ESP8266 PROBE ACTIVE',
    'LATENCY: 12MS',
    'ZERO COMPROMISE POTABILITY',
    'PRECISION TDS AND EC ANALYSIS',
    'STAINLESS VACUUM VESSEL 750ML',
    'CERTIFIED POTABLE WATER STANDARDS',
  ];

  return (
    <div className="w-full bg-[#050506] border-y border-[#23272F] overflow-hidden py-3 select-none relative z-20">
      <div className="flex w-[200%] animate-ticker ticker-track">
        {/* Loop 1 */}
        <div className="flex items-center space-x-10 whitespace-nowrap text-xs font-mono tracking-widest text-[#8E95A5] uppercase px-4">
          {items.map((item, index) => (
            <React.Fragment key={`l1-${index}`}>
              <span className="text-white/90 font-medium">{item}</span>
              <span className="text-[#E87200] font-bold">•</span>
            </React.Fragment>
          ))}
        </div>

        {/* Loop 2 */}
        <div className="flex items-center space-x-10 whitespace-nowrap text-xs font-mono tracking-widest text-[#8E95A5] uppercase px-4">
          {items.map((item, index) => (
            <React.Fragment key={`l2-${index}`}>
              <span className="text-white/90 font-medium">{item}</span>
              <span className="text-[#E87200] font-bold">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
