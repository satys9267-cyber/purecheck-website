'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Cpu, ShieldCheck } from 'lucide-react';

interface FirmwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirmwareModal({ isOpen, onClose }: FirmwareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const arduinoCode = `/*
 * PURECHECK - ESP8266 NodeMCU Water Purity Telemetry
 * Architecture: ESP8266EX (NodeMCU v3 / D1 Mini)
 * Probe: Analog TDS Sensor (Pin A0)
 * RTDB Path: /devices/nodemcu_01
 */

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// WiFi Configuration
#define WIFI_SSID "Nothing Phone (3a)_2344"
#define WIFI_PASSWORD "Satyam@S7"

// Firebase Realtime Database Configuration
#define FIREBASE_HOST "purecheck-website-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "AIzaSyCEDZQDDpi8glzmbq4gPaF8UgVuznIDhJs"

#define TDS_PIN A0
#define VREF 3.3
#define SCOUNT 30

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
int analogBuffer[SCOUNT];

int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++) bTab[i] = bArray[i];
  int i, j, bTemp;
  for (j = 0; j < iFilterLen - 1; j++) {
    for (i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  return (iFilterLen & 1) ? bTab[(iFilterLen - 1) / 2] : (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
}

void setup() {
  Serial.begin(115200);
  pinMode(TDS_PIN, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());

  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  for (int i = 0; i < SCOUNT; i++) {
    analogBuffer[i] = analogRead(TDS_PIN);
    delay(10);
  }
  
  float averageVoltage = getMedianNum(analogBuffer, SCOUNT) * (float)VREF / 1024.0;
  float compensationVoltage = averageVoltage / (1.0 + 0.02 * (25.0 - 25.0));
  
  float tdsValue = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage 
                   - 255.86 * compensationVoltage * compensationVoltage 
                   + 857.39 * compensationVoltage) * 0.5;
  if (tdsValue < 0) tdsValue = 0;
  float ecValue = tdsValue * 2.0;

  // Exact PureCheck schema payload
  FirebaseJson json;
  json.set("deviceName", "PureCheck-NodeMCU-01");
  json.set("tds", (double)tdsValue);
  json.set("voltage", (double)averageVoltage);
  json.set("ec", (double)ecValue);
  json.set("rssi", WiFi.RSSI());
  json.set("ip", WiFi.localIP().toString());
  json.set("lastSeen", (double)millis());

  if (Firebase.updateNode(fbdo, "/devices/nodemcu_01", json)) {
    Serial.println("Telemetry synced: TDS=" + String(tdsValue, 1) + " ppm");
  } else {
    Serial.println("Firebase Error: " + fbdo.errorReason());
  }

  delay(3000);
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#23272F] bg-[#0E1013] p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        
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

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-[#181B20] border border-[#23272F] text-[#E87200]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
              ESP8266 FIRMWARE SOURCE
            </h2>
            <p className="text-[11px] font-mono text-[#8E95A5] uppercase">
              TARGET PATH: <code className="text-[#E87200]">/devices/nodemcu_01</code>
            </p>
          </div>
        </div>

        {/* Pinout info */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
          <div className="p-2.5 rounded bg-[#121417] border border-[#23272F]">
            <span className="text-[#8E95A5] block uppercase text-[10px]">TDS PROBE</span>
            <span className="text-[#E87200] font-bold">A0 ANALOG</span>
          </div>
          <div className="p-2.5 rounded bg-[#121417] border border-[#23272F]">
            <span className="text-[#8E95A5] block uppercase text-[10px]">SUPPLY</span>
            <span className="text-white font-bold">3.3V / VIN</span>
          </div>
          <div className="p-2.5 rounded bg-[#121417] border border-[#23272F]">
            <span className="text-[#8E95A5] block uppercase text-[10px]">GND</span>
            <span className="text-white font-bold">COMMON GND</span>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative flex-1 overflow-hidden rounded border border-[#23272F] bg-[#050506]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#23272F] bg-[#121417]">
            <span className="text-xs font-mono text-[#8E95A5] flex items-center space-x-1.5 uppercase">
              <Terminal className="w-3.5 h-3.5 text-[#E87200]" />
              <span>PureCheck_NodeMCU.ino</span>
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#E87200] text-black text-xs font-mono font-bold uppercase hover:bg-[#FFA033] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-y-auto max-h-[380px] leading-relaxed selection:bg-[#E87200] selection:text-black">
            {arduinoCode}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-4 text-xs font-mono text-[#8E95A5] uppercase">
          <span className="flex items-center space-x-1 text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            <span>ARDUINO IDE 2.X COMPLIANT</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#181B20] border border-[#23272F] text-white hover:border-white transition-all uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
