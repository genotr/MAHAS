import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar, CheckSquare, GraduationCap, Briefcase, Heart, ShoppingBag, 
  ArrowRight, ArrowLeft, Sparkles, ChevronLeft, ChevronRight, Share2, Plus, Users, Award, Clock, MapPin, Smile, BookOpen, Upload,
  Shirt, TrendingUp, TrendingDown, Info, Edit, Trash2, Check, AlertTriangle, CalendarDays, X, Timer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, AgendaItem, CampusEvent, Community, UserProfile, getIpkClassification } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { IndonesianQuotes } from "../data";
import { syncTasksWithDeviceDate } from "../utils/taskDateHelper";

export interface InteractiveCalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  category: "Pribadi" | "Tugas" | "Lainnya";
  completed?: boolean;
}

interface BerandaViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  eventsList?: InteractiveCalendarEvent[];
  setEventsList?: React.Dispatch<React.SetStateAction<InteractiveCalendarEvent[]>>;
  agenda: AgendaItem[];
  events: CampusEvent[];
  communities: Community[];
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setTab: (tab: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleCommunityJoin: (id: string) => void;
  toggleEventRegistration: (id: string) => void;
  
  // Progress states that make the dashboard editable and fully interactive
  completedCount: number;
  totalTaskCount: number;
  setCompletedCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalTaskCount: React.Dispatch<React.SetStateAction<number>>;
  
  studyHours: number;
  setStudyHours: React.Dispatch<React.SetStateAction<number>>;
  targetStudyHours: number;
  
  mood: string;
  setMood: React.Dispatch<React.SetStateAction<string>>;
}

export default function BerandaView({
  tasks,
  setTasks,
  eventsList: propEventsList,
  setEventsList: propSetEventsList,
  agenda,
  events,
  communities,
  profile,
  setProfile,
  setTab,
  toggleTaskCompletion,
  toggleCommunityJoin,
  toggleEventRegistration,
  completedCount,
  totalTaskCount,
  setCompletedCount,
  setTotalTaskCount,
  studyHours,
  setStudyHours,
  targetStudyHours,
  mood,
  setMood
}: BerandaViewProps) {
  // Logo/Avatar Upload Custom States and Refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // GPA Projection & Calculator states for increase/decrease simulation per semester
  const [showGpaProjection, setShowGpaProjection] = useState(false);
  const [targetIps, setTargetIps] = useState<number>(3.80);

  // Weekly Progress reset / auto countdown states and mechanics
  const [autoResetSecondsLeft, setAutoResetSecondsLeft] = useState<number | null>(null);
  const [dismissedAutoReset, setDismissedAutoReset] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Moving Octopus Mascot States and Quotes list
  const [octopusQuote, setOctopusQuote] = useState<string>("");
  const [isOctopusClicked, setIsOctopusClicked] = useState(false);
  const [showMiniChart, setShowMiniChart] = useState(false);

  const octopusWelcomeQuotes = [
    "Hai! Selamat datang di MAHAS - Speech to Text! Si Gurita siap nemenin belajarmu! 🐙✨",
    "Semangat awal yang baru! Yuk mulai kelola tugas & kuliahmu di sini! 🎓🚀",
    "Halo sobat cerdas! Jangan ragu input jadwal & tugas pertamamu ya! 📝🌟",
    "Selamat datang! Butuh bantuan? Klik aku kapan saja untuk semangat! 💖🐙"
  ];

  const octopusUncompletedQuotes = [
    "Ayo nugas! Si Gurita siap semangatin kamu sampai tuntas! 💪🐙",
    "Jangan ditunda-tunda ya kak, nanti tugasnya menumpuk lho! 🎒⏳",
    "Istirahat sejenak boleh kok, tapi jangan lupa diselesaikan ya! ☕✨",
    "Tinggal dikit lagi kok, kamu pasti bisa menyelesaikan semuanya! 🌟🚀",
    "Gurita sedang memantau progres tugasmu... 👀 Tetap fokus ya!",
    "Butuh bantuan? Tarik napas dalam-dalam, lalu mulai perlahan! 💨🧠"
  ];

  const octopusCompletedQuotes = [
    "Horeee! Semua tugas sudah beres! Kamu emang mahasiswa teladan! 🏆🎉",
    "Bebas nugas! Yuk manfaatkan waktu luang untuk istirahat atau hobi! 🎮🍀",
    "Gurita bangga banget sama kedisiplinan kamu hari ini! 🥰🐙",
    "Yesss! Pekerjaan bagus! Sekarang saatnya me-time! 🍿🍿",
    "Tidak ada tugas tersisa! Kamu berhak mendapatkan medali bintang! ⭐⭐⭐"
  ];

  const handleResetProgressAction = () => {
    setCompletedCount(0);
    setStudyHours(0);
    setDismissedAutoReset(true);
    setAutoResetSecondsLeft(null);
    setTasks(prev => prev.map(t => ({ ...t, completed: false })));
  };

  useEffect(() => {
    const calculatedTaskPct = Math.round((completedCount / (totalTaskCount || 1)) * 100);
    const calculatedStudyPct = Math.min(100, Math.round((studyHours / (targetStudyHours || 1)) * 100));
    const calculatedCombined = Math.round((calculatedTaskPct + calculatedStudyPct) / 2);

    if (calculatedCombined === 100) {
      if (!dismissedAutoReset && autoResetSecondsLeft === null) {
        setAutoResetSecondsLeft(10);
      }
    } else {
      setAutoResetSecondsLeft(null);
      setDismissedAutoReset(false);
    }
  }, [completedCount, totalTaskCount, studyHours, targetStudyHours, dismissedAutoReset]);

  useEffect(() => {
    if (autoResetSecondsLeft === null) return;
    if (autoResetSecondsLeft <= 0) {
      handleResetProgressAction();
      return;
    }

    const timer = setTimeout(() => {
      setAutoResetSecondsLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoResetSecondsLeft]);

  const handleAvatarChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfile(prev => ({
            ...prev,
            avatar: e.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarChange(e.dataTransfer.files[0]);
    }
  };

  // Calendar states dynamically synced with the user's device calendar
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Sync calendar and tasks with device date if month/day changes or component mounts
  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDay(now.getDate());

    // Automatically synchronize task daysLeft based on current device date
    setTasks(prev => syncTasksWithDeviceDate(prev));
  }, []);

  // Color-coded Interactive Calendar States & CRUD Modal States
  const [localEventsList, setLocalEventsList] = useState<InteractiveCalendarEvent[]>(() => {
    const saved = localStorage.getItem("campushub_color_events");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const eventsList = propEventsList !== undefined ? propEventsList : localEventsList;
  const setEventsList = propSetEventsList || setLocalEventsList;

  // Persist calendar events
  useEffect(() => {
    localStorage.setItem("campushub_color_events", JSON.stringify(eventsList));
  }, [eventsList]);

  // Modal Control States
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formCategory, setFormCategory] = useState<"Pribadi" | "Tugas" | "Lainnya">("Pribadi");
  const [formCompleted, setFormCompleted] = useState(false);

  // Open modal helper
  const openCreateModalForDate = (dateString: string) => {
    setFormTitle("");
    setFormDescription("");
    setFormDate(dateString);
    setFormTime("09:00");
    setFormCategory("Pribadi");
    setFormCompleted(false);
    setModalMode("create");
    setShowEventModal(true);
  };

  const openViewModal = (ev: InteractiveCalendarEvent) => {
    setSelectedEventId(ev.id);
    setFormTitle(ev.title);
    setFormDescription(ev.description);
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormCategory(ev.category);
    setFormCompleted(!!ev.completed);
    setModalMode("view");
    setShowEventModal(true);
  };

  const openEditModal = (ev: InteractiveCalendarEvent) => {
    setSelectedEventId(ev.id);
    setFormTitle(ev.title);
    setFormDescription(ev.description);
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormCategory(ev.category);
    setFormCompleted(!!ev.completed);
    setModalMode("edit");
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    if (modalMode === "create") {
      const newEv: InteractiveCalendarEvent = {
        id: "ev-" + Date.now(),
        title: formTitle,
        description: formDescription,
        date: formDate,
        time: formTime,
        category: formCategory,
        completed: formCompleted
      };
      setEventsList(prev => [...prev, newEv]);
    } else if (modalMode === "edit" && selectedEventId) {
      setEventsList(prev => prev.map(ev => 
        ev.id === selectedEventId 
          ? { ...ev, title: formTitle, description: formDescription, date: formDate, time: formTime, category: formCategory, completed: formCompleted }
          : ev
      ));
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEventsList(prev => prev.filter(ev => ev.id !== id));
    setShowEventModal(false);
    setDeleteConfirm(null);
  };

  const toggleEventCompletion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventsList(prev => prev.map(ev => 
      ev.id === id ? { ...ev, completed: !ev.completed } : ev
    ));
  };



  // Modal alert
  const [welcomeBannerMessage, setWelcomeBannerMessage] = useState(0);
  const banners = [
    {
      title: "Semua kebutuhan mahasiswa, ada disatu tempat.",
      desc: "Kelola akademik, tugas, kesehatan mental, bimbingan, dan kegiatan belajar dengan mudah.",
      btnText: "Akses Fitur Utama"
    },
    {
      title: "Optimalkan Cara Belajarmu! 🧠",
      desc: "Bangun mindmap interaktif, hitung durasi belajar seimbang, dan kelola prioritas materi kuliah di Ruang Belajar.",
      btnText: "Buka Ruang Belajar"
    },
    {
      title: "Kesehatan Mental Itu Penting! ❤️",
      desc: "Ceritakan keluh kesahmu tanpa rasa takut melalui curhat anonim atau konseling profesional kami.",
      btnText: "Curhat Sekarang"
    }
  ];

  // Auto-play interval with smooth transition
  useEffect(() => {
    const timer = setInterval(() => {
      setWelcomeBannerMessage((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const cycleQuote = () => {
    setQuoteIndex(prev => (prev + 1) % IndonesianQuotes.length);
  };

  // Build calendar matrix
  const daysCount = daysInMonth(currentYear, currentMonth);
  const startingDay = startDayOfMonth(currentYear, currentMonth);
  const calendarDays = [];
  
  // Fill empty spaces of previous month
  const prevMonthDaysCount = daysInMonth(currentYear, currentMonth - 1 < 0 ? 11 : currentMonth - 1);
  for (let i = startingDay - 1; i >= 0; i--) {
    calendarDays.push({ dayNum: prevMonthDaysCount - i, isCurrentMonth: false });
  }
  
  // Fill current month days
  for (let i = 1; i <= daysCount; i++) {
    calendarDays.push({ dayNum: i, isCurrentMonth: true });
  }

  // Fill next month placeholders
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({ dayNum: i, isCurrentMonth: false });
  }

  // Quick access icon color configurations (extended matching the mockup design)
  const quickAccess = [
    { label: "Tugas & Deadline", icon: CheckSquare, color: "text-[#2563eb] bg-[#eff6ff]", iconBg: "bg-blue-100", tab: "Tugas & Deadline" },
    { label: "Jadwal Kuliah", icon: Calendar, color: "text-[#16a34a] bg-[#f0fdf4]", iconBg: "bg-emerald-105", tab: "Jadwal" },
    { label: "Ruang Belajar", icon: BookOpen, color: "text-[#db2777] bg-[#fdf2f8]", iconBg: "bg-pink-106", tab: "Ruang Belajar", sparkle: true },
    { label: "Mental Health", icon: Heart, color: "text-[#7c3aed] bg-[#f5f3ff]", iconBg: "bg-purple-105", tab: "Mental Health" }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start relative z-10">
      
      {/* Left + Mid Content Columns (Span 2) */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Welcome message & 3D Glassmetric Pills */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-900 flex items-center gap-2">
              Hai, {profile.name} <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-slate-500 text-xs font-semibold flex items-center gap-1.5 leading-normal">
              Semangat ngerjain tugas hari ini! Kamu hebat!
            </p>
          </div>

          {/* 3D Glass Pill indicators */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative">
            {/* IPK Kamu Pill */}
            <div 
              id="gpa-pill-dropdown-trigger"
              onClick={() => setShowGpaProjection(!showGpaProjection)}
              className="group flex items-center gap-2.5 bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] px-3 py-1.5 rounded-2xl transition-all hover:scale-105 duration-300 cursor-pointer hover:border-blue-400 select-none relative"
            >
              <div className="bg-blue-500/10 p-1.5 rounded-xl text-blue-600 group-hover:bg-blue-500/20 transition-all">
                <GraduationCap size={15} />
              </div>
              <div className="text-left text-[10px]">
                <div className="flex items-center gap-1">
                  <p className="text-slate-500 font-extrabold leading-none uppercase tracking-wider">IPK Kamu</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ color: "#000000" }} />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-sans font-black text-sm leading-tight" style={{ color: "#000000" }}>{profile.gpa}</span>
                  <span className="bg-emerald-500/10 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center border border-emerald-500/20 gap-0.5 hover:bg-emerald-500/20" style={{ color: "#000000" }}>
                    Proyeksi IPK
                  </span>
                </div>
              </div>

              {/* Glassmorphic GPB Projection Detail Popover */}
              {showGpaProjection && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute right-0 top-full mt-3 w-76 sm:w-80 bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-3xl p-4.5 z-50 text-slate-800 text-left animate-in fade-in slide-in-from-top-3 duration-250 cursor-default"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={16} className="text-[#FF2D75]" />
                      <span className="font-extrabold text-xs text-slate-900">Proyeksi & Simulasi IPK</span>
                    </div>
                    <button 
                      onClick={() => setShowGpaProjection(false)}
                      className="text-slate-400 hover:text-slate-600 font-black text-xs cursor-pointer p-1 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Calculations setup */}
                  {(() => {
                    const currentGpa = profile.gpa;
                    const completedSks = 54;
                    const currentSks = 20;
                    const totalSks = completedSks + currentSks;

                    // Projected GPA based on slider
                    const projectedGpa = ((currentGpa * completedSks) + (targetIps * currentSks)) / totalSks;
                    const deltaGpa = projectedGpa - currentGpa;

                    // Max scenario (IPS 4.00)
                    const maxProjected = ((currentGpa * completedSks) + (4.00 * currentSks)) / totalSks;
                    const maxDelta = maxProjected - currentGpa;

                    // Min scenario (IPS 2.00)
                    const minProjected = ((currentGpa * completedSks) + (2.00 * currentSks)) / totalSks;
                    const minDelta = currentGpa - minProjected;

                    return (
                      <div className="space-y-3.5">
                        <div className="bg-pink-50/50 rounded-2xl p-3 border border-pink-100">
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Latar Belakang Akademik</p>
                          <div className="grid grid-cols-2 gap-2 mt-1 font-semibold text-slate-700 text-[10px]">
                            <div>SKS Kumulatif: <strong className="font-mono text-slate-900">{completedSks} SKS</strong></div>
                            <div>Semester Ini: <strong className="font-mono text-slate-900">{currentSks} SKS</strong></div>
                          </div>
                        </div>

                        {/* Interactive Slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-600">Simulasi IPS Semester Ini:</span>
                            <span className="font-mono font-black text-[#FF2D75] text-xs bg-pink-100/50 px-2 py-0.5 rounded-lg border border-pink-200">
                              {targetIps.toFixed(2)}
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="2.00" 
                            max="4.00" 
                            step="0.05"
                            value={targetIps} 
                            onChange={(e) => setTargetIps(parseFloat(e.target.value))}
                            className="w-full accent-[#FF2D75] cursor-pointer h-1.5 bg-slate-150 rounded-lg appearance-none"
                          />
                        </div>

                        {/* Projection result stats */}
                        <div className="text-center py-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-205">
                          <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Prediksi IPK Setelah Semester Ini</p>
                          <p className="font-sans font-black text-xl text-slate-900 mt-1 flex items-center justify-center gap-2">
                            {projectedGpa.toFixed(2)}
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${deltaGpa >= 0 ? "bg-emerald-100/70 text-emerald-600" : "bg-rose-100/70 text-rose-600"}`}>
                              {deltaGpa >= 0 ? `+${deltaGpa.toFixed(2)}` : `${deltaGpa.toFixed(2)}`}
                            </span>
                          </p>
                        </div>

                        {/* Best vs Worst Case Indicators requested by user */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Potensi Meningkat */}
                          <div className="bg-emerald-50/50 rounded-2xl p-2.5 border border-emerald-110 flex flex-col justify-between">
                            <div className="flex items-center gap-1 text-emerald-700 text-[9px] uppercase font-black tracking-wider">
                              <TrendingUp size={12} className="text-emerald-500" />
                              <span>Meningkat (Max)</span>
                            </div>
                            <div className="mt-1.5">
                              <p className="text-[10px] text-slate-500 font-bold">IPS Sempurna 4.00</p>
                              <p className="font-sans font-black text-sm text-slate-950 mt-0.5">
                                {maxProjected.toFixed(2)}
                              </p>
                              <p className="text-[9px] text-emerald-600 font-black mt-0.5">
                                Dapat Naik (+{maxDelta.toFixed(2)})
                              </p>
                            </div>
                          </div>

                          {/* Potensi Menurun */}
                          <div className="bg-rose-50/50 rounded-2xl p-2.5 border border-rose-110 flex flex-col justify-between">
                            <div className="flex items-center gap-1 text-rose-700 text-[9px] uppercase font-black tracking-wider">
                              <TrendingDown size={12} className="text-rose-500" />
                              <span>Menurun (Min)</span>
                            </div>
                            <div className="mt-1.5">
                              <p className="text-[10px] text-slate-500 font-bold">IPS Rendah 2.00</p>
                              <p className="font-sans font-black text-sm text-slate-950 mt-0.5">
                                {minProjected.toFixed(2)}
                              </p>
                              <p className="text-[9px] text-rose-600 font-black mt-0.5">
                                Dapat Turun (-{minDelta.toFixed(2)})
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-1 py-1 px-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                          <Info size={11} className="text-slate-500 mt-0.5 shrink-0" />
                          <span>Klik pilar mana saja untuk memperkirakan strategi perolehan IPK ideal di semester berjalan.</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Level Kamu Pill */}
            <div className="flex items-center gap-2.5 bg-white/44 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] px-3 py-1.5 rounded-2xl transition-all hover:scale-105 duration-300">
              <div className="bg-purple-500/10 p-1.5 rounded-xl text-purple-600">
                <TrendingUp size={15} />
              </div>
              <div className="text-left text-[10px]">
                <p className="text-slate-500 font-extrabold leading-none uppercase tracking-wider">Tingkat IPK</p>
                <p className="font-display font-bold text-[#FF2D75] text-xs mt-0.5">
                  {profile.gpa >= 3.51 ? "Cum Laude" :
                   profile.gpa >= 3.01 ? "Sangat Memuaskan" :
                   profile.gpa >= 2.76 ? "Memuaskan" :
                   profile.gpa >= 2.01 ? "Cukup" : "Kurang"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Banner - Pastel green gradient without decorative circles */}
        <div className="relative bg-gradient-to-r from-[#e2f9ec]/85 via-[#cdfbe1]/90 to-[#bbf7d0]/80 backdrop-blur-xl border border-white/95 rounded-[32px] p-6 md:p-8 text-slate-900 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-sm text-left relative min-h-[190px] md:min-h-[220px] flex flex-col justify-between">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={welcomeBannerMessage}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight text-slate-900">
                      {(() => {
                        const title = banners[welcomeBannerMessage].title;
                        if (title.includes("mahasiswa")) {
                          const parts = title.split("mahasiswa");
                          return (
                            <>
                              {parts[0]}
                              <span className="underline decoration-[#FF2D75] decoration-solid underline-offset-4 decoration-3">mahasiswa</span>
                              {parts[1]}
                            </>
                          );
                        }
                        if (title.includes("Mahasiswa")) {
                          const parts = title.split("Mahasiswa");
                          return (
                            <>
                              {parts[0]}
                              <span className="underline decoration-[#FF2D75] decoration-solid underline-offset-4 decoration-3">Mahasiswa</span>
                              {parts[1]}
                            </>
                          );
                        }
                        return title;
                      })()}
                    </h2>
                    <p className="text-slate-650 text-xs md:text-xs leading-relaxed font-semibold">
                      {banners[welcomeBannerMessage].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-auto">
                <button 
                  onClick={() => {
                    if (welcomeBannerMessage === 0) setTab("Suara Teks");
                    else if (welcomeBannerMessage === 1) setTab("Ruang Belajar");
                    else if (welcomeBannerMessage === 2) setTab("Mental Health");
                  }}
                  className="px-5 py-2.5 bg-[#FF2D75] text-white font-bold text-xs rounded-2xl hover:bg-[#db2777] transition shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer border border-[#FF2D75]/10"
                >
                  {banners[welcomeBannerMessage].btnText}
                  <ArrowRight size={14} className="text-white" />
                </button>
                <div className="flex gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setWelcomeBannerMessage(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${welcomeBannerMessage === idx ? "bg-[#FF2D75] w-4" : "bg-[#FF2D75]/25 hover:bg-[#FF2D75]/45"}`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Visual representation card - Animated and Interactive Moving Octopus Section (Mascot Reminder) */}
            <div className="flex relative w-56 h-56 xl:w-60 xl:h-60 shrink-0 items-center justify-center">
              {/* Floating Bubbles Effect behind Octopus */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white/40 backdrop-blur-xs rounded-full border border-white/20"
                    style={{
                      width: Math.random() * 8 + 4,
                      height: Math.random() * 8 + 4,
                      bottom: "-10px",
                      left: `${15 + i * 14}%`,
                    }}
                    animate={{
                      y: ["0%", "-120%"],
                      x: ["0%", i % 2 === 0 ? "10px" : "-10px", "0%"],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      delay: i * 0.7,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Task speech bubble reminder above Octopus */}
              {(() => {
                const isNewUser = tasks.length === 0;
                const uncompletedTasksCount = tasks.filter(t => !t.completed).length;
                const activeQuote = octopusQuote || (
                  isNewUser
                    ? "Hai! Selamat datang di MAHAS - Speech to Text! Si Gurita siap nemenin belajarmu! 🐙✨"
                    : uncompletedTasksCount > 0 
                    ? `Hei! Ada ${uncompletedTasksCount} tugas yang belum selesai nih. Yuk selesaikan! 🐙⚠️` 
                    : "Yey! Semua tugasmu sudah selesai! Hebat banget! 🌟🐙"
                );

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={uncompletedTasksCount + (octopusQuote ? 100 : 0)}
                    className="absolute top-1 left-1/2 transform -translate-x-1/2 z-30 bg-white border-2 border-pink-100 shadow-[0_8px_20px_rgba(255,45,117,0.12)] rounded-2xl px-3 py-1.5 w-max max-w-[240px] text-center select-none"
                  >
                    <p className="text-[10px] font-black leading-tight text-slate-800">
                      {activeQuote}
                    </p>
                    {/* Arrow Pointer */}
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-pink-100 rotate-45"></div>
                  </motion.div>
                );
              })()}

              {/* Animated Floating Octopus Mascot */}
              <motion.div
                onClick={() => {
                  const isNewUser = tasks.length === 0;
                  const uncompletedTasksCount = tasks.filter(t => !t.completed).length;
                  const pool = isNewUser 
                    ? octopusWelcomeQuotes 
                    : (uncompletedTasksCount > 0 ? octopusUncompletedQuotes : octopusCompletedQuotes);
                  const randomQuote = pool[Math.floor(Math.random() * pool.length)];
                  setOctopusQuote(randomQuote);
                  setIsOctopusClicked(true);
                  setTimeout(() => setIsOctopusClicked(false), 800);
                }}
                whileHover={{ scale: 1.08 }}
                animate={isOctopusClicked ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  rotate: [0, 15, -15, 10, 0],
                  y: [0, -15, 5, -2, 0]
                } : {
                  y: [0, -8, 0],
                }}
                transition={isOctopusClicked ? {
                  duration: 0.8,
                  ease: "easeInOut"
                } : {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-44 h-44 xl:w-48 xl:h-48 flex items-center justify-center cursor-pointer select-none z-10 filter drop-shadow-[0_12px_24px_rgba(236,72,153,0.25)]"
                title="Klik aku untuk mendapatkan kata penyemangat!"
              >
                {/* SVG Octopus Drawing */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="octopusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5e97" />
                      <stop offset="100%" stopColor="#a154f2" />
                    </linearGradient>
                    <linearGradient id="innerTentacleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fda4af" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#a154f2" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Gentle shadow oval beneath the octopus */}
                  <motion.ellipse 
                    cx="100" 
                    cy="180" 
                    rx="45" 
                    ry="6" 
                    fill="#1e293b" 
                    opacity="0.12" 
                    animate={{
                      scaleX: [1, 0.85, 1],
                      opacity: [0.12, 0.06, 0.12]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Octopus Tentacles - Animated individually for organic waving motion */}
                  <g>
                    {/* Tentacle 1 (Far Left) */}
                    <motion.path 
                      d="M 60 125 C 40 140, 30 155, 45 168 C 55 175, 65 165, 60 150 C 55 135, 65 130, 70 125" 
                      fill="url(#octopusGrad)" 
                      animate={{ rotate: [-6, 6, -6], y: [0, 4, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                      style={{ transformOrigin: "70px 125px" }}
                    />
                    
                    {/* Tentacle 2 (Left Mid) */}
                    <motion.path 
                      d="M 75 132 C 60 150, 50 168, 68 178 C 80 183, 85 170, 78 158 C 72 145, 80 138, 85 132" 
                      fill="url(#octopusGrad)" 
                      animate={{ rotate: [-8, 4, -8], y: [0, -3, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      style={{ transformOrigin: "85px 132px" }}
                    />

                    {/* Tentacle 3 (Center Left) */}
                    <motion.path 
                      d="M 90 135 C 80 160, 75 178, 92 182 C 100 184, 102 172, 96 160 C 90 148, 95 142, 98 135" 
                      fill="url(#octopusGrad)" 
                      animate={{ rotate: [-4, 6, -4], y: [0, 2, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      style={{ transformOrigin: "98px 135px" }}
                    />

                    {/* Tentacle 4 (Center Right) */}
                    <motion.path 
                      d="M 110 135 C 120 160, 125 178, 108 182 C 100 184, 98 172, 104 160 C 110 148, 105 142, 102 135" 
                      fill="url(#octopusGrad)" 
                      animate={{ rotate: [4, -6, 4], y: [0, 2, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      style={{ transformOrigin: "102px 135px" }}
                    />

                    {/* Tentacle 5 (Right Mid) */}
                    <motion.path 
                      d="M 125 132 C 140 150, 150 168, 132 178 C 120 183, 115 170, 122 158 C 128 145, 120 138, 115 132" 
                      fill="url(#octopusGrad)" 
                      animate={{ rotate: [8, -4, 8], y: [0, -3, 0] }}
                      transition={{ duration: 3.7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      style={{ transformOrigin: "115px 132px" }}
                    />

                    {/* Tentacle 6 (Far Right) */}
                    <motion.path 
                      d="M 140 125 C 160 140, 170 155, 155 168 C 145 175, 135 165, 140 150 C 145 135, 135 130, 130 125" 
                      fill="url(#octopusGrad)" 
                      animate={{ rotate: [6, -6, 6], y: [0, 4, 0] }}
                      transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                      style={{ transformOrigin: "130px 125px" }}
                    />
                  </g>

                  {/* Main Head/Body of Octopus */}
                  <path 
                    d="M 55 95 C 55 45, 145 45, 145 95 C 145 125, 130 138, 100 138 C 70 138, 55 125, 55 95 Z" 
                    fill="url(#octopusGrad)" 
                  />

                  {/* Cute Pink Blushing Cheeks */}
                  <ellipse cx="72" cy="102" rx="7" ry="5" fill="#fda4af" opacity="0.8" />
                  <ellipse cx="128" cy="102" rx="7" ry="5" fill="#fda4af" opacity="0.8" />

                  {/* Big Glossy Eyes - expression reacts to unfinished tasks! */}
                  {(() => {
                    const uncompletedTasksCount = tasks.filter(t => !t.completed).length;
                    
                    if (uncompletedTasksCount > 0) {
                      // Worried/Focused cute eyes for tasks warning
                      return (
                        <>
                          {/* Worried Eyebrows */}
                          <motion.path 
                            d="M 68 81 Q 78 79 84 85" 
                            stroke="#1e293b" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            fill="none" 
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.path 
                            d="M 132 81 Q 122 79 116 85" 
                            stroke="#1e293b" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            fill="none" 
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />

                          {/* Eyes */}
                          <motion.circle cx="78" cy="95" r="10" fill="#1e293b" />
                          <circle cx="76" cy="91" r="3.5" fill="white" />
                          <circle cx="80" cy="97" r="1.5" fill="white" />

                          <motion.circle cx="122" cy="95" r="10" fill="#1e293b" />
                          <circle cx="120" cy="91" r="3.5" fill="white" />
                          <circle cx="124" cy="97" r="1.5" fill="white" />

                          {/* Worried small open mouth */}
                          <ellipse cx="100" cy="109" rx="4.5" ry="6.5" fill="#5c0620" />
                          <circle cx="100" cy="107" r="2.5" fill="#f43f5e" opacity="0.3" />
                        </>
                      );
                    } else {
                      // Extremely happy laughing eyes!
                      return (
                        <>
                          {/* Happy eyebrows */}
                          <path d="M 68 76 Q 78 72 84 78" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                          <path d="M 132 76 Q 122 72 116 78" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />

                          {/* Happy curved lines for eyes */}
                          <path d="M 68 96 Q 78 86 88 96" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                          <path d="M 112 96 Q 122 86 132 96" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" fill="none" />

                          {/* Big open smile */}
                          <path d="M 92 108 Q 100 120 108 108 Z" fill="#5c0620" />
                          <path d="M 95 111 Q 100 118 105 111 Z" fill="#fda4af" />
                        </>
                      );
                    }
                  })()}
                </svg>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Akses Cepat */}
        <section className="space-y-4">
          <h3 className="font-extrabold font-display text-slate-800 flex items-center gap-2 text-base text-left">
            <span className="w-1.5 h-5 bg-[#FF2D75] rounded-full block"></span>
            Akses Cepat
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {quickAccess.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setTab(item.tab)}
                  className="bg-white/45 backdrop-blur-md p-3 rounded-2xl border border-white/75 transition-all duration-350 text-center flex flex-col items-center justify-center gap-2 cursor-pointer group hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(31,38,135,0.04)] hover:bg-white/65 shadow-xs"
                >
                  <div className={`p-2.5 rounded-2xl ${item.color} shadow-xs transition-all duration-300 group-hover:scale-108 group-hover:rotate-2`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-600 group-hover:text-pink-600 leading-tight block">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming Deadline & Weekly Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Deadline Terdekat Component */}
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold font-display text-slate-800 text-sm flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Deadline Terdekat
              </h3>
              <button 
                onClick={() => setTab("Tugas & Deadline")} 
                className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                Lihat semua
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {tasks.filter(t => !t.completed).slice(0, 3).map((task) => {
                // Determine days left pill color
                let pillColor = "bg-red-50 text-red-600 border border-red-100";
                if (task.daysLeft > 6) {
                  pillColor = "bg-amber-50 text-amber-600 border border-amber-100";
                } else if (task.daysLeft > 3) {
                  pillColor = "bg-orange-55 text-orange-600 border border-orange-100";
                }

                return (
                  <div 
                    key={task.id} 
                    className="flex justify-between items-center p-3 rounded-2xl border border-white/50 bg-white/30 hover:bg-white/60 transition-all text-left"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-[#000000] text-xs truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{task.course} • {task.dueDate}</p>
                    </div>
                    {task.daysLeft <= 0 ? (
                      <span className="text-[9.5px] font-black px-2.5 py-1 rounded-xl shrink-0 uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Closed
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-black px-2.5 py-1 rounded-xl shrink-0 uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Timer size={11} className="text-amber-800" />
                        {task.daysLeft} hari
                      </span>
                    )}
                  </div>
                );
              })}
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/20 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl">📝</span>
                  <p className="text-xs font-extrabold text-slate-700 mt-2">Masih belum ada tugas yang Anda masukkan</p>
                  <p className="text-[10px] text-slate-400">Tambahkan tugas baru pada menu Tugas &amp; Deadline.</p>
                </div>
              ) : tasks.filter(t => !t.completed).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/20 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl">🎉</span>
                  <p className="text-xs font-extrabold text-slate-700 mt-2">Semua tugas beres!</p>
                  <p className="text-[10px] text-slate-400">Selamat bersantai atau cari ilmu baru.</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Progres Mingguan saya */}
          <div className="bg-white/45 backdrop-blur-md p-5.5 rounded-3xl border border-white/60 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold font-display text-slate-800 text-sm flex items-center gap-2">
                <Smile size={16} className="text-pink-500" />
                Progres Mingguan saya
              </h3>
              <span className="text-[10px] font-black uppercase text-[#FF2D75] bg-pink-50 px-2 py-0.5 rounded-md tracking-wider">
                Target Minggu Ini
              </span>
            </div>

            {/* Auto-Reset Countdown Banner */}
            <AnimatePresence>
              {autoResetSecondsLeft !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-3.5 bg-green-50/70 backdrop-blur-xs border border-green-200/80 p-3 rounded-2xl text-left overflow-hidden relative shadow-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs pt-0.5 animate-bounce block">✨</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[10px] text-green-800 uppercase tracking-wider">Progres 100% Tercapai!</h4>
                      <p className="text-[10px] text-slate-600 font-bold mt-0.5 leading-snug">
                        Sistem mendeteksi pencapaian penuh. Otomatis meriset dalam <strong className="text-pink-600 font-black font-mono text-xs">{autoResetSecondsLeft}s</strong> untuk minggu baru.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleResetProgressAction()}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-black transition-colors cursor-pointer"
                        >
                          Reset Sekarang
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDismissedAutoReset(true);
                            setAutoResetSecondsLeft(null);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold border border-slate-200 transition-colors cursor-pointer"
                        >
                          Batal Auto-Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Combined nested 3D glass percentage display section */}
            {(() => {
              const taskPercentage = Math.round((completedCount / (totalTaskCount || 1)) * 100);
              const cappedTaskPct = Math.min(100, taskPercentage);
              const studyPct = Math.min(100, Math.round((studyHours / (targetStudyHours || 1)) * 100));
              const combinedPct = Math.round((cappedTaskPct + studyPct) / 2);
              
              const radius = 54;
              const strokeWidth = 10;
              const circumference = 2 * Math.PI * radius;
              const studyStrokeOffset = circumference - (studyPct / 100) * circumference;

              const innerRadius = radius - strokeWidth - 5;
              const innerCircumference = 2 * Math.PI * innerRadius;
              const taskStrokeOffset = innerCircumference - (cappedTaskPct / 100) * innerCircumference;

              return (
                <div className="flex flex-col items-center gap-5 mt-1">
                  {/* Concentric 3D Spherical/Orb Glassmeter view */}
                  <div className="relative w-40 h-40 shrink-0 flex items-center justify-center p-2 rounded-2xl bg-white/25 border border-white/40 shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)]">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <defs>
                        <linearGradient id="taskGradBeranda" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#FF2D75" />
                        </linearGradient>
                        <linearGradient id="studyGradBeranda" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                      </defs>

                      {/* Track Background outer ring (for study) */}
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        className="stroke-slate-200/40"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />
                      {/* Study Progress outer Ring */}
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke="url(#studyGradBeranda)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={studyStrokeOffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2)" }}
                      />

                      {/* Inner track (for tasks) */}
                      <circle
                        cx="72"
                        cy="72"
                        r={innerRadius}
                        className="stroke-slate-200/45"
                        strokeWidth={strokeWidth - 1}
                        fill="transparent"
                      />
                      {/* Task Progress inner Ring */}
                      <circle
                        cx="72"
                        cy="72"
                        r={innerRadius}
                        stroke="url(#taskGradBeranda)"
                        strokeWidth={strokeWidth - 1}
                        fill="transparent"
                        strokeDasharray={innerCircumference}
                        strokeDashoffset={taskStrokeOffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.1)" }}
                      />
                    </svg>

                    {/* Centered Glass Combined Percentage label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="bg-white/70 backdrop-blur-md w-22 h-22 rounded-full flex flex-col items-center justify-center border border-white shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                        <span className="text-xl font-black font-display text-slate-800 leading-none">
                          {combinedPct}%
                        </span>
                        <span className="text-[8px] font-black uppercase text-[#FF2D75] tracking-widest mt-1">
                          TUNTAS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Half: Control & Micro meters */}
                  <div className="w-full space-y-3.5 text-left">
                    {/* Task progress with adjustments */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-650 mb-1">
                        <span className="font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D75]"></span>
                          Tugas Selesai: <strong className="text-slate-800">{completedCount}/{totalTaskCount}</strong>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setCompletedCount(c => Math.max(0, c - 1))}
                            className="w-4 h-4 bg-white/70 shadow-xs border border-white/95 hover:bg-white rounded text-[9px] font-black text-slate-650 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                            title="Kurangi tugas selesai"
                          >
                            -
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setCompletedCount(c => Math.min(totalTaskCount, c + 1));
                            }}
                            className="w-4 h-4 bg-white/70 shadow-xs border border-white/95 hover:bg-white rounded text-[9px] font-black text-slate-655 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                            title="Tambah tugas selesai"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/35 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-400 to-[#FF2D75] rounded-full transition-all duration-300"
                          style={{ width: `${cappedTaskPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Study Hours progress with adjustments */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-650 mb-1">
                        <span className="font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 text-sky-500 font-black">•</span>
                          Jam Belajar: <strong className="text-slate-800">{studyHours}/{targetStudyHours}j</strong>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setStudyHours(h => Math.max(0, h - 1))}
                            className="w-4 h-4 bg-white/70 shadow-xs border border-white/95 hover:bg-white rounded text-[9px] font-black text-slate-650 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                          >
                            -
                          </button>
                          <button 
                            type="button"
                            onClick={() => setStudyHours(h => Math.min(targetStudyHours, h + 1))}
                            className="w-4 h-4 bg-white/70 shadow-xs border border-white/95 hover:bg-white rounded text-[9px] font-black text-slate-655 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/35 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full transition-all duration-300"
                          style={{ width: `${studyPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Mood indicator with Select drop query */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-655 mb-1">
                        <span className="font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Mood Anda: <strong className="text-slate-800">{mood === "Baik" ? "😊 Baik" : mood === "Sempurna" ? "🤩 Sempurna" : mood === "Lelah" ? "😴 Lelah" : mood === "Bad Mood" ? "😡 Bad..." : "😐 Biasa"}</strong>
                        </span>
                        <select 
                          value={mood} 
                          onChange={(e) => setMood(e.target.value)}
                          className="text-[8px] border border-white bg-white/60 backdrop-blur-xs rounded px-1.5 py-0.5 font-bold text-slate-600 cursor-pointer hover:bg-white transition-all shadow-xs"
                        >
                          <option value="Sempurna">Sempurna</option>
                          <option value="Baik">Baik</option>
                          <option value="Biasa Saja">Biasa Saja</option>
                          <option value="Lelah">Lelah</option>
                          <option value="Bad Mood">Bad Mood</option>
                        </select>
                      </div>
                      <div className="w-full bg-slate-200/35 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ 
                            width: mood === "Sempurna" ? "100%" : mood === "Baik" ? "80%" : mood === "Biasa Saja" ? "60%" : mood === "Lelah" ? "35%" : "15%" 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Manual Reset Progress button */}
                    {combinedPct === 100 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2"
                      >
                        <button
                          type="button"
                          onClick={() => setShowResetConfirmModal(true)}
                          className="w-full py-2 bg-pink-100 hover:bg-pink-200 text-[#FF2D75] rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs ring-1 ring-pink-200"
                        >
                          <AlertTriangle size={11} className="animate-pulse" />
                          Reset Progres Mingguan
                        </button>
                      </motion.div>
                    )}

                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* Tip Belajar Sukses Section (Replacer for event slot to keep visual balance block) */}
        <section className="space-y-4">
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 text-left shadow-xs">
            <h3 className="font-extrabold font-display text-slate-800 text-sm flex items-center gap-2 mb-2">
              Tips Belajar Pintar Hari Ini
            </h3>
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              Gunakan teknik Pomodoro di sub-fitur <b>Ruang Belajar</b> kami. Belajar fokus selama 25 menit secara intensif, diikuti dengan istirahat singkat selama 5 menit. Sesi studi seimbang sangat membantu meningkatkan retensi memori jangka panjang!
            </p>
          </div>
        </section>

      </div>

      {/* Right Sidebar Column (Span 1) */}
      <div className="space-y-8">
        
        {/* Kalender Card Container */}
        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold font-display text-slate-800 text-sm flex items-center gap-1.5">
              <Calendar size={16} className="text-[#FF2D75]" />
              Kalender
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white/80 rounded-lg text-slate-600 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white/80 rounded-lg text-slate-600 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Table Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Calendar Grid Numbers */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const cellMonth = cell.isCurrentMonth ? currentMonth : (cell.dayNum > 15 ? (currentMonth - 1 < 0 ? 11 : currentMonth - 1) : (currentMonth + 1 > 11 ? 0 : currentMonth + 1));
              const cellYear = cell.isCurrentMonth ? currentYear : (cell.dayNum > 15 ? (currentMonth - 1 < 0 ? currentYear - 1 : currentYear) : (currentMonth + 1 > 11 ? currentYear + 1 : currentYear));
              const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, "0")}-${String(cell.dayNum).padStart(2, "0")}`;
              
              const cellEvents = eventsList.filter(ev => ev.date === cellDateStr);
              const hasPribadi = cellEvents.some(ev => ev.category === "Pribadi");
              const hasTugas = cellEvents.some(ev => ev.category === "Tugas");
              const hasLainnya = cellEvents.some(ev => ev.category === "Lainnya");
              
              const today = new Date();
              const isToday = cell.isCurrentMonth && 
                              cell.dayNum === today.getDate() && 
                              currentMonth === today.getMonth() && 
                              currentYear === today.getFullYear();
              
              let cellBaseClass = "";
              if (!cell.isCurrentMonth) {
                cellBaseClass = "text-slate-300 opacity-40 cursor-default pointer-events-none";
              } else if (isToday) {
                cellBaseClass = "bg-[#FF2D75] text-white shadow-md shadow-pink-100 ring-2 ring-pink-500/40 font-black";
              } else if (selectedDay === cell.dayNum) {
                cellBaseClass = "bg-pink-100 text-[#FF2D75] ring-2 ring-pink-300 font-extrabold";
              } else {
                if (hasTugas) {
                  cellBaseClass = "bg-rose-50 text-red-700 hover:bg-rose-100/80 border border-red-200/50";
                } else if (hasPribadi) {
                  cellBaseClass = "bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/50";
                } else if (hasLainnya) {
                  cellBaseClass = "bg-blue-50 text-blue-800 hover:bg-blue-100/80 border border-blue-200/50";
                } else {
                  cellBaseClass = "text-slate-700 hover:bg-white/60 border border-transparent";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (cell.isCurrentMonth) setSelectedDay(cell.dayNum);
                  }}
                  onDoubleClick={() => {
                    if (cell.isCurrentMonth) {
                      setSelectedDay(cell.dayNum);
                      openCreateModalForDate(cellDateStr);
                    }
                  }}
                  className={`aspect-square text-[10px] font-bold rounded-xl flex flex-col items-center justify-center transition-all relative cursor-pointer ${cellBaseClass}`}
                  title={cellEvents.length ? `${cellEvents.length} Agenda` : "Double click untuk tambah"}
                >
                  <span className={isToday || (selectedDay === cell.dayNum && cell.isCurrentMonth) ? "" : "text-slate-800 font-extrabold"}>{cell.dayNum}</span>
                  
                  {/* Color-Coded Dots */}
                  {cell.isCurrentMonth && cellEvents.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-0.5 absolute bottom-1">
                      {hasPribadi && <span className="w-1 h-1 rounded-full bg-amber-400"></span>}
                      {hasTugas && <span className="w-1 h-1 rounded-full bg-red-500"></span>}
                      {hasLainnya && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100/70 flex flex-wrap gap-x-3 gap-y-1 items-center justify-center text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Pribadi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Deadline Tugas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Kegiatan Lain
            </span>
          </div>
        </div>

        {/* Agenda Hari Ini Component */}
        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold font-display text-slate-800 text-sm flex items-center gap-1.5">
              <Clock size={16} className="text-[#FF2D75]" />
              Agenda hari {selectedDay} {monthNames[currentMonth]}
            </h3>
            <button 
              onClick={() => openCreateModalForDate(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`)}
              className="text-xs font-black text-[#FF2D75] hover:text-pink-600 flex items-center gap-0.5 cursor-pointer"
            >
              <Plus size={12} />
              Tambah
            </button>
          </div>

          {/* Today's Agenda list */}
          <div>
            {(() => {
              const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
              const selectedDayEvents = eventsList.filter(ev => ev.date === selectedDateStr);
              
              if (selectedDayEvents.length === 0) {
                return (
                  <div className="py-6 text-center text-slate-400 bg-white/20 rounded-2xl border border-dashed border-slate-200">
                    <CalendarDays size={20} className="mx-auto text-slate-300 mb-1 pointer-events-none" />
                    <p className="text-[10px] font-bold text-slate-500">Tenang & Santai...</p>
                    <p className="text-[9px] text-slate-400">Tidak ada agenda terjadwal.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-2.5">
                  {selectedDayEvents.map(ev => {
                    const isPribadi = ev.category === "Pribadi";
                    const isTugas = ev.category === "Tugas";
                    const isLainnya = ev.category === "Lainnya";
                    
                    const cardBg = isPribadi 
                      ? "bg-amber-50/50 border-amber-200/50 hover:bg-amber-50" 
                      : isTugas 
                        ? "bg-rose-50/50 border-red-200/50 hover:bg-rose-50" 
                        : "bg-blue-50/50 border-blue-200/50 hover:bg-blue-50";
                        
                    const accentBorder = isPribadi ? "bg-amber-400" : isTugas ? "bg-red-500" : "bg-blue-500";
                    const categoryLabel = isPribadi ? "Pribadi" : isTugas ? "Tugas BEM/Kuliah" : "Kegiatan Lain";
                    const categoryTextColor = isPribadi ? "text-amber-800" : isTugas ? "text-red-700" : "text-blue-800";

                    return (
                      <div 
                        key={ev.id} 
                        onClick={() => openViewModal(ev)}
                        className={`group relative flex items-start justify-between p-3 border rounded-2xl shadow-xs transition-transform hover:-translate-y-0.5 cursor-pointer ${
                          ev.completed 
                            ? "bg-slate-50/70 border-slate-250 opacity-75" 
                            : cardBg
                        } text-left`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Completion Circle Checkbox */}
                          <button
                            onClick={(e) => toggleEventCompletion(ev.id, e)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                              ev.completed
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                                : isPribadi
                                  ? "border-amber-300 hover:border-amber-500 bg-white"
                                  : isTugas
                                    ? "border-red-300 hover:border-red-500 bg-white"
                                    : "border-blue-300 hover:border-blue-500 bg-white"
                            }`}
                            title={ev.completed ? "Tandai belum dilaksanakan" : "Tandai telah dilaksanakan"}
                          >
                            {ev.completed ? (
                              <Check size={11} strokeWidth={3} />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-slate-300 transition-colors" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                ev.completed
                                  ? "bg-slate-200 text-slate-650"
                                  : isPribadi ? "bg-amber-100" : isTugas ? "bg-red-100" : "bg-blue-100"
                              } ${ev.completed ? "" : categoryTextColor}`}>
                                {ev.completed ? "Selesai" : categoryLabel}
                              </span>
                              <span className="text-[9px] font-bold text-slate-600 flex items-center gap-0.5 font-sans tracking-tight tabular-nums">
                                <Clock size={9} />
                                {ev.time}
                              </span>
                            </div>
                            <h4 className={`text-[11px] font-black leading-snug truncate group-hover:text-[#FF2D75] transition-colors ${
                              ev.completed ? "line-through text-slate-500" : "text-slate-800"
                            }`}>
                              {ev.title}
                            </h4>
                            {ev.description && (
                              <p className={`text-[10px] font-medium truncate mt-0.5 ${
                                ev.completed ? "text-slate-400" : "text-slate-500"
                              }`}>
                                {ev.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Always visible quick action buttons for better accessibility */}
                        <div className="flex items-center gap-1.5 pl-1.5 self-center shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(ev);
                            }}
                            className="p-1.5 bg-white/80 hover:bg-white border border-slate-100 hover:border-slate-350 rounded-xl text-slate-500 hover:text-[#FF2D75] transition-all shadow-2xs cursor-pointer"
                            title="Ubah"
                          >
                            <Edit size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ id: ev.id });
                            }}
                            className="p-1.5 bg-white/80 hover:bg-white border border-slate-100 hover:border-pink-200 rounded-xl text-slate-500 hover:text-[#FF2D75] transition-all shadow-2xs cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={11} className="text-[#FF2D75]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>


        {/* Elegant Quote of the Day Section */}
        <div className="bg-gradient-to-br from-pink-50/50 to-orange-50/50 backdrop-blur-md border border-pink-100 p-5 rounded-3xl text-slate-800 relative overflow-hidden group flex flex-col justify-between text-left">
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-125 select-none font-serif text-8xl pointer-events-none">
            “
          </div>
          <div>
            <p className="text-xs font-black text-[#FF2D75] tracking-wider uppercase flex items-center gap-1">
              Kutipan Hari Ini
            </p>
            <p className="text-xs font-bold text-slate-700 mt-2.5 leading-relaxed italic text-left">
              "{IndonesianQuotes[quoteIndex]}"
            </p>
          </div>
          <div className="mt-3.5 flex justify-end items-center">
            <button 
              onClick={cycleQuote}
              className="text-[10px] font-bold bg-white border border-pink-100 text-[#FF2D75] px-2.5 py-1 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-all cursor-pointer shadow-3xs"
            >
              Kutipan Lain
            </button>
          </div>
        </div>


        {/* Catatan Akademik Ringkas Sidebar Group (Replacer block to keep visual density) */}
        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs text-left">
          <h3 className="font-extrabold font-display text-slate-800 text-sm mb-2 flex items-center gap-1.5">
            <BookOpen size={16} className="text-[#FF2D75]" />
            Catatan Belajar Mandiri
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
            Rangkuman bahan materi ujian, presentasi kelompok, dan catatan mingguan KRS Anda terangkum dengan rapi melalui integrasi sinkronisasi kalender Anda.
          </p>
        </div>

      </div>

      {/* CONFIRMATION PROGRESS RESET MODAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showResetConfirmModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-transparent cursor-pointer"
                onClick={() => setShowResetConfirmModal(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-5 shadow-2xl relative z-10 space-y-4"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-rose-50 text-red-650 rounded-full flex items-center justify-center border border-red-100 shadow-xs">
                    <AlertTriangle size={24} className="text-[#FF2D75]" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-800">
                      Reset Progres Mingguan?
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-1">
                      Tindakan ini akan mengembalikan jumlah tugas selesai menjadi <strong className="text-emerald-300 font-black">0</strong> dan jam belajar menjadi <strong className="text-emerald-300 font-black">0j</strong> untuk target minggu baru.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmModal(false)}
                    className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-120 border border-slate-200 font-extrabold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetProgressAction();
                      setShowResetConfirmModal(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:brightness-105 font-extrabold py-2 rounded-xl text-xs shadow-md shadow-pink-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={12} />
                    Ya, Reset Progres
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CRUD MODAL UNTUK KALENDER INTERAKTIF */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showEventModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-transparent cursor-pointer"
                onClick={() => setShowEventModal(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-5 shadow-2xl relative z-10 space-y-3.5"
              >
              {/* Header inside modal */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-[#FF2D75]" />
                  {modalMode === "create" ? "Tambah Agenda Baru" : modalMode === "view" ? "Detail Agenda" : "Ubah Agenda"}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1 hover:bg-slate-102 rounded-lg text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleSaveEvent} className="space-y-3.5 text-left">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Judul Agenda</label>
                  {modalMode === "view" ? (
                    <p className="text-xs font-bold text-slate-800 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100">
                      {formTitle}
                    </p>
                  ) : (
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Masukkan judul agenda..."
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF2D75]/50 focus:outline-[#FF2D75]/30 px-3 py-2 rounded-xl font-bold text-xs"
                    />
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Deskripsi / Detail</label>
                  {modalMode === "view" ? (
                    <p className="text-xs font-medium text-slate-600 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100 min-h-[50px] whitespace-pre-wrap">
                      {formDescription || "Tidak ada deskripsi."}
                    </p>
                  ) : (
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Tuliskan catatan atau detail tambahan..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF2D75]/50 focus:outline-[#FF2D75]/30 px-3 py-2 rounded-xl font-bold text-xs resize-none"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Date */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Tanggal</label>
                    {modalMode === "view" ? (
                      <p className="text-[10px] font-bold text-[#FF2D75] bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-100 font-mono">
                        {formDate}
                      </p>
                    ) : (
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF2D75]/50 focus:outline-[#FF2D75]/30 p-2 rounded-xl font-bold text-xs font-mono"
                      />
                    )}
                  </div>

                  {/* Time */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Waktu</label>
                    {modalMode === "view" ? (
                      <p className="text-[10px] font-bold text-[#FF2D75] bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-100 font-mono">
                        {formTime}
                      </p>
                    ) : (
                      <input
                        type="time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF2D75]/50 focus:outline-[#FF2D75]/30 p-2 rounded-xl font-bold text-xs font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Kategori Agenda</label>
                  {modalMode === "view" ? (
                    <div className="flex items-center gap-1.5 mt-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        formCategory === "Pribadi" ? "bg-amber-400" : formCategory === "Tugas" ? "bg-red-500" : "bg-blue-500"
                      }`} />
                      <span className="text-[11px] font-bold text-slate-700">
                        {formCategory === "Pribadi" ? "Agenda Pribadi (Kuning)" : formCategory === "Tugas" ? "Deadline Tugas (Merah)" : "Kegiatan Lainnya (Biru)"}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {[
                        { val: "Pribadi", label: "Pribadi", color: "bg-amber-50 border-amber-200 text-amber-800 active:bg-amber-100", dot: "bg-amber-400" },
                        { val: "Tugas", label: "Tugas", color: "bg-rose-50 border-rose-250 text-rose-800 active:bg-rose-100", dot: "bg-red-500" },
                        { val: "Lainnya", label: "Lainnya", color: "bg-blue-50 border-blue-200 text-blue-800 active:bg-blue-105", dot: "bg-blue-500" }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setFormCategory(opt.val as any)}
                          className={`py-1.5 px-2.5 border rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            formCategory === opt.val 
                              ? `${opt.color} ring-2 ring-[#FF2D75]/20 scale-[1.02]` 
                              : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Pelaksanaan */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Status Pelaksanaan</span>
                  {modalMode === "view" ? (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formCompleted ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <span className={`text-[10px] font-extrabold ${formCompleted ? "text-emerald-700" : "text-slate-500"}`}>
                        {formCompleted ? "Selesai (Dilaksanakan)" : "Belum Dilaksanakan"}
                      </span>
                    </div>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formCompleted}
                        onChange={(e) => setFormCompleted(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-2 text-[10px] font-extrabold text-slate-700">
                        {formCompleted ? "Sudah Selesai" : "Belum Selesai"}
                      </span>
                    </label>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
                  {modalMode === "view" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          selectedEventId && setDeleteConfirm({ id: selectedEventId });
                        }}
                        className="flex-1 bg-pink-50 text-[#FF2D75] hover:bg-pink-100 border border-pink-100 font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={12} className="text-[#FF2D75]" />
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const original = eventsList.find(ev => ev.id === selectedEventId);
                          if (original) openEditModal(original);
                        }}
                        className="flex-1 bg-slate-100 text-slate-755 hover:bg-slate-200 border border-slate-200 font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit size={12} />
                        Ubah
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowEventModal(false)}
                        className="flex-1 bg-slate-50 text-slate-650 hover:bg-slate-102 border border-slate-200 font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:brightness-105 font-extrabold py-2 rounded-xl text-xs shadow-md shadow-pink-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check size={12} />
                        Simpan
                      </button>
                    </>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* Custom Confirmation Modal */}
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
                  <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="font-black font-display text-slate-900 text-sm">Konfirmasi Hapus</h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Apakah Anda yakin ingin menghapus agenda/kegiatan ini? Tindakan ini tidak dapat dibatalkan.
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
                    onClick={() => handleDeleteEvent(deleteConfirm.id)}
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

    </div>
  );
}
