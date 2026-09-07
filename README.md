# 🕉️ DarshanSetu (दर्शनसेतु) — Intelligent Multi-Temple Crowd Management & Telemetry Platform

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://darshansetu-dashboard.vercel.app)
[![Railway Deployment](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway)](https://darshansetu-production.up.railway.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostGIS-15-336791?style=flat-square&logo=postgresql)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![MQTT](https://img.shields.io/badge/MQTT-Mosquitto-660066?style=flat-square&logo=eclipse-mosquitto)](https://mosquitto.org/)
[![YOLOv8](https://img.shields.io/badge/Vision_AI-YOLOv8-00FFFF?style=flat-square)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **DarshanSetu** is an enterprise-grade, real-time crowd analytics and pilgrim safety platform engineered for high-density religious pilgrimage shrines across Gujarat (**Dwarka, Somnath, Ambaji, and Pavagadh**). It unifies IoT turnstiles, Edge Computer Vision, AI-driven traffic incident management, and a zero-friction devotee portal into a cohesive smart infrastructure.

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [End-to-End System Architecture](#-end-to-end-system-architecture)
3. [Core Feature Breakdown](#-core-feature-breakdown)
   - [A. Pilgrim Seva Portal](#a-pilgrim-seva-portal-devotee-facing)
   - [B. Admin Command Center](#b-admin-command-center-operations--police)
   - [C. UI/UX Design System & Localization](#c-uiux-design-system--localization)
4. [Calibrated Pilgrimage Sites (Gujarat)](#-calibrated-pilgrimage-sites-gujarat)
5. [Technology Stack](#-technology-stack)
6. [Repository & Directory Structure](#-repository--directory-structure)
7. [Local Setup & Installation Guide](#-local-setup--installation-guide)
8. [API, WebSocket & MQTT Specifications](#-api-websocket--mqtt-specifications)
9. [Machine Learning & Computer Vision Pipelines](#-machine-learning--computer-vision-pipelines)
10. [Security, Privacy & DPDP Compliance](#-security-privacy--dpdp-compliance)
11. [Future Scope & Strategic Roadmap](#-future-scope--strategic-roadmap)
12. [Hackathon Pitch & Cross-Questioning Defense](#-hackathon-pitch--cross-questioning-defense)

---

## 📌 Executive Summary & Problem Statement

### The Problem
Major religious shrines in India regularly host hundreds of thousands of pilgrims daily, surging beyond 1 million during festivals (e.g., Janmashtami at Dwarka, Mahashivratri at Somnath, Navratri at Ambaji and Pavagadh). These surges cause severe operational challenges:
* **Stampede & Surge Risks**: Abrupt bottlenecks forming inside barricaded sanctum queues without early warning.
* **Separated Children & Elderly**: Thousands of family separation cases during peak rush hours, overwhelming local public address systems.
* **Corridor & Traffic Paralysis**: Ingress roads choked with vehicles, delaying emergency ambulances and fire tenders.
* **Information Asymmetry**: Devotees enter queues blindly without knowing wait times, water points, or cloakroom locations.

### The DarshanSetu Solution
**DarshanSetu** provides a dual-interface smart ecosystem:
1. **For Devotees**: A zero-download, multilingual mobile web portal featuring digital QR passes, real-time queue meters, a 14-day rush forecast, dual-mode satellite & architectural maps, missing person reporting, and an emergency SOS beacon.
2. **For Administrators & Police**: A unified Command Overview displaying live occupancy differentials, turnstile telemetry, YOLOv8 CCTV crowd counting, vahanFlow incident prediction (dispatching marshals and barricades), and direct emergency escalation desks.

---

## 🏛️ End-to-End System Architecture

```
                                  ┌──────────────────────────────────────────────────┐
                                  │             IoT & Hardware Layer                 │
                                  │  • ESP32 Turnstile Controllers (MQTT / 1883)     │
                                  │  • Edge RTSP CCTV Feeds (YOLOv8 Head Counting)   │
                                  │  • Physical Panic Buttons & Hall Sensors         │
                                  └────────────────────────┬─────────────────────────┘
                                                           │
                                                           ▼
                                  ┌──────────────────────────────────────────────────┐
                                  │          Ingress & Broker Services               │
                                  │  • Eclipse Mosquitto MQTT Broker                 │
                                  │  • Redis 7 In-Memory Pub/Sub & Telemetry Cache   │
                                  └────────────────────────┬─────────────────────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DarshanSetu Core Engine (Node.js / TS)                                     │
│  • Express REST APIs            • Socket.IO Real-Time Emitter (2s Telemetry)   • PostGIS Spatial Indexing        │
│  • HMAC QR Pass Generator       • Emergency SOS Orchestration                  • Incident Feedback Ingestion     │
│  • Prisma ORM Layer             • PostgreSQL 15 Core Database                  • Role Segregation Engine         │
└─────────────────────────────────┬──────────────────────────────────────────────┬─────────────────────────────────┘
                                  │                                              │
                                  ▼                                              ▼
       ┌──────────────────────────────────────┐        ┌─────────────────────────────────────────────────┐
       │     ML & Vision Engine (Python)      │        │            Client Presentation Layer            │
       │  • YOLOv8 Crowd Density & Heatmaps   │        │  • Pilgrim Seva Portal (Mobile-Responsive)      │
       │  • vahanFlow Mobility Predictor      │        │  • Admin Command Center (Desktop Command View)  │
       │  • CatBoost Tactical Recommender     │        │  • Dual-Mode Leaflet Map (Satellite/Blueprint)  │
       │  • Continuous Feedback ML Pipeline   │        │  • Dynamic Theme Engine (Temple vs Tech)        │
       └──────────────────────────────────────┘        └─────────────────────────────────────────────────┘
```

---

## 🌟 Core Feature Breakdown

### A. Pilgrim Seva Portal (Devotee-Facing)
* **🎫 Instant Darshan E-Pass Booking**: Generates dynamic QR passes for General Entry, Senior Citizens, Divyangjan, and Special Puja slots with anti-screenshot security tokens.
* **⏱️ Real-Time Queue & Gate Throughput**: Live waiting estimates and flow rates across entry gates with breathing status glows (🟢 Light, 🟡 Moderate, 🔴 Heavy).
* **📅 14-Day Devotee Rush Calendar**: Predictive calendar mapping upcoming footfall curves, highlighting recommended low-rush visiting days.
* **🗺️ Dual-Mode Temple Guide & Map**:
  - **Satellite HD Mode**: High-resolution Google Hybrid satellite tiles with calibrated custom map pins for 9 checkpoint categories (Sanctum, Gates, Free RO Water, Shoe Counters, Cloakrooms, Medical Posts, Prasad Counters, Wheelchair Hubs, Police Desks).
  - **Architectural Blueprint Mode**: Step-by-step Standard Operating Procedure (SOP) flow diagrams mapping pedestrian progression:
    $$\text{Entry Gate} \longrightarrow \text{Lockers} \longrightarrow \text{Holding Bays} \longrightarrow \text{Sanctum} \longrightarrow \text{Prasad} \longrightarrow \text{Exit}$$
* **👶 Missing Family Member Alert**: Pilgrims can report separated children or seniors instantly with photo, clothing description, and last-seen checkpoint. Dispatches immediately to on-duty marshals.
* **🚨 24x7 Emergency SOS Beacon**: One-touch distress trigger transmitting the pilgrim's device GPS coordinates directly to the Central Control Room.
* **🕉️ Daily Sacred Aarti Schedule**: Complete timetable of daily rituals (Mangla, Shringar, Bhog, Sandhya, Shayan) with countdowns to the next aarti.
* **📜 Pilgrim Advisory & Code of Conduct**: Guidelines on traditional attire, mobile locker rules, and wheelchair accessibility.

### B. Admin Command Center (Operations & Police)
* **📊 Command Overview**: Live KPI tiles tracking total footfall, active crowd, capacity percentage, gate entry/exit rates, active security marshals, and system health.
* **👥 Live Occupancy Differential**: Tracks real-time net crowd inside the temple compound using turnstile ingress and egress sensors:
  $$\Delta \text{Crowd}(t) = \int \big(\text{Ingress Rate}(t) - \text{Egress Rate}(t)\big) \, dt$$
* **🚗 vahanFlow Mobility & Traffic Predictor**:
  - Predicts incident clearance duration using CatBoost and PyTorch models.
  - Automatically calculates tactical allocations: required police officers, security marshals, barricading type (Modular vs. Heavy Armor), and bypass diversion corridors.
  - Features a **Human-in-the-Loop Feedback Loop** where officer overrides trigger automated model retraining.
* **📷 Edge CCTV Crowd Telemetry**: Computer-vision head counting using YOLOv8 running on edge streams to detect sudden crowd surges and stampede triggers.
* **🛂 Gate Security QR Scanner**: Built-in camera scanner for guards at turnstiles to validate devotee passes in $< 100\text{ ms}$, preventing pass duplication.
* **🚨 Emergency Command Desk & Reports**: Comprehensive incident log, response time tracker, and magisterial report export.

### C. UI/UX Design System & Localization
* **🛕 Instant Theme Preset Switcher**: One-click header toggle between:
  - **Temple Theme**: Vedic Saffron Orange (`#ea580c`), Sandalwood Silk Cream (`#fbf7ee`), Royal Gold Accents (`#d97706`), and a subtle Sacred Lotus Mandala SVG background pattern.
  - **Tech Theme**: Corporate Electric Blue (`#2563eb`), Cool Slate Grey (`#f8fafc`), and clean enterprise dashboard styling.
* **🌙 Sandhya Aarti Dark Mode**: Deep obsidian and temple indigo palette (`#0b0f19`) with warm amber lamp halos for night operations.
* **✨ 60 FPS Hardware-Accelerated Animations**: Staggered card entry cascades (`.stagger-grid`), live telemetry breathing halos, golden shimmer location badges, and tactile button presses without external JS animation dependencies.
* **🌐 Trilingual Localization**: Instant runtime translation across **English, Hindi (हिन्दी), and Gujarati (ગુજરાતી)**.

---

## 🗺️ Calibrated Pilgrimage Sites (Gujarat)

DarshanSetu is pre-configured with precise GPS coordinates, landmark topologies, queue lane configurations, and emergency service integrations for Gujarat's four prominent shrines:

| Shrine | Location | Primary Focal Point | GPS Coordinates | Baseline Capacity |
| :--- | :--- | :--- | :--- | :--- |
| **Dwarkadhish Temple** | Devbhumi Dwarka | Moksha Dvar & Swarga Dvar | `22.2376° N, 68.9675° E` | 35,000 devotees |
| **Somnath Jyotirlinga** | Prabhas Patan, Veraval | Main Sanctum & Sea Walk | `20.8880° N, 70.4013° E` | 45,000 devotees |
| **Ambaji Shaktipeeth** | Banaskantha | Gabbar Hill & Chachar Chowk | `24.3330° N, 72.8485° E` | 50,000 devotees |
| **Kalika Mata Temple** | Pavagadh Hill | Hilltop Sanctum & Ropeway | `22.4597° N, 73.5204° E` | 30,000 devotees |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, Vite 8, TypeScript | High-performance SPA architecture with sub-second hot reload |
| **Styling & UI** | CSS3 Custom Properties, Modern CSS Keyframes | Zero-runtime CSS variables for instant theme switching & micro-interactions |
| **Icons & Visuals** | Lucide React | Clean, accessible SVG iconography |
| **Charting Engine** | Recharts 3.x | Reactive real-time footfall curves and 14-day projection graphs |
| **Mapping Engine** | Leaflet 1.9, Google Hybrid (`lyrs=y`), Google Roadmap (`lyrs=m`) | Satellite imagery and architectural checkpoint navigation |
| **Real-Time Client** | Socket.IO Client 4.8 | Bidirectional event streaming for live telemetry |
| **Backend Core** | Node.js, Express, TypeScript | High-concurrency REST APIs and event orchestration |
| **Database & ORM** | PostgreSQL 15, PostGIS, Prisma ORM 5.10 | Geospatial checkpoint queries, relational incident tracking, and schema migrations |
| **Cache & Pub/Sub** | Redis 7 Alpine, ioredis | Fast turnstile session caching and cluster-wide message distribution |
| **IoT Gateway** | Eclipse Mosquitto MQTT 2.x, MQTT.js | Turnstile sensor telemetry and hardware panic button ingestion |
| **Vision AI** | YOLOv8 (Ultralytics), OpenCV, NumPy | Real-time crowd head counting and bottleneck detection |
| **Mobility ML** | CatBoost, PyTorch | vahanFlow tactical dispatch duration and resource recommendation |
| **Containerization** | Docker, Docker Compose | Multi-container local orchestration (Postgres, Redis, MQTT) |
| **Hosting & CI/CD** | Vercel (Frontend), Railway (Backend) | Production cloud deployments with automatic GitHub CI/CD triggers |

---

## 📁 Repository & Directory Structure

```
DarshanSetu/
├── backend/                        # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   └── schema.prisma           # Prisma PostgreSQL Database Schema
│   ├── src/
│   │   ├── controllers/            # REST API Controllers (Incidents, Passes, Analytics)
│   │   ├── routes/                 # Express Route Definitions
│   │   ├── services/               # Socket.IO, Redis, and MQTT Ingress Services
│   │   └── index.ts                # Main Server Entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomMetrics.jsx   # Lower Sparkline KPI Cards
│   │   │   ├── EmergencyCommandDesk.jsx # SOS Incident Dispatch Module
│   │   │   ├── GuardScannerModal.jsx # Security Turnstile QR Scanner
│   │   │   ├── Header.jsx          # Top Navigation, Role & Theme Presets
│   │   │   ├── InteractiveMap.jsx  # Admin Geographical Command Map
│   │   │   ├── LiveAlerts.jsx      # High-Priority Security Feed
│   │   │   ├── Logo.jsx            # Sacred Temple Emblem SVG
│   │   │   ├── ModuleNavigation.jsx # Top Command Navigation Tabs
│   │   │   ├── PilgrimPortal.jsx   # Dedicated Devotee Mobile-First Portal
│   │   │   ├── ReportsModule.jsx   # Magisterial Incident Report Generation
│   │   │   ├── Sidebar.jsx         # Left Collapsible Navigation & SOS Strip
│   │   │   ├── SituationOverview.jsx # Top Level Crowd Analytics Dashboard
│   │   │   ├── StatsAndCharts.jsx  # Recharts Real-Time Flow Visualizations
│   │   │   ├── TempleGuideMap.jsx  # Dual-Mode Satellite & Blueprint Map
│   │   │   └── TicketBookingModal.jsx # E-Pass Booking Modal
│   │   ├── utils/
│   │   │   ├── siteData.js         # Master Registry for Dwarka, Somnath, Ambaji, Pavagadh
│   │   │   └── translations.js     # English, Hindi & Gujarati Localization Strings
│   │   ├── App.jsx                 # Main Application Orchestrator & State Container
│   │   ├── index.css               # Global Theme Tokens, Patterns & Micro-Animations
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── iot/                            # IoT Firmware & Edge Hardware
│   └── esp32/                      # ESP32 Turnstile Ingress Sensors (MQTT C++/Arduino)
├── ml-engine/                      # Python Vision & Mobility Engine
│   ├── models/                     # CatBoost / PyTorch Tactical Weight Checkpoints
│   ├── pipelines/                  # Automated Feedback Retraining Scripts
│   ├── traffic_predictor/          # vahanFlow Tactical Plan Heuristics
│   ├── requirements.txt            # Python Dependencies (ultralytics, opencv, etc.)
│   └── yolov8n.pt                  # Pre-trained YOLOv8 Nano Vision Model
├── config/
│   └── mosquitto.conf              # Eclipse Mosquitto MQTT Broker Configuration
├── docker-compose.yml              # Multi-Service Infrastructure Orchestrator
└── README.md                       # Master Documentation
```

---

## 🚀 Local Setup & Installation Guide

### Prerequisites
* **Node.js**: `>= 18.18.0` ([Download](https://nodejs.org/))
* **Docker Desktop**: `>= 4.20.0` ([Download](https://www.docker.com/))
* **Python**: `>= 3.10` (for ML Engine)
* **Git**: Installed and configured

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/RitambharAdvait/DarshanSetu.git
cd DarshanSetu
```

---

### Step 2: Spin Up Infrastructure Containers
Start the PostgreSQL (PostGIS), Redis, and Mosquitto MQTT containers:
```bash
docker-compose up -d
```
Verify containers are running:
```bash
docker ps
# Expected: darshansetu_postgres (5433->5432), darshansetu_redis (6379), darshansetu_mqtt (1883, 9001)
```

---

### Step 3: Backend Setup
```bash
cd backend
npm install

# Push database schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Start Backend in Development Mode
npm run dev
```
The backend server initializes on `http://localhost:5000` with WebSocket listeners active.

---

### Step 4: Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install

# Start Vite Development Server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### Step 5: ML Vision Engine Setup (Optional)
In a third terminal window:
```bash
cd ml-engine
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

## 📡 API, WebSocket & MQTT Specifications

### REST Endpoints
| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/passes/book` | Generates a signed Devotee E-Pass | `{ siteId, devoteeName, slotTime, passType }` |
| `POST` | `/api/passes/validate` | Validates a pass QR at turnstile | `{ qrToken, gateId }` |
| `POST` | `/api/incidents/sos` | Registers an emergency SOS incident | `{ siteId, zoneId, type, severity, lat, lng }` |
| `POST` | `/api/incidents/:id/recommend` | Requests ML tactical mitigation plan | `{ incidentId }` |
| `PUT` | `/api/incidents/:id/feedback` | Logs post-incident override feedback | `{ actualDuration, actualMarshals, remarks }` |
| `GET` | `/api/analytics/forecast` | Returns 14-day crowd projection | `?siteId=dwarka` |

### WebSocket Real-Time Events (`socket.io`)
* **`occupancy_update`**: Emitted on every turnstile scan with updated site crowd counts.
* **`forecast_stream`**: Emits real-time simulated 2-second telemetry drift updates.
* **`new_incident`**: Broadcasts critical SOS triggers to the Admin Command Desk.
* **`gate_scan`**: Broadcasts valid/invalid entry logs to security monitors.

### MQTT Ingress Topics
* **`temple/{siteId}/telemetry`**: Publishes sensor count increments (`{ "gate": "Gate-2", "in": 1 }`).
* **`temple/{siteId}/sos`**: Hardware panic button triggers across compounds.

---

## 🧠 Machine Learning & Computer Vision Pipelines

### 1. YOLOv8 Edge Vision Pipeline
* **Input**: RTSP video streams from fixed CCTV dome cameras stationed at Sanctum entrances and holding areas.
* **Model**: YOLOv8 Nano (`yolov8n.pt`), quantized to FP16 for low-latency inferencing ($< 35\text{ ms/frame}$).
* **Task**: Head detection and spatial bounding-box clustering to calculate density metrics ($\text{people}/\text{m}^2$).
* **Alert Trigger**: If density exceeds $\rho_{\text{crit}} = 4.5 \, \text{people}/\text{m}^2$, an emergency bottleneck event is emitted.

### 2. vahanFlow Mobility Incident Engine
* **Input Variables**: Event class (`CONGESTION`, `STAMPEDE_RISK`, `VIP_MOVEMENT`), priority (`CRITICAL`, `HIGH`, `MODERATE`), junction coordinates, and current site crowd.
* **Model**: Ensemble CatBoost Regressor & PyTorch Multi-Layer Perceptron (MLP).
* **Output**: Clearance duration (minutes), required security marshals, barricade specification, and dynamic vehicular diversion routes.
* **Continuous Retraining**: When operators adjust actual marshals or duration, feedback is stored in `feedback.db`/PostgreSQL. Once 50 new samples accumulate, automated retraining fine-tunes model weights.

---

## 🛡️ Security, Privacy & DPDP Compliance

* **DPDP Act (Digital Personal Data Protection) Ready**: The vision pipeline executes inferencing locally on edge devices. Only numerical density values and bounding centroids are transmitted; **no facial recognition vectors or biometric profiles are permanently logged**.
* **Cryptographic QR E-Passes**: Passes contain an encrypted HMAC-SHA256 signature combining `DevoteeID + Timestamp + Nonce`, invalidating duplicate or forged pass attempts.
* **Strict Role-Based Separation**: Separation between Devotee actions and Administrative Command APIs ensures pilgrims cannot access sensitive police deployment data.

---

## 🔮 Future Scope & Strategic Roadmap

1. **Edge YOLOv10 Acceleration**: Integration with TensorRT for zero-latency execution on existing low-cost DVR hardware.
2. **Reusable BLE/RFID Wristbands**: Issuance of waterproof smart bands at entry gates for vulnerable groups (children, elderly, Divyangjan) allowing sub-meter localization across sanctum zones.
3. **Regional WhatsApp Seva Bot**: Zero-app access via WhatsApp Business API for instant QR pass delivery, queue alerts, and multilingual audio navigation.
4. **State 108 & Police Interoperability**: Direct API bridge interfacing DarshanSetu with Gujarat Police Control Rooms and GVK EMRI 108 ambulances for automated green-corridor creation.
5. **Pan-India Multi-State Expansion**: Architectural scaling from Gujarat to Char Dham, Tirupati, and Mahakaleshwar via multi-tenant cloud partitions.

---

*Built with devotion for safe, organized, and tranquil pilgrimage experiences.*
