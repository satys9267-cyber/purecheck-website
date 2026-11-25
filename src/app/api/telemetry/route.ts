import { NextRequest, NextResponse } from 'next/server';
import { RawNodeMCUTelemetry } from '@/types/telemetry';

// Global cache for latest telemetry on Vercel serverless runtime
let cachedTelemetry: RawNodeMCUTelemetry = {
  deviceName: 'PureCheck-NodeMCU-01',
  tds: 0.0,
  voltage: 0.0,
  ec: 0.0,
  rssi: 0,
  ip: 'Awaiting Hardware',
  lastSeen: 0,
};

// GET: Fetch latest real-time telemetry
export async function GET() {
  return NextResponse.json(cachedTelemetry, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// POST: Direct HTTP ingestion from ESP8266 without Firebase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    cachedTelemetry = {
      deviceName: body.deviceName || 'PureCheck-NodeMCU-01',
      tds: Number(body.tds) || 0.0,
      voltage: Number(body.voltage) || 0.0,
      ec: Number(body.ec) || (Number(body.tds) * 2.0) || 0.0,
      rssi: Number(body.rssi) || -50,
      ip: body.ip || '192.168.x.x',
      lastSeen: Date.now(),
    };

    return NextResponse.json({ success: true, received: cachedTelemetry }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}
