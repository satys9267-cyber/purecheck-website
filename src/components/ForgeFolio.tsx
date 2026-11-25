'use client';

import React from 'react';
import { SimulationProfile } from '@/lib/simulator';
import { ArrowUpRight } from 'lucide-react';

interface ForgeFolioProps {
  currentProfile: SimulationProfile;
  onSelectProfile: (profile: SimulationProfile) => void;
}

export function ForgeFolio({ currentProfile, onSelectProfile }: ForgeFolioProps) {
  const benchmarks: {
    id: SimulationProfile;
    num: string;
    name: string;
    tds: number;
    purity: number;
    category: string;
    description: string;
    badge: string;
    color: string;
  }[] = [
    {
      id: 'spring',
      num: '01',
      name: 'ALPINE MOUNTAIN SPRING',
      tds: 85,
      purity: 96,
      category: 'NATURAL MINERAL SOURCE',
      description: 'Pristine high-altitude glacial snowmelt. Optimal physiological mineral balance for everyday human hydration.',
      badge: '96% OPTIMAL PURE',
      color: '#10B981',
    },
    {
      id: 'filtered',
      num: '02',
      name: 'MULTI-STAGE RO WATER',
      tds: 124.5,
      purity: 94,
      category: 'REVERSE OSMOSIS PURIFIED',
      description: 'Default ESP8266 calibration benchmark. Filtered through semi-permeable membrane with remineralization.',
      badge: '94% PURE',
      color: '#10B981',
    },
    {
      id: 'tap',
      num: '03',
      name: 'MUNICIPAL CITY TAP',
      tds: 210,
      purity: 84,
      category: 'TREATED PUBLIC SUPPLY',
      description: 'Chlorinated city distribution grid. Higher dissolved solids with noticeable calcium/magnesium traces.',
      badge: '84% ACCEPTABLE',
      color: '#FFA033',
    },
    {
      id: 'hard',
      num: '04',
      name: 'HARD WELL MINERAL WATER',
      tds: 295,
      purity: 72,
      category: 'GROUNDWATER AQUIFER',
      description: 'High carbonate hardness. Approaching filtration threshold; carbon block softening recommended.',
      badge: '72% MODERATE',
      color: '#FFA033',
    },
    {
      id: 'unsafe',
      num: '05',
      name: 'CONTAMINATED UNFILTERED',
      tds: 560,
      purity: 42,
      category: 'UNSAFE BIO-ORGANIC SOURCE',
      description: 'Critical dissolved solids exceeding WHO threshold limits. Audio warning chime and red alert triggered.',
      badge: '42% UNSAFE',
      color: '#EF4444',
    },
  ];

  return (
    <section id="benchmarks" className="w-full bg-[#08090A] border-b border-[#23272F] py-16 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#23272F] mb-8 gap-4">
          <div>
            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight leading-none">
              FEATURED PROFILES
            </h2>
          </div>

          <div className="font-mono text-xs text-[#8E95A5] uppercase max-w-xs text-left sm:text-right">
            Click any profile card to inject benchmark telemetry into the live bottle HUD.
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benchmarks.map((item) => {
            const isSelected = currentProfile === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectProfile(item.id)}
                className={`group rounded-2xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#14171C] border-[#E87200] shadow-forge-glow -translate-y-1'
                    : 'bg-[#0E1013] border-[#23272F] hover:border-[#E87200] hover:bg-[#121417]'
                }`}
              >
                {isSelected && (
                  <div
                    className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-[80px] opacity-30 pointer-events-none"
                    style={{ backgroundColor: item.color }}
                  />
                )}

                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#23272F] mb-6">
                    <span className="font-mono text-sm text-[#E87200] font-bold">
                      [{item.num}]
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[#8E95A5] tracking-widest uppercase block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-[#FFA033] transition-colors mb-4">
                    {item.name}
                  </h3>

                  <p className="font-mono text-xs text-[#8E95A5] uppercase leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#23272F] flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-[#8E95A5] uppercase block">TARGET TDS</span>
                    <span className="text-xl font-bold text-white">
                      {item.tds} <span className="text-xs text-[#8E95A5]">ppm</span>
                    </span>
                  </div>

                  <button
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${
                      isSelected
                        ? 'bg-[#E87200] text-black shadow-md'
                        : 'bg-[#181B20] text-white/80 group-hover:bg-[#E87200] group-hover:text-black'
                    }`}
                  >
                    <span>{isSelected ? 'ACTIVE' : 'SIMULATE'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
