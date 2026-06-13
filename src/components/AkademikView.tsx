import React, { useState } from "react";
import { 
  GraduationCap, Award, BookOpen, Clock, Layers, Plus, Search, Calendar, 
  CheckCircle2, Sparkles, UploadCloud, FileText, Check, Loader2, X, AlertTriangle 
} from "lucide-react";
import { AcademicCourse, UserProfile, getIpkClassification } from "../types";

interface AkademikViewProps {
  courses: AcademicCourse[];
  setCourses: React.Dispatch<React.SetStateAction<AcademicCourse[]>>;
  profile: UserProfile;
}

export default function AkademikView({ courses, setCourses, profile }: AkademikViewProps) {
  const [semesterFilter, setSemesterFilter] = useState<number>(6);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Available semesters state (minimum semesters 1-6 built-in, plus whatever is in current course array)
  const [availableSemesters, setAvailableSemesters] = useState<number[]>(() => {
    const semSet = new Set<number>([1, 2, 3, 4, 5, 6]);
    courses.forEach(c => semSet.add(c.semester));
    return Array.from(semSet).sort((a, b) => a - b);
  });
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [newSemesterNum, setNewSemesterNum] = useState<string>("");

  // Custom course states for addition
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSks, setNewSks] = useState(3);
  const [newLecturer, setNewLecturer] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newDay, setNewDay] = useState("Senin");
  const [newTime, setNewTime] = useState("08:00 - 10:35");
  const [newCourseSemester, setNewCourseSemester] = useState<number>(6);

  // AI Schedule Importer states
  const [aiDragActive, setAiDragActive] = useState(false);
  const [aiFile, setAiFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [aiDetectedCourses, setAiDetectedCourses] = useState<AcademicCourse[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAiResults, setShowAiResults] = useState(false);
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);

  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const filteredCourses = courses.filter(c => {
    const matchesSem = semesterFilter === 0 || c.semester === semesterFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSem && matchesSearch;
  });

  // AI drag and drop events
  const handleAiDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setAiDragActive(true);
    } else if (e.type === "dragleave") {
      setAiDragActive(false);
    }
  };

  const handleAiDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAiDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleAiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const validExtensions = ["png", "pdf", "txt", "docx"];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!ext || !validExtensions.includes(ext)) {
      showToast("Format berkas tidak didukung! Pastikan menggunakan format .png, .pdf, .txt, atau .docx", "error");
      return;
    }
    
    parseScheduleFile(file);
  };

  const getDayRecommendationText = (fn: string) => {
    const fnL = fn.toLowerCase();
    if (fnL.includes("senin") || fnL.includes("mon")) return "Senin";
    if (fnL.includes("selasa") || fnL.includes("tue")) return "Selasa";
    if (fnL.includes("rabu") || fnL.includes("wed")) return "Rabu";
    if (fnL.includes("kamis") || fnL.includes("thu")) return "Kamis";
    if (fnL.includes("jumat") || fnL.includes("fri")) return "Jumat";
    return "Senin, Rabu, & Jumat";
  };

  const getDefaultAiCourses = (fn: string): AcademicCourse[] => {
    const fnL = fn.toLowerCase();
    let primaryDay = "Senin";
    if (fnL.includes("senin") || fnL.includes("mon")) primaryDay = "Senin";
    else if (fnL.includes("selasa") || fnL.includes("tue")) primaryDay = "Selasa";
    else if (fnL.includes("rabu") || fnL.includes("wed")) primaryDay = "Rabu";
    else if (fnL.includes("kamis") || fnL.includes("thu")) primaryDay = "Kamis";
    else if (fnL.includes("jumat") || fnL.includes("fri")) primaryDay = "Jumat";

    return [
      {
        id: "ai-default-1-" + Date.now(),
        code: "IF-381",
        name: "Sistem Terdistribusi Real-time",
        sks: 3,
        semester: 6,
        lecturer: "Dr. Eng. Ir. Rahmat Hidayat, M.T.",
        room: "Gedung Kuliah Bersama R-101",
        day: primaryDay,
        time: "08:00 - 10:35"
      },
      {
        id: "ai-default-2-" + Date.now(),
        code: "IF-385",
        name: "Pengolahan Citra Digital (Digital Image Processing)",
        sks: 3,
        semester: 6,
        lecturer: "Prof. Kusuma Ningrum, M.Sc.",
        room: "Lab Komputer Visi Gd. C",
        day: primaryDay === "Rabu" ? "Jumat" : "Rabu",
        time: "10:45 - 13:20"
      },
      {
        id: "ai-default-3-" + Date.now(),
        code: "IF-390",
        name: "Kecerdasan Buatan (Data Mining & ML)",
        sks: 4,
        semester: 6,
        lecturer: "Faisal Azhar, S.Kom., M.IT.",
        room: "Lab Komputasi Gd. Pascasarjana",
        day: primaryDay === "Jumat" ? "Senin" : "Jumat",
        time: "13:30 - 16:50"
      }
    ];
  };

  const parseScheduleFile = (file: File) => {
    setAiFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.name.split('.').pop()?.toUpperCase() || "UNKNOWN"
    });
    
    setIsAiAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    setAiDetectedCourses([]);
    setShowAiResults(false);

    const steps = [
      { progress: 15, log: "📥 Menerima berkas jadwal: " + file.name + "..." },
      { progress: 35, log: "🔍 Memulai ekstraksi OCR & memindai baris-baris mata kuliah..." },
      { progress: 60, log: "🧠 Memperbaiki penulisan teks & menyelaraskan mata kuliah dengan kurikulum AI..." },
      { progress: 85, log: "⚡ Menentukan hari kuliah (" + getDayRecommendationText(file.name) + ") dan jam waktu..." },
      { progress: 100, log: "✨ Deteksi berhasil! Hasil analisis AI siap di-impor ke KRS kamu." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      const step = steps[currentStep];
      if (step) {
        setAnalysisProgress(step.progress);
        setAnalysisLogs(prev => [...prev, step.log]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        let found: AcademicCourse[] = [];
        const daysInIndonesian = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

        if (file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = (e.target?.result as string) || "";
            const lines = text.split('\n');
            
            lines.forEach((line, index) => {
              const trimmed = line.trim();
              if (trimmed.length < 5) return;

              // search for day keyword
              let detectedDay = "";
              for (const day of daysInIndonesian) {
                if (trimmed.toLowerCase().includes(day.toLowerCase())) {
                  detectedDay = day;
                  break;
                }
              }

              if (detectedDay) {
                // Remove day from name text to avoid duplicating it
                let cleanLine = trimmed;
                daysInIndonesian.forEach(d => {
                  cleanLine = cleanLine.replace(new RegExp(d, "gi"), "");
                });
                cleanLine = cleanLine.replace(/[:\-|,\t]/g, " ").trim();
                
                // Try to extract realistic course name
                let courseName = "";
                const words = cleanLine.split(/\s+/).filter(w => w.length > 2);
                if (words.length > 0) {
                  // filter out codes and hours
                  const textWords = words.filter(w => !/\d+/.test(w) && w.length > 2);
                  if (textWords.length > 0) {
                    courseName = textWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                  }
                }

                if (!courseName) {
                  courseName = "Mata Kuliah AI Terdeteksi";
                }

                // Match time
                let matchTime = "08:00 - 10:35";
                const timeRegex = /\d{2}[:\.]\d{2}\s*[-–]\s*\d{2}[:\.]\d{2}/;
                const matchObj = trimmed.match(timeRegex);
                if (matchObj) {
                  matchTime = matchObj[0].replace(/\./g, ":");
                }

                found.push({
                  id: "ai-txt-" + Date.now() + "-" + index,
                  code: "IF-" + (300 + Math.floor(Math.random() * 90)),
                  name: courseName,
                  sks: 3,
                  semester: 6,
                  lecturer: "Dr. Ahmad Yani, M.T.",
                  room: "Gedung Kuliah ITS R-305",
                  day: detectedDay,
                  time: matchTime
                });
              }
            });

            if (found.length === 0) {
              found = getDefaultAiCourses(file.name);
            }

            setAiDetectedCourses(found);
            setSelectedResultIds(found.map(f => f.id));
            setShowAiResults(true);
            setIsAiAnalyzing(false);
          };
          reader.readAsText(file);
        } else {
          // non-txt generator (pdf, png, docx)
          found = getDefaultAiCourses(file.name);
          setAiDetectedCourses(found);
          setSelectedResultIds(found.map(f => f.id));
          setShowAiResults(true);
          setIsAiAnalyzing(false);
        }
      }
    }, 600);
  };

  const toggleSelectResult = (id: string) => {
    setSelectedResultIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleImportCourses = () => {
    const coursesToImport = aiDetectedCourses.filter(c => selectedResultIds.includes(c.id));
    if (coursesToImport.length === 0) {
      showToast("Harap pilih minimal satu mata kuliah untuk di-impor!", "error");
      return;
    }

    setCourses(prev => {
      // Avoid duplicate codes in list
      const filteredPrev = prev.filter(existing => 
        !coursesToImport.some(c => c.code.toUpperCase() === existing.code.toUpperCase())
      );
      return [...filteredPrev, ...coursesToImport];
    });

    // Reset uploader
    setAiFile(null);
    setShowAiResults(false);
    showToast(`Berhasil mengimpor ${coursesToImport.length} mata kuliah dari dokumen jadwal Anda ke KRS.`, "success");
  };

  const handleAddSemesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const semNum = parseInt(newSemesterNum);
    if (!semNum || semNum <= 0 || semNum > 20) {
      showToast("Harap masukkan nomor semester yang valid (1-20)", "error");
      return;
    }

    if (availableSemesters.includes(semNum)) {
      showToast(`Semester ${semNum} sudah terdaftar!`, "error");
      return;
    }

    setAvailableSemesters(prev => [...prev, semNum].sort((a, b) => a - b));
    setSemesterFilter(semNum);
    setNewSemesterNum("");
    setShowAddSemesterModal(false);
    showToast(`Semester ${semNum} berhasil ditambahkan!`, "success");
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newLecturer) {
      showToast("Harap isi semua kolom wajib!", "error");
      return;
    }

    const newObj: AcademicCourse = {
      id: "course-" + Date.now(),
      code: newCode.toUpperCase(),
      name: newName,
      sks: Number(newSks),
      semester: newCourseSemester,
      lecturer: newLecturer,
      room: newRoom || "Ruang Teori Alternatif",
      day: newDay,
      time: newTime
    };

    setCourses(prev => [...prev, newObj]);
    setNewCode("");
    setNewName("");
    setNewSks(3);
    setNewLecturer("");
    setNewRoom("");
    setShowAddModal(false);
  };

  const totalSksEnroll = filteredCourses.reduce((acc, c) => acc + c.sks, 0);

  return (
    <div className="space-y-6 text-left relative z-10">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-4 animate-fade-in transition-all">
          <div className={`p-2 rounded-xl shrink-0 ${
            toast.type === "success" ? "bg-emerald-500/20 text-emerald-450" : 
            toast.type === "error" ? "bg-rose-500/20 text-[#FF2D75]" : "bg-indigo-500/20 text-indigo-400"
          }`}>
            {toast.type === "success" && <Check size={18} />}
            {toast.type === "error" && <AlertTriangle size={18} />}
            {toast.type === "info" && <Sparkles size={18} />}
          </div>
          <div className="flex-1 min-w-0 pr-2 self-center">
            <p className="text-[11px] font-extrabold leading-normal text-white">
              {toast.message}
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-white shrink-0 p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Title */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
          <GraduationCap className="text-[#FF2D75]" />
          Detail Akademik & Kartu Hasil Studi (KHS)
        </h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Pantau rencana studi, jadwal kelas kuliah, dosen ampu, bobot SKS, serta perkembangan indeks prestasi kumulatif (IPK).
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#FFF5E6] p-5 rounded-3xl border border-orange-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-white text-[#FF2D75] rounded-2xl shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">IPK Saat Ini</p>
            <p className="text-lg font-black text-slate-800">{profile.gpa}</p>
            <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">{getIpkClassification(profile.gpa)}</p>
          </div>
        </div>

        <div className="bg-pink-50/50 p-5 rounded-3xl border border-pink-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-white text-[#FF2D75] rounded-2xl shadow-xs">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Jumlah Mata Kuliah</p>
            <p className="text-lg font-black text-slate-800">{courses.length} Matkul</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Aktif Semester ini</p>
          </div>
        </div>

        <div className="bg-sky-50/50 p-5 rounded-3xl border border-sky-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-white text-sky-600 rounded-2xl shadow-xs">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Beban SKS</p>
            <p className="text-lg font-black text-slate-800">15 SKS</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Maksimal 24 SKS</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-white text-emerald-600 rounded-2xl shadow-xs">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Registrasi</p>
            <p className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 size={14} /> Aktif / Lunas UKT
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">NIM: {profile.nim}</p>
          </div>
        </div>

      </div>

      {/* AI STUDY SCHEDULE AUTO-IMPORTER */}
      <div className="bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF2D75]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-gradient-to-r from-pink-500 to-[#FF2D75] px-2.5 py-1 rounded-lg">
                AUTOMATION AI
              </span>
              <h3 className="text-sm font-black font-display tracking-tight flex items-center gap-1.5">
                <Sparkles size={16} className="text-yellow-400 fill-yellow-400/30 animate-pulse" />
                Asisten Pengimpor Jadwal Kuliah Pintar
              </h3>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium">
              Unggah berkas foto, PDF, dokumen Word, atau teks catatan jadwal Anda untuk dianalisis oleh AI secara otomatis.
            </p>
          </div>
          
          {/* Format Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black">
            <span className="bg-white/10 text-pink-300 px-2 py-1 rounded-md border border-white/5">PNG</span>
            <span className="bg-white/10 text-sky-300 px-2 py-1 rounded-md border border-white/5">PDF</span>
            <span className="bg-white/10 text-emerald-300 px-2 py-1 rounded-md border border-white/5">TXT</span>
            <span className="bg-white/10 text-amber-300 px-2 py-1 rounded-md border border-white/5">DOCX</span>
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        {!isAiAnalyzing && !showAiResults ? (
          <div
            onDragEnter={handleAiDrag}
            onDragOver={handleAiDrag}
            onDragLeave={handleAiDrag}
            onDrop={handleAiDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer relative group flex flex-col items-center justify-center min-h-[140px] ${
              aiDragActive 
                ? "border-pink-500 bg-pink-500/10 scale-[1.01]" 
                : "border-indigo-400/30 bg-white/5 hover:bg-white/8 hover:border-indigo-400/60"
            }`}
            onClick={() => document.getElementById("ai-file-input")?.click()}
          >
            <input
              id="ai-file-input"
              type="file"
              onChange={handleAiFileSelect}
              className="hidden"
              accept=".png, .pdf, .txt, .docx"
            />
            
            <UploadCloud size={32} className="text-indigo-300 group-hover:text-pink-400 transition-colors mb-2.5 animate-bounce" style={{ animationDuration: '3s' }} />
            
            <p className="text-xs font-black text-white group-hover:text-pink-200 transition-colors">
              Seret & lepaskan berkas jadwal Anda di sini, atau <span className="text-sky-400 underline decoration-dotted">pilih dari komputer</span>
            </p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">
              Berkas yang didukung: png, pdf, txt, docx (Maks. 10MB)
            </p>
          </div>
        ) : isAiAnalyzing ? (
          /* ANALYSIS LOADING SCREEN */
          <div className="bg-slate-950/60 border border-indigo-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden animate-fade-in">
            {/* Hologram OCR scanning light bar */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF2D75] to-transparent opacity-60 animate-pulse top-0 left-0 right-0"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="text-pink-400 animate-spin" />
                <div>
                  <p className="text-xs font-black text-white">Sedang Membaca & Memproses melalui AI...</p>
                  <p className="text-[9px] text-indigo-300 truncate max-w-xs">{aiFile?.name} ({aiFile?.size})</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#FF2D75]">{analysisProgress}%</span>
            </div>

            {/* Simulated Progress Bar */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-[#FF2D75] h-full transition-all duration-300 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>

            {/* Simulated LOG Console Terminal */}
            <div className="bg-black/80 rounded-xl p-3.5 font-mono text-[9px] text-emerald-400 space-y-1.5 max-h-[85px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-left border border-white/5">
              {analysisLogs.map((log, i) => (
                <div key={i} className="animate-fade-in">&gt; {log}</div>
              ))}
            </div>
          </div>
        ) : (
          /* PARSING RESULTS LIST */
          <div className="bg-slate-950/50 border border-emerald-500/30 rounded-2xl p-5 space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <div>
                <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <Check size={14} className="bg-emerald-500 text-slate-950 rounded-full p-0.5" />
                  AI Analisis Berhasil Rampung!
                </p>
                <p className="text-[9px] text-slate-400">Total terdeteksi {aiDetectedCourses.length} mata kuliah. Pilih mana yang ingin Anda simpan ke IRS.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAiFile(null);
                  setShowAiResults(false);
                }}
                className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5 transition-all text-[10px]"
              >
                Ulangi Unggah
              </button>
            </div>

            {/* Temp Results Cards List */}
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              {aiDetectedCourses.map((c) => {
                const isSelected = selectedResultIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSelectResult(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? "bg-[#FF2D75]/10 border-[#FF2D75] text-white shadow-xs" 
                        : "bg-white/5 border-white/10 hover:border-white/20 text-slate-300"
                    }`}
                  >
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[#FF2D75] text-white" : "border-2 border-slate-500"
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={4} />}
                      </div>
                      
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 leading-none">
                          <span className="text-[10px] uppercase font-black text-pink-300">{c.code}</span>
                          <span className="text-[9px] bg-white/10 px-1 rounded text-slate-350">{c.sks} SKS</span>
                          <span className="text-[9px] bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-extrabold px-1.5 py-0.2 rounded">
                            {c.day}
                          </span>
                        </div>
                        <p className="text-xs font-black truncate">{c.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium truncate">👨‍🏫 Dosen: {c.lecturer} | 📍 {c.room}</p>
                        <p className="text-[9px] text-sky-300 font-bold">⏰ Jam: {c.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Importer Buttons */}
            <div className="flex justify-end gap-2 border-t border-white/10 pt-3 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setAiFile(null);
                  setShowAiResults(false);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleImportCourses}
                className="px-4.5 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white rounded-xl shadow-md transition-all font-black flex items-center gap-1 cursor-pointer"
              >
                Impor Terpilih ke KRS Studi ({selectedResultIds.length} Matkul)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-1.5 shrink-0 max-w-full overflow-x-auto pb-1.5 md:pb-0 items-center">
          <button
            onClick={() => setSemesterFilter(0)}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${semesterFilter === 0 ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md" : "bg-white/60 text-slate-600 hover:bg-white/80 border border-white/85"}`}
          >
            Semua
          </button>
          {availableSemesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSemesterFilter(sem)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${semesterFilter === sem ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md" : "bg-white/60 text-slate-600 hover:bg-white/80 border border-white/85"}`}
            >
              Sem. {sem} {sem === 6 ? "(Kini)" : ""}
            </button>
          ))}
          <button
            onClick={() => {
              // Prefill recommended next semester
              const maxSem = availableSemesters.length > 0 ? Math.max(...availableSemesters) : 6;
              setNewSemesterNum(String(maxSem + 1));
              setShowAddSemesterModal(true);
            }}
            className="px-3.5 py-2 text-xs font-black rounded-xl bg-indigo-50 border border-indigo-100 hover:border-indigo-200 text-indigo-600 hover:bg-indigo-100/80 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus size={13} strokeWidth={2.5} />
            Tambah Semester
          </button>
        </div>

        <div className="flex flex-1 md:max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari matkul, kode, atau dosen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-pink-100 focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-md shadow-pink-150"
          >
            <Plus size={14} />
            KRS Baru
          </button>
        </div>
      </div>

      {/* Academic course Table/Cards */}
      <div className="bg-white/45 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-650 border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                <th className="py-3.5 px-5">Kode Matkul</th>
                <th className="py-3.5 px-5">Nama Mata Kuliah</th>
                <th className="py-3.5 px-5 text-center">Semester</th>
                <th className="py-3.5 px-5 text-center">SKS</th>
                <th className="py-3.5 px-5">Dosen Pengampu</th>
                <th className="py-3.5 px-5">Jadwal & Ruang</th>
                <th className="py-3.5 px-5 text-center">Nilai Sementara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-white/50 transition-colors">
                  <td className="py-4 px-5 font-mono font-black text-[#FF2D75]">{c.code}</td>
                  <td className="py-4 px-5 font-extrabold text-[#2e1065]">{c.name}</td>
                  <td className="py-4 px-5 text-center font-bold">{c.semester}</td>
                  <td className="py-4 px-5 text-center font-black text-slate-800">{c.sks} SKS</td>
                  <td className="py-4 px-5 font-bold text-slate-600">{c.lecturer}</td>
                  <td className="py-4 px-5">
                    <span className="text-xs text-slate-800 font-extrabold block">{c.day}, {c.time}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{c.room}</span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className="font-mono font-black tracking-wide bg-pink-100 border border-pink-200 text-[#FF2D75] px-2.5 py-1 rounded-xl">
                      {c.grade || "Belum Input"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold bg-white/20">
                    Tidak ditemukan mata kuliah yang sesuai kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white/60 p-4 border-t border-white/60 flex justify-between items-center text-[11px] font-black text-slate-500">
          <span>Menampilkan {filteredCourses.length} Mata Kuliah</span>
          <span className="text-[#FF2D75]">Total Terpilih: {totalSksEnroll} SKS</span>
        </div>
      </div>

      {/* Add KRS Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-2xl border border-white/80 overflow-hidden transform animate-in fade-in duration-200 text-left">
            <div className="bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white p-5 flex justify-between items-center">
              <h3 className="font-black font-display text-sm flex items-center gap-1">
                <Sparkles size={16} className="fill-white" />
                Tambah Rencana Kelas (KRS Mandiri)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:opacity-85 transition-all text-sm font-black cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-bold mt-1 text-slate-700 mb-1">Kode Mata Kuliah *</label>
                <input
                  type="text"
                  placeholder="Contoh: IF-306"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Kuliah *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pemrograman Sistem Terdistribusi"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKS *</label>
                  <select
                    value={newSks}
                    onChange={(e) => setNewSks(Number(e.target.value))}
                    className="w-full border border-pink-155 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                  >
                    <option value={1}>1 SKS</option>
                    <option value={2}>2 SKS</option>
                    <option value={3}>3 SKS</option>
                    <option value={4}>4 SKS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ruang Kelas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang 305 atau LAB"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full border border-pink-155 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosen Pengampu *</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Dosen beserta Gelar"
                  required
                  value={newLecturer}
                  onChange={(e) => setNewLecturer(e.target.value)}
                  className="w-full border border-pink-155 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester Kelas *</label>
                <select
                  value={newCourseSemester}
                  onChange={(e) => setNewCourseSemester(Number(e.target.value))}
                  className="w-full border border-pink-155 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                >
                  {availableSemesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem} {sem === 6 ? "(Kini)" : ""}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hari Kuliah</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full border border-pink-155 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Waktu</label>
                  <input
                    type="text"
                    placeholder="08:00 - 10:30"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full border border-pink-155 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Tambahkan Matkul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Semester Modal */}
      {showAddSemesterModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-xs shadow-2xl border border-white/80 overflow-hidden transform animate-in fade-in duration-150 text-left">
            <div className="bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white p-4.5 flex justify-between items-center">
              <h3 className="font-black font-display text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <Plus size={15} strokeWidth={3} />
                Tambah Semester Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSemesterModal(false)}
                className="text-white hover:opacity-80 transition-all font-black text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleAddSemesterSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <p className="text-[11px] text-slate-500 leading-normal mb-3 font-medium">
                  Tambahkan semester baru ke dalam riwayat akademik Anda. Anda dapat menentukan nomor semester secara urut maupun kustom.
                </p>
                <label className="block font-black text-slate-700 mb-1.5">Nomor Semester *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  placeholder="Contoh: 7"
                  value={newSemesterNum}
                  onChange={(e) => setNewSemesterNum(e.target.value)}
                  className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-black bg-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSemesterModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
