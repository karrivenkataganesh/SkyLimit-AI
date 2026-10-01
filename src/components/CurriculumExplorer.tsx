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
} from "lucide-react";
import { CurriculumFile } from "../types";

export const CurriculumExplorer: React.FC = () => {
  const [files, setFiles] = useState<CurriculumFile[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>("overbooking_engine.py");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch files from server endpoint
  useEffect(() => {
    fetch("/api/curriculum-files")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.files) {
          setFiles(data.files);
        }
      })
      .catch((err) => console.error("Error loading curriculum files:", err))
      .finally(() => setLoading(false));
  }, []);

  const currentFile = files.find((f) => f.name === selectedFileName) || files[0];

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

  const handleDownloadAll = () => {
    // Generate combined bundle file
    let bundle = `# =====================================================================\n`;
    bundle += `# AIRLINE OVERBOOKING MANAGER: COMPLETE ACADEMIC PYTHON PACKAGE\n`;
    bundle += `# =====================================================================\n\n`;

    files.forEach((f) => {
      bundle += `\n# #####################################################################\n`;
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
    link.download = "airline_overbooking_manager_complete_bundle.py";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Complete Python Deliverables
            </span>
            <span className="text-xs text-slate-400">Computer Science Curriculum Codebase</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Code className="w-5 h-5 text-sky-400" />
            <span>Python Source Code &amp; CSV Datasets Lab</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Modular architecture: Object-Oriented design, discrete probability, 2D arrays, and Min-Heaps.
          </p>
        </div>

        {/* Global Download Button */}
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <FolderArchive className="w-4 h-4" />
          <span>Download All Files Bundle</span>
        </button>
      </div>

      {/* Main Layout: File Selector Sidebar + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: File List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Project Deliverables ({files.length})
          </div>

          <div className="space-y-1">
            {files.map((f) => {
              const isSelected = f.name === selectedFileName;
              const isCsv = f.type === "csv";
              const isPy = f.type === "python";

              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFileName(f.name)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-sky-950/80 border-sky-500/60 text-white shadow-sm ring-1 ring-sky-500/30"
                      : "bg-slate-800/30 border-slate-800/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCsv ? (
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    ) : isPy ? (
                      <FileCode className="w-4 h-4 text-sky-400" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-semibold truncate text-white">{f.name}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{f.title}</div>
                  </div>
                  {isSelected && <ChevronRight className="w-4 h-4 text-sky-400 shrink-0 self-center" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Code & Content Viewer */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>{currentFile?.name}</span>
                <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {currentFile?.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentFile?.desc}</p>
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

          {/* Code Viewer Body */}
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[580px] custom-scrollbar">
            <pre className="text-slate-300 leading-relaxed">
              <code>{currentFile?.content || "# Loading file content..."}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Local Run Guide Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Local Running &amp; Execution Guide (Terminal Commands)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          {/* Step 1 */}
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Virtual Environment</span>
            </div>
            <p className="text-slate-400 text-[11px]">Create an isolated environment for Python 3.9+:</p>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
              python3 -m venv venv{"\n"}source venv/bin/activate
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>Install Dependencies</span>
            </div>
            <p className="text-slate-400 text-[11px]">Install pandas, numpy, matplotlib, seaborn:</p>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
              pip install -r requirements.txt
            </pre>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Execute Pipeline</span>
            </div>
            <p className="text-slate-400 text-[11px]">Run the integrated simulation and plot generator:</p>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
              python main.py
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
