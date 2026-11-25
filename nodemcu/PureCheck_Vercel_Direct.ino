/*
 * =================================================================================
 * PURECHECK — Direct Vercel Telemetry Firmware (NO FIREBASE NEEDED)
 * Target Hardware: NodeMCU 1.0 (ESP-12E / ESP8266)
 * Destination: https://purecheck-irubssgth-satys9267-8741.vercel.app/api/telemetry
 * =================================================================================
 *
 * Circuit Wiring:
 *   - TDS Sensor VOUT (Signal) -> NodeMCU Pin A0
 *   - TDS Sensor VCC (+)       -> NodeMCU Pin 3V3 (3.3V)
 *   - TDS Sensor GND (-)       -> NodeMCU Pin GND
 * =================================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

// 1. Wi-Fi Credentials
#define WIFI_SSID "Nothing Phone (3a)_2344"
#define WIFI_PASSWORD "Satyam@S7"

// 2. Direct Vercel Endpoint
const char* VERCEL_URL = "https://purecheck-irubssgth-satys9267-8741.vercel.app/api/telemetry";

// 3. Hardware Settings
#define TDS_PIN A0
#define VREF 3.3
#define SAMPLES_COUNT 30
#define TELEMETRY_INTERVAL 3000

int analogBuffer[SAMPLES_COUNT];
int analogBufferIndex = 0;
unsigned long lastTelemetryTime = 0;

int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++) bTab[i] = bArray[i];
  for (int j = 0; j < iFilterLen - 1; j++) {
    for (int i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        int bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  return (iFilterLen & 1) ? bTab[(iFilterLen - 1) / 2] : (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n==================================================");
  Serial.println("  PURECHECK // Direct Vercel Ingestion Booting... ");
  Serial.println("==================================================");

  pinMode(TDS_PIN, INPUT);

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
  Serial.println("[SYSTEM] Ready! Streaming to Vercel...\n");
}

void loop() {
  // Sample ADC
  static unsigned long sampleTime = 0;
  if (millis() - sampleTime > 40) {
    sampleTime = millis();
    analogBuffer[analogBufferIndex] = analogRead(TDS_PIN);
    analogBufferIndex = (analogBufferIndex + 1) % SAMPLES_COUNT;
  }

  // Send every 3 seconds
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = millis();

    float avgVoltage = getMedianNum(analogBuffer, SAMPLES_COUNT) * (float)VREF / 1024.0;
    float temperature = 25.0;
    float compCoeff = 1.0 + 0.02 * (temperature - 25.0);
    float compVolt = avgVoltage / compCoeff;

    float tds = (133.42 * compVolt * compVolt * compVolt 
                - 255.86 * compVolt * compVolt 
                + 857.39 * compVolt) * 0.5;
    if (tds < 0.0) tds = 0.0;
    float ec = tds * 2.0;

    tds = round(tds * 10.0) / 10.0;
    ec = round(ec * 10.0) / 10.0;
    avgVoltage = round(avgVoltage * 100.0) / 100.0;

    int currentRSSI = WiFi.RSSI();
    String localIP = WiFi.localIP().toString();

    Serial.printf("[TELEMETRY] TDS: %.1f ppm | Volts: %.2f V | EC: %.1f uS/cm | RSSI: %d dBm\n", tds, avgVoltage, ec, currentRSSI);

    // Build JSON payload
    String json = "{";
    json += "\"deviceName\":\"PureCheck-NodeMCU-01\",";
    json += "\"tds\":" + String(tds, 1) + ",";
    json += "\"voltage\":" + String(avgVoltage, 2) + ",";
    json += "\"ec\":" + String(ec, 1) + ",";
    json += "\"rssi\":" + String(currentRSSI) + ",";
    json += "\"ip\":\"" + localIP + "\"";
    json += "}";

    // HTTP POST to Vercel
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClientSecure client;
      client.setInsecure(); // SSL direct bypass

      HTTPClient http;
      if (http.begin(client, VERCEL_URL)) {
        http.addHeader("Content-Type", "application/json");
        int httpCode = http.POST(json);

        if (httpCode > 0) {
          Serial.printf("[VERCEL] Telemetry HTTP %d (Success!)\n", httpCode);
        } else {
          Serial.printf("[VERCEL] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
        }
        http.end();
      }
    }
  }
}
