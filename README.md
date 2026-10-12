# Airline Overbooking Manager & Stochastic Optimization Lab

An interactive computer science curriculum platform, multi-stack architecture lab, and real-time operations dashboard for airline revenue management and overbooking risk control.

Built for CS / Data Science / Applied Mathematics coursework bridging:
- **Discrete Probability & Stochastic Calculus**: Binomial PMF/CDF distributions, Newsvendor critical ratio under marginal underage vs. overage costs ($C_u / (C_u + C_o)$).
- **Advanced Data Structures**: Priority Queue (Min-Heap / `heapq` / `java.util.PriorityQueue`) for passenger protection ranking and bumping lists.
- **Linear Algebra & Matrices**: 2D cabin seat grid matrices with sector load factor dot products.
- **Applied Generative AI**: Gemini API integration with an automated multi-model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`).
- **Multi-Subsystem Architecture**: Frontend (React 19 / TS / Tailwind), Backend (Node / Express / Gemini), Java Core (Enterprise OOP / Heaps / Matrices), and Python (NumPy / Pandas / Matplotlib).

---

## Architecture & Subsystems Overview

```
airline-overbooking-manager/
├── frontend/                          # Dedicated Frontend Architecture Subsystem
│   └── README.md                      # UI Architecture & Component Guide
├── backend/                           # Dedicated Backend Architecture Subsystem
│   ├── controllers/
│   │   └── FlightController.ts        # Request bounds validation & error containment
│   ├── services/
│   │   ├── GeminiService.ts           # Resilient multi-model fallback ladder
│   │   └── OverbookingService.ts      # Newsvendor analytical baseline
│   ├── routes/
│   │   └── apiRoutes.ts               # Categorized file discovery & redirection
│   ├── types/
│   │   └── index.ts                   # Backend schemas
│   └── README.md                      # Backend deployment & security standard
├── java-core/                         # Enterprise Java Core Architecture Subsystem
│   ├── src/main/java/com/airline/overbooking/
│   │   ├── OverbookingEngine.java     # Binomial PMF/CDF & Newsvendor stochastic engine
│   │   ├── PassengerPriorityQueue.java# Min-Heap priority queue with IDB audit logging
│   │   ├── SeatMatrix.java            # 2D cabin grid matrix & class partitioning
│   │   ├── Passenger.java             # Comparable passenger POJO model with protection scoring
│   │   ├── FlightDataManager.java     # CSV ingestion & seed data generator
│   │   └── Main.java                  # Executable Java CLI simulation driver
│   ├── pom.xml                        # Maven Java 17/21 compiler & build specification
│   └── README.md                      # Java compilation & execution guide
├── python_curriculum/                 # Python Academic Curriculum Package
│   ├── overbooking_engine.py          # Binomial & Newsvendor stochastic calculator
│   ├── seat_matrix.py                 # 2D NumPy cabin matrix & sector analysis
│   ├── priority_queue.py              # Python heapq passenger priority queue
│   ├── data_manager.py                # Pandas historical flight dataset processing
│   ├── ai_optimizer.py                # Gemini AI risk analysis & policy generator
│   ├── visualizer.py                  # Matplotlib/Seaborn dual-axis chart plotting
│   ├── main.py                        # Integrated Python CLI simulation driver
│   ├── flight_history.csv             # Historical flight logs (INR fares)
│   ├── current_bookings.csv           # Passenger booking manifest (INR fares)
│   └── requirements.txt               # Python pip dependencies
├── src/                               # Frontend Application Source (React 19 / TS / Vite)
│   ├── components/
│   │   ├── SimulationDashboard.tsx    # Dual-axis profit vs bump probability curve
│   │   ├── CabinSeatMap.tsx           # 2D cabin matrix & sector load factor engine
│   │   ├── PriorityQueueVisualizer.tsx# Min-heap visualizer & passenger queue reordering
│   │   ├── CurriculumExplorer.tsx     # Subsystem categorized code viewer & redirection
│   │   ├── MathematicalReference.tsx  # Mathematical formulation & derivations
│   │   └── ParticleBackground.tsx     # GPU WebGL GLSL atmospheric background
│   ├── utils/
│   │   └── mathEngine.ts              # Binomial PMF, simulation engine, protection scoring
│   ├── types.ts                       # Shared TypeScript schemas
│   └── App.tsx                        # Central state controller & navigation manager
├── server.ts                          # Production Cloud Run Express server with Vite dev proxy
├── metadata.json                      # AI Studio applet metadata
└── package.json                       # Node.js dependencies, scripts & Node 22 engine
```

---

## Subsystem Redirection & Deep-Linking

The application features built-in deep-linking and HTTP redirection across all subsystems:
- `/frontend` or `/#curriculum?category=frontend`: Opens Frontend components and architecture.
- `/backend` or `/#curriculum?category=backend`: Opens Express backend services, controllers, and routes.
- `/java-core` or `/#curriculum?category=java-core`: Opens Java 17/21 OOP classes, algorithms, and Maven POM.
- `/python` or `/#curriculum?category=python`: Opens Python 3 NumPy, Pandas, and Matplotlib curriculum modules.

---

## Prerequisites & Environment Setup

1. **Google Cloud SDK (`gcloud` CLI)**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     cloudbuild.googleapis.com
   ```

3. **Runtime Environments**:
   - Node.js 22+ (configured via `"engines": { "node": ">=22.0.0" }` in `package.json`)
   - Java 17+ (for `java-core/`)
   - Python 3.9+ (for `python_curriculum/`)

---

## Secret Management Configuration

Never hardcode API keys or credentials. Operational credentials are bound dynamically via Secret Manager:

```bash
# 1. Create the Gemini API Key secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API key value
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Obtain your Project Number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# 4. Grant Cloud Run runtime service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Cloud Firestore Security Rules

When provisioning Cloud Firestore for user interactions and simulation logs, enforce zero-insecure defaults with strict owner-bound data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

---

## Local Execution by Subsystem

### 1. Full-Stack Web App (Frontend + Backend)
```bash
# Install dependencies
npm install

# Start unified development server (Express + Vite on http://localhost:3000)
npm run dev

# Compile production bundle
npm run build
npm start
```

### 2. Java Core Simulation Subsystem
```bash
# Navigate to java-core directory
cd java-core

# Direct compilation with javac
mkdir -p bin
javac -d bin src/main/java/com/airline/overbooking/*.java

# Run enterprise simulation CLI driver
java -cp bin com.airline.overbooking.Main
```

### 3. Python Curriculum Pipeline
```bash
cd python_curriculum
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

---

## Cloud Run Deployment Flow

Build and deploy the application container to Google Cloud Run:

```bash
# 1. Build and deploy container directly from source
gcloud run deploy airline-overbooking-manager \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest

# 2. Apply mandatory campaign verification label
gcloud run services update airline-overbooking-manager \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region us-central1
```

---

## Multi-Platform Deployment Guides

This repository is pre-configured with declarative deployment manifests and zero-config files for all major cloud and container hosting platforms:

### 1. Render (`render.yaml`)
- **Type**: Web Service (Node.js runtime or Docker)
- **Manifest**: `render.yaml` included in root.
- **Steps**:
  1. Link your GitHub repository in the [Render Dashboard](https://dashboard.render.com).
  2. Render will automatically detect `render.yaml` (Build Command: `npm install && npm run build`, Start Command: `npm start`).
  3. Under **Environment Variables**, set:
     - `GEMINI_API_KEY`: Your Gemini API key.
     - `NODE_ENV`: `production`.
  4. Deploy! The service will bind to `$PORT` and serve both frontend and backend seamlessly.

### 2. Vercel (`vercel.json` & Serverless Function)
- **Manifest**: `vercel.json` and `api/index.ts`.
- **Steps**:
  1. Import the repository into the [Vercel Dashboard](https://vercel.com).
  2. Framework Preset: **Vite** (Root Directory: `./`).
  3. Build Command: `npm run build` | Output Directory: `dist`.
  4. In **Settings -> Environment Variables**, add:
     - `GEMINI_API_KEY`: Your Gemini API key.
  5. Deploy! Vercel serves the static frontend assets from edge CDNs while routing `/api/*` and subsystem redirects (`/frontend`, `/backend`, `/java-core`, `/python`) via the serverless Express function in `api/index.ts`.

### 3. Railway (`railway.json` & `Dockerfile`)
- **Manifest**: `railway.json` and `Dockerfile`.
- **Steps**:
  1. Click **New Project** -> **Deploy from GitHub repo** in [Railway](https://railway.app).
  2. Railway will automatically select the root `Dockerfile`.
  3. In **Variables**, add `GEMINI_API_KEY`.
  4. Railway provides a live HTTPS domain with automatic SSL and port forwarding.

### 4. Fly.io (`fly.toml` & `Dockerfile`)
- **Manifest**: `fly.toml` and `Dockerfile`.
- **Steps**:
  1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
  2. Run `fly launch` (it will detect `fly.toml` and `Dockerfile`).
  3. Set your secret: `fly secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY`
  4. Deploy: `fly deploy`

### 5. Netlify (`netlify.toml`)
- **Manifest**: `netlify.toml`.
- **Steps**:
  1. Link the repository in [Netlify](https://app.netlify.com).
  2. Netlify reads `netlify.toml` automatically: Build command `npm run build`, publish directory `dist`.
  3. Set environment variables under **Site configuration -> Environment variables**.
  4. Deploy! The SPA rewrite rules and subsystem redirects are handled at the edge.

### 6. Container / Docker Anywhere (AWS ECS, Azure App Service, DigitalOcean, self-hosted VPS)
- **Dockerfile**: Multi-stage Alpine container (`node:22-alpine`).
- **Steps**:
  ```bash
  # Build container image
  docker build -t airline-overbooking-manager .

  # Run container locally or in production
  docker run -p 8080:8080 -e GEMINI_API_KEY="your-api-key" airline-overbooking-manager
  ```
  Access the app at `http://localhost:8080`.

---

## Deployment Rollout Fix Details

- **Container Startup**: `server.ts` dynamically serves pre-built static assets from `dist/` in production mode without loading Vite development watchers, eliminating memory bloat and startup timeouts.
- **Port Binding**: Respects `PORT` passed by Cloud Run (`8080`) listening on `0.0.0.0:${PORT}`.
- **Health Probes**: Explicit `/health` and `/api/health` endpoints respond with `200 OK` in milliseconds to pass Cloud Run container rollout health checks immediately.
- **Node 22 Engine**: `package.json` specifies `"engines": { "node": ">=22.0.0" }` ensuring Google Cloud Buildpack deploys Node 22 with native TypeScript execution.
