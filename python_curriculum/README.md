# Airline Overbooking Manager: Computer Science Curriculum Mini-Project

An integrated academic mini-project demonstrating core software architecture, data structures, linear algebra/probability modeling, and applied AI in aviation revenue management.

---

## 📚 Curriculum Core Concepts

| Module | Core CS / Math Concept | Implementation File |
| :--- | :--- | :--- |
| **Probability & Stochastic Optimization** | Binomial PMF, Discrete Expectations, Newsvendor Critical Ratio | `overbooking_engine.py` |
| **Linear Algebra & Arrays** | 2D Cabin Grid Matrices, Sector Slicing, Load Factor Dot Products | `seat_matrix.py` |
| **Data Structures** | Priority Queue (Min-Heap), Custom Comparator, $O(\log n)$ Bumping | `priority_queue.py` |
| **File I/O & Data Management** | Pandas DataFrame Parsing, CSV Validation, Time Series Aggregation | `data_manager.py` |
| **Applied AI / LLM Layer** | Gemini 3 API structured recommendation with multi-model fallback | `ai_optimizer.py` |
| **Visual Analytics** | Dual-axis curves, Seaborn thematic styling, Trade-off mapping | `visualizer.py` |

---

## 🚀 Quickstart: Running Locally

### Step 1: Clone or navigate to the directory
```bash
cd python_curriculum
```

### Step 2: Create and activate a Virtual Environment
```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows (Command Prompt / PowerShell)
python -m venv venv
.\venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4 (Optional): Configure Gemini API Key
To enable real-time Gemini AI optimization, set the environment variable:
```bash
# macOS / Linux
export GEMINI_API_KEY="your-api-key-here"

# Windows
set GEMINI_API_KEY=your-api-key-here
```
*(Note: If no API key is set, the system automatically runs the analytical Newsvendor stochastic fallback engine without breaking).*

### Step 5: Execute the Full Academic Pipeline
```bash
python main.py
```

---

## 📐 How Risk Scores & Overbooking Are Formulated

### 1. Newsvendor Critical Ratio (Optimal Capacity Determination)
When deciding how many tickets $n$ to sell beyond capacity $C$:
- **Underage Cost ($C_u$)**: Lost revenue if a seat flies empty = $\text{Base Fare}$.
- **Overage Cost ($C_o$)**: Penalty incurred if an oversold passenger is bumped = $\text{Involuntary Denied Boarding (IDB) Compensation}$.
- **Critical Ratio**:
  $$CR = \frac{C_u}{C_u + C_o}$$
- We find the smallest $n$ such that cumulative show-up probability satisfies:
  $$P(X \le C) \ge 1 - CR$$

### 2. Passenger Bumping Protection Score (Min-Heap Priority)
The priority queue sorts passengers in a Min-Heap based on an objective composite **Protection Score**:
$$\text{Protection Score} = W_{\text{fare}} + W_{\text{tier}} + \left(\frac{\text{Fare (₹ INR)}}{100}\right) \times 0.5 + \text{EarlyCheckinBonus} + \text{SafetyGuard}$$

- **Fare Class Weight**: First ($1000$), Business ($600$), Premium Economy ($350$), Economy ($150$)
- **Frequent Flyer Tier**: Platinum ($500$), Gold ($350$), Silver ($200$), Standard ($50$)
- **Early Check-in Bonus**: $\max(0, (24 - t_{\text{checkin\_hour}}) \times 4)$
- **Safety Guards**: Connecting Flight ($+300$), Special Medical/Assistance ($+2000$)

**Min-Heap Invariant**: The passenger at the root of the heap (`heap[0]`) has the **lowest protection score** and is objectively selected first for bumping or voluntary compensation solicitation.
