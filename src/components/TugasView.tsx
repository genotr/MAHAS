import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckSquare, Plus, CheckCircle2, Circle, Clock, Trash2, Calendar, FileText, Filter, Sparkles, Settings2, KeyRound, Globe, Loader2, LogOut, Check, Smile, ArrowRight, AlertTriangle, Timer, Pencil, AlertCircle, BookOpen, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Task, InteractiveCalendarEvent, AcademicCourse } from "../types";
import { syncTasksWithDeviceDate, calculateDaysLeftFromDueDate } from "../utils/taskDateHelper";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { motion, AnimatePresence } from "motion/react";

interface TugasViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  courses?: AcademicCourse[];
  calendarEvents?: InteractiveCalendarEvent[];
  setCalendarEvents?: React.Dispatch<React.SetStateAction<InteractiveCalendarEvent[]>>;
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
  googleAccessToken?: string | null;
  setGoogleAccessToken?: React.Dispatch<React.SetStateAction<string | null>>;
  googleUser?: {name?: string; email?: string} | null;
  setGoogleUser?: React.Dispatch<React.SetStateAction<{name?: string; email?: string} | null>>;
  classroomLoading?: boolean;
  setClassroomLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  classroomSuccess?: string | null;
  setClassroomSuccess?: React.Dispatch<React.SetStateAction<string | null>>;
  classroomError?: string | null;
  setClassroomError?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function TugasView({ 
  tasks, 
  setTasks, 
  courses = [],
  calendarEvents = [],
  setCalendarEvents,
  toggleTaskCompletion,
  completedCount,
  setCompletedCount,
  totalTaskCount,
  setTotalTaskCount,
  studyHours,
  setStudyHours,
  targetStudyHours,
  mood,
  setMood,
  googleAccessToken,
  setGoogleAccessToken,
  googleUser: propGoogleUser,
  setGoogleUser: propGoogleUserSetter,
  classroomLoading: propClassroomLoading,
  setClassroomLoading: propClassroomLoadingSetter,
  classroomSuccess: propClassroomSuccess,
  setClassroomSuccess: propClassroomSuccessSetter,
  classroomError: propClassroomError,
  setClassroomError: propClassroomErrorSetter
}: TugasViewProps) {
  const [filterMode, setFilterMode] = useState<"semua" | "aktif" | "selesai">("aktif");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);
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

  // Edit task modal fields
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editDateStr, setEditDateStr] = useState("");
  const [editTimeStr, setEditTimeStr] = useState("23:59");
  const [editNotes, setEditNotes] = useState("");
  const [editDaysValue, setEditDaysValue] = useState(3);

  // References for triggering native pickers via the chevron button
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const editDateInputRef = useRef<HTMLInputElement>(null);
  const editTimeInputRef = useRef<HTMLInputElement>(null);

  // Custom interactive date/time picker state (guaranteed to work in cross-origin iframes)
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    type: "date" | "time";
    target: "add" | "edit";
    // For date view
    viewYear: number;
    viewMonth: number;
    // For time view
    hour: number;
    minute: number;
  }>({
    isOpen: false,
    type: "date",
    target: "add",
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    hour: 23,
    minute: 59,
  });

  const openCustomDatePicker = (target: "add" | "edit") => {
    const val = target === "add" ? dateStr : editDateStr;
    let y = new Date().getFullYear();
    let m = new Date().getMonth();
    if (val) {
      const parts = val.split("-");
      if (parts.length === 3) {
        y = parseInt(parts[0], 10) || y;
        m = (parseInt(parts[1], 10) - 1) || m;
      }
    }
    setPickerState({
      isOpen: true,
      type: "date",
      target,
      viewYear: y,
      viewMonth: m,
      hour: 23,
      minute: 59,
    });
  };

  const openCustomTimePicker = (target: "add" | "edit") => {
    const val = target === "add" ? timeStr : editTimeStr;
    let h = 23;
    let min = 59;
    if (val) {
      const parts = val.split(":");
      if (parts.length >= 2) {
        h = parseInt(parts[0], 10) || 0;
        min = parseInt(parts[1], 10) || 0;
      }
    }
    setPickerState({
      isOpen: true,
      type: "time",
      target,
      viewYear: new Date().getFullYear(),
      viewMonth: new Date().getMonth(),
      hour: h,
      minute: min,
    });
  };

  const safeOpenPicker = (_inputEl: HTMLInputElement | null, type: "date" | "time", target: "add" | "edit") => {
    // Directly open custom interactive modal picker to guarantee 100% reliable opening in all environments (desktop, mobile, cross-origin iframes)
    if (type === "date") {
      openCustomDatePicker(target);
    } else {
      openCustomTimePicker(target);
    }
  };

  // Sync all task daysLeft dynamically based on device date
  useEffect(() => {
    setTasks(prev => syncTasksWithDeviceDate(prev));
  }, []);

  // Automatically calculate estimated days left based on Batas Tanggal Kumpul for Add Form
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
        setDaysValue(diffDays);
      }
    }
  }, [dateStr]);

  // Automatically calculate estimated days left based on Batas Tanggal Kumpul for Edit Form
  useEffect(() => {
    if (editDateStr) {
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const parts = editDateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const selectedDate = new Date(year, month, day);
        
        const diffTime = selectedDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setEditDaysValue(diffDays);
      }
    }
  }, [editDateStr]);

  // Google Classroom integration states
  const [classroomCode, setClassroomCode] = useState("");
  
  const localClassroomLoading = useState(false);
  const localClassroomSuccess = useState<string | null>(null);
  const localClassroomError = useState<string | null>(null);

  const classroomLoading = propClassroomLoading !== undefined ? propClassroomLoading : localClassroomLoading[0];
  const setClassroomLoading = propClassroomLoadingSetter !== undefined ? propClassroomLoadingSetter : localClassroomLoading[1];

  const classroomSuccess = propClassroomSuccess !== undefined ? propClassroomSuccess : localClassroomSuccess[0];
  const setClassroomSuccess = propClassroomSuccessSetter !== undefined ? propClassroomSuccessSetter : localClassroomSuccess[1];

  const classroomError = propClassroomError !== undefined ? propClassroomError : localClassroomError[0];
  const setClassroomError = propClassroomErrorSetter !== undefined ? propClassroomErrorSetter : localClassroomError[1];

  // Custom Google Keys configurations
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GOOGLE_CLASSROOM_API_KEY") || "");
  const [clientId, setClientId] = useState(() => localStorage.getItem("GOOGLE_CLASSROOM_CLIENT_ID") || "");
  const [showConfig, setShowConfig] = useState(false);
  
  const localAccessToken = useState<string | null>(null);
  const localGoogleUser = useState<{name?: string; email?: string} | null>(null);

  const accessToken = googleAccessToken !== undefined ? googleAccessToken : localAccessToken[0];
  const setAccessToken = setGoogleAccessToken !== undefined ? setGoogleAccessToken : localAccessToken[1];

  const googleUser = propGoogleUser !== undefined ? propGoogleUser : localGoogleUser[0];
  const setGoogleUser = propGoogleUserSetter !== undefined ? propGoogleUserSetter : localGoogleUser[1];

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
      provider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.me.readonly");
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
      if (err.code === "auth/popup-closed-by-user" || err.message?.includes("closed-by-user") || err.message?.includes("closed_by_user")) {
        setClassroomError("Sinkronisasi dibatalkan karena jendela login/pop-up ditutup sebelum selesai.");
      } else if (err.code === "auth/popup-blocked" || err.message?.includes("popup-blocked") || err.message?.includes("popup_blocked")) {
        setClassroomError("Jendela pop-up masuk diblokir oleh browser Anda. Mohon aktifkan izin pop-up/redirect di browser Anda lalu coba kembali.");
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setClassroomError("Metode login Google belum diaktifkan di Firebase Console Anda. Silakan buka Console Firebase -> Authentication -> Sign-in method, lalu aktifkan penyedia 'Google' agar fitur ini dapat digunakan.");
      } else {
        setClassroomError(`Gagal mengaitkan akun Google Classroom: ${err.message || String(err)}`);
      }
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

            // Fetch Student Submissions to check if any of the tasks are completed/turned in
            const submissionsUrl = `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me${keyParam}`;
            const subRes = await fetch(submissionsUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
              }
            });

            const submissionMap = new Map<string, string>();
            if (subRes.ok) {
              const subData = await subRes.json();
              const submissionsList = subData.studentSubmissions || [];
              submissionsList.forEach((sub: any) => {
                if (sub.courseWorkId) {
                  submissionMap.set(sub.courseWorkId, sub.state);
                }
              });
            }

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

                const subState = submissionMap.get(cw.id);
                const isCompleted = subState === "TURNED_IN" || subState === "RETURNED";

                apiTasks.push({
                  id: `gc-${cw.id}`,
                  title: `[G-Classroom] ${cw.title}`,
                  course: course.name,
                  dueDate: dueDateStr,
                  daysLeft: daysLeft,
                  completed: isCompleted,
                  notes: cw.description || `Tugas kuliah disinkronkan langsung via API Google Classroom. Status: ${subState || "Belum dikerjakan"}`
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
            notes: "Tulis lembar jawaban secara rapi, scan dan unggah berkas laporan Anda."
          }
        ];
      } else {
        imported = [
          {
            id: "gc-def-1",
            title: "[Simulasi] Penugasan Mandiri: Analisis Studi Kasus Lapangan",
            course: "Mata Kuliah (" + code.toUpperCase() + ")",
            dueDate: "4 Hari Lagi, 23:59 WIB",
            daysLeft: 4,
            completed: false,
            notes: "Diimpor otomatis via kode simulasi: " + code.toUpperCase()
          }
        ];
      }

      setTasks(prev => [...imported, ...prev]);
      setTotalTaskCount(old => old + imported.length);

      setClassroomLoading(false);
      setClassroomSuccess(`Simulasi berhasil! Terimpor ${imported.length} tugas dari kelas kode ${code.toUpperCase()} secara instan.`);
      setClassroomCode("");

      setTimeout(() => setClassroomSuccess(null), 5000);
    }, 1500);
  };

  // Unified merged list of regular tasks and calendar events with category "Tugas"
  const allMergedTasks: Task[] = useMemo(() => {
    // 1. Regular tasks (daysLeft recalculated relative to device date)
    const syncedRegularTasks = syncTasksWithDeviceDate(tasks);

    // 2. Calendar events filtered ONLY for category "Tugas"
    const calendarTugasList: Task[] = calendarEvents
      .filter(ev => ev.category === "Tugas")
      .map(ev => {
        const timePart = ev.time || "23:59";
        const dueDateFormatted = `${ev.date}, ${timePart}`;
        const daysLeft = calculateDaysLeftFromDueDate(dueDateFormatted);

        return {
          id: ev.id,
          title: ev.title,
          course: "Agenda Kalender (Tugas)",
          dueDate: dueDateFormatted,
          daysLeft: daysLeft,
          completed: !!ev.completed,
          notes: ev.description || "Tugas terjadwal dari kalender akademik & pribadi."
        };
      });

    // Avoid duplicate IDs if any task and event share same ID
    const seenIds = new Set<string>();
    const combined: Task[] = [];

    for (const t of [...syncedRegularTasks, ...calendarTugasList]) {
      if (!seenIds.has(t.id)) {
        seenIds.add(t.id);
        combined.push(t);
      }
    }

    return combined;
  }, [tasks, calendarEvents]);

  const displayTasks = allMergedTasks.filter(t => {
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

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCourse(task.course);
    setEditNotes(task.notes || "");
    setEditDaysValue(task.daysLeft);

    // Parse dueDate formatted as "YYYY-MM-DD, HH:MM" or similar
    if (task.dueDate) {
      const parts = task.dueDate.split(",");
      const dStr = parts[0]?.trim() || "";
      const tStr = parts[1]?.trim() || "23:59";
      if (dStr) setEditDateStr(dStr);
      if (tStr) setEditTimeStr(tStr);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setEditDateStr(`${year}-${month}-${day}`);
      setEditTimeStr("23:59");
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim() || !editCourse.trim()) {
      alert("Harap lengkapi judul tugas dan mata kuliah terkait!");
      return;
    }

    const formattedDueDate = `${editDateStr}, ${editTimeStr}`;
    const calculatedDays = Number(editDaysValue) || calculateDaysLeftFromDueDate(formattedDueDate);

    if (editingTask.id.startsWith("ev-")) {
      // Calendar event item
      if (setCalendarEvents) {
        setCalendarEvents(prev => prev.map(ev => {
          if (ev.id === editingTask.id) {
            return {
              ...ev,
              title: editTitle.trim(),
              date: editDateStr,
              time: editTimeStr,
              description: editNotes.trim()
            };
          }
          return ev;
        }));
      }
    } else {
      // Regular task
      setTasks(prev => prev.map(t => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            title: editTitle.trim(),
            course: editCourse.trim(),
            dueDate: formattedDueDate,
            daysLeft: calculatedDays,
            notes: editNotes.trim()
          };
        }
        return t;
      }));
    }

    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (id.startsWith("ev-")) {
      if (setCalendarEvents) {
        setCalendarEvents(prev => prev.filter(ev => ev.id !== id));
      }
    } else {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      setTotalTaskCount(updatedTasks.length);
      setCompletedCount(updatedTasks.filter(t => t.completed).length);
    }
    setDeleteConfirm(null);
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
      <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-900 leading-tight">
            Tugas & Lingkup Deadline Akademik{" "}
            <CheckSquare className="text-[#FF2D75] inline-block align-middle ml-1.5" size={24} />
          </h2>
          <p className="text-xs text-slate-500 leading-normal font-semibold">
            Urus semua penugasan semester, tugas lab, makalah kelompok, kuis, dan ujian akhir sebelum melewati batas waktu pengumpulan.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full md:w-auto justify-center bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white font-black text-xs px-4.5 py-2.5 rounded-2xl shrink-0 shadow-md shadow-pink-100 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} />
          Tambah Tugas Baru
        </button>
      </div>

      {accessToken && (
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-3xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Globe size={20} className="text-emerald-600 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                Google Classroom Terhubung
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </p>
              <p className="text-[10px] text-emerald-750 font-bold mt-0.5">
                Sinkronisasi otomatis aktif untuk {googleUser?.email || "Akun Google Anda"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                if (accessToken) {
                  setClassroomLoading(true);
                  fetchClassroomData(accessToken);
                }
              }}
              disabled={classroomLoading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              {classroomLoading ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-650 font-black text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              Putuskan
            </button>
          </div>
        </div>
      )}

      {/* Interactive Class Code Connector Widget */}
      <div className="bg-gradient-to-r from-[#137333] via-[#0f6229] to-[#0a481c] text-white p-5.5 rounded-3xl border border-emerald-500/30 shadow-md shadow-emerald-900/10 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold tracking-wider text-white font-display flex items-center gap-1.5">
              <Globe size={14} className="text-white" />
              Kode Kelas Classroom
            </h3>
            <p className="text-[11px] text-emerald-100/90 font-semibold leading-relaxed">
              Hubungkan mata kuliah Anda dengan memasukkan kode akses kelas untuk sinkronisasi tugas instan.
            </p>
          </div>

          <form onSubmit={handleConnectClassroom} className="flex gap-2.5 shrink-0 w-full md:w-auto">
            <input
              type="text"
              placeholder="Contoh: ai101, ro404"
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
              disabled={classroomLoading}
              required
              className="px-4 py-2 rounded-2xl text-xs font-black focus:outline-hidden bg-emerald-950/40 text-white border border-emerald-600/40 placeholder-emerald-300/60 w-full md:w-44 focus:border-amber-400 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={classroomLoading}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-5 py-2 rounded-2xl active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-emerald-900/20"
            >
              {classroomLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Hubungkan"
              )}
            </button>
          </form>
        </div>

        {classroomLoading && (
          <div className="flex items-center gap-2.5 p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs font-medium animate-pulse text-emerald-150">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
            <span>Sedang memproses kode kelas yang Anda masukkan, mohon tunggu sebentar...</span>
          </div>
        )}

        {classroomSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs font-bold leading-relaxed animate-in fade-in slide-in-from-top-1 shadow-md">
            ✔️ {classroomSuccess.replace(/Google Classroom/gi, "Kelas")}
          </div>
        )}

        {classroomError && (
          <div className="p-3 bg-red-950/80 border border-red-400/30 text-rose-200 rounded-xl text-xs font-bold leading-relaxed animate-in fade-in slide-in-from-top-1 shadow-md">
            ❌ {classroomError.replace(/Google Classroom/gi, "Kelas")}
          </div>
        )}
      </div>

      {/* Add Task Form Collapsible */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-pink-150 shadow-md text-xs text-left space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-pink-100/60 pb-3">
            <h3 className="font-extrabold text-[#FF2D75] text-sm flex items-center gap-1.5 font-display">
              <Plus size={16} />
              Rancang Detail Penugasan Baru
            </h3>
            <span className="text-[10px] bg-pink-50 text-pink-700 font-bold px-2.5 py-1 rounded-xl border border-pink-200/60">
              Terhubung dengan Jadwal Akademik
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul Tugas / Nama Laporan *</label>
              <input
                type="text"
                placeholder="Contoh: Makalah Studi Kasus atau Laporan Lab"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/90 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Mata Kuliah Terkait *</span>
                <span className="text-[10px] text-pink-600 font-bold">Pilihan Jadwal Akademik</span>
              </label>

              {courses && courses.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={courses.some(c => c.name === course) ? course : (course ? "__custom__" : "")}
                    onChange={(e) => {
                      if (e.target.value !== "__custom__") {
                        setCourse(e.target.value);
                      }
                    }}
                    className="w-full border border-pink-200 focus:outline-hidden focus:border-pink-400 p-2.5 rounded-xl font-bold bg-white text-xs text-slate-800 shadow-2xs"
                  >
                    <option value="">-- Pilih Mata Kuliah dari Jadwal Akademik --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        📚 {c.name} {c.code ? `[${c.code}]` : ''} ({c.day}, {c.time})
                      </option>
                    ))}
                    <option value="__custom__">✏️ Ketik Mata Kuliah Lainnya / Manual...</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Nama mata kuliah (contoh: Pemrograman Web)"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2 rounded-xl font-bold bg-white/70 text-xs"
                  />

                  {/* Quick Select Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400">Jadwal:</span>
                    {courses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourse(c.name)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                          course === c.name
                            ? "bg-[#FF2D75] text-white shadow-xs"
                            : "bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/60"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Contoh: Interaksi Manusia & Komputer"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batas Tanggal Kumpul</label>
              <div className="relative flex items-center">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  onClick={(e) => {
                    e.preventDefault();
                    safeOpenPicker(e.currentTarget, "date", "add");
                  }}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 pr-14 rounded-xl font-bold bg-white/60 text-xs cursor-pointer select-none hide-native-picker-icon"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Pilih tanggal"
                  onClick={() => safeOpenPicker(dateInputRef.current, "date", "add")}
                  className="absolute right-2.5 flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors p-1 rounded-md hover:bg-pink-50 cursor-pointer"
                  title="Klik untuk memilih tanggal"
                >
                  <Calendar className="w-3.5 h-3.5 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-600 pointer-events-none" />
                </button>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batas Waktu Jam</label>
              <div className="relative flex items-center">
                <input
                  ref={timeInputRef}
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  onClick={(e) => {
                    e.preventDefault();
                    safeOpenPicker(e.currentTarget, "time", "add");
                  }}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 pr-14 rounded-xl font-bold bg-white/90 text-xs text-slate-800 cursor-pointer select-none hide-native-picker-icon"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Pilih waktu"
                  onClick={() => safeOpenPicker(timeInputRef.current, "time", "add")}
                  className="absolute right-2.5 flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors p-1 rounded-md hover:bg-pink-50 cursor-pointer"
                  title="Klik untuk memilih jam batas waktu"
                >
                  <Clock className="w-3.5 h-3.5 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-600 pointer-events-none" />
                </button>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 select-none cursor-not-allowed">Estimasi Hari Tersisa <span className="text-emerald-600 font-extrabold text-[10px]">(Otomatis)</span></label>
              <input
                type="number"
                value={daysValue}
                readOnly
                tabIndex={-1}
                title="Dihitung secara otomatis berdasarkan batas tanggal pengumpulan"
                className="w-full border border-slate-200 p-2.5 rounded-xl font-bold text-xs text-emerald-700 font-mono bg-slate-100/80 cursor-not-allowed select-none focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Link Kriteria Pengumpulan</label>
            <textarea
              rows={2}
              placeholder="Masukkan instruksi khusus dari dosen, misal: 'File PDF kumpul di portal dengan format NIM_Nama_Tugas'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
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
            return (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, y: -15, transition: { duration: 0.22, ease: "easeInOut" } }}
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
                          <Circle size={19} className="text-black hover:text-pink-500 transition-colors" />
                        </motion.div>
                      )}
                    </motion.button>
                    <div>
                      <h4 className={`font-extrabold text-xs text-[#000000] leading-snug transition-all duration-300 ${task.completed ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-0.5 font-bold flex items-center gap-1">
                        <BookOpen size={10} className="text-[#FF2D75]" />
                        <span>{task.course}</span>
                      </p>
                    </div>
                  </div>
                  
                  {!task.completed && (
                    task.daysLeft <= 0 ? (
                      <span className="text-[9.5px] font-black px-2.5 py-1 rounded-xl shrink-0 uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1 shadow-2xs">
                        <AlertCircle size={11} className="text-rose-600 shrink-0" />
                        <span>Closed</span>
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-black px-2.5 py-1 rounded-xl shrink-0 uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs font-sans">
                        <Timer size={11} className="text-amber-800 shrink-0" />
                        <span>{task.daysLeft} hari</span>
                      </span>
                    )
                  )}
                  {task.completed && (
                    <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-xl bg-[#E6F4EA] border border-emerald-200 shrink-0 uppercase tracking-wider flex items-center gap-1 ${
                      index === 3 ? "text-black" : "text-[#137333]"
                    }`}>
                      <Check size={11} />
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
                  !task.completed ? "text-black" : (index === 3 ? "text-black" : "text-slate-400")
                }`}>
                  <Calendar size={11} className="text-[#FF2D75]" />
                  <span>Batas Waktu: {task.dueDate}</span>
                </div>
              </div>

              {/* Action operations on bottom card */}
              <div className="border-t border-white/40 mt-4 pt-3 flex justify-between items-center">
                <div>
                  {task.completed ? (
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="text-[10px] font-black text-[#FF2D75] cursor-pointer flex items-center gap-1 hover:underline"
                    >
                      Buka Tugas Kembali
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Status: Aktif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="transition-colors duration-200 p-1.5 px-2.5 hover:bg-pink-50 rounded-lg cursor-pointer text-slate-600 hover:text-[#FF2D75] flex items-center gap-1 text-[10px] font-bold"
                    title="Edit isi tugas"
                  >
                    <Pencil size={12} className="text-[#FF2D75]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: task.id })}
                    className="transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer text-[#ff0000]"
                    title="Hapus tugas"
                  >
                    <Trash2 size={13} className="text-[#ff0000]" />
                  </button>
                </div>
              </div>

            </motion.div>
          );
        })}
        </AnimatePresence>

        {displayTasks.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl space-y-3">
            <span className="text-4xl">
              {allMergedTasks.length === 0 ? "📝" : filterMode === "selesai" ? "⏳" : "🎉"}
            </span>
            <div>
              <p className="font-extrabold text-slate-700 text-sm">
                {allMergedTasks.length === 0
                  ? "Masih belum ada tugas yang Anda masukkan"
                  : filterMode === "selesai"
                  ? "Belum ada tugas yang telah diselesaikan"
                  : "Semua tugas beres!"}
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {allMergedTasks.length === 0
                  ? "Tambahkan tugas baru pada tombol di atas atau hubungkan dengan kode kelas Classroom Anda."
                  : filterMode === "selesai"
                  ? "Tandai centang tugas yang telah selesai untuk memindahkannya ke sini."
                  : "Selamat bersantai atau cari ilmu baru."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {editingTask && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl space-y-4 text-left my-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 text-[#FF2D75]">
                    <div className="h-9 w-9 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
                      <Pencil size={16} className="text-[#FF2D75]" />
                    </div>
                    <div>
                      <h3 className="font-black font-display text-slate-900 text-sm">Edit Rincian Tugas</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Perbarui informasi tugas, mata kuliah, atau tenggat waktu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Tugas / Nama Laporan *</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Mata Kuliah Terkait *</span>
                      <span className="text-[10px] text-pink-600 font-bold">Pilihan Jadwal Akademik</span>
                    </label>

                    {courses && courses.length > 0 ? (
                      <div className="space-y-2">
                        <select
                          value={courses.some(c => c.name === editCourse) ? editCourse : (editCourse ? "__custom__" : "")}
                          onChange={(e) => {
                            if (e.target.value !== "__custom__") {
                              setEditCourse(e.target.value);
                            }
                          }}
                          className="w-full border border-pink-200 focus:outline-hidden focus:border-pink-400 p-2.5 rounded-xl font-bold bg-white text-xs text-slate-800 shadow-2xs"
                        >
                          <option value="">-- Pilih Mata Kuliah dari Jadwal Akademik --</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.name}>
                              📚 {c.name} {c.code ? `[${c.code}]` : ''} ({c.day}, {c.time})
                            </option>
                          ))}
                          <option value="__custom__">✏️ Ketik Mata Kuliah Lainnya / Manual...</option>
                        </select>

                        <input
                          type="text"
                          required
                          value={editCourse}
                          onChange={(e) => setEditCourse(e.target.value)}
                          placeholder="Nama mata kuliah"
                          className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-xs"
                        />

                        {/* Quick Selection Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-bold text-slate-400">Jadwal:</span>
                          {courses.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setEditCourse(c.name)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                                editCourse === c.name
                                  ? "bg-[#FF2D75] text-white shadow-xs"
                                  : "bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/60"
                              }`}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        value={editCourse}
                        onChange={(e) => setEditCourse(e.target.value)}
                        className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-xs"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Batas Tanggal</label>
                      <div className="relative flex items-center">
                        <input
                          ref={editDateInputRef}
                          type="date"
                          value={editDateStr}
                          onChange={(e) => setEditDateStr(e.target.value)}
                          onClick={(e) => {
                            e.preventDefault();
                            safeOpenPicker(e.currentTarget, "date", "edit");
                          }}
                          className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 pr-14 rounded-xl font-bold bg-white text-xs cursor-pointer select-none"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Pilih tanggal"
                          onClick={() => safeOpenPicker(editDateInputRef.current, "date", "edit")}
                          className="absolute right-2.5 flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors p-1 rounded-md hover:bg-pink-50 cursor-pointer"
                          title="Klik untuk memilih tanggal"
                        >
                          <Calendar className="w-3.5 h-3.5 pointer-events-none" />
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-600 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jam Batas</label>
                      <div className="relative flex items-center">
                        <input
                          ref={editTimeInputRef}
                          type="time"
                          value={editTimeStr}
                          onChange={(e) => setEditTimeStr(e.target.value)}
                          onClick={(e) => {
                            e.preventDefault();
                            safeOpenPicker(e.currentTarget, "time", "edit");
                          }}
                          className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 pr-14 rounded-xl font-bold bg-white text-xs text-slate-800 cursor-pointer select-none"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Pilih waktu"
                          onClick={() => safeOpenPicker(editTimeInputRef.current, "time", "edit")}
                          className="absolute right-2.5 flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors p-1 rounded-md hover:bg-pink-50 cursor-pointer"
                          title="Klik untuk memilih jam batas waktu"
                        >
                          <Clock className="w-3.5 h-3.5 pointer-events-none" />
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-600 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 select-none cursor-not-allowed">Hari Tersisa <span className="text-emerald-600 font-bold text-[10px]">(Otomatis)</span></label>
                      <input
                        type="number"
                        value={editDaysValue}
                        readOnly
                        tabIndex={-1}
                        title="Dihitung secara otomatis berdasarkan batas tanggal pengumpulan"
                        className="w-full border border-slate-200 p-2.5 rounded-xl font-bold bg-slate-100/80 text-emerald-800 text-xs font-mono cursor-not-allowed select-none focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Link Pengumpulan</label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Catatan instruksi atau kriteria tugas"
                      className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-xs"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-bold rounded-xl shadow-md cursor-pointer text-xs"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Custom Delete Confirmation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-xl space-y-4 text-left"
              >
                <div className="flex items-center gap-3 text-[#FF2D75]">
                  <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-[#FF2D75]" />
                  </div>
                  <h3 className="font-black font-display text-slate-900 text-sm">Konfirmasi Hapus</h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(deleteConfirm.id)}
                    className="flex-1 py-2 bg-[#FF2D75] hover:bg-pink-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Custom Universal Date & Time Picker Modal (Works 100% reliably in cross-origin iframes, renders instantly without animation) */}
      {typeof document !== 'undefined' && pickerState.isOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100000] p-4">
          <div className="bg-white rounded-3xl border border-pink-100 max-w-sm w-full p-5 shadow-2xl space-y-4 text-left select-none">
            {/* Header */}
                <div className="flex items-center justify-between border-b border-pink-100/70 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-[#FF2D75] text-white flex items-center justify-center shadow-md shadow-pink-200">
                      {pickerState.type === "date" ? <Calendar size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {pickerState.type === "date" ? "Pilih Batas Tanggal" : "Pilih Batas Jam"}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {pickerState.target === "add" ? "Form Tambah Tugas" : "Edit Tugas"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body: Date Picker Mode */}
                {pickerState.type === "date" && (
                  <div>
                    {/* Month / Year Navigator */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPickerState(prev => {
                            let newM = prev.viewMonth - 1;
                            let newY = prev.viewYear;
                            if (newM < 0) {
                              newM = 11;
                              newY -= 1;
                            }
                            return { ...prev, viewMonth: newM, viewYear: newY };
                          });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-pink-50 hover:text-pink-600 text-slate-600 transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-bold text-xs text-slate-800">
                        {new Date(pickerState.viewYear, pickerState.viewMonth, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPickerState(prev => {
                            let newM = prev.viewMonth + 1;
                            let newY = prev.viewYear;
                            if (newM > 11) {
                              newM = 0;
                              newY += 1;
                            }
                            return { ...prev, viewMonth: newM, viewYear: newY };
                          });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-pink-50 hover:text-pink-600 text-slate-600 transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Day names header */}
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
                      {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, idx) => (
                        <div key={idx} className="py-1">{d}</div>
                      ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const firstDayIdx = new Date(pickerState.viewYear, pickerState.viewMonth, 1).getDay();
                        const daysInMonth = new Date(pickerState.viewYear, pickerState.viewMonth + 1, 0).getDate();
                        const cells = [];
                        
                        // Current selected date string
                        const activeVal = pickerState.target === "add" ? dateStr : editDateStr;
                        const todayStr = (() => {
                          const t = new Date();
                          return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                        })();

                        // Empty padding cells for start of month
                        for (let i = 0; i < firstDayIdx; i++) {
                          cells.push(<div key={`pad-${i}`} className="h-8" />);
                        }

                        // Day number buttons
                        for (let day = 1; day <= daysInMonth; day++) {
                          const mStr = String(pickerState.viewMonth + 1).padStart(2, "0");
                          const dStr = String(day).padStart(2, "0");
                          const cellDateStr = `${pickerState.viewYear}-${mStr}-${dStr}`;
                          const isSelected = activeVal === cellDateStr;
                          const isToday = todayStr === cellDateStr;

                          cells.push(
                            <button
                              key={`day-${day}`}
                              type="button"
                              onClick={() => {
                                if (pickerState.target === "add") {
                                  setDateStr(cellDateStr);
                                } else {
                                  setEditDateStr(cellDateStr);
                                }
                                setPickerState(prev => ({ ...prev, isOpen: false }));
                              }}
                              className={`h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer relative ${
                                isSelected 
                                  ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md shadow-pink-200" 
                                  : isToday 
                                    ? "bg-pink-50 text-pink-600 font-extrabold hover:bg-pink-100" 
                                    : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {day}
                              {isToday && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full" />
                              )}
                            </button>
                          );
                        }
                        return cells;
                      })()}
                    </div>

                    {/* Quick presets footer */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const t = new Date();
                          const str = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                          if (pickerState.target === "add") setDateStr(str); else setEditDateStr(str);
                          setPickerState(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="flex-1 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const t = new Date();
                          t.setDate(t.getDate() + 1);
                          const str = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                          if (pickerState.target === "add") setDateStr(str); else setEditDateStr(str);
                          setPickerState(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="flex-1 py-1.5 text-[11px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Besok
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const t = new Date();
                          t.setDate(t.getDate() + 7);
                          const str = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                          if (pickerState.target === "add") setDateStr(str); else setEditDateStr(str);
                          setPickerState(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="flex-1 py-1.5 text-[11px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors cursor-pointer"
                      >
                        +7 Hari
                      </button>
                    </div>
                  </div>
                )}

                {/* Body: Time Picker Mode */}
                {pickerState.type === "time" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      {/* Hour selector */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Jam</span>
                        <select
                          value={pickerState.hour}
                          onChange={(e) => setPickerState(prev => ({ ...prev, hour: parseInt(e.target.value, 10) }))}
                          className="bg-white border border-pink-200 rounded-xl font-mono font-bold text-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-pink-500 shadow-xs cursor-pointer"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {String(i).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="font-mono text-2xl font-black text-pink-500 pt-4">:</span>

                      {/* Minute selector */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Menit</span>
                        <select
                          value={pickerState.minute}
                          onChange={(e) => setPickerState(prev => ({ ...prev, minute: parseInt(e.target.value, 10) }))}
                          className="bg-white border border-pink-200 rounded-xl font-mono font-bold text-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-pink-500 shadow-xs cursor-pointer"
                        >
                          {Array.from({ length: 60 }).map((_, i) => (
                            <option key={i} value={i}>
                              {String(i).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Common deadline shortcut chips */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 mb-1.5">Preset Batas Waktu Cepat:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "23:59 (Malam)", h: 23, m: 59 },
                          { label: "17:00 (Sore)", h: 17, m: 0 },
                          { label: "12:00 (Siang)", h: 12, m: 0 },
                          { label: "08:00 (Pagi)", h: 8, m: 0 },
                          { label: "21:00 (Malam)", h: 21, m: 0 },
                          { label: "15:00 (Asar)", h: 15, m: 0 },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPickerState(prev => ({ ...prev, hour: preset.h, minute: preset.m }));
                            }}
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                              pickerState.hour === preset.h && pickerState.minute === preset.m
                                ? "bg-pink-50 border-pink-300 text-[#FF2D75]"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save action button */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
                        className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const timeStrValue = `${String(pickerState.hour).padStart(2, "0")}:${String(pickerState.minute).padStart(2, "0")}`;
                          if (pickerState.target === "add") {
                            setTimeStr(timeStrValue);
                          } else {
                            setEditTimeStr(timeStrValue);
                          }
                          setPickerState(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:opacity-95 rounded-xl shadow-md shadow-pink-200 transition-opacity cursor-pointer"
                      >
                        Pilih Jam Ini
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>,
        document.body
      )}

    </div>
  );
}
