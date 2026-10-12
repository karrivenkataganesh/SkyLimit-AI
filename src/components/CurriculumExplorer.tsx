import React, { useState, useEffect } from "react";
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  FolderArchive,
  BookOpen,
  Code,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Server,
  Layout,
  Coffee,
  ExternalLink,
  Filter,
} from "lucide-react";
import { CurriculumFile } from "../types";

type CategoryKey = "all" | "frontend" | "backend" | "java-core";

interface CurriculumExplorerProps {
  initialCategory?: CategoryKey;
}

export const CurriculumExplorer: React.FC<CurriculumExplorerProps> = ({
  initialCategory = "all",
}) => {
  const [files, setFiles] = useState<CurriculumFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initialCategory);
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to compute a strictly unique file ID
  const getFileId = (f: CurriculumFile): string => f.id || `${f.category || "general"}/${f.name}`;

  // Sync category from URL hash or query params if present
  useEffect(() => {
    const handleUrlHash = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category")?.toLowerCase();

      if (catParam && ["frontend", "backend", "java-core"].includes(catParam)) {
        setSelectedCategory(catParam as CategoryKey);
      } else if (hash.includes("frontend")) {
        setSelectedCategory("frontend");
      } else if (hash.includes("backend")) {
        setSelectedCategory("backend");
      } else if (hash.includes("java-core") || hash.includes("java")) {
        setSelectedCategory("java-core");
      }
    };

    handleUrlHash();
    window.addEventListener("hashchange", handleUrlHash);
    return () => window.removeEventListener("hashchange", handleUrlHash);
  }, []);

  // Fetch files from server endpoint
  useEffect(() => {
    setLoading(true);
    fetch("/api/curriculum-files")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.files) {
          setFiles(data.files);
          // Set initial file ID
          if (!selectedFileId && data.files.length > 0) {
            setSelectedFileId(getFileId(data.files[0]));
          }
        }
      })
      .catch((err) => console.error("Error loading curriculum files:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filtered files based on active category
  const filteredFiles = files.filter((f) => {
    if (selectedCategory === "all") return true;
    return f.category === selectedCategory;
  });

  // Ensure selected file is within current filter
  useEffect(() => {
    if (filteredFiles.length > 0) {
      const stillInFilter = filteredFiles.some((f) => getFileId(f) === selectedFileId);
      if (!stillInFilter) {
        setSelectedFileId(getFileId(filteredFiles[0]));
      }
    }
  }, [selectedCategory, files]);

  const currentFile =
    filteredFiles.find((f) => getFileId(f) === selectedFileId) ||
    filteredFiles[0] ||
    files[0];

  // Redirect to category helper
  const handleRedirectCategory = (cat: CategoryKey) => {
    setSelectedCategory(cat);
    const newHash = cat === "all" ? "curriculum" : `curriculum?category=${cat}`;
    window.history.replaceState(null, "", `#${newHash}`);
  };

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBundle = () => {
    const targetFiles = filteredFiles.length > 0 ? filteredFiles : files;
    let bundle = `# =====================================================================\n`;
    bundle += `# AIRLINE OVERBOOKING MANAGER: ${selectedCategory.toUpperCase()} PACKAGE\n`;
    bundle += `# Generated on: ${new Date().toISOString()}\n`;
    bundle += `# =====================================================================\n\n`;

    targetFiles.forEach((f) => {
      bundle += `\n# #####################################################################\n`;
      bundle += `# CATEGORY: ${f.category || "General"}\n`;
      bundle += `# FILE: ${f.name}\n`;
      bundle += `# TITLE: ${f.title}\n`;
      bundle += `# DESCRIPTION: ${f.desc}\n`;
      bundle += `# #####################################################################\n\n`;
      bundle += f.content;
      bundle += `\n\n`;
    });

    const blob = new Blob([bundle], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `airline_overbooking_${selectedCategory}_bundle.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categories: {
    id: CategoryKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badgeBg: string;
  }[] = [
    {
      id: "all",
      label: "All Subsystems",
      icon: Layers,
      color: "text-slate-300",
      badgeBg: "bg-slate-800 text-slate-300",
    },
    {
      id: "frontend",
      label: "Frontend (React / TS)",
      icon: Layout,
      color: "text-sky-400",
      badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
    {
      id: "backend",
      label: "Backend (Node / Express)",
      icon: Server,
      color: "text-emerald-400",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "java-core",
      label: "Java Core (OOP / Heaps)",
      icon: Coffee,
      color: "text-amber-400",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
  ];

  const getFileIcon = (file: CurriculumFile) => {
    if (file.type === "java") return <Coffee className="w-4 h-4 text-amber-400" />;
    if (file.type === "typescript") return <Layout className="w-4 h-4 text-sky-400" />;
    if (file.type === "csv") return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    return <BookOpen className="w-4 h-4 text-purple-400" />;
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "frontend":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">Frontend</span>;
      case "backend":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Backend</span>;
      case "java-core":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Java Core</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Multi-Language Architecture
            </span>
            <span className="text-xs text-slate-400">Computer Science Curriculum Codebase</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Code className="w-5 h-5 text-sky-400" />
            <span>Architecture &amp; Code Lab: Frontend, Backend, and Java Core</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore code organized by subsystem. Select a category below or redirect directly to Frontend, Backend, or Java Core.
          </p>
        </div>

        {/* Global Download Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadBundle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Download {selectedCategory === "all" ? "All Files" : selectedCategory.toUpperCase()} Bundle</span>
          </button>
        </div>
      </div>

      {/* Subsystem Redirection Bar (Tab Filters) */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Subsystems:</span>
        </div>

        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === "all"
              ? files.length
              : files.filter((f) => f.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => handleRedirectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-800 text-white shadow-md border border-slate-700 ring-1 ring-sky-500/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${cat.color}`} />
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono text-slate-400 border border-slate-800">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Code & Content Viewer */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {currentFile && getFileIcon(currentFile)}
              <select
                value={currentFile ? getFileId(currentFile) : ""}
                onChange={(e) => setSelectedFileId(e.target.value)}
                aria-label="Select file"
                className="bg-slate-900 text-white font-mono text-xs sm:text-sm font-bold border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {filteredFiles.map((f) => {
                  const fileId = getFileId(f);
                  return (
                    <option key={fileId} value={fileId}>
                      {f.name} {selectedCategory === "all" ? `(${f.category})` : ""} — {f.title}
                    </option>
                  );
                })}
              </select>
            </div>
            {currentFile?.category && getCategoryBadge(currentFile.category)}
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hidden md:inline-block">
              {currentFile?.title}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Quick File Switcher Bar */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Files ({filteredFiles.length}):
          </span>
          {loading ? (
            <span className="text-xs text-slate-500 font-mono">Loading files...</span>
          ) : filteredFiles.length === 0 ? (
            <span className="text-xs text-slate-500 font-mono">No files in category</span>
          ) : (
            filteredFiles.map((f) => {
              const fileId = getFileId(f);
              const isSelected = fileId === (currentFile ? getFileId(currentFile) : "");
              return (
                <button
                  key={fileId}
                  onClick={() => setSelectedFileId(fileId)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-sky-600 text-white font-semibold shadow-sm shadow-sky-600/30"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {getFileIcon(f)}
                  <span>{f.name}</span>
                  {selectedCategory === "all" && (
                    <span className="text-[10px] opacity-70 font-sans">({f.category})</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Code Viewer Body */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[620px] custom-scrollbar">
          <pre className="text-slate-300 leading-relaxed">
            <code>{currentFile?.content || "# Loading file content..."}</code>
          </pre>
        </div>
      </div>

      {/* Subsystem Execution & Deployment Guides */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Local Running &amp; Execution Guides by Subsystem</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Active view: {selectedCategory.toUpperCase()}
          </span>
        </div>

        {/* Dynamic execution instructions based on selected category */}
        {selectedCategory === "java-core" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Java 17/21 SDK</span>
              </div>
              <p className="text-slate-400 text-[11px]">Verify Java compiler and runtime installation:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                javac -version{"\n"}java -version
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Direct Javac Compilation</span>
              </div>
              <p className="text-slate-400 text-[11px]">Compile classes into output bin directory:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                mkdir -p bin{"\n"}javac -d bin java-core/src/main/java/com/airline/overbooking/*.java
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Execute Java Simulation</span>
              </div>
              <p className="text-slate-400 text-[11px]">Run the enterprise Main driver with Min-Heap:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                java -cp bin com.airline.overbooking.Main
              </pre>
            </div>
          </div>
        ) : selectedCategory === "backend" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Environment Secrets</span>
              </div>
              <p className="text-slate-400 text-[11px]">Set Google Gemini API key in .env or Secret Manager:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                export GEMINI_API_KEY="your-key"{"\n"}export PORT=3000
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Development Server</span>
              </div>
              <p className="text-slate-400 text-[11px]">Run full-stack Express server with Vite:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm run dev
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Cloud Run Production</span>
              </div>
              <p className="text-slate-400 text-[11px]">Build static bundle and start Express container:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm run build{"\n"}npm start
              </pre>
            </div>
          </div>
        ) : selectedCategory === "frontend" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>React 19 &amp; Tailwind</span>
              </div>
              <p className="text-slate-400 text-[11px]">Install UI dependencies and icons:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm install
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Compile Assets</span>
              </div>
              <p className="text-slate-400 text-[11px]">Run production build with Vite bundler:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm run build
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Interactive Live Testing</span>
              </div>
              <p className="text-slate-400 text-[11px]">Verify hot reload and responsive seat map:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm run dev
              </pre>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Java Core Optimization</span>
              </div>
              <p className="text-slate-400 text-[11px]">Compile and test Java priority queue and Newsvendor engine:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                javac -d bin java-core/src/main/java/com/airline/overbooking/*.java
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Backend API &amp; Gemini</span>
              </div>
              <p className="text-slate-400 text-[11px]">Run Express service with AI fallback ladder:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm run dev
              </pre>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Frontend UI &amp; Curves</span>
              </div>
              <p className="text-slate-400 text-[11px]">Interactive SVG simulation curves and 2D cabin map:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                npm run build
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
