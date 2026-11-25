'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function ForgeServices() {
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const services = [
    {
      num: '01',
      title: 'TDS & CONDUCTIVITY SENSING',
      category: 'HARDWARE & SENSORS',
      bullets: [
        'Analog 0–3.3V Dynamic Probe Input',
        '30-Point Median Moving Average Filter',
        'NIST Traceable EPA Potability Formulation',
      ],
      spec: 'ADC A0 10-BIT RESOLUTION',
    },
    {
      num: '02',
      title: 'FIREBASE REALTIME SYNC',
      category: 'TELEMETRY & CLOUD',
      bullets: [
        'Zero-Latency WebSocket Bi-Directional Stream',
        'Target Payload Path: /devices/nodemcu_01',
        'Auto-Reconnect & Stale Heartbeat Detection',
      ],
      spec: 'RTDB 1HZ FREQUENCY',
    },
    {
      num: '03',
      title: 'SMART HYDRATION MANAGEMENT',
      category: 'HEALTH & ANALYTICS',
      bullets: [
        'Continuous Daily Intake Logging (Target: 2,500ml)',
        'Smart Filter Lifespan Remaining Indicator',
        'Multi-Tier Potability Alert Chime Engine',
      ],
      spec: 'VESSEL 750ML CAPACITY',
    },
    {
      num: '04',
      title: 'ESP8266 FIRMWARE CO-DEVELOPMENT',
      category: 'EMBEDDED SYSTEMS',
      bullets: [
        'High-Efficiency Arduino / PlatformIO C++ Driver',
        'Station Mode 802.11 b/g/n Wi-Fi Management',
        'Complete Open-Source Flashable Repository',
      ],
      spec: 'SOC ESP8266EX 80MHZ',
    },
  ];

  return (
    <section id="services" className="w-full bg-[#08090A] border-b border-[#23272F] py-16 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#23272F] mb-4 gap-4">
          <div>
            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight leading-none">
              SERVICES
            </h2>
          </div>

          <div className="font-mono text-xs text-[#8E95A5] uppercase max-w-xs text-left sm:text-right">
            Full-stack IoT engineering from analog sensor calibration to cloud telemetry.
          </div>
        </div>

        {/* Interactive Services Rows */}
        <div className="divide-y divide-[#23272F] border-b border-[#23272F]">
          {services.map((svc, idx) => {
            const isHovered = activeRow === idx;
            return (
              <div
                key={svc.num}
                onMouseEnter={() => setActiveRow(idx)}
                onMouseLeave={() => setActiveRow(null)}
                className="group relative py-8 sm:py-12 transition-all duration-300 hover:bg-[#0E1013] px-4 -mx-4 cursor-pointer"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-[#E87200] transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Number & Title */}
                  <div className="lg:col-span-6 flex items-start space-x-4 sm:space-x-8">
                    <span className="font-mono text-sm sm:text-base text-[#E87200] font-bold">
                      [{svc.num}]
                    </span>
                    <div>
                      <span className="font-mono text-[10px] sm:text-xs text-[#8E95A5] tracking-widest uppercase block mb-1">
                        {svc.category}
                      </span>
                      <h3 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight group-hover:text-[#FFA033] transition-colors">
                        {svc.title}
                      </h3>
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="lg:col-span-4 font-mono text-xs text-[#8E95A5] space-y-1.5 uppercase">
                    {svc.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-[#E87200]" />
                        <span className="text-white/80">{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right Spec & Arrow */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-end space-x-4">
                    <span className="font-mono text-[10px] text-[#E87200] uppercase font-semibold">
                      {svc.spec}
                    </span>
                    <div className="w-10 h-10 rounded-full border border-[#23272F] group-hover:border-[#E87200] group-hover:bg-[#E87200] group-hover:text-black text-white flex items-center justify-center transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
