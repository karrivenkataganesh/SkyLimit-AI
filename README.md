# Airline Overbooking Manager & Stochastic Optimization Lab

An interactive computer science curriculum platform, Python architecture lab, and real-time operations dashboard for airline revenue management and overbooking risk control.

Built for CS / Data Science / Applied Mathematics coursework bridging:
- **Discrete Probability & Stochastic Calculus**: Binomial PMF/CDF distributions, Newsvendor critical ratio under marginal underage vs. overage costs ($C_u / (C_u + C_o)$).
- **Advanced Data Structures**: Priority Queue (Min-Heap / `heapq`) for passenger protection ranking and bumping lists.
- **Linear Algebra & Matrices**: 2D cabin seat grid matrices with sector load factor dot products.
- **Applied Generative AI**: Gemini API integration with an automated multi-model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`).
- **Modern Web Dashboard**: Express backend with Vite, React 19, Tailwind CSS, Three.js shaders, and interactive controls.

---

## Architecture & System Overview

```
airline-overbooking-manager/
├── src/
│   ├── components/
│   │   ├── SimulationDashboard.tsx      # Dual-axis profit vs bump probability curve
│   │   ├── CabinSeatMap.tsx             # 2D cabin matrix & sector load factor engine
│   │   ├── PriorityQueueVisualizer.tsx  # Min-heap visualizer & passenger queue reordering
│   │   ├── CurriculumExplorer.tsx       # In-browser Python curriculum file viewer & runner
│   │   ├── MathematicalReference.tsx    # Mathematical formulation & latex derivations
│   │   └── ParticleBackground.tsx       # GPU WebGL GLSL atmospheric background
│   ├── utils/
│   │   └── mathEngine.ts                # Binomial PMF, simulation engine, protection scoring
│   ├── types.ts                         # Shared TypeScript schemas
│   └── App.tsx                          # Central state controller and tab manager
├── python_curriculum/
│   ├── overbooking_engine.py            # Binomial & Newsvendor stochastic calculator
│   ├── seat_matrix.py                   # 2D NumPy cabin matrix & sector analysis
│   ├── priority_queue.py                # Python heapq passenger priority queue
│   ├── data_manager.py                  # Pandas historical flight dataset processing
│   ├── ai_optimizer.py                  # Gemini AI risk analysis & policy generator
│   ├── visualizer.py                    # Matplotlib/Seaborn dual-axis chart plotting
│   ├── main.py                          # Integrated Python CLI simulation driver
│   ├── flight_history.csv               # Historical flight logs (20 routes)
│   ├── current_bookings.csv             # Passenger booking manifest (20 records)
│   └── requirements.txt                 # Python pip dependencies
├── server.ts                            # Express API proxy with Gemini Fallback Ladder
├── metadata.json                        # AI Studio applet metadata
└── package.json                         # Node.js dependencies & scripts
```

---

## Prerequisites & Environment Setup

1. **Google Cloud SDK (`gcloud` CLI)** installed and authenticated:
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

3. **Node.js & Python Environments**:
   - Node.js 20+ and npm 10+
   - Python 3.10+ (for running the Python curriculum files locally)

---

## Secret Management Configuration

Never hardcode API keys or service account credentials. Configure Secret Manager:

```bash
# 1. Create the Gemini API Key secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API key value
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Obtain your Project Number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# 4. Grant Cloud Run default compute service account permission to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Cloud Firestore Security Rules

When provisioning Cloud Firestore for user interactions and simulation logs, enforce zero-insecure defaults with strict owner-bound access control:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User interactions isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Read-only curriculum metadata
    match /curriculum/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

---

## Local Development

### 1. Web Application & Dashboard
```bash
# Install Node dependencies
npm install

# Run full-stack dev server (Express + Vite) on port 3000
npm run dev
```
Open `http://localhost:3000` to access the interactive dashboard.

### 2. Python Curriculum Execution
```bash
cd python_curriculum
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run full terminal simulation
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
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000

# 2. Apply mandatory campaign verification label
gcloud run services update airline-overbooking-manager \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region us-central1
```

---

## Testing & Quality Assurance Walkthrough

Refer to the automated and manual verification instructions in the test verification catalog for complete coverage of mathematical bounds, priority heap operations, and AI fallback recovery.
