import express, { type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import { FlightController } from "../controllers/FlightController.ts";
import type { CurriculumFileMetadata } from "../types/index.ts";

export const apiRouter = express.Router();

// Health check
apiRouter.get("/health", FlightController.getHealth);

// Predictive overbooking AI / Analytical
apiRouter.post("/predict-overbooking", FlightController.predictOverbooking);

/**
 * Universal file registry covering Frontend, Backend, Java Core, and Python curriculum.
 */
export function getAllProjectFiles(baseDir: string): CurriculumFileMetadata[] {
  const fileRegistry: {
    category: "frontend" | "backend" | "java-core";
    name: string;
    subPath: string;
    type: string;
    title: string;
    desc: string;
  }[] = [
    // Java Core files
    {
      category: "java-core",
      name: "OverbookingEngine.java",
      subPath: "java-core/src/main/java/com/airline/overbooking/OverbookingEngine.java",
      type: "java",
      title: "Stochastic Overbooking Engine",
      desc: "Binomial distribution PMF/CDF, log-gamma factorial arithmetic, Newsvendor critical ratio",
    },
    {
      category: "java-core",
      name: "PassengerPriorityQueue.java",
      subPath: "java-core/src/main/java/com/airline/overbooking/PassengerPriorityQueue.java",
      type: "java",
      title: "Priority Queue (Min-Heap)",
      desc: "Gate bumping queue with composite protection score and statutory IDB compensation audit log",
    },
    {
      category: "java-core",
      name: "SeatMatrix.java",
      subPath: "java-core/src/main/java/com/airline/overbooking/SeatMatrix.java",
      type: "java",
      title: "Cabin Seat Matrix (2D Layout)",
      desc: "Aircraft cabin grid, row-column addressing, cabin classes, and load factors",
    },
    {
      category: "java-core",
      name: "Passenger.java",
      subPath: "java-core/src/main/java/com/airline/overbooking/Passenger.java",
      type: "java",
      title: "Passenger Entity Model",
      desc: "Comparable passenger domain model with multi-criteria protection scoring in INR (₹)",
    },
    {
      category: "java-core",
      name: "FlightDataManager.java",
      subPath: "java-core/src/main/java/com/airline/overbooking/FlightDataManager.java",
      type: "java",
      title: "Flight Data Manager & CSV I/O",
      desc: "Ingests CSV manifests and generates seed datasets for simulations",
    },
    {
      category: "java-core",
      name: "Main.java",
      subPath: "java-core/src/main/java/com/airline/overbooking/Main.java",
      type: "java",
      title: "Java Core Simulation Runner",
      desc: "Executable main driver integrating Newsvendor optimizer, seat matrix, and bumping heap",
    },
    {
      category: "java-core",
      name: "pom.xml",
      subPath: "java-core/pom.xml",
      type: "xml",
      title: "Maven Build Specification",
      desc: "Java 17/21 compiler plugins and executable JAR build configuration",
    },
    {
      category: "java-core",
      name: "README.md",
      subPath: "java-core/README.md",
      type: "markdown",
      title: "Java Core Architecture Guide",
      desc: "Step-by-step javac and maven compilation and execution instructions",
    },

    // Backend files
    {
      category: "backend",
      name: "server.ts",
      subPath: "server.ts",
      type: "typescript",
      title: "Express Application Server",
      desc: "Production Cloud Run server with dynamic Vite dev middleware, JSON parsers, and routing",
    },
    {
      category: "backend",
      name: "GeminiService.ts",
      subPath: "backend/services/GeminiService.ts",
      type: "typescript",
      title: "Gemini AI Resilient Service",
      desc: "Automated multi-model fallback ladder: gemini-3.6-flash -> gemini-3.1-flash-lite -> dynamic alias",
    },
    {
      category: "backend",
      name: "OverbookingService.ts",
      subPath: "backend/services/OverbookingService.ts",
      type: "typescript",
      title: "Overbooking Mathematical Service",
      desc: "Newsvendor analytical baseline and normal approximation expected values",
    },
    {
      category: "backend",
      name: "FlightController.ts",
      subPath: "backend/controllers/FlightController.ts",
      type: "typescript",
      title: "Flight Prediction Controller",
      desc: "Defensive input validation, schema bounds, and zero-crash error containment",
    },
    {
      category: "backend",
      name: "apiRoutes.ts",
      subPath: "backend/routes/apiRoutes.ts",
      type: "typescript",
      title: "REST API Route Specifications",
      desc: "Endpoints for prediction, health probes, categorized file discovery, and redirection",
    },
    {
      category: "backend",
      name: "README.md",
      subPath: "backend/README.md",
      type: "markdown",
      title: "Backend Deployment & Security Guide",
      desc: "OWASP Top 10 mitigations, secret management, and Cloud Run architecture",
    },

    // Frontend files
    {
      category: "frontend",
      name: "SimulationDashboard.tsx",
      subPath: "src/components/SimulationDashboard.tsx",
      type: "typescript",
      title: "Dual-Axis Simulation Dashboard",
      desc: "Interactive SVG yield curves, INR sliders, preset corridors, and AI optimizer trigger",
    },
    {
      category: "frontend",
      name: "CabinSeatMap.tsx",
      subPath: "src/components/CabinSeatMap.tsx",
      type: "typescript",
      title: "2D Aircraft Cabin Matrix",
      desc: "Interactive seat grid with class partitions (First, Business, Economy) and inspection tooltip",
    },
    {
      category: "frontend",
      name: "PriorityQueueVisualizer.tsx",
      subPath: "src/components/PriorityQueueVisualizer.tsx",
      type: "typescript",
      title: "Priority Queue Visualizer (Min-Heap)",
      desc: "Animated min-heap tree, dynamic passenger enqueuing, and simulated gate bumping audit log",
    },
    {
      category: "frontend",
      name: "CurriculumExplorer.tsx",
      subPath: "src/components/CurriculumExplorer.tsx",
      type: "typescript",
      title: "Curriculum & Architecture Explorer",
      desc: "Categorized code viewer with Frontend, Backend, Java Core, and Python file redirects",
    },
    {
      category: "frontend",
      name: "mathEngine.ts",
      subPath: "src/utils/mathEngine.ts",
      type: "typescript",
      title: "Client-Side Mathematical Engine",
      desc: "Binomial PMF, expected net profit curves, and multi-factor protection score calculations",
    },
    {
      category: "frontend",
      name: "types.ts",
      subPath: "src/types.ts",
      type: "typescript",
      title: "Frontend TypeScript Interfaces",
      desc: "Domain types for flight params, passenger entities, analysis responses, and files",
    },
  ];

  return fileRegistry.map((item) => {
    const fullPath = path.join(baseDir, item.subPath);
    let content = "";
    if (fs.existsSync(fullPath)) {
      try {
        content = fs.readFileSync(fullPath, "utf-8");
      } catch (err) {
        content = `# Error reading ${item.name}: ${err}`;
      }
    }
    return {
      id: `${item.category}/${item.name}`,
      name: item.name,
      type: item.type,
      category: item.category,
      title: item.title,
      desc: item.desc,
      content,
    };
  });
}

// API: Retrieve curriculum files, optionally filtered by category
apiRouter.get("/curriculum-files", (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category.toLowerCase() : null;
    const baseDir = process.cwd();
    let files = getAllProjectFiles(baseDir);

    if (category && ["frontend", "backend", "java-core", "python"].includes(category)) {
      files = files.filter((f) => f.category === category);
    }

    res.json({
      success: true,
      category: category || "all",
      total: files.length,
      files,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error reading files";
    res.status(500).json({ success: false, error: errMessage });
  }
});

// Category-specific file endpoints
apiRouter.get("/files/:category", (req: Request, res: Response) => {
  const category = req.params.category.toLowerCase();
  const valid = ["frontend", "backend", "java-core", "python"];
  if (!valid.includes(category)) {
    res.status(404).json({ success: false, error: `Invalid category: ${category}` });
    return;
  }
  const files = getAllProjectFiles(process.cwd()).filter((f) => f.category === category);
  res.json({ success: true, category, total: files.length, files });
});

// Redirection helper
apiRouter.get("/redirect/:target", (req: Request, res: Response) => {
  const target = req.params.target.toLowerCase();
  if (["frontend", "backend", "java-core", "python"].includes(target)) {
    res.redirect(`/#curriculum?category=${target}`);
  } else {
    res.redirect("/#curriculum");
  }
});
