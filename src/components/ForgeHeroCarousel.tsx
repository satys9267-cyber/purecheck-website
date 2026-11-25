'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RawNodeMCUTelemetry, PurityMetrics, DeviceState } from '@/types/telemetry';
import { Droplet, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle, AlertOctagon, Sparkles, Scale, Waves, Filter, Zap } from 'lucide-react';
import gsap from 'gsap';

interface ForgeHeroCarouselProps {
  telemetry: RawNodeMCUTelemetry;
  metrics: PurityMetrics;
  deviceState: DeviceState;
}

export function ForgeHeroCarousel({ telemetry, metrics, deviceState }: ForgeHeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;
  const slideRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const slidesData = [
    {
      title: 'SMART TELEMETRY',
      tag: 'VESSEL PROBE',
      desc: 'Active monitoring of dissolved solids, electro-conductivity, mineralisation, and water hardness via integrated NodeMCU probe.',
    },
    {
      title: 'ESP8266 HARDWARE',
      tag: 'SOC TELEMETRY',
      desc: 'Real-time 10-bit analog-to-digital sensor registers synced with zero latency to Firebase Cloud RTDB.',
    },
    {
      title: 'LIVE OSCILLOSCOPE',
      tag: 'BUFFER STREAM',
      desc: 'High-frequency rolling buffer oscilloscope measuring minute fluctuations in mineral saturation.',
    },
    {
      title: 'OPTIMAL HYDRATION',
      tag: 'STAINLESS VESSEL',
      desc: 'Certified medical potability standards ensuring cellular hydration in every drop.',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (slideRef.current) {
      gsap.fromTo(
        slideRef.current.querySelectorAll('.hero-anim'),
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }

    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { width: '0%' },
        { width: '100%', duration: 7, ease: 'linear' }
      );
    }
  }, [currentSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const percentage = Math.min(100, Math.max(0, metrics.purityPercent));

  const renderStatusIcon = () => {
    switch (metrics.category) {
      case 'safe':
        return <ShieldCheck className="w-4 h-4 text-[#10B981]" />;
      case 'moderate':
        return <AlertTriangle className="w-4 h-4 text-[#FF7A00]" />;
      case 'unsafe':
        return <AlertOctagon className="w-4 h-4 text-[#EF4444]" />;
    }
  };

  return (
    <section className="relative w-full bg-[#08090A] border-b border-[#23272F] overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-10 w-[700px] h-[500px] bg-gradient-to-b from-[#E87200]/12 via-[#E87200]/5 to-transparent blur-[160px]" />
        <div className="absolute bottom-0 left-10 w-[600px] h-[400px] bg-gradient-to-tr from-[#E87200]/8 to-transparent blur-[180px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-16 relative z-10 flex flex-col justify-between min-h-[600px] lg:min-h-[680px]">
        
        {/* Main Headline */}
        <div ref={slideRef} className="max-w-4xl pt-4">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase text-white tracking-tight leading-[0.85] hero-anim">
            {slidesData[currentSlide].title}
          </h1>

          <p className="font-mono text-xs sm:text-sm uppercase tracking-wider text-[#8E95A5] mt-4 max-w-2xl hero-anim leading-relaxed">
            {slidesData[currentSlide].desc}
          </p>
        </div>

        {/* Embedded Interactive HUD Module */}
        <div className="my-8 pt-2">
          <div className="rounded-2xl border border-[#23272F] bg-[#0E1013]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative">
            
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E87200]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E87200]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* Bottle Visualizer (4 cols) */}
              <div className="lg:col-span-4 flex items-center justify-center relative py-2">
                <div className="relative flex items-center justify-center w-full max-w-[260px] h-[280px]">
                  
                  {/* Rotating Reticle */}
                  <div className="absolute w-56 h-56 rounded-full border border-dashed border-[#23272F] animate-radar-sweep pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-center space-x-4">
                    {/* Bottle */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-6 bg-gradient-to-r from-[#2A2E35] via-[#484F5B] to-[#202328] rounded-t-sm shadow-md border-b border-[#E87200]/60" />
                      <div
                        className="w-13 h-2.5 rounded-sm my-0.5 transition-all duration-700 shadow-lg"
                        style={{
                          backgroundColor: metrics.category === 'safe' ? '#10B981' : '#E87200',
                          boxShadow: `0 0 16px ${metrics.category === 'safe' ? '#10B981' : '#E87200'}80`,
                        }}
                      />
                      <div className="w-11 h-4 bg-gradient-to-r from-[#202328] via-[#353B45] to-[#1E2125]" />
                      <div className="relative w-20 h-48 rounded-b-xl overflow-hidden border border-[#2A2E38] bg-gradient-to-r from-[#171A1F] via-[#2D333D] to-[#14161A] shadow-2xl flex flex-col justify-between p-2">
                        <div className="z-10 flex flex-col items-center justify-center my-auto">
                          <span className="font-display text-[11px] font-black tracking-widest text-[#F4F5F7]/90 uppercase [writing-mode:vertical-rl] rotate-180 select-none">
                            PURECHECK
                          </span>
                        </div>
                        <div className="absolute bottom-3 inset-x-2 h-16 rounded-md overflow-hidden border border-[#23272F] bg-[#0A0C0E]/70">
                          <div
                            className="absolute inset-x-0 bottom-0 transition-all duration-700 opacity-90"
                            style={{
                              height: `${Math.min(95, Math.max(30, percentage))}%`,
                              backgroundColor: metrics.category === 'safe' ? '#10B981' : '#E87200',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Companion Phone App Mockup */}
                    <div className="relative w-14 h-32 rounded bg-[#050506] border border-[#23272F] p-1 shadow-2xl flex flex-col items-center justify-between">
                      <div className="w-3 h-0.5 bg-[#23272F] rounded-full mt-0.5" />
                      <div className="w-full flex-1 rounded bg-[#0A0C0E] flex flex-col items-center justify-center p-1 border border-[#23272F]">
                        <Droplet className="w-3.5 h-3.5 text-[#E87200] animate-pulse" />
                        <span className="text-[7px] font-mono text-[#E87200] font-bold mt-1 uppercase">SYNC</span>
                      </div>
                      <div className="w-4 h-0.5 bg-[#23272F] rounded-full mb-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Quality Gauge & Potability Score (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                <div className="flex items-baseline justify-center lg:justify-start space-x-3">
                  <span
                    className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none transition-colors duration-700"
                    style={{
                      color: metrics.category === 'safe' ? '#F4F5F7' : metrics.category === 'moderate' ? '#FFA033' : '#EF4444',
                    }}
                  >
                    {metrics.purityPercent}%
                  </span>
                  <span className="font-display text-3xl font-extrabold text-[#E87200] uppercase tracking-wider">
                    PURE
                  </span>
                </div>

                <div
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded border text-xs font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: metrics.category === 'safe' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(232, 114, 0, 0.12)',
                    borderColor: metrics.category === 'safe' ? '#10B981' : '#E87200',
                    color: metrics.category === 'safe' ? '#10B981' : '#FFA033',
                  }}
                >
                  {renderStatusIcon()}
                  <span>{metrics.statusBadge}</span>
                </div>

                {/* 3-Tier Gauge */}
                <div className="w-full max-w-md pt-1 space-y-2">
                  <div className="relative h-3.5 w-full bg-[#121417] border border-[#23272F] p-0.5 rounded overflow-visible">
                    <div className="h-full w-full flex overflow-hidden rounded-sm">
                      <div className="w-[70%] h-full bg-[#EF4444] opacity-80" />
                      <div className="w-[20%] h-full bg-[#E87200] opacity-85" />
                      <div className="w-[10%] h-full bg-[#10B981] opacity-95" />
                    </div>
                    <div
                      className="absolute -top-3 transition-all duration-700 ease-out flex flex-col items-center pointer-events-none -translate-x-1/2 z-20"
                      style={{ left: `${percentage}%` }}
                    >
                      <div className="px-1.5 py-0.5 rounded bg-white text-black font-mono font-black text-[8px] shadow-lg">
                        {metrics.purityPercent}%
                      </div>
                      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 text-center text-[10px] font-mono text-[#8E95A5]">
                    <div>&lt;70% UNSAFE</div>
                    <div>70–89% MODERATE</div>
                    <div>90–100% SAFE</div>
                  </div>
                </div>
              </div>

              {/* Calculated Readings Laboratory Tiles */}
              <div className="lg:col-span-3 flex flex-col space-y-2 w-full">
                {/* 1. Mineral / Taste Profile */}
                <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFA033]" />
                    <span className="text-[10px] font-mono text-[#8E95A5]">MINERALS:</span>
                  </div>
                  <span className="font-mono font-bold text-white text-xs">
                    {metrics.mineralProfile.tasteNote} <span className="text-[10px] text-[#8E95A5]">({metrics.mineralProfile.rating})</span>
                  </span>
                </div>

                {/* 2. Water Hardness (Indirect) */}
                <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-mono text-[#8E95A5]">HARDNESS:</span>
                  </div>
                  <span className="font-mono font-bold text-white text-xs">
                    {metrics.hardness.caco3Equivalent} <span className="text-[10px] text-[#8E95A5]">mg/L ({metrics.hardness.category})</span>
                  </span>
                </div>

                {/* 3. RO Memory / Purity % */}
                <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[10px] font-mono text-[#8E95A5]">RO MEMORY:</span>
                  </div>
                  <span className="font-mono font-bold text-white text-xs">
                    {metrics.roFiltrationMemory.purifiedPercent}% <span className="text-[10px] text-[#10B981]">PURIFIED</span>
                  </span>
                </div>

                {/* 4. Salinity & EC */}
                <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-mono text-[#8E95A5]">SALINITY:</span>
                  </div>
                  <span className="font-mono font-bold text-white text-xs">
                    {metrics.salinity.ppt} ppt <span className="text-[10px] text-[#8E95A5]">({metrics.ecValue} µS/cm)</span>
                  </span>
                </div>

                {/* 5. Anomaly State */}
                <div className="p-2.5 rounded bg-[#121417] border border-[#23272F] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[10px] font-mono text-[#8E95A5]">FLOW STATE:</span>
                  </div>
                  <span
                    className="font-mono font-bold text-[11px] uppercase"
                    style={{ color: metrics.anomaly.colorHex }}
                  >
                    {metrics.anomaly.label}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Carousel Bottom Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#23272F] gap-4">
          
          {/* Index Counter */}
          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-2xl font-black text-white">0{currentSlide + 1}</span>
            <span className="text-sm text-[#8E95A5]">/ 0{totalSlides}</span>
            <span className="text-xs text-[#E87200] ml-3 uppercase font-semibold">
              {slidesData[currentSlide].tag}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full sm:max-w-md h-1 bg-[#181B20] rounded-full overflow-hidden">
            <div ref={progressRef} className="h-full bg-[#E87200]" />
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded border border-[#23272F] bg-[#121417] hover:border-[#E87200] text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Previous slide"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded border border-[#23272F] bg-[#121417] hover:border-[#E87200] text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Next slide"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
