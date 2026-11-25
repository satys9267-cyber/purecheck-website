# PureCheck — Smart IoT Water Purity Telemetry Web Application

> **"Pure Water, Pure Life: Your Health in Every Drop."**

A complete, production-ready IoT water purity telemetry monitoring dashboard built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase Realtime Database**, designed for zero-configuration deployment on **Vercel**.

---

## 🌟 Key Features

1. **Exact ESP8266 NodeMCU Firmware Schema:**
   - Real-time listener on path `/devices/nodemcu_01`.
   - Incoming telemetry fields:
     - `deviceName`: Hardware profile label (`"PureCheck-NodeMCU-01"`)
     - `tds`: Total Dissolved Solids in ppm (e.g. `124.5`)
     - `voltage`: Analog sensor voltage in Volts (e.g. `0.62`)
     - `ec`: Electrical Conductivity in µS/cm (e.g. `249.0`)
     - `rssi`: Wi-Fi signal strength in dBm (e.g. `-58`)
     - `ip`: Internal LAN IP address
     - `lastSeen`: Milliseconds epoch heartbeat timestamp
2. **Futuristic Glassmorphic UI:**
   - Deep slate obsidian aesthetic (`#070B14`) with translucent frosted cards (`backdrop-blur-md`).
   - Glowing 3D Smart Bottle visualization with animated water reservoir and pulsating LED status ring.
   - Dynamic 3-tier safety gradient meter:
     - `90% – 100%`: **Safe for Drinking** (Emerald glow)
     - `70% – 89%`: **Moderate Quality** (Amber glow)
     - `Below 70%`: **Unsafe / Do Not Consume** (Rose glow)
3. **Live Trend Analytics:**
   - Dynamic SVG/Canvas area trend chart tracking TDS, EC, and Purity scores in real-time.
   - Minimum, average, and peak readings buffer.
4. **Interactive Demo Simulation Mode:**
   - Built-in simulation with 5 realistic water profiles (Mountain Spring, RO Filtered, City Tap, Hard Mineral, Contaminated).
   - Instant testing without waiting for physical hardware.
5. **Daily Hydration & Filter Health:**
   - Smart daily water intake logger.
   - Smart filter cartridge remaining lifespan calculator.
6. **Embedded ESP8266 NodeMCU Firmware:**
   - Ready-to-flash Arduino C++ source code accessible directly via the dashboard's "Firmware" button.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Live Firebase)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
*(Note: You can also configure Firebase RTDB dynamically in the browser using the in-app Settings modal).*

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## ⚡ Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and import it.
4. Add the Firebase environment variables in the Vercel project settings under **Environment Variables**.
5. Click **Deploy**. Next.js App Router will be automatically built and hosted globally with edge optimization!

---

## 🔌 Hardware Circuit & ESP8266 Wiring

| Sensor Pin | ESP8266 NodeMCU Pin | Description |
|---|---|---|
| TDS Signal (Analog Out) | `A0` | Analog input (0–3.3V) |
| TDS VCC | `3.3V` or `VIN` | Power supply |
| TDS GND | `GND` | Ground reference |

---

## 🛡️ Firebase Realtime Database Rules

To allow your ESP8266 to write and the PureCheck web app to read telemetry, ensure your Firebase Realtime Database rules are set:
```json
{
  "rules": {
    "devices": {
      "nodemcu_01": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```
*(For production, you can lock down `.write` with Firebase Auth token or Database Secret).*
