'use client';

import React, { useState, useEffect } from 'react';
import { X, Database, Check, AlertCircle, Save, Trash2 } from 'lucide-react';
import {
  getActiveFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  isFirebaseConfigured,
  FirebaseConfigOptions,
} from '@/lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export function FirebaseConfigModal({
  isOpen,
  onClose,
  onConfigUpdated,
}: FirebaseConfigModalProps) {
  const [databaseURL, setDatabaseURL] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveFirebaseConfig();
      setDatabaseURL(active.databaseURL || '');
      setApiKey(active.apiKey || '');
      setProjectId(active.projectId || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: FirebaseConfigOptions = {
      databaseURL: databaseURL.trim(),
      apiKey: apiKey.trim() || 'demo-api-key',
      projectId: projectId.trim() || 'purecheck-rtdb',
      authDomain: `${projectId.trim() || 'purecheck'}.firebaseapp.com`,
    };
    saveStoredFirebaseConfig(newConfig);
    setIsSaved(true);
    onConfigUpdated();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    clearStoredFirebaseConfig();
    setDatabaseURL('');
    setApiKey('');
    setProjectId('');
    onConfigUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#23272F] bg-[#0E1013] p-6 sm:p-8 shadow-2xl">
        
        {/* Corner crosses */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E87200]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E87200]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded text-[#8E95A5] hover:text-white hover:bg-[#181B20] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-[#181B20] border border-[#23272F] text-[#E87200]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
              FIREBASE RTDB CONFIG
            </h2>
            <p className="text-[11px] font-mono text-[#8E95A5] uppercase">
              SPECIFY REALTIME DATABASE PATH: /devices/nodemcu_01
            </p>
          </div>
        </div>

        {/* Active Status indicator */}
        <div className="mb-6 p-3 rounded bg-[#121417] border border-[#23272F] flex items-center justify-between text-xs font-mono">
          <span className="text-[#8E95A5] uppercase">STATE:</span>
          {isFirebaseConfigured() ? (
            <span className="text-[#10B981] font-semibold flex items-center space-x-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>CONFIGURED &amp; ACTIVE</span>
            </span>
          ) : (
            <span className="text-[#FFA033] font-semibold flex items-center space-x-1.5 uppercase">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>SIMULATION ACTIVE</span>
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-bold text-[#8E95A5] uppercase tracking-wider mb-1.5">
              DATABASE URL <span className="text-[#E87200]">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#08090A] border border-[#23272F] text-white focus:outline-none focus:border-[#E87200] transition-colors placeholder:text-[#4A505C]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#8E95A5] uppercase tracking-wider mb-1.5">
              PROJECT ID
            </label>
            <input
              type="text"
              placeholder="purecheck-water-monitor"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#08090A] border border-[#23272F] text-white focus:outline-none focus:border-[#E87200] transition-colors placeholder:text-[#4A505C]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#8E95A5] uppercase tracking-wider mb-1.5">
              API KEY (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#08090A] border border-[#23272F] text-white focus:outline-none focus:border-[#E87200] transition-colors placeholder:text-[#4A505C]"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#181B20] border border-[#23272F] text-[#EF4444] font-medium hover:bg-[#EF4444]/10 transition-all uppercase"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-[#23272F] text-[#8E95A5] hover:text-white transition-all uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 rounded bg-[#E87200] text-black font-bold shadow-forge-glow hover:bg-[#FFA033] transition-all uppercase"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'SAVED' : 'SAVE & CONNECT'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
