# Airline Overbooking Manager - Frontend Subsystem

Interactive, modern aviation revenue management and CS architecture simulation built with React 19, TypeScript, and Tailwind CSS.

## Architecture & Components

- **`SimulationDashboard.tsx`**:
  - Interactive SVG dual-axis graph displaying seat inventory versus net expected profit and passenger bump risk.
  - Interactive slider controls for seat capacity, Indian Rupee (₹ INR) ticket fares, involuntary denied boarding penalties, and historical no-show probabilities.
  - Preset airline corridors (e.g. DEL ➔ BOM Metro Trunk, BLR ➔ DEL Corridor, BOM ➔ DXB Gulf Route).
  - Server-side Gemini AI optimization trigger with comprehensive analytical baselines.

- **`CabinSeatMap.tsx`**:
  - 2D interactive aircraft cabin grid (First Class, Business Class, Premium Economy, and Economy).
  - Physical seat layout inspection, load factor calculations, and passenger seat assignments.

- **`PriorityQueueVisualizer.tsx`**:
  - Visual Min-Heap tree and sorted priority queue.
  - Multi-factor protection scoring formula incorporating fare paid (INR), loyalty status, connection status, and check-in timing.
  - Interactive gate bumping simulator with statutory compensation audit records.

- **`CurriculumExplorer.tsx`**:
  - Code and file explorer with categorized filtering across **Frontend**, **Backend**, **Java Core**, and **Python**.
  - Direct file content viewer with copy-to-clipboard, individual file download, and full category bundle downloads.
  - Redirection based on selected subsystem.

- **`MathematicalReference.tsx`**:
  - Comprehensive theoretical foundations: Newsvendor Model, Binomial PMF, Normal Approximation, and Fair Bumping Optimization algorithms.

## Execution

```bash
# Start frontend with dev server
npm run dev

# Compile production bundle
npm run build
```
