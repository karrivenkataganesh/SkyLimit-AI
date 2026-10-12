# Airline Overbooking Manager - Java Core Subsystem

High-performance, enterprise-grade Java implementation of the airline revenue optimization and yield management architecture.

## Architecture Overview

1. **`OverbookingEngine.java`**:
   - Binomial Probability Mass Function ($P(K = k \mid n, p)$) utilizing log-gamma combination arithmetic to prevent floating-point overflow.
   - Newsvendor economic trade-off analysis between marginal seat revenue ($C_u$) and involuntary denied boarding penalties ($C_o$).
   - Dual-axis expected net profit curve calculation.

2. **`SeatMatrix.java`**:
   - 2D aircraft cabin grid representation (Rows 1 to 30, Columns A through F).
   - Cabin class partitioning (First, Business, Premium Economy, Economy).
   - Dynamic seat assignment and real-time cabin load factor calculations.

3. **`PassengerPriorityQueue.java`**:
   - Priority Queue Min-Heap (`java.util.PriorityQueue<Passenger>`) sorting by multi-factor protection scores.
   - Automated regulatory IDB compensation compliance (200% ticket fare, bounded between ₹10,000 and ₹45,000 INR).
   - Complete audit trail logging.

4. **`Passenger.java` & `FlightDataManager.java`**:
   - Object-oriented passenger domain entity with composite protection scoring.
   - CSV dataset ingestion and realistic seed data generators.

---

## Compilation & Execution

### Prerequisites
- JDK 17 or higher (`javac` and `java` available on PATH)
- Optional: Apache Maven 3.8+

### Option A: Direct Compilation with `javac` & `java`

```bash
# Navigate to the java-core root
cd java-core

# Compile all Java sources into the target bin directory
mkdir -p bin
javac -d bin src/main/java/com/airline/overbooking/*.java

# Execute the simulation driver
java -cp bin com.airline.overbooking.Main
```

### Option B: Build and Run with Maven

```bash
cd java-core
mvn clean package
java -jar target/overbooking-core-1.0.0.jar
```

---

## Mathematical Formulation

$$\text{Critical Ratio} = \frac{C_u}{C_u + C_o} = \frac{\text{Base Fare}}{\text{Base Fare} + \text{Bump Penalty}}$$

$$\text{Protection Score} = W_{\text{fare}} + W_{\text{tier}} + \left(\frac{\text{Fare (₹ INR)}}{100}\right) \times 0.5 + \text{EarlyCheckinBonus} + \text{SafetyGuard}$$
