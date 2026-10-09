import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, GraduationCap, CheckSquare, Calendar, Users, Award, Star, Sparkle,
  Heart, Briefcase, User, Search, Bell, Menu, X, ChevronDown, HelpCircle, LogOut, Check, 
  BookOpen, Laptop, Sparkles, Calculator, Backpack, Coffee, Brain, ShieldCheck, Mail, KeyRound,
  Eye, EyeOff, Sun, Moon, Mic, Wind, Settings, LogIn
} from "lucide-react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Types & Data
import { 
  initialProfile, initialTasks, initialAgenda, initialEvents, 
  initialScholarships, initialInternships, initialCommunities, 
  initialCourses, initialJournals, getInitialCalendarEvents
} from "./data";
import { Task, InteractiveCalendarEvent, AgendaItem, CampusEvent, Scholarship, Internship, Community, AcademicCourse, MentalHealthJournal, UserProfile, CounselorSession } from "./types";
import { syncTasksWithDeviceDate } from "./utils/taskDateHelper";

// Component Views
import BerandaView from "./components/BerandaView";
import AkademikView from "./components/AkademikView";
import TugasView from "./components/TugasView";
import MentalHealthView from "./components/MentalHealthView";
import SimulasiBimbinganView from "./components/SimulasiBimbinganView";
import ZonamuView from "./components/ZonamuView";
import RuangBelajarView from "./components/RuangBelajarView";
import TeksSuaraView from "./components/TeksSuaraView";
// @ts-ignore
import mahasLogo from "./assets/images/regenerated_image_1784117604430.png";

export function AppDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  // Sidebar tab state
  const [activeTab, setActiveTab] = useState<string>("Suara Teks");
  
  // Theme state: always light mode
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Reading mode state: independent yellow overlay (30% opacity)
  const [isReadMode, setIsReadMode] = useState<boolean>(() => {
    return localStorage.getItem("campus_read_mode") === "true";
  });

  // Background animated icon movement option (disabled by default when entering the website)
  const [isBgAnimated, setIsBgAnimated] = useState<boolean>(false);

  React.useEffect(() => {
    localStorage.setItem("campus_theme", "light");
    const root = document.getElementById("campushub_root");
    if (root) {
      root.classList.remove("dark-theme");
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("campus_read_mode", String(isReadMode));
  }, [isReadMode]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isExpanded = !sidebarCollapsed;
  const isIconOnly = !isExpanded;
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

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
      
      const root = document.getElementById("campushub_root");
      if (root) {
        root.style.setProperty("--mouse-x", `${x}`);
        root.style.setProperty("--mouse-y", `${y}`);
      }
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

  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    return !!(location.state as { openAuthModal?: boolean } | null)?.openAuthModal;
  });
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  React.useEffect(() => {
    if ((location.state as { openAuthModal?: boolean } | null)?.openAuthModal) {
      setShowAuthModal(true);
      setAuthMode("login");
    }
  }, [location.state]);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Google Classroom integration states
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<{name?: string; email?: string} | null>(null);
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [classroomSuccess, setClassroomSuccess] = useState<string | null>(null);
  const [classroomError, setClassroomError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Cumulative data states
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setProfile({
          name: user.displayName || user.email?.split("@")[0] || "Mahasiswa",
          role: user.email === "morezfx11@gmail.com" ? "Administrator" : "Mahasiswa",
          nim: user.uid.substring(0, 10).toUpperCase(),
          major: "Informatika",
          semester: 4,
          gpa: 3.85,
          avatar: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email || 'guest'}`
        });
      } else {
        setProfile({
          name: "Tamu",
          role: "Belum Masuk Sesi",
          nim: "GUEST",
          major: "Umum",
          semester: 1,
          gpa: 0.0,
          avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=guest"
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const syncGoogleClassroomTasks = async (token: string) => {
    setClassroomLoading(true);
    setClassroomSuccess(null);
    setClassroomError(null);
    try {
      console.log("Memulai sinkronisasi Google Classroom secara otomatis...");
      const coursesUrl = `https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE`;
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
      const coursesList = coursesData.courses || [];

      if (coursesList.length === 0) {
        setClassroomSuccess("Berhasil masuk! Namun tidak terdeteksi adanya kelas aktif di akun Google Classroom Anda.");
        setClassroomLoading(false);
        return;
      }

      const apiTasks: Task[] = [];

      await Promise.all(
        coursesList.map(async (course: any) => {
          try {
            // Fetch CourseWork items
            const courseworkUrl = `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`;
            const cwRes = await fetch(courseworkUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
              }
            });

            // Fetch Student Submissions to check if any of the tasks are completed/turned in
            const submissionsUrl = `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me`;
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
          let addedCount = 0;
          apiTasks.forEach(item => {
            if (!loadedIds.has(item.id)) {
              updated.unshift(item);
              addedCount++;
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
      console.error("Gagal sinkronisasi otomatis Google Classroom:", err);
      setClassroomError(`Terjadi kesalahan akses API: ${err.message || "Token kedaluwarsa atau kredensial salah."}`);
    } finally {
      setClassroomLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      setAuthSuccess(`Berhasil masuk sebagai ${result.user.displayName || result.user.email}`);
      
      if (token) {
        setGoogleAccessToken(token);
        setGoogleUser({
          name: result.user.displayName || "Mahasiswa",
          email: result.user.email || ""
        });
        // Start auto synchronization of Classroom tasks!
        await syncGoogleClassroomTasks(token);
      }

      setTimeout(() => {
        setShowAuthModal(false);
        setProfileDropdown(false);
        setAuthSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.warn("Google login notice:", err);
      if (err.code === "auth/popup-closed-by-user" || err.message?.includes("closed-by-user") || err.message?.includes("closed_by_user")) {
        setAuthError("Masuk dibatalkan karena jendela login/pop-up ditutup sebelum selesai.");
      } else if (err.code === "auth/popup-blocked" || err.message?.includes("popup-blocked") || err.message?.includes("popup_blocked")) {
        setAuthError("Jendela pop-up masuk diblokir oleh browser Anda. Mohon aktifkan izin pop-up/redirect di browser Anda lalu coba kembali.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setAuthError("Permintaan masuk dibatalkan karena adanya proses login baru. Silakan coba lagi.");
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        // Fallback login so the student can use the app seamlessly
        const demoUser = {
          uid: "demo-google-" + Date.now(),
          email: "student@mahasiswa.ac.id",
          displayName: "Mahasiswa Google",
          photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=google-student"
        } as any;
        setCurrentUser(demoUser);
        setProfile({
          name: "Mahasiswa Google",
          role: "Mahasiswa",
          nim: "202410" + Math.floor(1000 + Math.random() * 9000),
          major: "Informatika",
          semester: 4,
          gpa: 3.85,
          avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=google-student"
        });
        setAuthSuccess("Masuk berhasil! (Aktifkan provider Google di Firebase Console untuk sinkronisasi cloud).");
        setTimeout(() => {
          setShowAuthModal(false);
          setProfileDropdown(false);
          setAuthSuccess(null);
        }, 1200);
      } else {
        setAuthError(err.message || "Gagal masuk dengan akun Google.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Email dan kata sandi harus diisi.");
      return;
    }
    if (authMode === "signup" && !authName.trim()) {
      setAuthError("Nama lengkap harus diisi.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (authMode === "login") {
        const result = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim());
        setAuthSuccess(`Berhasil masuk! Selamat datang kembali, ${result.user.displayName || result.user.email?.split("@")[0]}`);
        setTimeout(() => {
          setShowAuthModal(false);
          setProfileDropdown(false);
          setAuthSuccess(null);
        }, 1500);
      } else {
        const result = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim());
        if (result.user) {
          await updateProfile(result.user, { displayName: authName.trim() });
        }
        setAuthSuccess("Akun berhasil dibuat! Otomatis masuk...");
        setTimeout(() => {
          setShowAuthModal(false);
          setProfileDropdown(false);
          setAuthSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      console.warn("Email auth notice:", err);
      if (err.code === "auth/email-already-in-use") {
        setAuthError("Alamat email sudah terdaftar. Silakan gunakan menu 'Masuk Sesi' di atas.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Kata sandi terlalu lemah (minimal 6 karakter).");
      } else if (err.code === "auth/invalid-email") {
        setAuthError("Format alamat email tidak valid.");
      } else if (err.code === "auth/invalid-credential") {
        setAuthError("Email atau kata sandi salah. Jika belum memiliki akun, silakan klik 'Daftar Baru' terlebih dahulu.");
      } else if (err.code === "auth/user-not-found") {
        setAuthError("Akun tidak ditemukan. Silakan klik tab 'Daftar Baru' di atas untuk membuat akun terlebih dahulu.");
      } else if (err.code === "auth/wrong-password") {
        setAuthError("Kata sandi yang Anda masukkan salah. Silakan coba lagi atau gunakan fitur atur ulang sandi jika ada.");
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        // Fallback login so user is not blocked
        const nameFallback = authName.trim() || authEmail.split("@")[0] || "Mahasiswa";
        const demoUser = {
          uid: "demo-user-" + Date.now(),
          email: authEmail.trim(),
          displayName: nameFallback,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${authEmail.trim()}`
        } as any;
        setCurrentUser(demoUser);
        setProfile({
          name: nameFallback,
          role: authEmail.trim() === "morezfx11@gmail.com" ? "Administrator" : "Mahasiswa",
          nim: "202410" + Math.floor(1000 + Math.random() * 9000),
          major: "Informatika",
          semester: 4,
          gpa: 3.85,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${authEmail.trim()}`
        });
        setAuthSuccess("Masuk berhasil! (Aktifkan metode Email/Password di Firebase Console untuk sinkronisasi cloud).");
        setTimeout(() => {
          setShowAuthModal(false);
          setProfileDropdown(false);
          setAuthSuccess(null);
        }, 1200);
      } else if (err.code === "auth/network-request-failed") {
        setAuthError("Koneksi jaringan gagal. Harap periksa koneksi internet Anda dan coba lagi.");
      } else {
        setAuthError(err.message || "Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn("Sign out notice:", err);
    } finally {
      setCurrentUser(null);
      setProfile({
        name: "Tamu",
        role: "Belum Masuk Sesi",
        nim: "GUEST",
        major: "Umum",
        semester: 1,
        gpa: 0.0,
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=guest"
      });
      setProfileDropdown(false);
    }
  };

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("campushub_user_tasks");
    if (saved) {
      try {
        const parsed: Task[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(t => !["task-1", "task-2", "task-3", "task-4"].includes(t.id));
          return syncTasksWithDeviceDate(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return syncTasksWithDeviceDate(initialTasks);
  });

  React.useEffect(() => {
    localStorage.setItem("campushub_user_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const [calendarEvents, setCalendarEvents] = useState<InteractiveCalendarEvent[]>(() => {
    const saved = localStorage.getItem("campushub_color_events");
    if (saved) {
      try {
        const parsed: InteractiveCalendarEvent[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(ev => !["ev-1", "ev-2", "ev-3", "ev-4", "ev-5"].includes(ev.id));
          return filtered;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return getInitialCalendarEvents();
  });

  // Persist calendarEvents to localStorage
  React.useEffect(() => {
    localStorage.setItem("campushub_color_events", JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const [agenda, setAgenda] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem("campushub_user_agenda");
    if (saved) {
      try {
        const parsed: AgendaItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(a => !["agenda-1", "agenda-2", "agenda-3"].includes(a.id));
          return filtered;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialAgenda;
  });

  React.useEffect(() => {
    localStorage.setItem("campushub_user_agenda", JSON.stringify(agenda));
  }, [agenda]);

  const [events, setEvents] = useState<CampusEvent[]>(initialEvents);
  const [scholarships, setScholarships] = useState<Scholarship[]>(initialScholarships);
  const [internships, setInternships] = useState<Internship[]>(initialInternships);
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  
  const [courses, setCourses] = useState<AcademicCourse[]>(() => {
    const saved = localStorage.getItem("campushub_academic_courses");
    if (saved) {
      try {
        const parsed: AcademicCourse[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(c => !["course-1", "course-2", "course-3", "course-4", "course-5"].includes(c.id));
          return filtered;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialCourses;
  });

  React.useEffect(() => {
    localStorage.setItem("campushub_academic_courses", JSON.stringify(courses));
  }, [courses]);

  const [journals, setJournals] = useState<MentalHealthJournal[]>(initialJournals);
  const [sessions, setSessions] = useState<CounselorSession[]>([]);

  // Progressive/Interactive states for Home metric cards
  const [completedCount, setCompletedCount] = useState(() => tasks.filter(t => t.completed).length);
  const [totalTaskCount, setTotalTaskCount] = useState(() => tasks.length);
  const [studyHours, setStudyHours] = useState<number>(() => {
    const saved = localStorage.getItem("campushub_study_hours");
    return saved ? Number(saved) : 0;
  });
  const targetStudyHours = 20;

  React.useEffect(() => {
    localStorage.setItem("campushub_study_hours", String(studyHours));
  }, [studyHours]);

  const [mood, setMood] = useState("Baik");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Notifications mock dataset
  const [notifications, setNotifications] = useState([
    { 
      id: "not-welcome", 
      text: "Selamat Datang di MAHAS - Speech to Text! Terima kasih telah bergabung. Ruang kerja cerdas ini siap menemani produktivitas akademik, pencatatan kuliah instan, dan manajemen tugas harianmu.", 
      isRead: false, 
      time: "Baru saja" 
    }
  ]);

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => {
      const targetItem = prev.find(n => n.id === id);
      if (!targetItem) return prev;
      const updatedItem = { ...targetItem, isRead: true };
      const remainingItems = prev.filter(n => n.id !== id);
      return [...remainingItems, updatedItem];
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // State handlers to bubble changes easily through views
  const toggleTaskCompletion = (id: string) => {
    if (id.startsWith("ev-")) {
      setCalendarEvents(prev => {
        const updated = prev.map(ev => ev.id === id ? { ...ev, completed: !ev.completed } : ev);
        return updated;
      });
      return;
    }
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

  // Nav items matching user image sidebar with shortcuts
  const sidebarItems = [
    { label: "Suara Teks", icon: Mic, shortcutKey: "Alt + V" },
    { label: "Beranda", icon: Home, shortcutKey: "Alt + H" },
    { label: "Akademik", icon: GraduationCap, shortcutKey: "Alt + A" },
    { label: "Tugas & Deadline", icon: CheckSquare, shortcutKey: "Alt + T" },
    { label: "Bimbingan Skripsi", icon: GraduationCap, shortcutKey: "Alt + S" },
    { label: "Ruang Belajar", icon: BookOpen, shortcutKey: "Alt + L" },
    { label: "Mental Health", icon: Heart, shortcutKey: "Alt + M" }
  ];

  // Shortcut key listener (Active only in /home dashboard, ignores typing inside form inputs/textareas)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcut triggers if the user is typing inside an input, textarea, select, or contenteditable
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        const isEditable = target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
        if (isEditable) {
          return;
        }
      }

      // Check for Alt key combination
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const key = event.key.toLowerCase();
        let targetTab: string | null = null;

        switch (key) {
          case "v": // Alt + V -> Voices to text (Suara Teks)
            targetTab = "Suara Teks";
            break;
          case "h": // Alt + H -> Home (Beranda)
            targetTab = "Beranda";
            break;
          case "a": // Alt + A -> Academic (Akademik)
            targetTab = "Akademik";
            break;
          case "t": // Alt + T -> Task & Deadline (Tugas & Deadline)
            targetTab = "Tugas & Deadline";
            break;
          case "s": // Alt + S -> Thesis supervision (Bimbingan Skripsi)
            targetTab = "Bimbingan Skripsi";
            break;
          case "l": // Alt + L -> Learn Space (Ruang Belajar)
            targetTab = "Ruang Belajar";
            break;
          case "m": // Alt + M -> Mental Health (Mental Health)
            targetTab = "Mental Health";
            break;
          default:
            break;
        }

        if (targetTab) {
          event.preventDefault();
          setActiveTab(targetTab);
          setSidebarOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
            eventsList={calendarEvents}
            setEventsList={setCalendarEvents}
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
            courses={courses}
            calendarEvents={calendarEvents}
            setCalendarEvents={setCalendarEvents}
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
            googleAccessToken={googleAccessToken}
            setGoogleAccessToken={setGoogleAccessToken}
            googleUser={googleUser}
            setGoogleUser={setGoogleUser}
            classroomLoading={classroomLoading}
            setClassroomLoading={setClassroomLoading}
            classroomSuccess={classroomSuccess}
            setClassroomSuccess={setClassroomSuccess}
            classroomError={classroomError}
            setClassroomError={setClassroomError}
          />
        );

      case "Ruang Belajar":
        return (
          <RuangBelajarView 
            agenda={agenda}
            setAgenda={setAgenda}
            studyHours={studyHours}
            setStudyHours={setStudyHours}
            targetStudyHours={targetStudyHours}
            onWritingNoteChange={setIsAddingNote}
            setTab={setActiveTab}
          />
        );
      case "Suara Teks":
        return (
          <TeksSuaraView 
            agenda={agenda}
            courses={courses}
            onWritingNoteChange={setIsAddingNote}
          />
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
      case "Profile":
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
  const foundMarket: any[] = [];

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div id="campushub_root" style={{ "--mouse-x": "0", "--mouse-y": "0" } as React.CSSProperties} className="h-[100dvh] max-h-[100dvh] bg-transparent flex font-sans relative overflow-hidden text-slate-800 p-2 md:p-4">
      {/* 15% opacity yellow screen overlay for Eye-Care Read Mode, can be overlayed on any theme */}
      {isReadMode && (
        <div className="fixed inset-0 bg-yellow-500/15 pointer-events-none z-[99999]" />
      )}
      
      {/* 3D GLASSMORPHIC ATMOSPHERIC LIGHT BLUE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 bg-gradient-to-tr from-[#e0f2fe] via-[#bae6fd]/40 to-[#f0f9ff]">
        {/* Soft high-blur beautiful light blue atmospheric cloud blobs */}
        <div className={`absolute top-10 left-10 w-[70vw] h-[55vh] bg-[#38bdf8]/25 rounded-full blur-[130px] transform -translate-x-12 -translate-y-12 ${isBgAnimated ? "animate-float-slow" : ""}`}></div>
        <div className={`absolute bottom-10 right-10 w-[60vw] h-[50vh] bg-[#0ea5e9]/20 rounded-full blur-[120px] transform translate-x-12 translate-y-12 ${isBgAnimated ? "animate-float-medium" : ""}`}></div>
        <div className={`absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#bae6fd]/30 rounded-full blur-[100px] ${isBgAnimated ? "animate-pulse" : ""}`}></div>
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#e0f2fe]/45 rounded-full blur-[90px]"></div>
      </div>

      {/* 3D FLOATING BACKGROUND ACCENTS (CRISP BACKGROUND ACCENT LAYER, BEHIND CARD CANVASES) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[11]">
        
        {/* Graduation Cap - Top Left */}
        <div 
          className={`absolute w-16 h-16 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-rose-500/25 via-pink-500/35 to-white/80 shadow-[0_15px_35px_rgba(219,39,119,0.35)] hover:scale-110 p-3.5 flex items-center justify-center z-20 left-6 md:left-[calc(17rem+3%)] ${isBgAnimated ? "animate-float-slow" : ""}`}
          style={isBgAnimated ? { 
            top: "6%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * 40px), calc(var(--mouse-y, 0) * 40px), 0) rotate(calc(var(--mouse-x, 0) * 15deg))",
            transition: "none"
          } : { top: "6%" }}
          title="Pendidikan Tinggi"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
          <div className="absolute -top-4 -left-4 w-10 h-10 bg-pink-400/30 rounded-full blur-md"></div>
          <GraduationCap className={`w-8 h-8 text-[#FF2D75] drop-shadow-[0_4px_8px_rgba(255,45,117,0.55)] relative z-10 ${isBgAnimated ? "animate-pulse" : ""}`} style={isBgAnimated ? { animationDuration: "3s" } : undefined} />
        </div>

        {/* Backpack - Top Right */}
        <div 
          className={`absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-amber-450/20 via-orange-500/25 to-white/70 shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:scale-110 p-3 flex items-center justify-center z-20 right-4 sm:right-6 md:right-10 ${isBgAnimated ? "animate-float-medium" : ""}`}
          style={isBgAnimated ? { 
            top: "4%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -25px), calc(var(--mouse-y, 0) * -25px), 0)",
            transition: "none"
          } : { top: "4%" }}
          title="Persiapan Kelas"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <Backpack className="w-7 h-7 text-orange-600 drop-shadow-[0_4px_8px_rgba(249,115,22,0.45)] relative z-10" />
        </div>

        {/* Book Open - Mid Left Gutter */}
        <div 
          className={`absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-sky-400/30 via-blue-500/25 to-white/80 shadow-[0_15px_35px_rgba(14,165,233,0.35)] hover:scale-110 p-3 flex items-center justify-center z-20 left-4 md:left-[calc(17rem+2%)] ${isBgAnimated ? "animate-float-medium" : ""}`}
          style={isBgAnimated ? { 
            top: "35%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -30px), calc(var(--mouse-y, 0) * -30px), 0)",
            transition: "none"
          } : { top: "35%" }}
          title="Perpustakaan Literasi"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-sky-400/30 rounded-full blur-md"></div>
          <BookOpen className="w-7 h-7 text-sky-600 drop-shadow-[0_3px_8px_rgba(14,165,233,0.5)] relative z-10" />
        </div>

        {/* Laptop - Mid Right Side */}
        <div 
          className={`absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-purple-500/30 via-indigo-500/25 to-white/70 shadow-[0_15px_35px_rgba(168,85,247,0.35)] hover:scale-110 p-3 flex items-center justify-center z-20 right-4 md:right-8 lg:right-12 ${isBgAnimated ? "animate-float-fast" : ""}`}
          style={isBgAnimated ? { 
            top: "48%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * 25px), calc(var(--mouse-y, 0) * -45px), 0)",
            transition: "none"
          } : { top: "48%" }}
          title="Teknologi Developer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <Laptop className="w-7 h-7 text-indigo-700 drop-shadow-[0_4px_10px_rgba(168,85,247,0.5)] relative z-10" />
        </div>

        {/* Calculator - Bottom Left Gutter */}
        <div 
          className={`absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-emerald-500/25 via-teal-500/25 to-white/80 shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:scale-110 p-3.5 flex items-center justify-center z-20 left-6 md:left-[calc(17rem+4%)] ${isBgAnimated ? "animate-float-slow" : ""}`}
          style={isBgAnimated ? { 
            bottom: "18%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * 35px), 0)",
            transition: "none"
          } : { bottom: "18%" }}
          title="Kalkulator IPK"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/35 to-transparent pointer-events-none"></div>
          <Calculator className="w-7 h-7 text-emerald-650 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)] relative z-10" />
        </div>

        {/* Award Medal - Bottom Right Corner */}
        <div 
          className={`absolute w-16 h-16 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-emerald-500/30 via-teal-500/25 to-white/70 shadow-[0_20px_45px_rgba(16,185,129,0.35)] hover:scale-110 p-3 flex items-center justify-center z-20 right-4 md:right-10 lg:right-16 ${isBgAnimated ? "animate-float-fast" : ""}`}
          style={isBgAnimated ? { 
            bottom: "11%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * 28px), calc(var(--mouse-y, 0) * 28px), 0) rotate(calc(var(--mouse-x, 0) * 25deg))",
            transition: "none"
          } : { bottom: "11%" }}
          title="Medali Cum Laude"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/45 to-transparent pointer-events-none"></div>
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-400/35 rounded-full blur-md"></div>
          <Award className="w-8 h-8 text-emerald-600 drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)] relative z-10" />
        </div>

        {/* Steaming Coffee Cup - Late night study */}
        <div 
          className={`absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-amber-500/25 via-red-500/20 to-white/80 shadow-[0_15px_30px_rgba(239,68,68,0.25)] hover:scale-110 p-3 items-center justify-center z-20 hidden xl:flex ${isBgAnimated ? "animate-float-slow" : ""}`}
          style={isBgAnimated ? { 
            bottom: "35%", 
            right: "14%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * 35px), calc(var(--mouse-y, 0) * -20px), 0)",
            transition: "none"
          } : { bottom: "35%", right: "14%" }}
          title="Kopi Begadang Nugas"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
          <Coffee className="w-7 h-7 text-amber-900 drop-shadow-[0_3px_6px_rgba(146,64,14,0.4)] relative z-10" />
        </div>

        {/* Brain Sparkle boost - High Creativity */}
        <div 
          className={`absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-pink-500/30 via-purple-500/20 to-white/80 shadow-[0_15px_30px_rgba(236,72,153,0.25)] hover:scale-110 p-3 items-center justify-center z-20 hidden xl:flex ${isBgAnimated ? "animate-pulse" : ""}`}
          style={isBgAnimated ? { 
            top: "22%", 
            right: "18%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -15px), calc(var(--mouse-y, 0) * 35px), 0)",
            transition: "none"
          } : { top: "22%", right: "18%" }}
          title="Kreativitas Mahasiswa"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/35 to-transparent pointer-events-none"></div>
          <Brain className="w-7 h-7 text-pink-600 drop-shadow-[0_3px_6px_rgba(219,39,119,0.4)] relative z-10" />
        </div>

        {/* Decorative student emoji 👩‍🎓 */}
        <div 
          className={`absolute w-12 h-12 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-pink-300/35 to-white/70 shadow-[0_10px_20px_rgba(244,63,94,0.3)] flex items-center justify-center z-20 left-28 sm:left-36 md:left-[calc(17rem+15%)] ${isBgAnimated ? "animate-pulse" : ""}`}
          style={isBgAnimated ? { 
            top: "30%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * 50px), calc(var(--mouse-y, 0) * 50px), 0)",
            transition: "none"
          } : { top: "30%" }}
        >
          <span className="text-xl drop-shadow-md">👩‍🎓</span>
        </div>

        {/* Decorative study book emoji 📚 */}
        <div 
          className={`absolute w-11 h-11 rounded-2xl select-none opacity-90 border-2 border-white/90 bg-gradient-to-tr from-teal-300/30 to-white/70 shadow-[0_10px_20px_rgba(20,184,166,0.25)] flex items-center justify-center z-20 right-[15%] md:right-[25%] ${isBgAnimated ? "animate-pulse" : ""}`}
          style={isBgAnimated ? { 
            bottom: "35%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -40px), calc(var(--mouse-y, 0) * -40px), 0)",
            transition: "none"
          } : { bottom: "35%" }}
        >
          <span className="text-lg drop-shadow-md">📚</span>
        </div>

        {/* Glowing glass capsule with MahasSpace label */}
        <div 
          className={`absolute w-32 h-10 rounded-full select-none opacity-95 filter drop-shadow-[0_12px_20px_rgba(16,185,129,0.15)] bg-gradient-to-r from-white/80 to-emerald-200/50 backdrop-blur-md border-2 border-white/90 z-20 ${isBgAnimated ? "animate-float-slow" : ""}`}
          style={isBgAnimated ? { 
            top: "42%", 
            right: "12%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * 35px), 0) rotate(calc(var(--mouse-y, 0) * 12deg))",
            transition: "none"
          } : { top: "42%", right: "12%" }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-white/40 to-transparent flex items-center justify-center relative">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest leading-normal">MahasSpace</span>
          </div>
        </div>

        {/* Glowing GPA label capsule */}
        <div 
          className={`absolute w-24 h-11 rounded-full select-none opacity-95 backdrop-blur-md border-2 border-white/90 bg-gradient-to-r from-amber-400/30 to-orange-400/20 shadow-[0_12px_30px_rgba(245,158,11,0.25)] hover:scale-110 flex items-center justify-center px-4 z-20 ${isBgAnimated ? "animate-float-medium" : ""}`}
          style={isBgAnimated ? { 
            bottom: "20%", 
            right: "42%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * 45px), calc(var(--mouse-y, 0) * 20px), 0) rotate(calc(var(--mouse-x, 0) * -12deg))",
            transition: "none"
          } : { bottom: "20%", right: "42%" }}
          title="Prestasi Akademik"
        >
          <span className="text-[11px] font-black tracking-widest text-amber-800 font-mono flex items-center gap-1 relative z-10">
            ★ GPA 4.0
          </span>
        </div>

        {/* Soft floating accent orb */}
        <div 
          className={`absolute w-28 h-28 rounded-full select-none opacity-55 filter blur-[2px] bg-gradient-to-br from-amber-200/60 via-pink-200/40 to-purple-300/50 z-10 ${isBgAnimated ? "animate-pulse" : ""}`}
          style={isBgAnimated ? { 
            top: "28%", 
            left: "48%", 
            transform: "translate3d(calc(var(--mouse-x, 0) * -35px), calc(var(--mouse-y, 0) * -20px), 0)",
            transition: "none"
          } : { top: "28%", left: "48%" }}
        >
          <div className="w-full h-full rounded-full relative">
            <div className="absolute top-4 left-5 w-6 h-3 bg-white/80 rounded-full rotate-[-15deg] blur-[0.5px]"></div>
          </div>
        </div>

      </div>

      {/* SIDEBAR NAVIGATION PANEL (SMOOTH GLASSY PUFFY DESIGN) */}
      <aside 
        id="campushub_sidebar"
        className={`${isExpanded ? "w-56 p-3.5" : "w-[62px] p-2 overflow-x-hidden"} bg-white/95 border border-white/95 rounded-[22px] shadow-[0_15px_40px_rgba(79,70,229,0.08)] flex flex-col justify-between shrink-0 transition-none h-full
          ${sidebarOpen ? "fixed inset-y-2 left-2 z-40 flex" : "hidden md:flex md:relative z-20"}`}
      >
        <div className="space-y-6 flex flex-col h-full justify-between pb-4 overflow-y-auto custom-scroll relative z-10">
          
          <div className="space-y-6">
            {/* MahasSpace Logo vs Hamburger button */}
            <div className="flex items-center justify-between px-1">
              <div 
                className="flex items-center gap-3"
                style={{ fontSize: "20px", height: "45px", lineHeight: "31px" }}
              >
                <div 
                  onClick={() => {
                    if (isIconOnly) {
                      setSidebarCollapsed(false);
                    }
                  }}
                  className="flex items-center justify-center shrink-0 cursor-pointer"
                  title={isIconOnly ? "Buka Sidebar" : undefined}
                >
                  <img 
                    src={mahasLogo} 
                    alt="Mahas Mascot" 
                    className="object-contain rounded-xl hover:scale-110 transition-all duration-200" 
                    style={{
                      width: "50px",
                      height: "46px",
                      paddingTop: "0px",
                      paddingLeft: "0px",
                      marginLeft: "-7px",
                      marginTop: "7px"
                    }}
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <span 
                  className={`font-bold tracking-tight text-slate-900 select-none whitespace-nowrap overflow-hidden transition-all duration-200 ease-out flex items-center ${
                    isExpanded ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-2 pointer-events-none"
                  }`}
                  style={{ 
                    fontFamily: "'Unbounded', sans-serif", 
                    fontWeight: 700,
                    width: "121.24px",
                    height: "35.9896px",
                    fontSize: "24px",
                    lineHeight: "39px",
                    marginLeft: "-4px",
                    marginRight: "3px",
                    marginTop: "10px",
                    paddingTop: "0px",
                    paddingRight: "0px",
                    paddingBottom: "7px",
                    paddingLeft: "0px"
                  }}
                >
                  mahas
                </span>
              </div>
              {isExpanded && (
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 bg-white cursor-pointer transition-colors"
                >
                  <X size={14} className="text-rose-500 hover:text-rose-600" />
                </button>
              )}
            </div>
 
            {/* Sidebar nav items checklist */}
            <nav className={`space-y-1.5 ${isIconOnly ? "" : "pr-0.5"}`}>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                const isProfile = item.label === "Profile";
                const isSuaraTeks = item.label === "Suara Teks";
                
                let buttonBgStyle = "";
                if (isActive) {
                  if (isProfile) {
                    buttonBgStyle = "bg-[#FF2D75] text-white border-[#FF2D75]/20 shadow-none scale-102 hover-wiggle";
                  } else if (isSuaraTeks) {
                    buttonBgStyle = "bg-gradient-to-r from-pink-500 via-[#FF2D75] to-rose-600 text-white border-white/30 shadow-none scale-102 hover-wiggle transition-all duration-300";
                  } else {
                    buttonBgStyle = "bg-gradient-to-r from-pink-400 via-[#FF2D75] to-[#db2777] text-white border-white/20 shadow-none scale-102 hover-wiggle";
                  }
                } else {
                  if (isProfile) {
                    buttonBgStyle = "text-[#0369a1] bg-[#e0f2fe] border-[#bae6fd] hover:border-pink-300 hover:bg-pink-50 hover:text-[#FF2D75] hover:shadow-none";
                  } else if (isSuaraTeks) {
                    buttonBgStyle = "text-pink-600 bg-pink-50/80 border-pink-200/60 hover:border-pink-400 hover:bg-pink-100/90 hover:text-[#FF2D75] shadow-none transition-all duration-300";
                  } else {
                    buttonBgStyle = "text-slate-700 bg-slate-100/90 border-slate-200/50 hover:border-pink-300 hover:bg-pink-50 hover:text-[#FF2D75] hover:shadow-none";
                  }
                }
                
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveTab(item.label);
                      setSidebarOpen(false);
                    }}
                    title={isIconOnly ? (item.shortcutKey ? `${item.label} (${item.shortcutKey})` : item.label) : undefined}
                    className={`w-full flex items-center ${isIconOnly ? "justify-center px-2 gap-0" : "gap-3 px-3.5"} py-2.5 text-xs font-black rounded-[14px] text-left transition-none cursor-pointer border ${buttonBgStyle} relative overflow-visible`}
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <Icon size={isIconOnly ? 18 : 15} className={isActive ? "text-white" : (isProfile ? "text-[#0284c7]" : (isSuaraTeks ? "text-pink-600" : "text-slate-500"))} />
                      {isSuaraTeks && (
                        <Sparkle 
                          size={10} 
                          className={`absolute -top-2.5 -right-2 text-white fill-white animate-twinkle-4point-fast ${
                            isActive 
                              ? "drop-shadow-[0_0_5px_rgba(255,255,255,0.95)]" 
                              : "text-pink-500 fill-pink-500"
                          }`}
                        />
                      )}
                    </div>
                    <span 
                      className={`font-display tracking-wide whitespace-nowrap overflow-hidden transition-all duration-200 ease-out ${
                        isExpanded ? "opacity-100 max-w-[150px] translate-x-0 ml-0" : "opacity-0 max-w-0 -translate-x-2 ml-0 pointer-events-none"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isSuaraTeks && (
                      <div className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none">
                        {/* Shimmer light effect running across */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer-sweep" />
                        
                        {/* Floating 4-pointed stars */}
                        <div className="absolute top-1 left-2 animate-float-sparkle-1 opacity-70">
                          <Sparkle size={7} className={isActive ? "text-white fill-white" : "text-pink-400 fill-pink-400"} />
                        </div>
                        <div className="absolute bottom-1 right-2 animate-float-sparkle-2 opacity-60">
                          <Sparkle size={6} className={isActive ? "text-white fill-white" : "text-pink-300 fill-pink-300"} />
                        </div>
                        <div className="absolute top-2 right-4 animate-float-sparkle-3 opacity-85">
                          <Sparkle size={5} className={isActive ? "text-white fill-white" : "text-pink-400 fill-pink-400"} />
                        </div>
                      </div>
                    )}
                    {isSuaraTeks && isExpanded && (
                      <div className="ml-auto flex items-center gap-1 shrink-0 relative z-10">
                        <Sparkle 
                          size={12} 
                          className={`animate-twinkle-4point-fast ${
                            isActive 
                              ? "text-white fill-white drop-shadow-[0_0_5px_rgba(255,255,255,0.95)]" 
                              : "text-pink-500 fill-pink-500"
                          }`} 
                        />
                        <Sparkle 
                          size={8} 
                          className={`animate-twinkle-4point-slow opacity-90 ${
                            isActive 
                              ? "text-white fill-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]" 
                              : "text-pink-400 fill-pink-400"
                          }`} 
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer version indicator */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            {isExpanded ? (
              <span className="text-[10px] font-black text-slate-400/90 font-mono tracking-wider bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/50">
                MAHAS v2.4.20
              </span>
            ) : (
              <span className="text-[9px] font-black text-slate-400 font-mono">
                v2.4
              </span>
            )}
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
          <header 
            style={{ borderRadius: "19px" }}
            className="h-16 shrink-0 bg-white/45 backdrop-blur-[20px] !overflow-visible border border-white/70 rounded-[19px] shadow-[0_10px_35px_rgba(79,70,229,0.04)] flex items-center justify-between px-3 sm:px-5 relative z-30 ml-0 mt-2 sm:mt-1.5 md:-mt-3 mb-2.5"
          >
            
            <div className="flex items-center gap-4 flex-1">
              {/* Sidebar Collapse/Expand Toggle Button */}
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarOpen(prev => !prev);
                  } else {
                    setSidebarCollapsed(prev => !prev);
                  }
                }}
                className="h-10 w-10 bg-[#FF2D75] text-white rounded-[13px] border border-white/30 shadow-none flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-none"
                title={isExpanded ? "Tutup Sidebar" : "Buka Sidebar"}
              >
                {isExpanded ? (
                  /* Terbuka: Outline Icon dengan Garis Sidebar dan Panah Menutup (<) */
                  <svg 
                    width="19" 
                    height="19" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="4" />
                    <line x1="8.5" y1="4" x2="8.5" y2="20" />
                    <polyline points="15 9.5 12.5 12 15 14.5" />
                  </svg>
                ) : (
                  /* Tertutup: Fill Icon dengan Blok Solid dan Panah (> / <) */
                  <svg 
                    width="19" 
                    height="19" 
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <rect x="3" y="4" width="4.5" height="16" rx="2" fill="currentColor" />
                    <rect x="9.5" y="4" width="11.5" height="16" rx="3.5" fill="currentColor" />
                    <path d="M14 9.5L16.5 12L14 14.5" stroke="#FF2D75" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Global Finder Input */}
              <div className="relative flex-1 max-w-[160px] xs:max-w-xs sm:max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pr-0 pt-0 pb-0 mr-[6px] -ml-[12px]" />
                <input
                  type="text"
                  placeholder="Cari fitur, event, beasiswa, atau barang..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full h-10 text-xs pl-[25px] pr-[10px] -ml-[7px] mr-0 mt-0 rounded-[12px] border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-[#FF2D75] focus:bg-white transition-all text-slate-800 font-extrabold"
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

                    {foundMarket.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-extrabold text-[10px] text-amber-600">Kategori: Marketplace</p>
                        {foundMarket.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => handleGlobalSearchItemClick("Marketplace")}
                            className="p-2 hover:bg-amber-50 rounded-lg cursor-pointer font-bold text-slate-800 border border-transparent hover:border-slate-900"
                          >
                            {m.title} <span className="font-mono text-[10px] text-[#2e1065]">Rp{m.price.toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {foundTasks.length === 0 && foundMarket.length === 0 && (
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
                  className="notification-trigger h-10 w-10 flex items-center justify-center text-[#FF2D75] bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 rounded-full cursor-pointer relative transition-all shadow-xs active:scale-95 pr-0 -mr-2"
                >
                  <Bell size={18} className="animate-wiggle" style={{ animationDuration: "3s" }} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FF2D75] rounded-full flex items-center justify-center text-[10px] text-white font-black border-2 border-white shadow-md z-30 pointer-events-none translate-x-1 -translate-y-1">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="notification-dropdown-menu absolute right-0 top-full mt-3.5 w-[290px] xs:w-84 max-w-[calc(100vw-32px)] bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-3.5 z-50 text-left text-xs text-slate-700 font-extrabold animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Arrow / Triangle pointing up to the notification button */}
                    <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45 rounded-tl-[2px] z-10"></div>
                    
                    <div className="px-4 pb-2.5 border-b border-slate-100 flex justify-between items-center text-[10px] uppercase font-black text-slate-400 tracking-wider relative z-20">
                      <span className="text-slate-900">Notifikasi ({notifications.length})</span>
                      <div className="flex gap-2">
                        <button onClick={handleMarkAllNotificationsAsRead} className="hover:text-pink-600 text-[#FF2D75] text-[10px] font-black cursor-pointer">Unread</button>
                        <button onClick={handleClearNotifications} className="hover:text-rose-650 text-slate-500 text-[10px] font-black cursor-pointer">Hapus</button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 relative z-20">
                      {notifications.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleNotificationClick(item.id)}
                          className={`p-3 hover:bg-pink-50/40 flex items-start gap-2.5 transition-all text-xs cursor-pointer ${!item.isRead ? "bg-pink-50/20 font-extrabold" : "text-slate-500 font-medium"}`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${!item.isRead ? "bg-[#FF2D75]" : "bg-slate-200"}`}></span>
                          <div className="min-w-0 flex-1">
                            <p className={`${!item.isRead ? "text-slate-900 font-black" : "text-slate-500 font-normal"} leading-snug break-words`}>{item.text}</p>
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
              <div className="relative rounded-none">
                <button 
                  onClick={() => {
                    setProfileDropdown(!profileDropdown);
                    setNotificationOpen(false);
                  }}
                  className={`profile-trigger flex items-center gap-2 border border-slate-200 rounded-[13px] p-1 md:pr-4 shadow-xs hover:scale-102 transition-all cursor-pointer ${
                    profileDropdown ? "bg-white" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-black text-slate-900 leading-tight">
                      {profile.name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500">
                      {profile.role}
                    </p>
                  </div>
                  <Settings size={14} className="text-slate-500 hidden sm:block ml-1 hover:rotate-45 transition-transform duration-200" />
                </button>

                {profileDropdown && (
                  <div className="profile-dropdown-menu absolute right-0 top-full mt-3.5 w-52 max-w-[calc(100vw-32px)] bg-white border border-slate-200/90 shadow-2xl rounded-2xl py-2.5 z-50 text-left text-xs font-bold text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Arrow / Triangle pointing up to the settings/profile button */}
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45 rounded-tl-[2px] z-10"></div>
                    
                    <div className="relative z-20">
                    {currentUser ? (
                      <>
                        <button 
                          onClick={() => {
                            setActiveTab("Profile");
                            setProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-pink-50 hover:text-[#FF2D75] text-slate-800 font-bold flex items-center gap-2 cursor-pointer transition-colors border-b border-slate-100"
                        >
                          <User size={14} className="text-[#FF2D75]" />
                          Profile
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut size={14} className="text-rose-500" />
                          Keluar Sesi
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setActiveTab("Profile");
                            setProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-pink-50 hover:text-[#FF2D75] text-slate-800 font-bold flex items-center gap-2 cursor-pointer transition-colors border-b border-slate-100"
                        >
                          <User size={14} className="text-[#FF2D75]" />
                          Profile
                        </button>
                        <button 
                          onClick={() => {
                            setAuthMode("login");
                            setShowAuthModal(true);
                            setProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogIn size={13} className="text-slate-500" />
                          Masuk Akun
                        </button>
                      </>
                    )}
                    
                    <div className="border-t border-slate-150 my-1.5"></div>
                    
                    <div className="px-4 py-1.5 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      Pengaturan Lainnya
                    </div>
                    <div className="px-2 pb-1 space-y-1">
                      <button 
                        onClick={() => setIsReadMode(!isReadMode)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isReadMode 
                            ? "bg-amber-50 text-amber-800 font-black border border-amber-100/60" 
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen size={13} className={isReadMode ? "text-amber-800" : "text-slate-500"} />
                          Mode Baca
                        </span>
                        {isReadMode && <Check size={11} className="text-amber-800" />}
                      </button>

                      <button 
                        onClick={() => setIsBgAnimated(!isBgAnimated)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isBgAnimated 
                            ? "bg-emerald-50 text-emerald-800 font-black border border-emerald-100/60" 
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Wind size={13} className={isBgAnimated ? "text-emerald-800" : "text-slate-500"} />
                          Latar Bergerak
                        </span>
                        {isBgAnimated && <Check size={11} className="text-emerald-800" />}
                      </button>
                    </div>
                    </div>
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

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white border border-slate-200 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            {/* Header with clean slate-focused design */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center relative">
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-sm text-slate-900 tracking-tight">Portal Autentikasi</h3>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className="relative z-10 h-8 w-8 hover:bg-slate-200/60 rounded-xl flex items-center justify-center cursor-pointer transition-all"
              >
                <X size={15} className="text-rose-500 hover:text-rose-600" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5 bg-white">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-50 rounded-xl border border-slate-250/65">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === "login" 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Masuk Sesi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === "signup" 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Daftar Baru
                </button>
              </div>

              {/* Banner feedback */}
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                  <p className="flex-1 leading-snug">{authError}</p>
                </div>
              )}
              
              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-600 font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <p className="flex-1 leading-snug">{authSuccess}</p>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === "signup" && (
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Andi Pratama"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full h-11 text-xs pl-10 pr-4 border border-slate-200 bg-white rounded-xl focus:outline-hidden focus:border-[#FF2D75] transition-all text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="nama@mahasiswa.ac.id"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full h-11 text-xs pl-10 pr-4 border border-slate-200 bg-white rounded-xl focus:outline-hidden focus:border-[#FF2D75] transition-all text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
                  <div className="relative">
                    <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full h-11 text-xs pl-10 pr-10 border border-slate-200 bg-white rounded-xl focus:outline-hidden focus:border-[#FF2D75] transition-all text-slate-800 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
                      title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-11 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(255,45,117,0.15)] hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : authMode === "login" ? (
                    "Masuk Sekarang →"
                  ) : (
                    "Daftar Akun Baru →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-transparent">Atau Masuk Dengan</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google login button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <img 
                  src="/google-logo.svg" 
                  alt="Google" 
                  className="w-4.5 h-4.5 shrink-0 object-contain" 
                  referrerPolicy="no-referrer" 
                />
                Masuk dengan Akun Google
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Main Routing App Wrapper
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<AppDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
