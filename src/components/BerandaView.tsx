import React, { useState, useEffect } from "react";
import { 
  Calendar, CheckSquare, GraduationCap, Briefcase, HeartHandshake, ShoppingBag, 
  ArrowRight, Sparkles, ChevronLeft, ChevronRight, Share2, Plus, Users, Award, Clock, MapPin, Smile, BookOpen, Upload,
  Shirt, TrendingUp, TrendingDown, Info, Edit, Trash2, Check, AlertTriangle, CalendarDays, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, AgendaItem, CampusEvent, Community, UserProfile, getIpkClassification } from "../types";
import { IndonesianQuotes } from "../data";

export interface InteractiveCalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  category: "Pribadi" | "Tugas" | "Lainnya";
}

interface BerandaViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
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

  // Calendar states
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (index 5)
  const [selectedDay, setSelectedDay] = useState(9); // matching current clock date (June 9, 2026)
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Color-coded Interactive Calendar States & CRUD Modal States
  const [eventsList, setEventsList] = useState<InteractiveCalendarEvent[]>(() => {
    const saved = localStorage.getItem("campushub_color_events");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "ev-1",
        title: "Belajar UTBK / Mandiri",
        description: "Persiapan menghadapi ujian mandiri PTN bersama kelompok studi sains.",
        date: "2026-06-09",
        time: "10:00",
        category: "Pribadi"
      },
      {
        id: "ev-2",
        title: "Tenggat Laporan Akhir Praktikum",
        description: "Pengumpulan laporan akhir praktikum Sistem Digital di portal e-learning kampus.",
        date: "2026-06-11",
        time: "23:59",
        category: "Tugas"
      },
      {
        id: "ev-3",
        title: "Rapat Anggota Organisasi BEM",
        description: "Pembahasan program kerja bulanan dan evaluasi kegiatan sosial mahasiswa.",
        date: "2026-06-14",
        time: "14:00",
        category: "Lainnya"
      },
      {
        id: "ev-4",
        title: "Tugas Kelompok Matematika Diskrit",
        description: "Menyelesaikan representasi graf dan pohon biner dengan kawan sekelas.",
        date: "2026-06-20",
        time: "13:00",
        category: "Tugas"
      },
      {
        id: "ev-5",
        title: "Webinar Kewirausahaan Kampus",
        description: "Menghadirkan pembicara sukses alumni dari inkubator bisnis teknologi.",
        date: "2026-06-25",
        time: "09:00",
        category: "Lainnya"
      }
    ];
  });

  // Persist calendar events
  useEffect(() => {
    localStorage.setItem("campushub_color_events", JSON.stringify(eventsList));
  }, [eventsList]);

  // Modal Control States
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formCategory, setFormCategory] = useState<"Pribadi" | "Tugas" | "Lainnya">("Pribadi");

  // Open modal helper
  const openCreateModalForDate = (dateString: string) => {
    setFormTitle("");
    setFormDescription("");
    setFormDate(dateString);
    setFormTime("09:00");
    setFormCategory("Pribadi");
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
        category: formCategory
      };
      setEventsList(prev => [...prev, newEv]);
    } else if (modalMode === "edit" && selectedEventId) {
      setEventsList(prev => prev.map(ev => 
        ev.id === selectedEventId 
          ? { ...ev, title: formTitle, description: formDescription, date: formDate, time: formTime, category: formCategory }
          : ev
      ));
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEventsList(prev => prev.filter(ev => ev.id !== id));
    setShowEventModal(false);
  };



  // Modal alert
  const [welcomeBannerMessage, setWelcomeBannerMessage] = useState(0);
  const banners = [
    {
      title: "Semua kebutuhan mahasiswa, satu tempat.",
      desc: "Kelola akademik, tugas, kesehatan mental, karier, dan kegiatan kampus dengan mudah.",
      btnText: "Jelajahi Semua Fitur"
    },
    {
      title: "Ubah Persiapan Karirmu!",
      desc: "Temukan ratusan info lowongan magang terbaru & diskon kursus eksklusif untuk tingkatkan portofolio.",
      btnText: "Buka Tab Karir"
    },
    {
      title: "Kesehatan Mental Itu Penting! ❤️",
      desc: "Ceritakan keluh kesahmu tanpa rasa takut melalui curhat anonim atau konseling profesional kami.",
      btnText: "Curhat Sekarang"
    }
  ];

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
    { label: "OOTD & Radar Peta", icon: Shirt, color: "text-[#db2777] bg-[#fdf2f8]", iconBg: "bg-pink-106", tab: "OOTD & Radar Peta", sparkle: true },
    { label: "Mental Health", icon: HeartHandshake, color: "text-[#7c3aed] bg-[#f5f3ff]", iconBg: "bg-purple-105", tab: "Mental Health" }
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
              Semangat ngerjain tugas hari ini! Kamu hebat! <Sparkles size={14} className="text-pink-500 fill-pink-200" />
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-black text-slate-900 text-sm leading-tight">{profile.gpa}</span>
                  <span className="bg-emerald-500/10 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center border border-emerald-500/20 gap-0.5 hover:bg-emerald-500/20">
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
                      <GraduationCap size={16} className="text-blue-600" />
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
                        <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-105">
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
                            <span className="font-mono font-black text-blue-600 text-xs bg-blue-100/50 px-2 py-0.5 rounded-lg border border-blue-200">
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
                            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-150 rounded-lg appearance-none"
                          />
                        </div>

                        {/* Projection result stats */}
                        <div className="text-center py-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-205">
                          <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Prediksi IPK Setelah Semester Ini</p>
                          <p className="font-mono font-black text-xl text-slate-900 mt-1 flex items-center justify-center gap-2">
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
                              <p className="font-mono font-black text-sm text-slate-950 mt-0.5">
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
                              <p className="font-mono font-black text-sm text-slate-950 mt-0.5">
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
                <Sparkles size={15} />
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

        {/* Dynamic Interactive Banner - Pastel glass gradient panel (Green Gradient with Sparkles) */}
        <div className="relative bg-gradient-to-r from-[#e2f9ec]/85 via-[#cdfbe1]/90 to-[#bbf7d0]/80 backdrop-blur-xl border border-white/95 rounded-[32px] p-6 md:p-8 text-slate-900 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
          
          {/* Beautiful glow / sparkle effects in the background */}
          <div className="absolute top-3 left-12 text-emerald-500/80 pointer-events-none animate-pulse">
            <Sparkles size={16} className="fill-emerald-300/30 text-emerald-400" />
          </div>
          <div className="absolute bottom-6 right-1/3 text-[#059669] pointer-events-none animate-bounce" style={{ animationDuration: '4.5s' }}>
            <Sparkles size={14} className="fill-emerald-200/20 text-emerald-550" />
          </div>
          <div className="absolute top-1/2 right-1/4 text-emerald-400/60 pointer-events-none animate-ping" style={{ animationDuration: '3s' }}>
            <Sparkles size={10} />
          </div>

          {/* Whimsical design accents (floating 3D glass circles and waves styled in lush greens) */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none font-sans"></div>
          <div className="absolute bottom-5 left-1/4 w-32 h-32 rounded-full border border-emerald-400/25 translate-x-4 pointer-events-none"></div>
          <div className="absolute -bottom-10 left-10 w-40 h-10 bg-gradient-to-r from-emerald-300/20 to-teal-300/10 rounded-full rotate-45 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-4 max-w-sm text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/60 border border-white/90 text-slate-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider select-none shrink-0 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D75] animate-ping"></span>
                <span>Aktivitas &bull; Pusat Akses</span>
              </div>
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
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => {
                    if (welcomeBannerMessage === 0) setTab("Zonamu");
                    else if (welcomeBannerMessage === 1) setTab("Karier");
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
            
            {/* Visual representation card - Enlarged & Interactive Photo Section with Drag-and-Drop / Upload */}
            <div className="hidden md:flex relative w-56 h-56 xl:w-60 xl:h-60 shrink-0 items-center justify-center">
              {/* Mascot Floating Items (Crown, stars, hearts, rocket) mimicking mockup */}
              <div className="absolute -top-3 -left-1 text-2xl select-none animate-bounce" style={{ animationDuration: '4s' }}>👑</div>
              <div className="absolute top-8 -right-2 text-xl select-none animate-pulse">💖</div>
              <div className="absolute bottom-6 -left-3 text-xl select-none animate-float-medium">🚀</div>
              <div className="absolute bottom-0 right-4 text-xs select-none bg-indigo-50 border border-indigo-100/60 rounded-full px-2 py-1 text-indigo-650 font-black tracking-wider animate-float-fast shadow-xs">
                #Mahasiswa Produktif
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`absolute w-44 h-44 xl:w-48 xl:h-48 bg-white/40 rounded-[32px] flex items-center justify-center border-2 transition-all duration-300 relative overflow-hidden group/avatar cursor-pointer shadow-lg hover:shadow-xl hover:scale-102 hover:border-pink-300 ${
                  isDragging ? "border-dashed border-pink-500 bg-pink-50/20 scale-105" : "border-white/85"
                }`}
                title="Klik atau seret foto ke sini untuk mengubah/mengunggah foto pribadi kamu!"
              >
                {/* Profile Image */}
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-[28px] object-cover border-2 border-white/60 transition-transform duration-500 group-hover/avatar:scale-105"
                />

                {/* LEFT FADING GRADIENT OVERLAY to make the left edge blend beautifully with the sky-blue container */}
                <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-blue-100/10 to-transparent pointer-events-none z-10"></div>

                {/* Slick Interactive Upload Indicator Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300 text-white z-20">
                  <Upload size={20} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white text-center px-2">Ganti Foto</span>
                </div>
              </div>
              <div className="absolute bottom-2 -right-1 bg-white/90 text-[#FF2D75] px-2.5 py-1 rounded-xl font-bold text-[8px] shadow-sm flex items-center gap-1 z-30 border border-white">
                <Sparkles size={10} className="fill-[#FF2D75] text-[#FF2D75]" />
                1.2K+ <span className="underline decoration-[#FF2D75] decoration-solid underline-offset-2 decoration-1">Mahasiswa</span> bergabung
              </div>
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
                <Clock size={16} className="text-[#FF2D75]" />
                Deadline Terdekat
              </h3>
              <button 
                onClick={() => setTab("Tugas & Deadline")} 
                className="text-xs font-bold text-[#FF2D75] hover:text-pink-600 flex items-center gap-1 cursor-pointer"
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
                      <p className="font-extrabold text-slate-800 text-xs truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{task.course} • {task.dueDate}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full shrink-0 ${pillColor}`}>
                      {task.daysLeft} hari lagi
                    </span>
                  </div>
                );
              })}
              {tasks.filter(t => !t.completed).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/20 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl">🎉</span>
                  <p className="text-xs font-extrabold text-slate-700 mt-2">Semua tugas beres!</p>
                  <p className="text-[10px] text-slate-400">Selamat bersantai atau cari ilmu baru.</p>
                </div>
              )}
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

        {/* Campus Events Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold font-display text-slate-800 text-base flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#FF2D75] rounded-full block"></span>
              Event Kampus untukmu
            </h3>
            <button 
              onClick={() => setTab("Organisasi & Event")} 
              className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 cursor-pointer"
            >
              Lihat semua
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event.id}
                className="bg-white/45 backdrop-blur-md rounded-3xl overflow-hidden border border-white/60 hover:shadow-xl hover:bg-white/65 transition-all flex flex-col group"
              >
                {/* Event Image Banner */}
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {event.category}
                  </span>
                </div>
                {/* Event text details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5 text-left">
                    <h4 className="font-extrabold text-slate-800 text-xs line-clamp-2 min-h-[32px]">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                      <Clock size={11} className="text-[#FF2D75]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                      <MapPin size={11} className="text-[#FF2D75]" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleEventRegistration(event.id)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer ${
                      event.registered 
                        ? "bg-emerald-55 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                        : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:brightness-105 shadow-md shadow-pink-100"
                    }`}
                  >
                    {event.registered ? "✓ Terdaftar" : "Daftar Event"}
                  </button>
                </div>
              </div>
            ))}
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
                        className={`group relative flex items-start justify-between p-3 border rounded-2xl shadow-xs transition-transform hover:-translate-y-0.5 cursor-pointer ${cardBg} text-left`}
                      >
                        {/* Accent left border */}
                        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md ${accentBorder}`} />
                        
                        <div className="pl-2 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md ${isPribadi ? "bg-amber-100" : isTugas ? "bg-red-100" : "bg-blue-100"} ${categoryTextColor}`}>
                              {categoryLabel}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                              <Clock size={9} />
                              {ev.time}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-black text-slate-800 leading-snug truncate group-hover:text-[#FF2D75] transition-colors">
                            {ev.title}
                          </h4>
                          {ev.description && (
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              {ev.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Hover Quick actions */}
                        <div className="flex items-center gap-0.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(ev);
                            }}
                            className="p-1 hover:bg-white/80 rounded-md text-slate-400 hover:text-[#FF2D75]"
                            title="Ubah"
                          >
                            <Edit size={10} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Hapus agenda "${ev.title}"?`)) {
                                handleDeleteEvent(ev.id);
                              }
                            }}
                            className="p-1 hover:bg-white/80 rounded-md text-slate-400 hover:text-red-650"
                            title="Hapus"
                          >
                            <Trash2 size={10} />
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
              <Sparkles size={12} className="fill-[#FF2D75]" />
              Kutipan Hari Ini
            </p>
            <p className="text-xs font-bold text-slate-700 mt-2.5 leading-relaxed italic text-left">
              "{IndonesianQuotes[quoteIndex]}"
            </p>
          </div>
          <div className="mt-3.5 flex justify-between items-center">
            <span className="text-[10px] text-pink-400 font-bold">• MahasSpace Motivator</span>
            <button 
              onClick={cycleQuote}
              className="text-[10px] font-bold bg-white border border-pink-100 text-[#FF2D75] px-2.5 py-1 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-all cursor-pointer"
            >
              Kutipan Lain
            </button>
          </div>
        </div>


        {/* Komunitas Populer Sidebar Group */}
        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold font-display text-slate-800 text-sm flex items-center gap-1.5">
              <Users size={16} className="text-[#FF2D75]" />
              Komunitas Populer
            </h3>
            <button 
              onClick={() => setTab("Komunitas")} 
              className="text-xs font-bold text-pink-500 hover:text-pink-600 cursor-pointer"
            >
              Lihat semua
            </button>
          </div>

          <div className="space-y-4">
            {communities.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-xs text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.members.toLocaleString("id-ID")} anggota</p>
                </div>
                <button
                  onClick={() => toggleCommunityJoin(item.id)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    item.isJoined 
                      ? "bg-white shadow-xs text-slate-600 border-slate-200 hover:bg-slate-50" 
                      : "bg-pink-50 text-[#FF2D75] border-pink-100 hover:bg-pink-100"
                  }`}
                >
                  {item.isJoined ? "Hapus" : "Gabung"}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CONFIRMATION PROGRESS RESET MODAL */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
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
      </AnimatePresence>

      {/* CRUD MODAL UNTUK KALENDER INTERAKTIF */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
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

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
                  {modalMode === "view" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus agenda "${formTitle}"?`)) {
                            selectedEventId && handleDeleteEvent(selectedEventId);
                          }
                        }}
                        className="flex-1 bg-red-50 text-red-650 hover:bg-rose-100 border border-red-100 font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={12} />
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
      </AnimatePresence>



    </div>
  );
}
