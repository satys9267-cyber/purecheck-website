#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Forward declaration
int getMedianNum(int bArray[], int iFilterLen);

// ---------------------------------------------------------------------------------
// 1. CONFIGURATION: Wi-Fi Credentials
// ---------------------------------------------------------------------------------
#define WIFI_SSID "Nothing Phone (3a)_2344"
#define WIFI_PASSWORD "Satyam@S7"

// ---------------------------------------------------------------------------------
// 2. CONFIGURATION: Firebase Realtime Database
// ---------------------------------------------------------------------------------
// Full Realtime Database URL with region
#define DATABASE_URL "https://purecheck-website-default-rtdb.asia-southeast1.firebasedatabase.app"

// Firebase Web API Key
#define FIREBASE_AUTH "AIzaSyCEDZQDDpi8glzmbq4gPaF8UgVuznIDhJs"

// Telemetry target path in Realtime Database
#define FIREBASE_PATH "/devices/nodemcu_01"

// ---------------------------------------------------------------------------------
// 3. HARDWARE CONSTANTS & PIN DEFINITIONS
// ---------------------------------------------------------------------------------
#define TDS_PIN A0               // Analog pin on ESP8266 NodeMCU
#define VREF 3.3                 // Operating voltage of NodeMCU ADC reference
#define SAMPLES_COUNT 30         // Samples for analog filtering
#define TELEMETRY_INTERVAL 3000  // Transmit telemetry every 3000 ms (3 seconds)

// Firebase and Data Objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Analog moving median buffer
int analogBuffer[SAMPLES_COUNT];
int analogBufferIndex = 0;
unsigned long lastTelemetryTime = 0;

// ---------------------------------------------------------------------------------
// Helper: Median filter algorithm to eliminate electrical noise
// ---------------------------------------------------------------------------------
int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++) {
    bTab[i] = bArray[i];
  }
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
  if ((iFilterLen & 1) > 0) {
    bTemp = bTab[(iFilterLen - 1) / 2];
  } else {
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  }
  return bTemp;
}

// ---------------------------------------------------------------------------------
// SETUP
// ---------------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n==================================================");
  Serial.println("  PURECHECK // NodeMCU 1.0 ESP8266 Booting...   ");
  Serial.println("==================================================");

  pinMode(TDS_PIN, INPUT);

  // Connect to Wi-Fi
  Serial.print("[WIFI] Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[WIFI] Connected Successfully!");
  Serial.print("[WIFI] IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("[WIFI] RSSI Signal: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");

  // Initialize Firebase RTDB
  Serial.println("[FIREBASE] Initializing connection...");
  config.database_url = DATABASE_URL;
  config.api_key = FIREBASE_AUTH;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Set timeout limits
  fbdo.setResponseSize(1024);

  Serial.println("[SYSTEM] Ready! Starting telemetry loop...\n");
}

// ---------------------------------------------------------------------------------
// MAIN LOOP
// ---------------------------------------------------------------------------------
void loop() {
  // 1. Gather analog samples with small sampling delay
  static unsigned long analogSampleTime = 0;
  if (millis() - analogSampleTime > 40) {
    analogSampleTime = millis();
    analogBuffer[analogBufferIndex] = analogRead(TDS_PIN);
    analogBufferIndex = (analogBufferIndex + 1) % SAMPLES_COUNT;
  }

  // 2. Transmit telemetry every TELEMETRY_INTERVAL (3 seconds)
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = millis();

    // Calculate median voltage from sample buffer
    float averageVoltage = getMedianNum(analogBuffer, SAMPLES_COUNT) * (float)VREF / 1024.0;

    // Temperature compensation (calibrated at standard 25 C)
    float temperature = 25.0; // Ambient default
    float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
    float compensationVoltage = averageVoltage / compensationCoefficient;

    // Standard EPA/NIST polynomial conversion to TDS (ppm)
    float tdsValue = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage 
                     - 255.86 * compensationVoltage * compensationVoltage 
                     + 857.39 * compensationVoltage) * 0.5;
    if (tdsValue < 0.0) tdsValue = 0.0;

    // Electrical conductivity estimation (EC in µS/cm)
    float ecValue = tdsValue * 2.0;

    // Round for clean reporting
    tdsValue = round(tdsValue * 10.0) / 10.0;
    ecValue = round(ecValue * 10.0) / 10.0;
    averageVoltage = round(averageVoltage * 100.0) / 100.0;

    int currentRSSI = WiFi.RSSI();
    String localIPStr = WiFi.localIP().toString();

    // Print diagnostic to Serial Monitor
    Serial.println("--------------------------------------------------");
    Serial.printf("[TELEMETRY] TDS: %.1f ppm | Volts: %.2f V | EC: %.1f uS/cm\n", tdsValue, averageVoltage, ecValue);
    Serial.printf("[NETWORK]   RSSI: %d dBm | IP: %s\n", currentRSSI, localIPStr.c_str());

    // Build JSON payload matching PureCheck exact schema
    FirebaseJson json;
    json.set("deviceName", "PureCheck-NodeMCU-01");
    json.set("tds", (double)tdsValue);
    json.set("voltage", (double)averageVoltage);
    json.set("ec", (double)ecValue);
    json.set("rssi", currentRSSI);
    json.set("ip", localIPStr);
    json.set("lastSeen", (double)millis());

    // Push to Firebase Realtime Database
    if (Firebase.updateNode(fbdo, FIREBASE_PATH, json)) {
      Serial.println("[FIREBASE] Telemetry synced successfully -> " FIREBASE_PATH);
    } else {
      Serial.print("[FIREBASE] Sync failed! Reason: ");
      Serial.println(fbdo.errorReason());
    }
  }
}
