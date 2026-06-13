import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, CheckCircle2, Circle, Clock, Trash2, Calendar, FileText, Filter, Sparkles, Settings2, KeyRound, Globe, Loader2, LogOut, Check, Smile, ArrowRight, AlertTriangle } from "lucide-react";
import { Task } from "../types";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { motion, AnimatePresence } from "motion/react";

interface TugasViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  toggleTaskCompletion: (id: string) => void;
  completedCount: number;
  setCompletedCount: React.Dispatch<React.SetStateAction<number>>;
  totalTaskCount: number;
  setTotalTaskCount: React.Dispatch<React.SetStateAction<number>>;
  studyHours: number;
  setStudyHours: React.Dispatch<React.SetStateAction<number>>;
  targetStudyHours: number;
  mood: string;
  setMood: React.Dispatch<React.SetStateAction<string>>;
}

export default function TugasView({ 
  tasks, 
  setTasks, 
  toggleTaskCompletion,
  completedCount,
  setCompletedCount,
  totalTaskCount,
  setTotalTaskCount,
  studyHours,
  setStudyHours,
  targetStudyHours,
  mood,
  setMood
}: TugasViewProps) {
  const [filterMode, setFilterMode] = useState<"semua" | "aktif" | "selesai">("aktif");
  const [searchWord, setSearchWord] = useState("");

  // New task form fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [timeStr, setTimeStr] = useState("23:59");
  const [notes, setNotes] = useState("");
  const [daysValue, setDaysValue] = useState(3);

  // Automatically calculate estimated days left based on Batas Tanggal Kumpul
  useEffect(() => {
    if (dateStr) {
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const selectedDate = new Date(year, month, day);
        
        const diffTime = selectedDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysValue(diffDays >= 0 ? diffDays : 0);
      }
    }
  }, [dateStr]);

  // Google Classroom integration states
  const [classroomCode, setClassroomCode] = useState("");
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [classroomSuccess, setClassroomSuccess] = useState<string | null>(null);
  const [classroomError, setClassroomError] = useState<string | null>(null);

  // Custom Google Keys configurations
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GOOGLE_CLASSROOM_API_KEY") || "");
  const [clientId, setClientId] = useState(() => localStorage.getItem("GOOGLE_CLASSROOM_CLIENT_ID") || "");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [googleUser, setGoogleUser] = useState<{name?: string; email?: string} | null>(null);

  // Save classroom keys to localStorage
  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("GOOGLE_CLASSROOM_API_KEY", apiKey.trim());
    localStorage.setItem("GOOGLE_CLASSROOM_CLIENT_ID", clientId.trim());
    setClassroomSuccess("Kredensial API Google Classroom berhasil disimpan!");
    setClassroomError(null);
    setTimeout(() => setClassroomSuccess(null), 3500);
    setShowConfig(false);
  };

  // Launch modern, secure Firebase OAuth 2.0 flow
  const startOAuthFlow = async () => {
    setClassroomError(null);
    setClassroomSuccess(null);
    setClassroomLoading(true);

    try {
      const apps = getApps();
      const app = apps.length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
      provider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
      provider.addScope("https://www.googleapis.com/auth/userinfo.email");

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error("Gagal memperoleh access token Google Classroom.");
      }

      setAccessToken(token);
      setGoogleUser({
        name: result.user.displayName || "Mahasiswa",
        email: result.user.email || ""
      });

      // Fetch active tasks from Google Classroom APIs
      await fetchClassroomData(token);
    } catch (err: any) {
      console.error("Firebase OAuth error:", err);
      setClassroomError(
        err.code === "auth/popup-closed-by-user" || err.message?.includes("closed_by_user")
          ? "Sinkronisasi dibatalkan karena jendela login ditutup sebelum selesai."
          : `Gagal mengaitkan akun Google Classroom: ${err.message || String(err)}`
      );
    } finally {
      setClassroomLoading(false);
    }
  };

  // Fetch coursework data from Google API endpoints
  const fetchClassroomData = async (token: string) => {
    setClassroomLoading(true);
    setClassroomSuccess(null);
    setClassroomError(null);
    try {
      // Use optional setting API key if provided by user, else use standard token authorization header
      const keyParam = apiKey.trim() ? `&key=${encodeURIComponent(apiKey.trim())}` : "";
      const coursesUrl = `https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE${keyParam}`;

      const coursesRes = await fetch(coursesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (!coursesRes.ok) {
        throw new Error(`Gagal memuat mata kuliah Google Classroom (${coursesRes.status})`);
      }

      const coursesData = await coursesRes.json();
      const courses = coursesData.courses || [];

      if (courses.length === 0) {
        setClassroomSuccess("Berhasil masuk! Namun tidak terdeteksi adanya kelas aktif di akun Google Classroom Anda.");
        setClassroomLoading(false);
        return;
      }

      let apiTasks: Task[] = [];

      // Loop through all active courses to list user's specific coursework
      await Promise.all(
        courses.map(async (course: any) => {
          try {
            const courseworkUrl = `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?${keyParam ? keyParam.substring(1) : ""}`;
            const cwRes = await fetch(courseworkUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
              }
            });

            if (cwRes.ok) {
              const cwData = await cwRes.json();
              const courseWorkList = cwData.courseWork || [];

              courseWorkList.forEach((cw: any) => {
                let daysLeft = 3;
                let dueDateStr = "Tidak ada batas waktu";

                if (cw.dueDate) {
                  const yr = cw.dueDate.year;
                  const mo = cw.dueDate.month - 1; // months 0-11
                  const dy = cw.dueDate.day;
                  const hr = cw.dueTime?.hours || 23;
                  const mn = cw.dueTime?.minutes || 59;

                  const targetDate = new Date(yr, mo, dy, hr, mn);
                  const today = new Date();
                  const diff = targetDate.getTime() - today.getTime();
                  daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                  dueDateStr = `${dy}/${mo + 1}/${yr} pukul ${String(hr).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
                }

                apiTasks.push({
                  id: `gc-${cw.id}`,
                  title: `[G-Classroom] ${cw.title}`,
                  course: course.name,
                  dueDate: dueDateStr,
                  daysLeft: daysLeft,
                  completed: false,
                  notes: cw.description || "Tugas kuliah disinkronkan langsung via API Google Classroom."
                });
              });
            }
          } catch (individualErr) {
            console.error(`Gagal mengambil tugas untuk kelas ${course.id}:`, individualErr);
          }
        })
      );

      if (apiTasks.length > 0) {
        setTasks(prev => {
          const loadedIds = new Set(prev.map(t => t.id));
          const updated = [...prev];
          apiTasks.forEach(item => {
            if (!loadedIds.has(item.id)) {
              updated.unshift(item);
            }
          });
          return updated;
        });

        setTotalTaskCount(old => old + apiTasks.length);
        setClassroomSuccess(`Sinkronisasi sukses! Berhasil mengimpor ${apiTasks.length} tugas aktif langsung dari Google Classroom.`);
      } else {
        setClassroomSuccess("Sinkronisasi sukses! Tetapi tidak terdeteksi tugas baru yang perlu dikerjakan saat ini.");
      }
    } catch (err: any) {
      console.error(err);
      setClassroomError(`Terjadi kesalahan akses API: ${err.message || "Token kedaluwarsa atau kredensial salah."}`);
    } finally {
      setClassroomLoading(false);
    }
  };

  // Simulated code fallback for classroom code input (AI101, RO404, etc.)
  const handleConnectClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomCode.trim()) return;

    setClassroomLoading(true);
    setClassroomSuccess(null);
    setClassroomError(null);

    setTimeout(() => {
      let imported: Task[] = [];
      const code = classroomCode.trim().toLowerCase();

      if (code === "ai101" || code === "ai202") {
        imported = [
          {
            id: "gc-ai-1",
            title: "[Simulasi] Tugas 2: Model Jaringan Syaraf Tiruan Feedforward & Backprop",
            course: "Kecerdasan Buatan (" + code.toUpperCase() + ")",
            dueDate: "Besok lusa, 23:59 WIB",
            daysLeft: 2,
            completed: false,
            notes: "Silakan kumpulkan berkas laporan .ipynb dan .pdf hasil kompilasi program."
          },
          {
            id: "gc-ai-2",
            title: "[Simulasi] Latihan 3: Implementasi Algoritma Heuristik A* Pathfinding",
            course: "Kecerdasan Buatan (" + code.toUpperCase() + ")",
            dueDate: "Minggu Depan, 18:00 WIB",
            daysLeft: 7,
            completed: false,
            notes: "Gunakan data koordinat simpul peta kampus yang ada."
          }
        ];
      } else if (code === "ro303" || code === "ro404") {
        imported = [
          {
            id: "gc-ro-1",
            title: "[Simulasi] Studi Kasus: Formulasi Linear Programming Metode Simplex",
            course: "Riset Operasional (" + code.toUpperCase() + ")",
            dueDate: "Besok Siang, 12:00 WIB",
            daysLeft: 1,
            completed: false,
            notes: "Tulis lembar jawaban secara rapi, scan dan kirimkan ke Classroom."
          }
        ];
      } else {
        imported = [
          {
            id: "gc-def-1",
            title: "[Simulasi] Penugasan Mandiri: Analisis Studi Kasus Lapangan",
            course: "Mata Kuliah Google Classroom (" + code.toUpperCase() + ")",
            dueDate: "4 Hari Lagi, 23:59 WIB",
            daysLeft: 4,
            completed: false,
            notes: "Diimpor otomatis via kode simulasi Classroom: " + code.toUpperCase()
          }
        ];
      }

      setTasks(prev => [...imported, ...prev]);
      setTotalTaskCount(old => old + imported.length);

      setClassroomLoading(false);
      setClassroomSuccess(`Simulsi berhasil! Terimpor ${imported.length} tugas dari kelas kode ${code.toUpperCase()} secara instan.`);
      setClassroomCode("");

      setTimeout(() => setClassroomSuccess(null), 5000);
    }, 1500);
  };

  const displayTasks = tasks.filter(t => {
    const matchesKeyword = t.title.toLowerCase().includes(searchWord.toLowerCase()) ||
                          t.course.toLowerCase().includes(searchWord.toLowerCase());
    if (filterMode === "aktif") return !t.completed && matchesKeyword;
    if (filterMode === "selesai") return t.completed && matchesKeyword;
    return matchesKeyword;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !course) {
      alert("Harap masukkan judul tugas dan mata kuliah terkait!");
      return;
    }

    const newTask: Task = {
      id: "task-" + Date.now(),
      title,
      course,
      dueDate: `${dateStr}, ${timeStr}`,
      daysLeft: Number(daysValue) || 3,
      completed: false,
      notes: notes
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    
    // Update metric totals as well
    setTotalTaskCount(updatedTasks.length);
    setCompletedCount(updatedTasks.filter(t => t.completed).length);

    setTitle("");
    setCourse("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    setTotalTaskCount(updatedTasks.length);
    setCompletedCount(updatedTasks.filter(t => t.completed).length);
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setGoogleUser(null);
    setClassroomSuccess("Berhasil memutuskan koneksi Google Classroom.");
    setTimeout(() => setClassroomSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* View Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <CheckSquare className="text-[#FF2D75]" />
            Tugas & Lingkup Deadline Akademik
          </h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Urus semua penugasan semester, tugas lab, makalah kelompok, kuis, dan ujian akhir sebelum melewati batas waktu pengumpulan.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white font-black text-xs px-4.5 py-2.5 rounded-2xl shrink-0 shadow-md shadow-pink-100 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} />
          Tambah Tugas Baru
        </button>
      </div>

      {/* Google Classroom Interactive Connector Widget */}
      <div className="bg-gradient-to-r from-[#175d2f] to-[#0f4422] text-white p-5.5 rounded-3xl border border-emerald-500/20 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/15 p-1 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase border border-white/10 flex items-center gap-1">
                <Globe size={11} className="text-emerald-300 animate-pulse" />
                Google Classroom API
              </span>
              {accessToken ? (
                <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-800 rounded-full animate-ping"></span>
                  TERHUBUNG (REAL API)
                </span>
              ) : (
                <span className="text-[10px] bg-amber-400 text-emerald-950 font-black px-2 py-0.5 rounded-md">
                  SIAP INTEGRASI
                </span>
              )}
            </div>
            <p className="text-xs font-bold font-display text-emerald-100">
              Sinkronkan tugas kuliah riil Anda dari server Google Classroom langsung ke dasbor MahasSpace dengan satu klik!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {accessToken ? (
              <div className="flex items-center gap-3 bg-white/10 p-2 pl-3.5 pr-2 rounded-2xl border border-white/15">
                <div className="text-left text-xs">
                  <p className="font-black text-amber-300">{googleUser?.name || "Mahasiswa"}</p>
                  <p className="text-[9px] text-emerald-150 leading-none">{googleUser?.email}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-500 hover:bg-red-650 p-2 rounded-xl text-white transition-all cursor-pointer"
                  title="Putuskan sambungan"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={startOAuthFlow}
                disabled={classroomLoading}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-black text-xs px-4.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-display shadow-md shadow-emerald-900/10"
              >
                {classroomLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <KeyRound size={13} />
                )}
                Sinkronkan Google Classroom
              </button>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
              title="Pengaturan Kredensial API"
            >
              <Settings2 size={15} />
            </button>
          </div>
        </div>

        {/* API Configurations Accordion */}
        {showConfig && (
          <form onSubmit={handleSaveKeys} className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/10 text-xs space-y-3.5 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/10 pb-1.5">
              <KeyRound size={14} />
              Setup Google API Key & Client ID
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
              <div>
                <label className="block text-emerald-150 font-bold mb-1">Google API Key:</label>
                <input
                  type="password"
                  placeholder="Masukkan API Key Google Anda"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-800 text-white placeholder-slate-400 px-3 py-2 border border-slate-700 focus:outline-hidden focus:border-emerald-500 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-emerald-150 font-bold mb-1">Google OAuth Client ID:</label>
                <input
                  type="text"
                  placeholder="Masukkan Client ID (.apps.googleusercontent.com)"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-800 text-white placeholder-slate-400 px-3 py-2 border border-slate-700 focus:outline-hidden focus:border-emerald-500 rounded-xl font-mono text-[10px]"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-300 leading-normal">
              💡 <span className="font-bold text-amber-300">Tips:</span> Anda dapat mengosongkan kolom jika ingin menggunakan pengaturan Google Client ID bawaan. Pastikan Anda telah mendaftarkan URL aplikasi <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white text-[9px]">{window.location.origin}</span> di Authorized Redirect URIs konsol Google API Anda.
            </p>
            <div className="flex justify-end gap-2 text-[10.5px]">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer font-bold"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Check size={12} />
                Simpan Kredensial
              </button>
            </div>
          </form>
        )}

        {/* Quick Simulator Fallback Container */}
        <div className="border-t border-white/10 pt-3 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <p className="text-[11px] text-emerald-100 font-medium">
            Atau jika tidak ada API key, masukkan kode simulasi kelas di samping untuk pengujian instan:
          </p>
          <form onSubmit={handleConnectClassroom} className="flex gap-2 shrink-0 w-full md:w-auto">
            <input
              type="text"
              placeholder="Kode: ai101, ro404"
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
              disabled={classroomLoading}
              required
              className="px-3.5 py-1.5 rounded-xl text-xs font-black focus:outline-hidden bg-white text-slate-800 placeholder-slate-400 w-full md:w-36"
            />
            <button
              type="submit"
              disabled={classroomLoading}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/15 font-bold text-xs px-3.5 py-1.5 rounded-xl hover:bg-cyan-50 hover:text-slate-900 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Simulasi
            </button>
          </form>
        </div>

        {classroomLoading && (
          <div className="flex items-center gap-2.5 p-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium animate-pulse text-emerald-150">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
            <span>Menghubungi platform Google Classroom API, memverifikasi token sesi dan mengambil penugasan kuliah terbaru...</span>
          </div>
        )}

        {classroomSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs font-bold leading-relaxed animate-in fade-in slide-in-from-top-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            ✔️ {classroomSuccess}
          </div>
        )}

        {classroomError && (
          <div className="space-y-3">
            <div className="p-3.5 bg-red-950/70 border border-red-400/30 text-red-150 rounded-xl text-xs font-bold leading-relaxed animate-in fade-in slide-in-from-top-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              ❌ {classroomError}
            </div>
            
            {/* Expanded step-by-step solution card for GCP/Firebase OAuth sandbox setup */}
            <div className="p-4 bg-amber-950/90 border border-amber-500/25 rounded-2xl text-[11px] leading-relaxed text-amber-100 space-y-3">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-300 text-xs shadow-xs pb-1.5 border-b border-white/5 uppercase">
                ⚙️ Solusi Cepat: Cara Mengatasi Error 403 / "Aplikasi sedang diuji" di Google Classroom
              </div>
              <p className="text-amber-200">
                Karena Google Project Anda (<span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white text-[10px]">gen-lang-client-0876419864</span>) statusnya masih dalam tahap <span className="underline font-black text-white">Pengujian / Sandbox</span> (belum verifikasi publik resmi dari Google), Anda harus mendaftarkan akun email mahasiswa Anda ke daftar <strong>Test Users (Penguji)</strong> terlebih dahulu. Ikuti langkah sederhana ini:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-zinc-350 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <li>
                  Buka tab baru dan akses <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 font-bold underline hover:text-sky-300">Google Cloud Console ↗️</a>.
                </li>
                <li>
                  Pilih proyek <span className="font-black text-white bg-slate-800 px-1 py-0.5 rounded text-[10px]">gen-lang-client-0876419864</span> pada pilihan proyek di bar navigasi atas.
                </li>
                <li>
                  Buka menu navigasi kiri (<span className="font-bold">☰</span>) dan pilih <span className="font-bold text-amber-300">APIs & Services</span> &gt; <span className="font-bold text-amber-300">OAuth consent screen</span> (Layar persetujuan OAuth).
                </li>
                <li>
                  Scroll ke bawah menuju kolom panel <span className="font-bold text-white uppercase">Test Users</span> (Pengguna Uji). Click tombol <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">+ ADD USERS</span> (Tambahkan Pengguna).
                </li>
                <li>
                  Ketik email Anda (misal: <span className="font-mono text-white text-[10px] bg-indigo-950 px-1 rounded">2501020090@student.umrah.ac.id</span> atau <span className="font-mono text-white text-[10px] bg-indigo-950 px-1 rounded">firnandosbf@gmail.com</span>) dan klik <span className="font-bold text-white">Save</span>.
                </li>
                <li>
                  Kembali ke halaman website ini dan klik ulang tombol <span className="font-bold text-amber-300">"Sinkronkan Google Classroom"</span> kembali. Kini login Anda akan berhasil 100% tanpa hambatan!
                </li>
              </ol>
              <div className="text-[10px] bg-slate-900/60 p-2.5 rounded-lg border border-white/5 flex items-start gap-1 pb-2">
                <span>💡</span>
                <span>
                  <strong>Mengapa langkah ini wajib?</strong> Google menerapkan perlindungan sandboxing agar tidak sembarang orang dapat mengakses integrasi Google API jika pengembang tidak secara sadar mengizinkan akun email tersebut untuk mengujinya. Hal ini sepenuhnya normal dalam siklus pembuatan aplikasi.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form Collapsible */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm text-xs text-left space-y-4 animate-in slide-in-from-top-3 duration-200">
          <h3 className="font-extrabold text-[#FF2D75] text-sm flex items-center gap-1.5 font-display">
            <Sparkles size={16} className="fill-[#FF2D75] text-[#FF2D75]" /> Rancang Detail Penugasan Baru
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul Tugas / Nama Laporan *</label>
              <input
                type="text"
                placeholder="Contoh: Makalah Kompilasi Bahasa Rakitan atau Laporan Lab"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mata Kuliah Terkait *</label>
              <input
                type="text"
                placeholder="Contoh: Interaksi Manusia & Komputer"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batas Tanggal Kumpul</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batas Waktu Jam</label>
              <input
                type="text"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                placeholder="23:59"
                className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimasi Hari Tersisa <span className="text-emerald-600 font-extrabold text-[10px]">(Dihitung Otomatis)</span></label>
              <input
                type="number"
                value={daysValue}
                onChange={(e) => setDaysValue(Number(e.target.value))}
                min={0}
                max={365}
                className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs text-emerald-700 font-mono bg-emerald-50/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Link Kriteria Pengumpulan</label>
            <textarea
              rows={2}
              placeholder="Masukkan instruksi khusus dari dosen, misal: 'File PDF kumpul di Siadin dengan format NIM_Nama_Tugas4'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      )}

      {/* Task Filters and Search */}
      <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="flex gap-1.5 flex-wrap">
          {(["semua", "aktif", "selesai"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === mode 
                  ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md shadow-pink-100" 
                  : "bg-white/65 text-slate-655 hover:bg-white/80 border border-white/85"
              }`}
            >
              {mode === "aktif" ? "Belum Selesai" : mode === "selesai" ? "Telah Selesai" : "Semua Tugas"}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Cari kata kunci tugas..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full text-xs pl-4 pr-10 py-2.5 border border-pink-100 rounded-2xl focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
          />
          <Filter size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Deadlines list display card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {displayTasks.map((task, index) => {
            let pillColor = index === 3 ? "bg-[#FFF5F5] text-black border border-red-100" : "bg-[#FFF5F5] text-red-650 border border-red-100";
            if (task.daysLeft > 6) {
              pillColor = index === 3 ? "bg-[#ECFDF5] text-black border border-emerald-100" : "bg-[#ECFDF5] text-emerald-800 border border-emerald-100";
            } else if (task.daysLeft > 3) {
              pillColor = index === 3 ? "bg-[#FFFBEB] text-black border border-amber-100" : "bg-[#FFFBEB] text-amber-800 border border-amber-100";
            }

            return (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, y: -15, transition: { duration: 0.22, ease: "easeInOut" } }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                className={`bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs flex flex-col justify-between hover:border-pink-100 hover:shadow-md transition-all duration-300 ${
                  task.completed ? "opacity-75 relative bg-white/20" : ""
                }`}
              >
              <div className="space-y-3.5 text-left">
                {/* Header status info */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-2.5">
                    <motion.button 
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="text-[#FF2D75] cursor-pointer pt-0.5 outline-none focus:ring-0 active:scale-95"
                    >
                      {task.completed ? (
                        <motion.div
                          key="checked"
                          initial={{ scale: 0.5, rotate: -15 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 15, mass: 0.8 }}
                        >
                          <CheckCircle2 size={19} className="text-[#137333] fill-emerald-50 drop-shadow-sm" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="unchecked"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        >
                          <Circle size={19} className="text-slate-300 hover:text-pink-400 hover:border-pink-500/30 transition-colors" />
                        </motion.div>
                      )}
                    </motion.button>
                    <div>
                      <h4 className={`font-extrabold text-xs text-[#2e1065] leading-snug transition-all duration-300 ${task.completed ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-0.5 font-bold">{task.course}</p>
                    </div>
                  </div>
                  
                  {!task.completed && (
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl shrink-0 uppercase tracking-wider ${pillColor}`}>
                      {task.daysLeft} hari lagi
                    </span>
                  )}
                  {task.completed && (
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl bg-[#E6F4EA] border border-emerald-200 shrink-0 uppercase tracking-wider ${
                      index === 3 ? "text-black" : "text-[#137333]"
                    }`}>
                      Selesai
                    </span>
                  )}
                </div>

                {/* Task notes details */}
                {task.notes && (
                  <p className="text-[11px] text-slate-655 bg-white/40 border border-white/50 p-3 rounded-xl flex items-start gap-1.5 leading-relaxed font-semibold">
                    <FileText size={13} className="text-pink-400 shrink-0 mt-0.5" />
                    <span className={index === 3 ? "text-black" : ""}>{task.notes}</span>
                  </p>
                )}

                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
                  index === 3 ? "text-black" : "text-slate-400"
                }`}>
                  <Calendar size={11} className="text-[#FF2D75]" />
                  <span>Batas Waktu: {task.dueDate}</span>
                </div>
              </div>

              {/* Action operations on bottom card */}
              <div className="border-t border-white/40 mt-4 pt-3 flex justify-between items-center">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="text-[10px] font-black text-[#FF2D75] cursor-pointer flex items-center gap-1"
                >
                  {task.completed ? "Buka Tugas Kembali" : "Tandai Sudah Selesai"}
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-stone-400 hover:text-red-650 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Hapus tugas"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </motion.div>
          );
        })}
        </AnimatePresence>

        {displayTasks.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl space-y-3">
            <span className="text-4xl">📚</span>
            <div>
              <p className="font-extrabold text-slate-700 text-sm">Tidak ada tugas dalam kategori ini</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Silakan tambahkan tugas baru atau sesuaikan filter Anda.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
