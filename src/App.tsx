import React, { useState } from "react";
import { 
  Home, GraduationCap, CheckSquare, Calendar, Users, Award, 
  HeartHandshake, Briefcase, User, Search, Bell, Menu, X, ChevronDown, HelpCircle, LogOut, Check, Shirt,
  BookOpen, Laptop, Sparkles, Calculator, Backpack, Coffee, Brain
} from "lucide-react";

// Types & Data
import { 
  initialProfile, initialTasks, initialAgenda, initialEvents, 
  initialScholarships, initialInternships, initialCommunities, 
  initialCourses, initialJournals
} from "./data";
import { Task, AgendaItem, CampusEvent, Scholarship, Internship, Community, AcademicCourse, MentalHealthJournal, UserProfile, CounselorSession } from "./types";

// Component Views
import BerandaView from "./components/BerandaView";
import AkademikView from "./components/AkademikView";
import TugasView from "./components/TugasView";
import JadwalView from "./components/JadwalView";
import BeasiswaView from "./components/BeasiswaView";
import MentalHealthView from "./components/MentalHealthView";
import OutfitPetaView from "./components/OutfitPetaView";
import SimulasiBimbinganView from "./components/SimulasiBimbinganView";
import KarierView from "./components/KarierView";
import KomunitasView from "./components/KomunitasView";
import ZonamuView from "./components/ZonamuView";
import OrganisasiEventView from "./components/OrganisasiEventView";

export default function App() {
  // Sidebar tab state
  const [activeTab, setActiveTab] = useState<string>("Beranda");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Mouse position tracking state for live interactive parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".notification-trigger") && !target.closest(".notification-dropdown-menu")) {
        setNotificationOpen(false);
      }
      if (!target.closest(".profile-trigger") && !target.closest(".profile-dropdown-menu")) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // normalized percentage coordinates from center of viewport (-1 to 1)
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  React.useEffect(() => {
    // Intercept OAuth hash credentials in popup callback window
    if (window.opener && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");
      if (token) {
        window.opener.postMessage({ type: "GOOGLE_CLASSROOM_TOKEN", token }, "*");
        window.close();
      }
    }
  }, []);

  // Cumulative data states
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [agenda, setAgenda] = useState<AgendaItem[]>(initialAgenda);
  const [events, setEvents] = useState<CampusEvent[]>(initialEvents);
  const [scholarships, setScholarships] = useState<Scholarship[]>(initialScholarships);
  const [internships, setInternships] = useState<Internship[]>(initialInternships);
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [courses, setCourses] = useState<AcademicCourse[]>(initialCourses);
  const [journals, setJournals] = useState<MentalHealthJournal[]>(initialJournals);
  const [sessions, setSessions] = useState<CounselorSession[]>([]);

  // Progressive/Interactive states for Home metric cards
  const [completedCount, setCompletedCount] = useState(6);
  const [totalTaskCount, setTotalTaskCount] = useState(10);
  const [studyHours, setStudyHours] = useState(14);
  const targetStudyHours = 20;
  const [mood, setMood] = useState("Baik");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Notifications mock dataset
  const [notifications, setNotifications] = useState([
    { id: "not-1", text: "Makalah Studi Kelayakan Bisnis segera dikumpulkan!", isRead: false, time: "2 jam yang lalu" },
    { id: "not-2", text: "Bank Indonesia mengumumkan program beasiswa semester genap.", isRead: false, time: "5 jam yang lalu" },
    { id: "not-3", text: "Registrasi Seminar Digital Future 2024 dikonfirmasi.", isRead: true, time: "1 hari yang lalu" }
  ]);

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // State handlers to bubble changes easily through views
  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      // Recount for Beranda metrics
      const comp = updated.filter(t => t.completed).length;
      setCompletedCount(comp);
      setTotalTaskCount(updated.length);
      return updated;
    });
  };

  const toggleCommunityJoin = (id: string) => {
    setCommunities(prev => 
      prev.map(c => c.id === id ? { ...c, isJoined: !c.isJoined } : c)
    );
  };

  const toggleEventRegistration = (id: string) => {
    setEvents(prev => {
      const updated = prev.map(ev => {
        if (ev.id === id) {
          const toggledReg = !ev.registered;
          
          // If enrolling, add to Agenda automatically to preserve functional linkage!
          if (toggledReg) {
            const hasAgenda = agenda.some(item => item.title.includes(ev.title));
            if (!hasAgenda) {
              const newAgenda: AgendaItem = {
                id: "agenda-event-" + ev.id,
                time: "19:00",
                title: ev.title,
                location: ev.location,
                type: "webinar",
                color: "purple"
              };
              setAgenda(old => [...old, newAgenda]);
            }
          } else {
            // Remove from agenda if cancel enrollment
            setAgenda(old => old.filter(item => !item.title.includes(ev.title)));
          }

          return { ...ev, registered: toggledReg };
        }
        return ev;
      });
      return updated;
    });
  };

  const toggleScholarshipReg = (id: string) => {
    setScholarships(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const nextVal = !s.registered;
          if (nextVal) {
            // Add automatic agenda
            const newAgenda: AgendaItem = {
              id: "agenda-sch-" + s.id,
              time: "11:00",
              title: "Wawancara Beasiswa: " + s.provider,
              location: "Gedung Rektorat Lt. 2",
              type: "webinar",
              color: "purple"
            };
            setAgenda(old => [...old, newAgenda]);
          } else {
            setAgenda(old => old.filter(i => !i.title.includes(s.provider)));
          }
          return { ...s, registered: nextVal };
        }
        return s;
      });
      return updated;
    });
  };

  const toggleInternshipApply = (id: string) => {
    setInternships(prev => {
      const updated = prev.map(j => {
        if (j.id === id) {
          const nextVal = !j.registered;
          if (nextVal) {
            // Add agenda entry
            const newAgenda: AgendaItem = {
              id: "agenda-job-" + j.id,
              time: "09:00",
              title: "Interview Magang: " + j.company,
              location: "Video Call (Google Meet)",
              type: "discussion",
              color: "teal"
            };
            setAgenda(old => [...old, newAgenda]);
          } else {
            setAgenda(old => old.filter(i => !i.title.includes(j.company)));
          }
          return { ...j, registered: nextVal };
        }
        return j;
      });
      return updated;
    });
  };

  // Nav items matching user image sidebar exactly
  const sidebarItems = [
    { label: "Beranda", icon: Home },
    { label: "Akademik", icon: GraduationCap },
    { label: "Tugas & Deadline", icon: CheckSquare },
    { label: "Bimbingan Skripsi", icon: GraduationCap },
    { label: "OOTD & Radar Peta", icon: Shirt },
    { label: "Jadwal", icon: Calendar },
    { label: "Organisasi & Event", icon: Users },
    { label: "Beasiswa", icon: Award },
    { label: "Mental Health", icon: HeartHandshake },
    { label: "Karier", icon: Briefcase },
    { label: "Komunitas", icon: Users },
    { label: "Zonamu", icon: User }
  ];

  // Overlay Search results when user types globally
  const handleGlobalSearchItemClick = (targetTab: string) => {
    setActiveTab(targetTab);
    setGlobalSearch("");
  };

  // Compile active tab component output
  const renderTabContent = () => {
    switch (activeTab) {
      case "Beranda":
        return (
          <BerandaView 
            tasks={tasks}
            setTasks={setTasks}
            agenda={agenda}
            events={events}
            communities={communities}
            profile={profile}
            setProfile={setProfile}
            setTab={setActiveTab}
            toggleTaskCompletion={toggleTaskCompletion}
            toggleCommunityJoin={toggleCommunityJoin}
            toggleEventRegistration={toggleEventRegistration}
            completedCount={completedCount}
            totalTaskCount={totalTaskCount}
            setCompletedCount={setCompletedCount}
            setTotalTaskCount={setTotalTaskCount}
            studyHours={studyHours}
            setStudyHours={setStudyHours}
            targetStudyHours={targetStudyHours}
            mood={mood}
            setMood={setMood}
          />
        );
      case "Akademik":
        return (
          <AkademikView 
            courses={courses} 
            setCourses={setCourses} 
            profile={profile} 
          />
        );
      case "Tugas & Deadline":
        return (
          <TugasView 
            tasks={tasks}
            setTasks={setTasks}
            toggleTaskCompletion={toggleTaskCompletion}
            completedCount={completedCount}
            setCompletedCount={setCompletedCount}
            totalTaskCount={totalTaskCount}
            setTotalTaskCount={setTotalTaskCount}
            studyHours={studyHours}
            setStudyHours={setStudyHours}
            targetStudyHours={targetStudyHours}
            mood={mood}
            setMood={setMood}
          />
        );
      case "Jadwal":
        return (
          <JadwalView 
            agenda={agenda}
            setAgenda={setAgenda}
            onWritingNoteChange={setIsAddingNote}
          />
        );
      case "Organisasi & Event":
        return (
          <OrganisasiEventView 
            events={events}
            communities={communities}
            toggleEventRegistration={toggleEventRegistration}
            toggleCommunityJoin={toggleCommunityJoin}
          />
        );
      case "Beasiswa":
        return (
          <BeasiswaView 
            scholarships={scholarships}
            toggleScholarshipReg={toggleScholarshipReg}
          />
        );
      case "OOTD & Radar Peta":
        return (
          <OutfitPetaView />
        );
      case "Bimbingan Skripsi":
        return (
          <SimulasiBimbinganView />
        );
      case "Mental Health":
        return (
          <MentalHealthView 
            journals={journals}
            setJournals={setJournals}
            sessions={sessions}
            setSessions={setSessions}
          />
        );
      case "Karier":
        return (
          <KarierView 
            internships={internships}
            toggleInternshipApply={toggleInternshipApply}
          />
        );
      case "Komunitas":
        return (
          <KomunitasView 
            communities={communities}
            toggleCommunityJoin={toggleCommunityJoin}
          />
        );
      case "Zonamu":
        return (
          <ZonamuView 
            profile={profile}
            setProfile={setProfile}
            tasks={tasks}
            events={events}
            scholarships={scholarships}
            internships={internships}
            communities={communities}
            marketplaceItems={[]}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-400">Section in progress</div>;
    }
  };

  // Filter global search overlay items
  const foundTasks = tasks.filter(t => t.title.toLowerCase().includes(globalSearch.toLowerCase()));
  const foundSchs = scholarships.filter(s => s.name.toLowerCase().includes(globalSearch.toLowerCase()));
  const foundMarket: any[] = [];

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div id="campushub_root" className="h-[100dvh] max-h-[100dvh] bg-transparent flex font-sans relative overflow-hidden text-slate-800 p-2 md:p-4">
        {/* 3D GLASSMORPHIC ATMOSPHERIC LIGHT BLUE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 bg-gradient-to-tr from-[#e0f2fe] via-[#bae6fd]/40 to-[#f0f9ff]">
        {/* Soft high-blur beautiful light blue atmospheric cloud blobs */}
        <div className="absolute top-10 left-10 w-[70vw] h-[55vh] bg-[#38bdf8]/25 rounded-full blur-[130px] transform -translate-x-12 -translate-y-12 animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-[60vw] h-[50vh] bg-[#0ea5e9]/20 rounded-full blur-[120px] transform translate-x-12 translate-y-12 animate-float-medium"></div>
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#bae6fd]/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#e0f2fe]/45 rounded-full blur-[90px]"></div>
      </div>

      {/* 3D FLOATING BACKGROUND ACCENTS (CRISP BACKGROUND ACCENT LAYER, BEHIND CARD CANVASES) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[11]">
        
        {/* Graduation Cap - Top Left */}
        <div 
          className="absolute w-16 h-16 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-rose-500/25 via-pink-500/35 to-white/80 shadow-[0_15px_35px_rgba(219,39,119,0.35)] hover:scale-110 transition-all duration-300 ease-out p-3.5 flex items-center justify-center animate-float-slow z-20 left-6 md:left-[calc(17rem+3%)]"
          style={{ 
            top: "6%", 
            transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * 40}px, 0) rotate(${mousePos.x * 15}deg)`,
          }}
          title="Pendidikan Tinggi"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
          <div className="absolute -top-4 -left-4 w-10 h-10 bg-pink-400/30 rounded-full blur-md"></div>
          <GraduationCap className="w-8 h-8 text-[#FF2D75] drop-shadow-[0_4px_8px_rgba(255,45,117,0.55)] relative z-10 animate-pulse" style={{ animationDuration: "3s" }} />
        </div>

        {/* Backpack - Top Right */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-amber-450/20 via-orange-500/25 to-white/70 shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:scale-110 transition-all duration-300 ease-out p-3 flex items-center justify-center animate-float-medium z-20 right-4 sm:right-6 md:right-10"
          style={{ 
            top: "4%", 
            transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -25}px, 0)`,
          }}
          title="Persiapan Kelas"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <Backpack className="w-7 h-7 text-orange-600 drop-shadow-[0_4px_8px_rgba(249,115,22,0.45)] relative z-10" />
        </div>

        {/* Book Open - Mid Left Gutter */}
        <div 
          className="absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-sky-400/30 via-blue-500/25 to-white/80 shadow-[0_15px_35px_rgba(14,165,233,0.35)] hover:scale-110 transition-all duration-300 ease-out p-3 flex items-center justify-center animate-float-medium z-20 left-4 md:left-[calc(17rem+2%)]"
          style={{ 
            top: "35%", 
            transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * -30}px, 0)`
          }}
          title="Perpustakaan Literasi"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-sky-400/30 rounded-full blur-md"></div>
          <BookOpen className="w-7 h-7 text-sky-600 drop-shadow-[0_3px_8px_rgba(14,165,233,0.5)] relative z-10" />
        </div>

        {/* Laptop - Mid Right Side */}
        <div 
          className="absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-purple-500/30 via-indigo-500/25 to-white/70 shadow-[0_15px_35px_rgba(168,85,247,0.35)] hover:scale-110 transition-all duration-350 ease-out p-3 flex items-center justify-center animate-float-fast z-20 right-4 md:right-8 lg:right-12"
          style={{ 
            top: "48%", 
            transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * -45}px, 0)`
          }}
          title="Teknologi Developer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <Laptop className="w-7 h-7 text-indigo-700 drop-shadow-[0_4px_10px_rgba(168,85,247,0.5)] relative z-10" />
        </div>

        {/* Calculator - Bottom Left Gutter */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-emerald-500/25 via-teal-500/25 to-white/80 shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:scale-110 transition-all duration-300 ease-out p-3.5 flex items-center justify-center animate-float-slow z-20 left-6 md:left-[calc(17rem+4%)]"
          style={{ 
            bottom: "18%", 
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * 35}px, 0)` 
          }}
          title="Kalkulator IPK"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/35 to-transparent pointer-events-none"></div>
          <Calculator className="w-7 h-7 text-emerald-650 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)] relative z-10" />
        </div>

        {/* Award Medal - Bottom Right Corner */}
        <div 
          className="absolute w-16 h-16 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-emerald-500/30 via-teal-500/25 to-white/70 shadow-[0_20px_45px_rgba(16,185,129,0.35)] hover:scale-110 transition-all duration-350 ease-out p-3 flex items-center justify-center animate-float-fast z-20 right-4 md:right-10 lg:right-16"
          style={{ 
            bottom: "11%", 
            transform: `translate3d(${mousePos.x * 28}px, ${mousePos.y * 28}px, 0) rotate(${mousePos.x * 25}deg)` 
          }}
          title="Medali Cum Laude"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/45 to-transparent pointer-events-none"></div>
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-400/35 rounded-full blur-md"></div>
          <Award className="w-8 h-8 text-emerald-600 drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)] relative z-10" />
        </div>

        {/* Steaming Coffee Cup - Late night study */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-amber-500/25 via-red-500/20 to-white/80 shadow-[0_15px_30px_rgba(239,68,68,0.25)] hover:scale-110 transition-all duration-400 ease-out p-3 items-center justify-center animate-float-slow z-20 hidden xl:flex"
          style={{ 
            bottom: "35%", 
            right: "14%", 
            transform: `translate3d(${mousePos.x * 35}px, ${mousePos.y * -20}px, 0)` 
          }}
          title="Kopi Begadang Nugas"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <Coffee className="w-7 h-7 text-amber-900 drop-shadow-[0_3px_6px_rgba(146,64,14,0.4)] relative z-10" />
        </div>

        {/* Brain Sparkle boost - High Creativity */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-pink-500/30 via-purple-500/20 to-white/80 shadow-[0_15px_30px_rgba(236,72,153,0.25)] hover:scale-110 transition-all duration-500 ease-out p-3 items-center justify-center animate-pulse z-20 hidden xl:flex"
          style={{ 
            top: "22%", 
            right: "18%", 
            transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * 35}px, 0)` 
          }}
          title="Kreativitas Mahasiswa"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/35 to-transparent pointer-events-none"></div>
          <Brain className="w-7 h-7 text-pink-600 drop-shadow-[0_3px_6px_rgba(219,39,119,0.4)] relative z-10" />
        </div>

        {/* Decorative student emoji 👩‍🎓 */}
        <div 
          className="absolute w-12 h-12 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-pink-300/35 to-white/70 shadow-[0_10px_20px_rgba(244,63,94,0.3)] animate-pulse flex items-center justify-center transition-all duration-500 ease-out z-20 left-28 sm:left-36 md:left-[calc(17rem+15%)]"
          style={{ 
            top: "30%", 
            transform: `translate3d(${mousePos.x * 50}px, ${mousePos.y * 50}px, 0)` 
          }}
        >
          <span className="text-xl drop-shadow-md">👩‍🎓</span>
        </div>

        {/* Decorative study book emoji 📚 */}
        <div 
          className="absolute w-11 h-11 rounded-2xl select-none opacity-90 border-2 border-white/90 bg-gradient-to-tr from-teal-300/30 to-white/70 shadow-[0_10px_20px_rgba(20,184,166,0.25)] animate-pulse flex items-center justify-center transition-all duration-700 ease-out z-20 right-[15%] md:right-[25%]"
          style={{ 
            bottom: "35%", 
            transform: `translate3d(${mousePos.x * -40}px, ${mousePos.y * -40}px, 0)` 
          }}
        >
          <span className="text-lg drop-shadow-md">📚</span>
        </div>

        {/* Glowing glass capsule with MahasSpace label */}
        <div 
          className="absolute w-32 h-10 rounded-full select-none opacity-95 filter drop-shadow-[0_12px_20px_rgba(16,185,129,0.15)] bg-gradient-to-r from-white/80 to-emerald-200/50 backdrop-blur-md border-2 border-white/90 animate-float-slow transition-all duration-300 ease-out z-20"
          style={{ 
            top: "42%", 
            right: "12%", 
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * 35}px, 0) rotate(${mousePos.y * 12}deg)` 
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-white/40 to-transparent flex items-center justify-center relative">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest leading-normal">MahasSpace</span>
          </div>
        </div>

        {/* Glowing GPA label capsule */}
        <div 
          className="absolute w-24 h-11 rounded-full select-none opacity-95 backdrop-blur-md border-2 border-white/90 bg-gradient-to-r from-amber-400/30 to-orange-400/20 shadow-[0_12px_30px_rgba(245,158,11,0.25)] hover:scale-110 transition-all duration-250 ease-out animate-float-medium flex items-center justify-center px-4 z-20"
          style={{ 
            bottom: "20%", 
            right: "42%", 
            transform: `translate3d(${mousePos.x * 45}px, ${mousePos.y * 20}px, 0) rotate(${mousePos.x * -12}deg)` 
          }}
          title="Prestasi Akademik"
        >
          <span className="text-[11px] font-black tracking-widest text-amber-800 font-mono flex items-center gap-1 relative z-10">
            ★ GPA 4.0
          </span>
        </div>

        {/* Soft floating accent orb */}
        <div 
          className="absolute w-28 h-28 rounded-full select-none opacity-55 filter blur-[2px] bg-gradient-to-br from-amber-200/60 via-pink-200/40 to-purple-300/50 animate-pulse transition-all duration-500 ease-out z-10"
          style={{ 
            top: "28%", 
            left: "48%", 
            transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -20}px, 0)` 
          }}
        >
          <div className="w-full h-full rounded-full relative">
            <div className="absolute top-4 left-5 w-6 h-3 bg-white/80 rounded-full rotate-[-15deg] blur-[0.5px]"></div>
          </div>
        </div>

      </div>

      {/* SIDEBAR NAVIGATION PANEL (SMOOTH GLASSY PUFFY DESIGN) */}
      <aside 
        className={`w-68 bg-white/95 border border-white/95 rounded-[32px] shadow-[0_15px_40px_rgba(79,70,229,0.08)] flex flex-col justify-between p-5 shrink-0 transition-all duration-300 h-full
          ${sidebarOpen ? "fixed inset-y-2 left-2 z-40 flex" : "hidden md:flex md:relative"}`}
      >
        <div className="space-y-6 flex flex-col h-full justify-between pb-4 overflow-y-auto custom-scroll relative z-10">
          
          <div className="space-y-6">
            {/* MahasSpace Logo with custom graduation hat */}
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#FF2D75] text-white p-2.5 rounded-2xl border border-white/30 shadow-md flex items-center justify-center">
                  <GraduationCap size={18} className="fill-pink-100 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <span className="text-xl font-black font-display tracking-tight text-slate-900">
                  Mahas<span className="text-[#FF2D75]">Space</span>
                </span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 hover:bg-slate-150 rounded-xl text-slate-855 border border-slate-200 bg-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
 
            {/* Sidebar nav items checklist */}
            <nav className="space-y-1.5 pr-0.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveTab(item.label);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-black rounded-2xl text-left transition-all duration-250 cursor-pointer border ${
                      isActive 
                        ? "bg-gradient-to-r from-pink-400 via-[#FF2D75] to-[#db2777] text-white border-white/20 shadow-[0_8px_16px_rgba(255,45,117,0.25)] scale-102 hover-wiggle" 
                        : "text-slate-700 bg-slate-100/90 border-slate-200/50 hover:border-pink-300 hover:bg-pink-50 hover:text-[#FF2D75] hover:shadow-xs"
                    }`}
                  >
                    <Icon size={15} className={isActive ? "text-white" : "text-slate-500"} />
                    <span className="font-display tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom illustration prompt card */}
          <div className="px-1 mt-auto">
            <div 
              onClick={() => setActiveTab("Mental Health")}
              className="bg-[#38bdf8] border border-white/50 p-4 rounded-3xl text-slate-900 text-left overflow-hidden relative cursor-pointer group hover:scale-[1.02] transition-all shadow-md hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/25 rounded-full translate-x-4 -translate-y-4 pointer-events-none"></div>
              <p className="text-sm font-black font-display leading-tight text-slate-950">Butuh teman cerita?</p>
              <p className="text-[10px] text-slate-800 font-extrabold mt-0.5 leading-relaxed">Kamu tidak sendiri, yuk curhat.</p>
              <div className="mt-4 flex">
                <span className="bg-[#FF2D75] text-white px-3 py-1.5 rounded-xl border border-[#FF2D75]/30 shadow-md text-[10px] font-black tracking-wide">
                  Curhat Sekarang →
                </span>
              </div>
              
              <div className="absolute -bottom-1 -right-1 opacity-20 pointer-events-none scale-105">
                <HeartHandshake size={48} className="text-slate-955" />
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* Main layout backdrop for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-30 md:hidden"
        ></div>
      )}

      {/* CONTENT CANVAS WRAPPER (TOY-BOX REDESIGN) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-1 sm:p-2 md:p-3 relative z-20">
        
        {/* TOP INTERACTIVE BAR */}
        {!isAddingNote && (
          <header className="h-16 bg-white/45 backdrop-blur-[20px] !overflow-visible border border-white/70 rounded-[28px] shadow-[0_10px_35px_rgba(79,70,229,0.04)] flex items-center justify-between px-5 shrink-0 relative z-30 mb-3 md:mb-4">
          
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-800 border border-slate-200 bg-white cursor-pointer shadow-xs"
            >
              <Menu size={18} />
            </button>

            {/* Global Finder Input */}
            <div className="relative w-full max-w-sm hidden sm:block">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari fitur, event, beasiswa, atau barang..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-full focus:outline-hidden focus:border-[#FF2D75] focus:bg-white transition-all text-slate-800 font-extrabold"
              />

              {/* Instant Search Results Dropdown overlay */}
              {globalSearch !== "" && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] max-h-80 overflow-y-auto z-50 p-4 space-y-3.5 text-xs text-left">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-100">
                    <span>Hasil Pencarian Cepat</span>
                    <button onClick={() => setGlobalSearch("")} className="hover:text-red-500 cursor-pointer text-[#FF2D75] font-black">✕ Tutup</button>
                  </div>
                  
                  {foundTasks.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-extrabold text-[10px] text-[#FF2D75]">Kategori: Tugas & Deadline</p>
                      {foundTasks.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => handleGlobalSearchItemClick("Tugas & Deadline")}
                          className="p-2 hover:bg-pink-50 rounded-lg cursor-pointer font-bold text-slate-800 border border-transparent hover:border-slate-900"
                        >
                          {t.title} <span className="font-normal text-[10px] text-slate-500 font-medium">({t.course})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {foundSchs.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-extrabold text-[10px] text-sky-600">Kategori: Beasiswa</p>
                      {foundSchs.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => handleGlobalSearchItemClick("Beasiswa")}
                          className="p-2 hover:bg-sky-55 rounded-lg cursor-pointer font-bold text-slate-800 border border-transparent hover:border-slate-900"
                        >
                          {s.name} <span className="font-normal text-[10px] text-slate-500">({s.provider})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {foundMarket.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-extrabold text-[10px] text-amber-600">Kategori: Marketplace</p>
                      {foundMarket.map(m => (
                        <div 
                          key={m.id} 
                          onClick={() => handleGlobalSearchItemClick("Marketplace")}
                          className="p-2 hover:bg-amber-50 rounded-lg cursor-pointer font-bold text-slate-800 border border-transparent hover:border-slate-900"
                        >
                          {m.title} <span className="font-mono text-[10px] text-emerald-600">Rp{m.price.toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {foundTasks.length === 0 && foundSchs.length === 0 && foundMarket.length === 0 && (
                    <p className="text-center py-4 text-slate-400 font-bold">Hmm, tidak ditemukan item pencarian yang cocok.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notifications bell and user profile settings */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Notifications Bell with unread badges dropdown */}
            <div className="relative flex items-center gap-2">
              <button 
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setProfileDropdown(false);
                }}
                className="notification-trigger p-2.5 text-[#FF2D75] bg-white/45 backdrop-blur-md border border-white/70 hover:bg-white/65 hover:scale-105 rounded-full cursor-pointer relative transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)] active:scale-95"
              >
                <Bell size={16} className="animate-wiggle" style={{ animationDuration: "3s" }} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 w-4.5 h-4.5 bg-[#FF2D75] rounded-full flex items-center justify-center text-[8px] text-white font-black animate-pulse shadow-[0_2px_6px_rgba(255,45,117,0.4)]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown-menu absolute right-0 mt-14 w-[280px] xs:w-80 max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_15px_35px_rgba(79,70,229,0.1)] py-3.5 z-50 text-left text-xs text-slate-700 font-extrabold animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex justify-between items-center text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    <span className="text-slate-900">Notifikasi ({notifications.length})</span>
                    <div className="flex gap-2">
                      <button onClick={handleMarkAllNotificationsAsRead} className="hover:text-pink-600 text-[#FF2D75] text-[10px] font-black cursor-pointer">Unread</button>
                      <button onClick={handleClearNotifications} className="hover:text-rose-650 text-slate-500 text-[10px] font-black cursor-pointer">Hapus</button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 hover:bg-pink-50/40 flex items-start gap-2.5 transition-all text-xs ${!item.isRead ? "bg-pink-50/20" : ""}`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${!item.isRead ? "bg-[#FF2D75]" : "bg-transparent"}`}></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-800 leading-snug font-black break-words">{item.text}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">{item.time}</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-slate-400 font-bold">
                        Tidak ada notifikasi baru harian.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User credentials & profile photo with dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileDropdown(!profileDropdown);
                  setNotificationOpen(false);
                }}
                className="profile-trigger flex items-center gap-2 bg-white/45 backdrop-blur-md border border-white/70 rounded-full p-1 md:pr-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:bg-white/65 transition-all cursor-pointer hover:scale-102"
              >
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-white/90 shrink-0 shadow-xs"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {profile.name}
                  </p>
                  <p className="text-[9px] text-slate-405 font-bold text-slate-500">
                    {profile.role}
                  </p>
                </div>
                <ChevronDown size={12} className="text-slate-500 hidden sm:block ml-1 animate-pulse" />
              </button>

              {profileDropdown && (
                <div className="profile-dropdown-menu absolute right-0 mt-14 w-52 max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_15px_35px_rgba(79,70,229,0.1)] py-2.5 z-50 text-left text-xs font-black text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button 
                    onClick={() => {
                      setActiveTab("Zonamu");
                      setProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-pink-100/40 hover:text-[#FF2D75] flex items-center gap-2 cursor-pointer"
                  >
                    <User size={13} className="text-slate-850" />
                    Profil Zonamu
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab("Akademik");
                      setProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-pink-100/40 hover:text-[#FF2D75] flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap size={13} className="text-slate-850" />
                    Kartu Rencana (KRS)
                  </button>
                  
                  <div className="border-t-2 border-slate-900/10 my-1"></div>
                  
                  <button 
                    onClick={() => {
                      alert("Terima kasih telah menggunakan portal mahasiswa MahasSpace!");
                      setProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={13} />
                    Keluar Sesi
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>
        )}

        {/* ACTIVE CANVAS MAIN BODY (TOY-BOX REDESIGN) */}
        <main className="flex-1 overflow-y-auto p-1 relative z-20 custom-scroll">
          <div className="max-w-7xl mx-auto relative">
            {renderTabContent()}
          </div>
        </main>

      </div>

    </div>
  );
}
