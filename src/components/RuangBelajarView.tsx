import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Brain,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ListTodo,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Hourglass,
  Award,
  Sparkles,
  Smile,
  ArrowRight,
  Save,
  Mic,
  MicOff,
  Check,
  AlertCircle,
  RefreshCw,
  BarChart2,
  Layers,
  Bookmark,
  Columns,
  Flame,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Highlighter,
  Quote,
  MapPin,
  Share2,
  Copy,
  CheckCircle2,
  Edit,
  Search,
  FileText,
  Filter,
  X,
  PlusCircle,
  GitBranch,
  Link,
  Image,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AgendaItem, CalendarNote } from "../types";

interface StudyLog {
  id: string;
  topic: string;
  technique: string;
  duration: number; // in minutes
  timestamp: string; // date formatted
  evaluations?: string[];
  noteExcerpt?: string;
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  textColor: string;
  parentId?: string;
  notes?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  imageUrl?: string;
}

interface RuangBelajarViewProps {
  agenda: AgendaItem[];
  setAgenda: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
  studyHours: number;
  setStudyHours: React.Dispatch<React.SetStateAction<number>>;
  targetStudyHours: number;
  onWritingNoteChange?: (val: boolean) => void;
  setTab?: (tab: string) => void;
}

export default function RuangBelajarView({
  agenda,
  setAgenda,
  studyHours,
  setStudyHours,
  targetStudyHours,
  onWritingNoteChange,
  setTab,
}: RuangBelajarViewProps) {
  // Technique selection state
  const [selectedTech, setSelectedTech] = useState<
    | "pomodoro"
    | "feynman"
    | "spaced"
    | "recall"
    | "cornell"
    | "timeboxing"
    | "mind-mapping"
  >("pomodoro");

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "note" | "log" | "node" | "flashcard" | "checklist";
    id: string;
    nodeId?: string;
  } | null>(null);

  // ==================== MIND MAPPING INITIAL ENVIRONMENT ====================
  const initialMindMapNodes: MindMapNode[] = [
    {
      id: "node-root",
      text: "Metodologi Penelitian Al-Skripsi",
      x: 230,
      y: 45,
      color: "#FF2D75",
      textColor: "text-white",
      notes:
        "Topik penelitian utama: Analisis Sentimen Opini Publik menggunakan IndoBERT.",
      checklist: [
        { id: "chk-1", text: "Tentukan rumusan masalah utama", done: true },
        { id: "chk-2", text: "Kumpulkan dataset twitter/review", done: false },
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "node-1",
      parentId: "node-root",
      text: "Bab I: Pendahuluan",
      x: 50,
      y: 190,
      color: "#4f46e5", // indigo
      textColor: "text-white",
      notes:
        "Latar belakang, rumusan masalah, batasan masalah, tujuan dan manfaat ilmiah.",
      checklist: [
        { id: "chk-3", text: "ACC outline pengajuan draf skripsi", done: true },
        { id: "chk-4", text: "Menulis bab latar belakang", done: false },
      ],
    },
    {
      id: "node-2",
      parentId: "node-root",
      text: "Bab II: Tinjauan Pustaka",
      x: 230,
      y: 210,
      color: "#0d9488", // teal
      textColor: "text-white",
      notes:
        "Studi literatur terdahulu, teori dasar NLP, pemodelan Deep Learning IndoBERT dan benchmarking.",
      checklist: [
        {
          id: "chk-5",
          text: "Cari minimal 15 jurnal bereputasi tinggi",
          done: true,
        },
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "node-3",
      parentId: "node-root",
      text: "Bab III: Rancangan Sistem",
      x: 410,
      y: 190,
      color: "#d97706", // amber
      textColor: "text-white",
      notes:
        "Arsitektur umum sistem, diagram alir ekstraksi dataset pre-processing, dan tuning parameter.",
      checklist: [
        {
          id: "chk-6",
          text: "Rancang flowchart preprocessing teks",
          done: false,
        },
      ],
    },
    {
      id: "node-1-sub1",
      parentId: "node-1",
      text: "Batasan Penelitian",
      x: 30,
      y: 330,
      color: "#7c3aed", // purple
      textColor: "text-white",
      notes: "Dataset terbatas pada tweet berbahasa Indonesia tahun 2025-2026.",
    },
    {
      id: "node-3-sub1",
      parentId: "node-3",
      text: "Skema Evaluasi F1-Score",
      x: 430,
      y: 330,
      color: "#0891b2", // cyan
      textColor: "text-white",
      notes:
        "Gunakan 10-fold cross validation untuk memastikan nilai presisi dan recall berimbang.",
    },
  ];

  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>(() => {
    const saved = localStorage.getItem("mahas_space_mind_maps");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("mahas_space_mind_maps", JSON.stringify(mindMapNodes));
  }, [mindMapNodes]);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    "node-root",
  );
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1.0);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(
    null,
  );

  // For connecting with the calendar belajar (Jadwal) automatically
  const handleSaveMindMapToCalendar = () => {
    const rootNode = mindMapNodes.find((n) => !n.parentId) || mindMapNodes[0];
    const mapTitle = rootNode ? rootNode.text : "Peta Pikiran Baru";
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Add study log entry
    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      topic: `${mapTitle} (Peta Pikiran)`,
      technique: "Mind Mapping",
      duration: 35, // 35 minutes default
      timestamp: timestampStr,
    };
    setLogs((prev) => [newLog, ...prev]);

    // Add study hours
    setStudyHours((prev) => Number((prev + 0.6).toFixed(1)));

    // Push into calendar (agenda)
    const agendaAdded: AgendaItem = {
      id: "agenda-mindmap-" + Date.now(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Mind Mapping: Selesai menyusun "${mapTitle}"`,
      location: "Kamar Belajar (Mandiri)",
      type: "discussion",
      color: "purple",
    };
    setAgenda((prev) => [...prev, agendaAdded]);

    setSuccessBannerText(
      `Sukses! Sesi menyusun Mind Map "${mapTitle}" (35 Menit) berhasil disinkronisasi ke Kalender Belajar Anda!`,
    );
    setShowProgressSuccessBanner(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    setDeleteConfirm({ type: 'node', id: nodeId });
  };

  const executeDeleteNode = (nodeId: string) => {
    const nodeToDelete = mindMapNodes.find((n) => n.id === nodeId);
    const parentIdStr = nodeToDelete ? nodeToDelete.parentId : undefined;

    setMindMapNodes((prev) =>
      prev
        .filter((n) => n.id !== nodeId)
        .map((n) =>
          n.parentId === nodeId ? { ...n, parentId: parentIdStr } : n,
        ),
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setDeleteConfirm(null);
  };

  const handleUpdateNodeProp = (
    nodeId: string,
    prop: keyof MindMapNode,
    value: any,
  ) => {
    setMindMapNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, [prop]: value } : node,
      ),
    );
  };

  const handleAddChecklistItem = (nodeId: string) => {
    if (!newChecklistItem.trim()) return;
    setMindMapNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const currentChecklist = node.checklist || [];
          return {
            ...node,
            checklist: [
              ...currentChecklist,
              {
                id: "chk-" + Date.now(),
                text: newChecklistItem.trim(),
                done: false,
              },
            ],
          };
        }
        return node;
      }),
    );
    setNewChecklistItem("");
  };

  const handleToggleChecklistItem = (nodeId: string, chkId: string) => {
    setMindMapNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId && node.checklist) {
          return {
            ...node,
            checklist: node.checklist.map((item) =>
              item.id === chkId ? { ...item, done: !item.done } : item,
            ),
          };
        }
        return node;
      }),
    );
  };

  const handleDeleteChecklistItem = (nodeId: string, chkId: string) => {
    setDeleteConfirm({ type: 'checklist', id: chkId, nodeId });
  };

  const executeDeleteChecklistItem = (nodeId: string, chkId: string) => {
    setMindMapNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId && node.checklist) {
          return {
            ...node,
            checklist: node.checklist.filter((item) => item.id !== chkId),
          };
        }
        return node;
      }),
    );
    setDeleteConfirm(null);
  };

  const loadTemplate = (type: "skripsi" | "db" | "empty") => {
    if (type === "empty") {
      setMindMapNodes([
        {
          id: "node-root",
          text: "Topik Utama Peta Pikiran Baru",
          x: 230,
          y: 60,
          color: "#FF2D75",
          textColor: "text-white",
          notes: "Ubah teks ini dan tambahkan sub-node baru.",
        },
      ]);
      setSelectedNodeId("node-root");
    } else if (type === "skripsi") {
      setMindMapNodes(initialMindMapNodes);
      setSelectedNodeId("node-root");
    } else if (type === "db") {
      setMindMapNodes([
        {
          id: "db-root",
          text: "Database KampusMAHAS (PostgreSQL)",
          x: 230,
          y: 40,
          color: "#1e293b",
          textColor: "text-white",
          notes: "Skema relasional data entitas penting mahasiswa.",
        },
        {
          id: "db-node1",
          parentId: "db-root",
          text: "Tabel Mahasiswa",
          x: 50,
          y: 180,
          color: "#4f46e5",
          textColor: "text-white",
          notes: "Kolom: nim (PK), nama, email, angkatan, jurusan, ipk.",
        },
        {
          id: "db-node2",
          parentId: "db-root",
          text: "Tabel IRS Akademik",
          x: 230,
          y: 200,
          color: "#0d9488",
          textColor: "text-white",
          notes: "Kolom: id (PK), nim (FK), kode_mk, status_bayar, semester.",
        },
        {
          id: "db-node3",
          parentId: "db-root",
          text: "Tabel Beasiswa",
          x: 410,
          y: 180,
          color: "#059669",
          textColor: "text-white",
          notes: "Kolom: id (PK), nama_beasiswa, syarat_ipk, dana_bantuan.",
        },
      ]);
      setSelectedNodeId("db-root");
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / canvasScale - dragOffset.x);
    const y = Math.round((e.clientY - rect.top) / canvasScale - dragOffset.y);
    const boundedX = Math.max(0, Math.min(rect.width / canvasScale - 185, x));
    const boundedY = Math.max(0, Math.min(rect.height / canvasScale - 95, y));

    setMindMapNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeId ? { ...n, x: boundedX, y: boundedY } : n,
      ),
    );
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!draggingNodeId || !canvasRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(
      (touch.clientX - rect.left) / canvasScale - dragOffset.x,
    );
    const y = Math.round(
      (touch.clientY - rect.top) / canvasScale - dragOffset.y,
    );
    const boundedX = Math.max(0, Math.min(rect.width / canvasScale - 185, x));
    const boundedY = Math.max(0, Math.min(rect.height / canvasScale - 95, y));

    setMindMapNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeId ? { ...n, x: boundedX, y: boundedY } : n,
      ),
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: MindMapNode) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== node.id) {
      // Connect connectingSourceId as parent of the clicked node
      setMindMapNodes((prev) =>
        prev.map((n) =>
          n.id === node.id ? { ...n, parentId: connectingSourceId } : n,
        ),
      );
      setConnectingSourceId(null);
      setSelectedNodeId(node.id);
      return;
    }
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / canvasScale - node.x;
    const offsetY = (e.clientY - rect.top) / canvasScale - node.y;
    setDraggingNodeId(node.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedNodeId(node.id);
  };

  const handleNodeTouchStart = (e: React.TouchEvent, node: MindMapNode) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== node.id) {
      setMindMapNodes((prev) =>
        prev.map((n) =>
          n.id === node.id ? { ...n, parentId: connectingSourceId } : n,
        ),
      );
      setConnectingSourceId(null);
      setSelectedNodeId(node.id);
      return;
    }
    if (!canvasRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (touch.clientX - rect.left) / canvasScale - node.x;
    const offsetY = (touch.clientY - rect.top) / canvasScale - node.y;
    setDraggingNodeId(node.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedNodeId(node.id);
  };
  // ==================== END OF MIND MAPPING ENVIRONMENT ====================

  // Local storage check for study logs
  const [logs, setLogs] = useState<StudyLog[]>(() => {
    const saved = localStorage.getItem("mahas_space_study_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("mahas_space_study_logs", JSON.stringify(logs));
  }, [logs]);

  // Topic input shared or separate
  const [topicName, setTopicName] = useState("");

  // ==================== LIVE MEMO STATE & LOGIC ====================
  const [notes, setNotes] = useState<CalendarNote[]>(() => {
    const saved = localStorage.getItem("campushub_calendar_notes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const updateNotesState = (newNotes: CalendarNote[]) => {
    setNotes(newNotes);
    localStorage.setItem("campushub_calendar_notes", JSON.stringify(newNotes));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");
  const [selectedNote, setSelectedNote] = useState<CalendarNote | null>(null);

  const dragScrollRefLiveMemo = useRef<HTMLDivElement>(null);
  const [isDragDown, setIsDragDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleDragScrollMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragDown(true);
    if (dragScrollRefLiveMemo.current) {
      setDragStartX(e.pageX - dragScrollRefLiveMemo.current.offsetLeft);
      setDragScrollLeft(dragScrollRefLiveMemo.current.scrollLeft);
    }
  };

  const handleDragScrollMouseLeave = () => {
    setIsDragDown(false);
  };

  const handleDragScrollMouseUp = () => {
    setIsDragDown(false);
  };

  const handleDragScrollMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragDown) return;
    e.preventDefault();
    if (dragScrollRefLiveMemo.current) {
      const x = e.pageX - dragScrollRefLiveMemo.current.offsetLeft;
      const walk = (x - dragStartX) * 1.5;
      dragScrollRefLiveMemo.current.scrollLeft = dragScrollLeft - walk;
    }
  };

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const startSimulasiRef = useRef<() => void>(undefined);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [recordingStatus, setRecordingStatus] = useState(
    "Siap merekam audio dosen di kelas.",
  );
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [simulationInterval, setSimulationInterval] = useState<any>(null);

  useEffect(() => {
    let timerId: any = null;
    if (isRecording) {
      setRecordingSeconds(0);
      timerId = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRecording]);

  useEffect(() => {
    if (transcription === "") {
      setRecordingSeconds(0);
    }
  }, [transcription]);

  const formatRecordingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const lectureSimulationTexts = [
    "[PENJELASAN DOSEN]: Rekan-rekan mahasiswa sekalian, hari ini kita membahas topik krusial mengenai Integrasi Sistem dan Database. Tolong dicatat, faktor utama keberhasilan integrasi sistem adalah standarisasi format pertukaran data seperti JSON atau XML. Pastikan kalian menggunakan API Gateway yang aman untuk membatasi akses demi keamanan data pengguna.",
    "[PENJELASAN DOSEN]: Mari kita lanjutkan ke materi kedua tentang Normalisasi Basis Data. Proses normalisasi dilakukan dari bentuk tidak normal ke bentuk normal pertama, kedua, hingga ketiga. Tujuannya adalah untuk meminimalkan redundansi data sehingga data di tabel kita konsisten dan tidak ada anomali saat manipulasi data dilakukan.",
    "[PENJELASAN DOSEN]: Catatan tambahan dari penugasan kemarin. Minggu depan kita akan mengadakan kuis interaktif berbobot lima belas persen dari nilai akhir. Materinya meliputi materi awal bab satu sampai bab lima hari ini. Kerjakan studi kasus di buku halaman sembilan puluh sembilan secara mandiri untuk persiapan.",
    "[PENJELASAN DOSEN]: Baik, untuk materi penutup, perhatikan penggunaan indeks pada database relasional. Indeks mempercepat proses pembacaan data, tetapi perlu diingat bahwa terlalu banyak indeks juga akan memperlambat operasi penulisan data seperti INSERT atau UPDATE. Gunakan indeks hanya pada kolom yang sering dicari.",
  ];

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setIsSpeechSupported(true);
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "id-ID";

      rec.onstart = () => {
        setRecordingStatus(
          "🎤 Perekaman aktif (Live). Silakan berbicara sekarang, suara Anda akan langsung berubah menjadi teks...",
        );
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setRecordingStatus(
            "❌ Akses mikrofon diblokir oleh browser. Klik tombol 'Simulasikan Dosen' untuk mengetes audio ke teks!",
          );
          setIsRecording(false);
        } else if (e.error === "no-speech") {
          setRecordingStatus(
            "⚠️ Mikrofon tidak menangkap suara. Silakan berbicara lebih keras...",
          );
          setIsRecording(false);
        } else if (e.error === "network") {
          setRecordingStatus(
            "⚠️ Koneksi mikrofon dibatasi sandbox iFrame (Kesalahan Jaringan). Mengaktifkan otomatis ke Mode Simulasi Dosen agar tetap dapat diuji! Tip: Buka aplikasi di Tab Baru untuk mic asli.",
          );
          setTimeout(() => {
            if (startSimulasiRef.current) {
              startSimulasiRef.current();
            }
          }, 2000);
        } else {
          setRecordingStatus(
            `⚠️ Kesalahan mikrofon: ${e.error}. Menyediakan simulasi otomatis...`,
          );
          setIsRecording(false);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = (evt: any) => {
        let cumulativeFinal = "";
        let cumulativeInterim = "";

        for (let i = 0; i < evt.results.length; ++i) {
          const chunk = evt.results[i][0].transcript;
          if (evt.results[i].isFinal) {
            cumulativeFinal += chunk + " ";
          } else {
            cumulativeInterim += chunk;
          }
        }

        const fullText = (cumulativeFinal + cumulativeInterim).trim();
        if (fullText) {
          setTranscription(fullText);
        }
      };

      setRecognition(rec);
    } else {
      setIsSpeechSupported(false);
      setRecordingStatus("⚠️ Browser ini belum mendukung Web Speech API.");
    }
  }, []);

  const handleStartSimulasi = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    setIsRecording(true);
    setRecordingStatus(
      "🎙️ [MODE SIMULASI] Mensimulasikan materi penjelasan dosen secara visual...",
    );
    setTranscription("");

    const textChoice =
      lectureSimulationTexts[
        Math.floor(Math.random() * lectureSimulationTexts.length)
      ];

    const words = textChoice.split(" ");
    let i = 0;
    let accumulated = "";

    const timer = setInterval(() => {
      if (i < words.length) {
        accumulated += words[i] + " ";
        setTranscription(accumulated.trim());
        i++;
      } else {
        clearInterval(timer);
        setSimulationInterval(null);
        setIsRecording(false);
        setRecordingStatus(
          "⏹️ [Simulasi Selesai] Transkrip audio dosen sukses disimulasikan!",
        );
      }
    }, 150);

    setSimulationInterval(timer);
  };

  // hook the simulation ref
  startSimulasiRef.current = handleStartSimulasi;

  const handleStartRecording = async () => {
    if (isRecording) {
      stopAllRecordingActivity();
      return;
    }

    setTranscription("");
    audioChunksRef.current = [];

    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
        handleStartSimulasi();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        let options = { mimeType: "audio/webm" };
        if (typeof MediaRecorder !== "undefined") {
          if (!MediaRecorder.isTypeSupported("audio/webm")) {
            options = { mimeType: "audio/ogg" };
          }
          if (
            !MediaRecorder.isTypeSupported("audio/ogg") &&
            !MediaRecorder.isTypeSupported("audio/webm")
          ) {
            options = { mimeType: "" };
          }
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });
          if (audioBlob.size === 0) {
            setRecordingStatus(
              "⚠️ Rekaman kosong. Silakan coba berbicara kembali.",
            );
            setIsRecording(false);
            return;
          }

          setRecordingStatus(
            "🔄 Mengirim rekaman suara ke AI untuk transkripsi verbatim...",
          );
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            const base64Payload = base64data.split(",")[1];

            try {
              const res = await fetch("/api/transcribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioData: base64Payload,
                  mimeType: mediaRecorder.mimeType || "audio/webm",
                }),
              });

              if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Gagal memproses audio.");
              }

              const data = await res.json();
              if (data.transcript && data.transcript.trim() !== "") {
                setTranscription(data.transcript);
                setRecordingStatus(
                  "⏹️ [Transkrip Sukses] Transkrip audio dosen sukses disimpan!",
                );
              } else {
                setTranscription("[Hening / Suara Kurang Jeles]");
                setRecordingStatus(
                  "⏹️ [Transkrip Selesai] Tidak terdeteksi materi suara yang jelas.",
                );
              }
            } catch (err: any) {
              console.error("API Transcribe Error:", err);
              setRecordingStatus(
                `⚠️ Transkripsi gagal: ${err.message || err}. Buka di Tab Baru bila berlanjut.`,
              );
            } finally {
              setIsRecording(false);
            }
          };
        };

        mediaRecorder.start(250);
        setRecordingStatus(
          "🎤 Mikrofon Aktif & Merekam... Silakan berbicara sekarang. Tekan 'Hentikan Rekam' untuk melihat transkrip.",
        );
      } catch (err: any) {
        console.error("Gagal mendapatkan izin mic:", err);
        setRecordingStatus(
          "⚠️ Koneksi mikrofon langsung dibatasi sandbox iFrame browser. Mengaktifkan Mode Simulasi Dosen...",
        );
        setTimeout(() => {
          handleStartSimulasi();
        }, 1500);
      }
    }
  };

  const stopAllRecordingActivity = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setTranscription("");
    setRecordingStatus("Siap merekam audio dosen di kelas.");
  };

  const appendTranscriptToNote = () => {
    if (!transcription.trim()) {
      alert("Belum ada teks transkripsi dari suara.");
      return;
    }
    setNoteContent((prev) => {
      const trimmed = prev.trim();
      return trimmed
        ? `${trimmed}\n\n📝 [REKAMAN SUARA DOSEN]\n${transcription}`
        : `📝 [REKAMAN SUARA DOSEN]\n${transcription}`;
    });
  };

  useEffect(() => {
    if (onWritingNoteChange) {
      onWritingNoteChange(showAddNoteModal || !!selectedNote);
    }
  }, [showAddNoteModal, selectedNote, onWritingNoteChange]);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteCourse, setNoteCourse] = useState("");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseTitle, setCustomCourseTitle] = useState("");
  const [noteLecturer, setNoteLecturer] = useState("");
  const [noteTopic, setNoteTopic] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteDate, setNoteDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [noteTagsRaw, setNoteTagsRaw] = useState("");

  const openNewNoteModal = () => {
    setEditingNoteId(null);
    setNoteLecturer("");
    setNoteTopic("");
    setNoteContent("");
    setNoteTagsRaw("");
    setNoteDate(new Date().toISOString().split("T")[0]);
    setIsCustomCourse(false);

    if (agenda && agenda.length > 0) {
      setNoteCourse(agenda[0].title);
    } else {
      setNoteCourse("Kustom");
      setIsCustomCourse(true);
    }

    setShowAddNoteModal(true);
  };

  const openEditNoteModal = (note: CalendarNote) => {
    setEditingNoteId(note.id);
    const inAgenda = agenda && agenda.some((a) => a.title === note.courseTitle);
    if (inAgenda) {
      setNoteCourse(note.courseTitle);
      setIsCustomCourse(false);
    } else {
      setNoteCourse("Kustom");
      setIsCustomCourse(true);
      setCustomCourseTitle(note.courseTitle);
    }
    setNoteLecturer(note.lecturerName);
    setNoteTopic(note.topic);
    setNoteContent(note.content);
    setNoteDate(note.date);
    setNoteTagsRaw(note.tags ? note.tags.join(", ") : "");
    setShowAddNoteModal(true);
    setSelectedNote(null);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourseTitle = isCustomCourse ? customCourseTitle : noteCourse;
    if (!finalCourseTitle.trim() || !noteTopic.trim() || !noteContent.trim()) {
      alert("Judul Matakuliah, Topik Bahasan, dan Catatan Materi wajib diisi!");
      return;
    }

    const parsedTags = noteTagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const formattedDate = () => {
      try {
        const d = new Date(noteDate);
        const months = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch {
        return noteDate;
      }
    };

    if (editingNoteId) {
      const idx = notes.findIndex((n) => n.id === editingNoteId);
      if (idx !== -1) {
        const updated = [...notes];
        updated[idx] = {
          ...updated[idx],
          courseTitle: finalCourseTitle,
          lecturerName: noteLecturer || "Dosen Pengampu",
          topic: noteTopic,
          content: noteContent,
          date: noteDate,
          createdAt: `${formattedDate()}, ${new Date().toTimeString().split(" ")[0].slice(0, 5)}`,
          tags: parsedTags.length > 0 ? parsedTags : ["Kuliah"],
        };
        updateNotesState(updated);
      }
    } else {
      const newNote: CalendarNote = {
        id: "note-" + Date.now(),
        courseTitle: finalCourseTitle,
        lecturerName: noteLecturer || "Dosen Pengampu",
        topic: noteTopic,
        content: noteContent,
        date: noteDate,
        createdAt: `${formattedDate()}, ${new Date().toTimeString().split(" ")[0].slice(0, 5)}`,
        tags: parsedTags.length > 0 ? parsedTags : ["Kuliah"],
      };
      updateNotesState([newNote, ...notes]);
    }

    setShowAddNoteModal(false);
  };

  const handleDeleteNote = (id: string) => {
    setDeleteConfirm({ type: 'note', id });
  };

  const executeDeleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    updateNotesState(remaining);
    setSelectedNote(null);
    setDeleteConfirm(null);
  };

  const applyTemplateStructure = (type: "general" | "points" | "tasks") => {
    let structure = "";
    if (type === "general") {
      structure = `📌 UTAS MATERI KULIAH:\n- \n\n📖 DETAIL PENJELASAN:\n- \n\n🔑 POIN UTAMA JANGAN DILUPAKAN:\n- \n`;
    } else if (type === "points") {
      structure = `🔑 POIN-POIN & RUMUS UTAMA:\n• \n• \n\n💬 PENJELASAN DOSEN:\n" "\n\n💡 LINK REFERENSI:\n- \n`;
    } else if (type === "tasks") {
      structure = `⚠️ TUGAS & PR MANDIRI DI KELAS:\n- Tugas: \n- Deadline: \n- Dikumpulkan ke: \n\n📋 CATATAN PERSIAPAN:\n- \n`;
    }
    setNoteContent((prev) => prev + (prev ? "\n\n" : "") + structure);
  };

  const filteredNotes = notes.filter((n) => {
    const query = searchTerm.toLowerCase();
    const matchQuery =
      n.courseTitle.toLowerCase().includes(query) ||
      n.topic.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.lecturerName.toLowerCase().includes(query);

    const matchTag =
      selectedTag === "Semua" || (n.tags && n.tags.includes(selectedTag));
    return matchQuery && matchTag;
  });

  const allUniqueTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));
  // ==================== END LIVE MEMO ======

  // Sound play simulation settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Success alert states
  const [showProgressSuccessBanner, setShowProgressSuccessBanner] =
    useState(false);
  const [successBannerText, setSuccessBannerText] = useState("");

  // 1. POMODORO TIMER STATE
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [totalTimerDuration, setTotalTimerDuration] = useState(25 * 60); // in seconds
  const [timerPresetIndex, setTimerPresetIndex] = useState<
    "focus" | "shortBreak" | "longBreak"
  >("focus");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Customizable inputs
  const [customFocusDuration, setCustomFocusDuration] = useState(25);
  const [customBreakDuration, setCustomBreakDuration] = useState(5);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup / preset changes
  const applyPreset = (preset: "focus" | "shortBreak" | "longBreak") => {
    setIsTimerRunning(false);
    setTimerPresetIndex(preset);
    if (preset === "focus") {
      setPomodoroMinutes(customFocusDuration);
      setPomodoroSeconds(0);
      setTotalTimerDuration(customFocusDuration * 60);
      setIsBreak(false);
    } else if (preset === "shortBreak") {
      setPomodoroMinutes(customBreakDuration);
      setPomodoroSeconds(0);
      setTotalTimerDuration(customBreakDuration * 60);
      setIsBreak(true);
    } else if (preset === "longBreak") {
      setPomodoroMinutes(15);
      setPomodoroSeconds(0);
      setTotalTimerDuration(15 * 60);
      setIsBreak(true);
    }
  };

  // Sync state if custom presets change when offline
  useEffect(() => {
    if (!isTimerRunning && timerPresetIndex === "focus") {
      setPomodoroMinutes(customFocusDuration);
      setTotalTimerDuration(customFocusDuration * 60);
    }
  }, [customFocusDuration]);

  useEffect(() => {
    if (!isTimerRunning && timerPresetIndex === "shortBreak") {
      setPomodoroMinutes(customBreakDuration);
      setTotalTimerDuration(customBreakDuration * 60);
    }
  }, [customBreakDuration]);

  // Timer loop mechanics
  useEffect(() => {
    if (isTimerRunning) {
      countdownIntervalRef.current = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds((prev) => prev - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes((prev) => prev - 1);
          setPomodoroSeconds(59);
        } else {
          // Timer reached 0!
          triggerTimerEnd();
        }
      }, 1000);
    } else {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [isTimerRunning, pomodoroMinutes, pomodoroSeconds]);

  // Play browser synthesizer beep or standard web alert
  const beep = (freq = 440, duration = 300) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + duration / 1000,
      );

      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    } catch (e) {
      console.log(
        "Audio contexts not supported/allowed yet by browser policy:",
        e,
      );
    }
  };

  const triggerTimerEnd = () => {
    setIsTimerRunning(false);
    beep(523.25, 400); // Play dynamic C5 success tone
    setTimeout(() => beep(659.25, 500), 200); // E5

    const activeTopic = topicName.trim() || "Topik Tanpa Nama";
    const durationEarned =
      timerPresetIndex === "focus" ? customFocusDuration : customBreakDuration;

    // Save logs & record to calendar only for actual Focus sessions
    if (!isBreak && timerPresetIndex === "focus") {
      const now = new Date();
      const timestampStr =
        now.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }) +
        `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newLog: StudyLog = {
        id: "log-" + Date.now(),
        topic: activeTopic,
        technique: "Pomodoro",
        duration: durationEarned,
        timestamp: timestampStr,
      };

      setLogs((prev) => [newLog, ...prev]);

      // Global metric linkage: add to weekly study hours (converted properly)
      const hoursAdded = Number((durationEarned / 60).toFixed(2));
      setStudyHours((prev) => Number((prev + hoursAdded).toFixed(1)));

      // Add to calendar/schedule agenda automatically!
      const agendaAdded: AgendaItem = {
        id: "agenda-study-" + Date.now(),
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        title: `Ruang Belajar: Focus [${activeTopic}] via Pomodoro`,
        location: "Kamar Belajar (Mandiri)",
        type: "discussion",
        color: "pink",
      };
      setAgenda((prev) => [...prev, agendaAdded]);

      setSuccessBannerText(
        `Hebat! Sesi Fokus Pomodoro "${activeTopic}" (${durationEarned}m) selesai & tercatat di Jadwal!`,
      );
      setShowProgressSuccessBanner(true);
    } else {
      setSuccessBannerText(
        "Waktu istirahat Anda telah usai! Mari kembali fokus.",
      );
      setShowProgressSuccessBanner(true);
    }

    // Reset presets
    applyPreset(isBreak ? "focus" : "shortBreak");
  };

  // 2. FEYNMAN TECHNIQUE STATE
  const [feynmanStep, setFeynmanStep] = useState<1 | 2 | 3 | 4>(1);
  const [feynmanExplanation, setFeynmanExplanation] = useState("");
  const [isRecordingSimulated, setIsRecordingSimulated] = useState(false);
  const [simulatedVoiceLog, setSimulatedVoiceLog] = useState<string | null>(
    null,
  );

  // Checklist evaluations
  const [evaluationChecklist, setEvaluationChecklist] = useState([
    {
      id: "eval-1",
      label:
        "Penjelasan bebas dari kata-kata teknis membingungkan (jargon-free)",
      checked: false,
    },
    {
      id: "eval-2",
      label:
        "Menggunakan analogi sederhana dunia nyata yang dipahami anak kecil",
      checked: false,
    },
    {
      id: "eval-3",
      label:
        "Menemukan bagian materi yang masih kosong (gap pemahaman) untuk diulas",
      checked: false,
    },
    {
      id: "eval-4",
      label:
        "Penyederhanaan kalimat agar mengalir dengan logis dan mudah diingat",
      checked: false,
    },
  ]);

  const handleToggleEvaluation = (id: string) => {
    setEvaluationChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // Simulated Voice Recorder mechanics
  const [micVisualBars, setMicVisualBars] = useState<number[]>([
    15, 8, 20, 10, 5, 25, 12, 18, 30, 8, 14, 21,
  ]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingSimulated) {
      interval = setInterval(() => {
        setMicVisualBars((prev) =>
          prev.map(() => Math.floor(Math.random() * 32) + 5),
        );
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecordingSimulated]);

  const handleToggleRecording = () => {
    if (!isRecordingSimulated) {
      // Start recording
      beep(600, 100);
      setIsRecordingSimulated(true);
    } else {
      // Stop recording
      beep(480, 150);
      setIsRecordingSimulated(false);
      setSimulatedVoiceLog(
        "Rekaman_Suara_Feynman_Belajar_" +
          Math.floor(Math.random() * 900 + 100) +
          ".wav (35 detik)",
      );
    }
  };

  const handleFinishFeynmanSession = () => {
    const activeTopic = topicName.trim() || "Konsep Materi Baru";
    const checkedCount = evaluationChecklist.filter(
      (item) => item.checked,
    ).length;

    // Validate
    if (feynmanExplanation.trim() === "" && !simulatedVoiceLog) {
      alert(
        "Tolong tuliskan penjelasan atau rekam suara pemaparan gagasan Anda terlebih dahulu.",
      );
      return;
    }

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Add study logs
    const completedChecklistLabels = evaluationChecklist
      .filter((item) => item.checked)
      .map((item) => item.label);

    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      topic: activeTopic,
      technique: "Feynman",
      duration: 15, // default estimated Feynman evaluation session time
      timestamp: timestampStr,
      evaluations: completedChecklistLabels,
      noteExcerpt: feynmanExplanation
        ? feynmanExplanation.substring(0, 110) + "..."
        : "Menggunakan rekaman audio penjelasan",
    };

    setLogs((prev) => [newLog, ...prev]);

    // Update global study hours (add standard 15 minutes of intensive explaining / 0.25 hours)
    setStudyHours((prev) => Number((prev + 0.25).toFixed(1)));

    // Push into Global Calendar!
    const agendaAdded: AgendaItem = {
      id: "agenda-feynman-" + Date.now(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Ruang Belajar: Evaluasi Feynman [${activeTopic}] (${checkedCount}/4 Tuntas)`,
      location: "Ruang Diskusi Mandiri",
      type: "class",
      color: "purple",
    };
    setAgenda((prev) => [...prev, agendaAdded]);

    setSuccessBannerText(
      `Hebat! Metode Feynman untuk "${activeTopic}" berhasil dikompilasi & dicatat ke Kalender!`,
    );
    setShowProgressSuccessBanner(true);

    // Reset fields for fresh learning
    setTopicName("");
    setFeynmanExplanation("");
    setSimulatedVoiceLog(null);
    setFeynmanStep(1);
    setIsRecordingSimulated(false);
    setEvaluationChecklist((prev) =>
      prev.map((item) => ({ ...item, checked: false })),
    );
  };

  // 3. SPACED REPETITION STATE
  const [spacedSessions, setSpacedSessions] = useState(() => {
    return [
      {
        id: "s1",
        label: "Hari Ini: Sesi Belajar Mandiri (Awal)",
        checked: true,
        date: "Hari Ini",
      },
      {
        id: "s2",
        label: "Review Hari Ke-1: Konsolidasi Singkat",
        checked: false,
        date: "Besok",
      },
      {
        id: "s3",
        label: "Review Hari Ke-3: Penguatan Skema Memori",
        checked: false,
        date: "3 Hari Lagi",
      },
      {
        id: "s4",
        label: "Review Hari Ke-7: Menyemen Struktur Ingatan",
        checked: false,
        date: "7 Hari Lagi",
      },
      {
        id: "s5",
        label: "Review Hari Ke-14: Pengulangan Jangka Panjang",
        checked: false,
        date: "14 Hari Lagi",
      },
    ];
  });

  const handleToggleSpacedSession = (id: string) => {
    setSpacedSessions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleFinishSpacedRepetition = () => {
    const activeTopic = topicName.trim() || "Topik Spaced Repetition";
    const completedCount = spacedSessions.filter((s) => s.checked).length;

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Add study log
    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      topic: activeTopic,
      technique: "Spaced Repetition",
      duration: completedCount * 12, // 12 mins estimated per checked review
      timestamp: timestampStr,
      noteExcerpt: `Review terjadwal terfokus. ${completedCount} dari 5 fase review tercentang.`,
    };

    setLogs((prev) => [newLog, ...prev]);

    // Update global hours (adding 15 mins total = 0.25h)
    setStudyHours((prev) => Number((prev + 0.25).toFixed(1)));

    // Push into Global Calendar!
    const agendaAdded: AgendaItem = {
      id: "agenda-spaced-" + Date.now(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Ruang Belajar: Spaced Rep [${activeTopic}] (${completedCount}/5 Lunas)`,
      location: "Fase Review Terjadwal",
      type: "discussion",
      color: "teal",
    };
    setAgenda((prev) => [...prev, agendaAdded]);

    setSuccessBannerText(
      `Sesi Spaced Repetition "${activeTopic}" (${completedCount}/5 selesai) berhasil dicatat ke Kalender!`,
    );
    setShowProgressSuccessBanner(true);

    // Reset topic
    setTopicName("");
    setSpacedSessions((prev) =>
      prev.map((s, idx) =>
        idx === 0 ? { ...s, checked: true } : { ...s, checked: false },
      ),
    );
  };

  // 4. ACTIVE RECALL STATE (FLASHCARDS)
  const [flashcards, setFlashcards] = useState(() => {
    return [
      {
        id: "fc-1",
        question: "Konsep Inti: Apa perbedaan mendasar Stack vs Queue?",
        answer:
          "Stack menggunakan prinsip LIFO (Last In First Out) seperti tumpukan buku, sedangkan Queue menggunakan FIFO (First In First Out) seperti antrean loket tiket.",
        flipped: false,
        correct: null as boolean | null,
      },
      {
        id: "fc-2",
        question:
          "Metode: Mengapa Binary Search memerlukan data yang sudah terurut?",
        answer:
          "Karena Binary Search membandingkan elemen tengah dan memutuskan arah pencarian (kiri atau kanan) secara biner. Jika data acak, pembatalan setengah populasi data tidak valid secara logis.",
        flipped: false,
        correct: null as boolean | null,
      },
      {
        id: "fc-3",
        question:
          "Fakta: Apa tujuan utama dari Normalisasi Database (1NF sampai 3NF)?",
        answer:
          "Meminimalkan redundansi data (duplikasi pengulangan), mencegah anomali data (saat insert/update/delete), dan mengoptimalkan integritas referensial antartabel.",
        flipped: false,
        correct: null as boolean | null,
      },
    ];
  });

  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);

  const handleAddFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert("Harap isi pertanyaan dan jawaban kartu!");
      return;
    }
    const newCard = {
      id: "fc-" + Date.now(),
      question: newQuestion,
      answer: newAnswer,
      flipped: false,
      correct: null as boolean | null,
    };
    setFlashcards((prev) => [...prev, newCard]);
    setNewQuestion("");
    setNewAnswer("");
    setShowAddCard(false);
    setCurrentFcIndex(flashcards.length); // go to newly added card
    beep(580, 100);
  };

  const handleFlipCard = (index: number) => {
    beep(540, 80);
    setFlashcards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, flipped: !c.flipped } : c)),
    );
  };

  const handleRateRecall = (index: number, answerCorrect: boolean) => {
    beep(answerCorrect ? 660 : 440, 100);
    setFlashcards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, correct: answerCorrect } : c)),
    );

    // Save logs when rating
    const card = flashcards[index];
    const activeTopic =
      topicName.trim() || card.question.substring(0, 30) + "...";

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      topic: activeTopic,
      technique: "Active Recall",
      duration: 5, // 5 mins of intensive memory extraction
      timestamp: timestampStr,
      noteExcerpt: `Menguji ingatan aktif. Hasil evaluasi: ${answerCorrect ? "BERHASIL DIINGAT" : "PERLU DIULANGI"}. Pertanyaan: "${card.question}"`,
    };

    setLogs((prev) => [newLog, ...prev]);
    setStudyHours((prev) => Number((prev + 0.1).toFixed(1))); // Add minimal hours

    // Add to schedule agenda
    const agendaAdded: AgendaItem = {
      id: "agenda-recall-" + Date.now(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Ruang Belajar: Recall [${activeTopic.substring(0, 30)}] (${answerCorrect ? "Ingat" : "Ulang"})`,
      location: "Dek Memori Kilat",
      type: "discussion",
      color: "pink",
    };
    setAgenda((prev) => [...prev, agendaAdded]);

    setSuccessBannerText(
      `Aktivitas Active Recall terekam di Jadwal sebagai "${answerCorrect ? "Berhasil Mengingat" : "Perlu Belajar Ulang"}".`,
    );
    setShowProgressSuccessBanner(true);

    // Auto proceed to next card if available after a brief moment
    if (index < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentFcIndex(index + 1);
      }, 800);
    }
  };

  const handleDeleteFlashcard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ type: 'flashcard', id });
  };

  const executeDeleteFlashcard = (id: string) => {
    const updated = flashcards.filter((fc) => fc.id !== id);
    setFlashcards(updated);
    if (currentFcIndex >= updated.length && updated.length > 0) {
      setCurrentFcIndex(updated.length - 1);
    }
    setDeleteConfirm(null);
  };

  // 5. TEKNIK CORNELL (THE FISCHLER) STATE
  const [cornellLeft, setCornellLeft] = useState("");
  const [cornellRight, setCornellRight] = useState("");
  const [cornellSummary, setCornellSummary] = useState("");

  const handleSaveCornellNotes = () => {
    const activeTopic = topicName.trim() || "Catatan Terstruktur";

    if (!cornellLeft.trim() && !cornellRight.trim() && !cornellSummary.trim()) {
      alert(
        "Harap ketik catatan Cornell Anda di salah satu bagian sebelum menyimpan.",
      );
      return;
    }

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      topic: activeTopic,
      technique: "Catatan Cornell",
      duration: 30, // 30 minutes of structuring
      timestamp: timestampStr,
      noteExcerpt: cornellSummary
        ? `Rangkuman: ${cornellSummary.substring(0, 110)}...`
        : `Catatan Inti: ${cornellRight.substring(0, 100)}...`,
    };

    setLogs((prev) => [newLog, ...prev]);
    setStudyHours((prev) => Number((prev + 0.5).toFixed(1))); // 30 mins = 0.5 hours

    // Add to schedule agenda
    const agendaAdded: AgendaItem = {
      id: "agenda-cornell-" + Date.now(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Ruang Belajar: Cornell Notes [${activeTopic}] Disimpan`,
      location: "Dokumen Pembelajaran",
      type: "class",
      color: "purple",
    };
    setAgenda((prev) => [...prev, agendaAdded]);

    setSuccessBannerText(
      `Hebat! Catatan terstruktur Cornell "${activeTopic}" disimpan, berdurasi 30 menit belajar!`,
    );
    setShowProgressSuccessBanner(true);

    // Reset notes
    setCornellLeft("");
    setCornellRight("");
    setCornellSummary("");
    setTopicName("");
  };

  // Clickable Daily Log Details Modal state
  const [selectedDayNode, setSelectedDayNode] = useState<{
    day: string;
    count: number;
    techs: string[];
    logsList: Array<{
      topic: string;
      technique: string;
      duration: number;
      time: string;
      focusNote?: string;
    }>;
  } | null>(null);

  // 6. TIMEBOXING (EAT THE FROG) STATE
  const [timeboxDuration, setTimeboxDuration] = useState(60); // default 60 minutes
  const [timeboxMinutes, setTimeboxMinutes] = useState(60);
  const [timeboxSeconds, setTimeboxSeconds] = useState(0);
  const [isTimeboxRunning, setIsTimeboxRunning] = useState(false);
  const [frogTask, setFrogTask] = useState("");

  const timeboxIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if duration change
  useEffect(() => {
    if (!isTimeboxRunning) {
      setTimeboxMinutes(timeboxDuration);
      setTimeboxSeconds(0);
    }
  }, [timeboxDuration]);

  // Timer loop mechanics for Timebox
  useEffect(() => {
    if (isTimeboxRunning) {
      timeboxIntervalRef.current = setInterval(() => {
        if (timeboxSeconds > 0) {
          setTimeboxSeconds((prev) => prev - 1);
        } else if (timeboxMinutes > 0) {
          setTimeboxMinutes((prev) => prev - 1);
          setTimeboxSeconds(59);
        } else {
          triggerTimeboxEnd();
        }
      }, 1000);
    } else {
      if (timeboxIntervalRef.current) clearInterval(timeboxIntervalRef.current);
    }

    return () => {
      if (timeboxIntervalRef.current) clearInterval(timeboxIntervalRef.current);
    };
  }, [isTimeboxRunning, timeboxMinutes, timeboxSeconds]);

  const triggerTimeboxEnd = () => {
    setIsTimeboxRunning(false);
    beep(523.25, 400);
    setTimeout(() => beep(659.25, 500), 200);

    const activeFrog =
      frogTask.trim() || topicName.trim() || "Selesaikan Sesi Timeboxing Utama";
    const durationEarned = timeboxDuration;

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      topic: activeFrog,
      technique: "Timeboxing",
      duration: durationEarned,
      timestamp: timestampStr,
      noteExcerpt: `Berhasil menaklukan Katak Terbesar (Eat the Frog) dalam timebox absolut selama ${durationEarned} menit.`,
    };

    setLogs((prev) => [newLog, ...prev]);

    // Update global hours
    const hoursAdded = Number((durationEarned / 60).toFixed(2));
    setStudyHours((prev) => Number((prev + hoursAdded).toFixed(1)));

    // Add to schedule agenda
    const agendaAdded: AgendaItem = {
      id: "agenda-timebox-" + Date.now(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Ruang Belajar: Timebox [${activeFrog.substring(0, 30)}] Tuntas`,
      location: "Fokus Absolut Mandiri",
      type: "discussion",
      color: "pink",
    };
    setAgenda((prev) => [...prev, agendaAdded]);

    setSuccessBannerText(
      `Luar biasa! Timebox "${activeFrog}" (${durationEarned}m) selesai & tercatat di Jadwal!`,
    );
    setShowProgressSuccessBanner(true);

    // Reset default values
    setTimeboxMinutes(timeboxDuration);
    setTimeboxSeconds(0);
    setFrogTask("");
    setTopicName("");
  };

  // STATS GRAPHICS COMPUTATION
  const totalMinStudied = logs.reduce((acc, curr) => acc + curr.duration, 0);
  const pomodoroCount = logs.filter((l) => l.technique === "Pomodoro").length;
  const feynmanCount = logs.filter((l) => l.technique === "Feynman").length;
  const totalCompletedSessions = logs.length;

  const handleDeleteLog = (id: string) => {
    setDeleteConfirm({ type: 'log', id });
  };

  const executeDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setDeleteConfirm(null);
  };

  const handleDayClick = (
    dayNode: { day: string; count: number; techs: string[] },
    index: number,
  ) => {
    beep(523, 80); // Cheerful feedback acoustic sound

    let list: Array<{
      topic: string;
      technique: string;
      duration: number;
      time: string;
      focusNote?: string;
    }> = [];

    const dayName = dayNode.day.toLowerCase();
    const matchedLogs = logs.filter((l) => {
      if (!l.timestamp) return false;
      return l.timestamp.toLowerCase().includes(dayName);
    });

    if (matchedLogs.length > 0) {
      list = matchedLogs.map((l) => ({
        topic: l.topic,
        technique: l.technique,
        duration: l.duration,
        time: l.timestamp.split(", ")[1] || "Baru Saja",
        focusNote:
          l.noteExcerpt ||
          "Sesi belajar mandiri tuntas direkam dengan selamat.",
      }));
    } else {
      list = [
        {
          topic: `Belum Ada Sesi Hari ${dayNode.day}`,
          technique: "Yuk Mulai",
          duration: 0,
          time: "--:--",
          focusNote:
            "Silakan pilih modul pembelajaran di atas dan jalankan Pomodoro atau Feynman untuk mulai merekam jejak belajar Anda!",
        },
      ];
    }

    setSelectedDayNode({
      day: dayNode.day,
      count: matchedLogs.length,
      techs: Array.from(new Set(matchedLogs.map((l) => l.technique))),
      logsList: list,
    });
  };

  // Helper for applying text formatting to textareas
  const formatText = (
    setText: (val: string) => void,
    value: string,
    formatType:
      | "bold"
      | "italic"
      | "underline"
      | "strikethrough"
      | "bullet"
      | "number"
      | "highlight"
      | "quote",
    elementId: string,
  ) => {
    beep(523, 60); // acoustic feedback on click
    const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = "";

    switch (formatType) {
      case "bold":
        newText = `**${selectedText || "teks_tebal"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "teks_miring"}*`;
        break;
      case "underline":
        newText = `<u>${selectedText || "teks_garisbawah"}</u>`;
        break;
      case "strikethrough":
        newText = `~~${selectedText || "teks_gariscoret"}~~`;
        break;
      case "bullet":
        if (selectedText) {
          newText = selectedText
            .split("\n")
            .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
            .join("\n");
        } else {
          newText = "- Poin Catatan";
        }
        break;
      case "number":
        if (selectedText) {
          newText = selectedText
            .split("\n")
            .map((line, idx) => {
              const match = line.match(/^(\d+)\.\s+/);
              return match ? line : `${idx + 1}. ${line}`;
            })
            .join("\n");
        } else {
          newText = "1. Poin Catatan";
        }
        break;
      case "highlight":
        newText = `==${selectedText || "sorotan"}==`;
        break;
      case "quote":
        if (selectedText) {
          newText = selectedText
            .split("\n")
            .map((line) => (line.startsWith("> ") ? line : `> ${line}`))
            .join("\n");
        } else {
          newText = "> Kutipan pembelajar";
        }
        break;
    }

    const updatedValue =
      value.substring(0, start) + newText + value.substring(end);
    setText(updatedValue);

    // Focus set selection back
    setTimeout(() => {
      textarea.focus();
      const newSelStart = start;
      const newSelEnd = start + newText.length;
      textarea.setSelectionRange(newSelStart, newSelEnd);
    }, 10);
  };

  // Parsing & showing rich formatting on active review modes
  const renderInlineStyles = (text: string) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|<u>.*?<\/u>|==.*?==)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("~~") && part.endsWith("~~")) {
        return (
          <del key={i} className="line-through text-slate-400">
            {part.slice(2, -2)}
          </del>
        );
      }
      if (part.startsWith("<u>") && part.endsWith("</u>")) {
        return (
          <span
            key={i}
            className="underline decoration-indigo-400 decoration-1"
          >
            {part.slice(3, -4)}
          </span>
        );
      }
      if (part.startsWith("==") && part.endsWith("==")) {
        return (
          <mark
            key={i}
            className="bg-amber-100 text-amber-900 px-1 rounded-sm font-bold"
          >
            {part.slice(2, -2)}
          </mark>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    if (!text)
      return (
        <p className="text-slate-400 italic text-[11px]">
          Belum ada tulisan... Mulai mengetik dan gunakan alat bantu format di
          atas.
        </p>
      );
    const lines = text.split("\n");
    return (
      <div className="space-y-1 text-left text-xs text-slate-700 leading-relaxed font-semibold">
        {lines.map((line, idx) => {
          let isList = false;
          let content = line;
          let listPrefix = null;

          if (line.trim().startsWith("- ")) {
            isList = true;
            content = line.trim().substring(2);
            listPrefix = <span className="text-[#FF2D75] mr-2">•</span>;
          } else {
            const numMatch = line.trim().match(/^(\d+)\.\s+/);
            if (numMatch) {
              isList = true;
              content = line.trim().substring(numMatch[0].length);
              listPrefix = (
                <span className="text-indigo-600 mr-1.5 font-black font-sans">
                  {numMatch[1]}.
                </span>
              );
            }
          }

          if (line.trim().startsWith("> ")) {
            isList = false;
            content = line.trim().substring(2);
            return (
              <div
                key={idx}
                className="border-l-2 border-indigo-400 pl-2 my-1 text-slate-500 italic bg-slate-50 py-1 rounded-r-lg font-medium"
              >
                {renderInlineStyles(content)}
              </div>
            );
          }

          const renderedLine = renderInlineStyles(content);
          if (isList) {
            return (
              <div key={idx} className="flex items-start pl-1">
                {listPrefix}
                <div className="flex-1">{renderedLine}</div>
              </div>
            );
          }
          return (
            <p key={idx} className="min-h-[1.2em]">
              {renderedLine}
            </p>
          );
        })}
      </div>
    );
  };

  // Timer format display helper
  const formatTimerDigits = (num: number) => String(num).padStart(2, "0");

  // Math for circle SVG indicator
  // total seconds preset
  const activeSecondsLeft = pomodoroMinutes * 60 + pomodoroSeconds;
  const percentLeft =
    totalTimerDuration > 0 ? (activeSecondsLeft / totalTimerDuration) * 100 : 0;
  const circleRadius = 78;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circleCircumference - (percentLeft / 100) * circleCircumference;

  // Math for Timebox circle SVG indicator
  const activeTimeboxSecondsLeft = timeboxMinutes * 60 + timeboxSeconds;
  const totalTimeboxSecondsPreset = timeboxDuration * 60;
  const timeboxPercentLeft =
    totalTimeboxSecondsPreset > 0
      ? (activeTimeboxSecondsLeft / totalTimeboxSecondsPreset) * 100
      : 0;
  const timeboxStrokeDashoffset =
    circleCircumference - (timeboxPercentLeft / 100) * circleCircumference;

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Title block */}
      <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black font-display text-slate-900 leading-tight">
              Ruang Belajar{" "}
              <Brain className="text-[#FF2D75] inline-block align-middle ml-1.5" size={24} />
            </h1>
          </div>
          <p className="text-xs text-slate-500 leading-normal font-semibold">
            Pusat optimalisasi produktivitas belajar Anda secara mandiri
            menggunakan teknik kognitif terbaik dunia.
          </p>

          {/* Quick-Access Banner for Suara Teks */}
          <div className="pt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-black font-black tracking-wider">
              AKSES FITUR UTAMA:
            </span>
            <button
              type="button"
              onClick={() => {
                if (setTab) {
                  setTab("Suara Teks");
                }
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FF2D75] hover:bg-pink-600 text-white rounded-xl shadow-md transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 border border-pink-400"
            >
              <Mic size={13} className="text-white animate-pulse" />
              <span className="text-xs font-black">
                Suara Teks (Live Memo)
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound switch */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              soundEnabled
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-slate-50 text-slate-400 border-slate-250"
            }`}
            title={soundEnabled ? "Suara Aktif" : "Suara Senyap"}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <div className="bg-white/90 border border-slate-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xs">
            <Clock
              size={14}
              className="text-pink-500 animate-spin"
              style={{ animationDuration: "6s" }}
            />
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-400 font-black block">
                PROGRES BULANAN
              </span>
              <span className="text-xs font-bold font-sans text-slate-800">
                {studyHours} dari {targetStudyHours} Jam
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP COMPLETED BANNER */}
      <AnimatePresence>
        {showProgressSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="bg-green-50/90 backdrop-blur-md border border-green-200/90 p-4.5 rounded-3xl flex items-start gap-3.5 relative overflow-hidden shadow-md"
          >
            <div className="w-9 h-9 rounded-full bg-green-150 flex items-center justify-center shrink-0 border border-green-200/50 shadow-xs">
              <Award className="text-green-600 animate-bounce" size={17} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-extrabold text-xs text-green-800">
                Umpan Balik Kognitif Sukses!
              </h4>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                {successBannerText}
              </p>
            </div>
            <button
              onClick={() => setShowProgressSuccessBanner(false)}
              className="text-xs text-slate-400 hover:text-slate-800 font-black cursor-pointer bg-white px-2.5 py-1 border border-slate-150 rounded-lg shadow-2xs"
            >
              Tutup
            </button>
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-400/5 rounded-full pointer-events-none transform translate-x-4 -translate-y-4"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE CONFIGURATION AREA: POMODORO vs FEYNMAN SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COMPACT PANEL (TECH SELECTION DETAILS) - 4 COLS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-3.5">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              PILIH TEKNIK BELAJAR
            </h3>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {/* Pomodoro selection card */}
              <button
                type="button"
                onClick={() => setSelectedTech("pomodoro")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "pomodoro"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "pomodoro"
                      ? "bg-pink-500 text-white"
                      : "bg-pink-50 text-pink-500"
                  }`}
                >
                  <Clock size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">1. Teknik Pomodoro</h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "pomodoro"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Blok fokus terstruktur (25 menit belajar & 5 menit
                    istirahat).
                  </p>
                </div>
                {selectedTech === "pomodoro" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                )}
              </button>

              {/* Feynman selection card */}
              <button
                type="button"
                onClick={() => setSelectedTech("feynman")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "feynman"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "feynman"
                      ? "bg-purple-500 text-white"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  <Brain size={16} />
                </div>
                <div className="space-y-0.5 font-sans">
                  <h4 className="font-extrabold text-xs">2. Teknik Feynman</h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "feynman"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Sederhanakan materi kompleks seolah diajarkan ke anak kecil
                    berusia 8 tahun.
                  </p>
                </div>
                {selectedTech === "feynman" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                )}
              </button>

              {/* Spaced Repetition card */}
              <button
                type="button"
                onClick={() => setSelectedTech("spaced")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "spaced"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "spaced"
                      ? "bg-teal-500 text-white"
                      : "bg-teal-50 text-teal-600"
                  }`}
                >
                  <Layers size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">
                    3. Spaced Repetition
                  </h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "spaced"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Belajar dalam beberapa sesi singkat berjarak berkala (1, 3,
                    7, 14 hari).
                  </p>
                </div>
                {selectedTech === "spaced" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                )}
              </button>

              {/* Active Recall card */}
              <button
                type="button"
                onClick={() => setSelectedTech("recall")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "recall"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "recall"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <Bookmark size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">4. Active Recall</h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "recall"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Gali memori otak secara aktif lewat kuis mandiri & deck
                    kartu kilat.
                  </p>
                </div>
                {selectedTech === "recall" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
              </button>

              {/* Cornell Notes card */}
              <button
                type="button"
                onClick={() => setSelectedTech("cornell")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "cornell"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "cornell"
                      ? "bg-[#FF2D75] text-white"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <Columns size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">
                    5. Catatan Cornell (Fischler)
                  </h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "cornell"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Format 3 bagian: kata kunci di kiri, catatan inti di kanan,
                    rangkuman di bawah.
                  </p>
                </div>
                {selectedTech === "cornell" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                )}
              </button>

              {/* Timeboxing card */}
              <button
                type="button"
                onClick={() => setSelectedTech("timeboxing")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "timeboxing"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "timeboxing"
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <Flame size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">
                    6. Timeboxing (Eat the Frog)
                  </h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "timeboxing"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Tetapkan batas waktu absolut (60 menit) tanpa jeda demi
                    menaklukan tugas tersulit.
                  </p>
                </div>
                {selectedTech === "timeboxing" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                )}
              </button>

              {/* Mind Mapping card */}
              <button
                type="button"
                onClick={() => setSelectedTech("mind-mapping")}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                  selectedTech === "mind-mapping"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
                    : "bg-white/60 hover:bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                    selectedTech === "mind-mapping"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <GitBranch size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs">7. Mind Mapping</h4>
                  <p
                    className={`text-[10px] leading-normal ${
                      selectedTech === "mind-mapping"
                        ? "text-slate-305 text-slate-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    Visualisasikan peta konsep riset & materi kuliah lewat
                    kanvas interaktif.
                  </p>
                </div>
                {selectedTech === "mind-mapping" && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>

            {/* Explain the active method simply and comprehensively */}
            <div className="bg-white/45 backdrop-blur-md rounded-2xl p-4 text-left border border-white/60 space-y-2 mt-4 shadow-xs">
              <span className="text-[9px] font-black uppercase text-[#FF2D75] tracking-widest block">
                CARA KERJA METODE
              </span>

              {selectedTech === "pomodoro" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Pomodoro 25/5 Cycle
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Diciptakan oleh Francesco Cirillo, teknik ini melatih otak
                    untuk fokus maksimal dalam rentang waktu terukur (25 menit),
                    dilanjutkan istirahat singkat (5 menit) guna memulihkan
                    tingkat konsentrasi.
                  </p>
                </div>
              )}

              {selectedTech === "feynman" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Feynman Mental Framework
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Sangat cocok untuk memahami materi yang rumit. Caranya
                    adalah dengan mempelajari suatu topik, lalu jelaskan konsep
                    tersebut menggunakan bahasa yang sangat
                    sederhana—seolah-olah kamu sedang mengajarkannya kepada anak
                    kecil. Jika kamu kesulitan menjelaskannya, berarti ada
                    bagian materi yang belum kamu pahami sepenuhnya.
                  </p>
                </div>
              )}

              {selectedTech === "spaced" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Spaced Repetition
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Sangat ideal untuk persiapan ujian dan menghafal jangka
                    panjang. Alih-alih belajar dalam sistem sks (sistem kebut
                    semalam), pelajari materi dalam beberapa sesi singkat yang
                    berjarak secara berkala (misal: hari ini, besok, 3 hari
                    kemudian, 7 hari kemudian, lalu 14 hari kemudian).
                  </p>
                </div>
              )}

              {selectedTech === "recall" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Active Recall
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Metode ini berfokus pada menggali informasi dari memori otak
                    secara aktif, bukan sekadar membaca ulang buku atau catatan.
                    Kamu bisa menggunakan flashcard (kartu kilat) atau membuat
                    pertanyaan dari materi yang baru dipelajari dan mencoba
                    menjawabnya tanpa melihat catatan.
                  </p>
                </div>
              )}

              {selectedTech === "cornell" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Teknik Cornell (The Fischler)
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Jika kamu lebih suka metode pencatatan yang terstruktur,
                    cobalah teknik Cornell. Bagi kertas menjadi tiga bagian:
                    kolom kiri untuk kata kunci/pertanyaan, kolom kanan untuk
                    catatan inti selama belajar, dan bagian bawah untuk
                    merangkum seluruh materi menggunakan bahasamu sendiri.
                  </p>
                </div>
              )}

              {selectedTech === "timeboxing" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Timeboxing (Eat the Frog)
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Alternatif yang lebih luwes dibanding Pomodoro. Kamu
                    menetapkan batas waktu absolut (misalnya 60 menit) untuk
                    menyelesaikan satu tugas spesifik dan wajib mengerjakannya
                    tanpa henti hingga waktu tersebut habis. Prioritaskan tugas
                    paling menantang terlebih dahulu!
                  </p>
                </div>
              )}

              {selectedTech === "live-memo" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Catatan Kelas (Live Memo)
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Satukan seluruh rincian penjelasan dosen dengan asisten
                    verbatim pintar. Rekam & transkripsikan audio penjelasan
                    dosen saat di kelas langsung ke notepad, tandai pointer
                    penting, sematkan tugas/PR, atau rancang draf dengan
                    template terstruktur dengan rapi.
                  </p>
                </div>
              )}

              {selectedTech === "mind-mapping" && (
                <div className="space-y-1.5 leading-relaxed">
                  <h5 className="font-extrabold text-xs text-slate-800">
                    Mind Mapping (Peta Pikiran)
                  </h5>
                  <p className="text-[10px] text-slate-550 font-bold leading-normal">
                    Visualisasikan hubungan antarkonsep secara hierarkis pada
                    kanvas tanpa batas. Tambahkan sub-node, atur posisi secara
                    fleksibel lewat drag-and-drop, serta lengkapi node dengan
                    checklist tugas, catatan, dan gambar inspirasi.
                  </p>
                </div>
              )}
            </div>

            {/* Shared Subject input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                TOPIK / MATA KULIAH BELAJAR:
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="cth: Statistika Inferensial No. 3"
                className="w-full text-xs font-extrabold px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-hidden focus:border-slate-800 text-slate-800 focus:shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* RIGHT DISPLAY PANEL (ACTIVE WORKING WINDOWS) - 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* 1. POMODORO UI INTERFACE */}
            {selectedTech === "pomodoro" && (
              <motion.div
                key="pomodoro-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-6.5 rounded-3xl border border-white/60 shadow-xs space-y-6 text-center"
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-pink-500" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Timer Fokus Kontrol
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-black px-2.5 py-0.5 rounded-md ${
                      isBreak
                        ? "bg-amber-100 text-amber-700"
                        : "bg-pink-100 text-[#FF2D75]"
                    }`}
                  >
                    {isBreak ? "Mode Istirahat" : "Sesi Fokus Kerja"}
                  </span>
                </div>

                {/* Sub presets selectors */}
                <div className="flex justify-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset("focus")}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                      timerPresetIndex === "focus"
                        ? "bg-pink-500 text-white border-pink-500 shadow-md"
                        : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                    }`}
                  >
                    🎯 Fokus Pomodoro ({customFocusDuration}m)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("shortBreak")}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                      timerPresetIndex === "shortBreak"
                        ? "bg-amber-400 text-slate-900 border-amber-400 shadow-md"
                        : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                    }`}
                  >
                    ☕ Istirahat Pendek ({customBreakDuration}m)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("longBreak")}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                      timerPresetIndex === "longBreak"
                        ? "bg-teal-500 text-white border-teal-500 shadow-md"
                        : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                    }`}
                  >
                    🌴 Istirahat Panjang (15m)
                  </button>
                </div>

                {/* 3D Circular Clock Dial View */}
                <div className="flex justify-center py-4 relative">
                  <div className="w-56 h-56 rounded-full iridescent-timer-bubble flex items-center justify-center p-3 relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <defs>
                        <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#FF2D75" />
                        </linearGradient>
                        <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                      </defs>

                      {/* Inner fine decorative guideline ring */}
                      <circle
                        cx="96"
                        cy="96"
                        r={circleRadius - 12}
                        className="stroke-slate-200/50"
                        strokeWidth="1"
                        fill="transparent"
                      />

                      {/* Radial analog tick marks (12 hours divisions) */}
                      {Array.from({ length: 12 }).map((_, index) => {
                        const angle = (index * 30 * Math.PI) / 180;
                        const x1 = 96 + Math.cos(angle) * 83;
                        const y1 = 96 + Math.sin(angle) * 83;
                        const x2 = 96 + Math.cos(angle) * 89;
                        const y2 = 96 + Math.sin(angle) * 89;
                        return (
                          <line
                            key={index}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            className="stroke-slate-300/60"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Track path */}
                      <circle
                        cx="96"
                        cy="96"
                        r={circleRadius}
                        className="stroke-slate-200/40"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Running percentage path */}
                      <circle
                        cx="96"
                        cy="96"
                        r={circleRadius}
                        stroke={isBreak ? "url(#breakGrad)" : "url(#focusGrad)"}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                          transition:
                            "stroke-dashoffset 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
                        }}
                      />
                    </svg>

                    {/* Centered Numbers - Highly polished contrast for white iridescent bubble */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
                      <span className="text-4xl font-black font-sans text-slate-800 leading-none tracking-tight">
                        {formatTimerDigits(pomodoroMinutes)}:
                        {formatTimerDigits(pomodoroSeconds)}
                      </span>

                      {/* Percentage capsule */}
                      <span className="text-[8.5px] font-extrabold font-sans px-2 py-0.5 rounded-full bg-slate-500/5 text-slate-600 mt-2 mb-1.5 leading-none border border-slate-500/10 backdrop-blur-xs">
                        {Math.round(percentLeft)}% Selesai
                      </span>

                      <span
                        className={`text-[8.5px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs ${
                          isTimerRunning
                            ? isBreak
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-[#FF2D75] text-white shadow-xs"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isTimerRunning
                          ? isBreak
                            ? "ISTIRAHAT"
                            : "TEKNIK POMODORO"
                          : "PAUSED"}
                      </span>
                    </div>

                    {/* Fun pulsing dots for real environment feedback */}
                    <AnimatePresence>
                      {isTimerRunning && (
                        <motion.div
                          className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-20"
                          style={{ top: "15%", left: "48%" }}
                          animate={{
                            scale: [1, 2.2, 1],
                            opacity: [0.4, 0.95, 0.4],
                          }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Controls buttons */}
                <div className="flex justify-center items-center gap-4.5">
                  <button
                    type="button"
                    onClick={() => {
                      beep(430, 100);
                      applyPreset(timerPresetIndex);
                    }}
                    className="p-3 bg-white hover:bg-slate-50 hover:text-slate-800 border border-slate-200 text-slate-500 rounded-full cursor-pointer shadow-2xs transition-all hover:scale-105"
                    title="Atur Ulang Pengukur"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      beep(isTimerRunning ? 500 : 540, 120);
                      setIsTimerRunning(!isTimerRunning);
                    }}
                    className={`px-7 py-3 rounded-full text-xs font-black tracking-wide cursor-pointer shadow-md transition-all flex items-center gap-2 transform active:scale-95 ${
                      isTimerRunning
                        ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                        : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:scale-102"
                    }`}
                  >
                    {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                    {isTimerRunning ? "Jeda Fokus" : "Mulai Konsentrasi"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Manual bypass to trigger session end instantly for fast test/user rating!
                      if (
                        confirm(
                          "Ingin menyelesaikan waktu belajar (bypass/selesai awal) seketika untuk pengetesan?",
                        )
                      ) {
                        triggerTimerEnd();
                      }
                    }}
                    className="text-[9px] font-black border border-pink-200 bg-pink-50/50 hover:bg-pink-100 text-[#FF2D75] px-2.5 py-1.5 rounded-lg cursor-pointer transition-all uppercase"
                    title="Selesaikan waktu belajar instan"
                  >
                    Instan Selesai
                  </button>
                </div>

                {/* Adjustable customize parameters inputs block */}
                <div className="bg-slate-100/40 border border-slate-200/60 p-4.5 rounded-3xl text-left grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-500 block">
                      FOKUS POMODORO (MENIT)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={customFocusDuration}
                        onChange={(e) =>
                          setCustomFocusDuration(
                            Math.max(1, Number(e.target.value)),
                          )
                        }
                        className="w-18 text-xs font-bold font-sans px-2 py-1 border border-slate-300 rounded-lg bg-white"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">
                        menit
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-500 block">
                      ISTIRAHAT PENDEK (MENIT)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customBreakDuration}
                        onChange={(e) =>
                          setCustomBreakDuration(
                            Math.max(1, Number(e.target.value)),
                          )
                        }
                        className="w-18 text-xs font-bold font-sans px-2 py-1 border border-slate-300 rounded-lg bg-white"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">
                        menit
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. FEYNMAN UI INTERFACE */}
            {selectedTech === "feynman" && (
              <motion.div
                key="feynman-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-5"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Brain size={16} className="text-purple-600" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Konsol Pemahaman Feynman
                    </span>
                  </div>

                  {/* Step Indicators */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        onClick={() => setFeynmanStep(step as any)}
                        className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer transition-all ${
                          feynmanStep === step
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub title details steps */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <h4 className="text-xs font-black text-slate-800">
                    {feynmanStep === 1 &&
                      "Langkah 1: Identifikasi Konsep & Menulis Definisi Kasar"}
                    {feynmanStep === 2 &&
                      "Langkah 2: Sederhanakan Seolah Menjelaskan Kepada Anak 8 Tahun"}
                    {feynmanStep === 3 &&
                      "Langkah 3: Perekam Suara Latihan Penjelasan Mandiri (Simulasi)"}
                    {feynmanStep === 4 &&
                      "Langkah 4: Checklist Evaluasi Pemahaman & Gap Kognitif"}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                    {feynmanStep === 1 &&
                      "Ketik konsep inti yang sedang Anda pelajari. Cobalah tuliskan deskripsi paling singkatnya."}
                    {feynmanStep === 2 &&
                      "Tulis analogi sehari-hari. Contoh: Enkapsulasi ibarat kapsul obat melindungi zat aktif di dalamnya dari interaksi langsung."}
                    {feynmanStep === 3 &&
                      "Aktifkan mikrofon dan berbicaralah seolah audiens berdiri di hadapan Anda. Tinjau kembali kejelasan artikulasi Anda."}
                    {feynmanStep === 4 &&
                      "Ulas kembali penjelasan Anda secara kritis. Berikan tanda centang jika kriteria pembuktian pemahaman telah tuntas."}
                  </p>
                </div>

                {/* Inner steps dynamic switch contents */}
                <div>
                  {feynmanStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                          Konsep Inti yang Ingin Dikuasai:
                        </label>
                        <input
                          type="text"
                          value={topicName}
                          onChange={(e) => setTopicName(e.target.value)}
                          placeholder="cth: Cara Kerja Big-O Notation pada Pencarian Binary Search"
                          className="w-full text-xs font-extrabold px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-hidden focus:border-purple-500 focus:shadow-2xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setFeynmanStep(2)}
                        className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1 ml-auto"
                      >
                        Langkah Selanjutnya (2)
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  {feynmanStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label
                            id="feynman-explanation-label"
                            className="text-[10px] font-black text-slate-500 uppercase"
                          >
                            Paparan Sederhana & Analogi Gagasan:
                          </label>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {feynmanExplanation.length} karakter
                          </span>
                        </div>

                        {/* FORMATTING TOOLBAR BAR */}
                        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "bold",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Tebal / Bold (Ctrl+B)"
                          >
                            <Bold size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "italic",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Miring / Italic (Ctrl+I)"
                          >
                            <Italic size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "underline",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Garis Bawah / Underline"
                          >
                            <Underline size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "strikethrough",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Coret / Strikethrough"
                          >
                            <Strikethrough size={13} />
                          </button>

                          <div className="h-5 w-[1px] bg-slate-200 mx-0.5"></div>

                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "bullet",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Bullet List (-)"
                          >
                            <List size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "number",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Numbered List (1.)"
                          >
                            <ListOrdered size={13} />
                          </button>

                          <div className="h-5 w-[1px] bg-slate-200 mx-0.5"></div>

                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "highlight",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-650 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Tanda Sorot / Highlight (==)"
                          >
                            <Highlighter size={13} className="text-amber-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              formatText(
                                setFeynmanExplanation,
                                feynmanExplanation,
                                "quote",
                                "feynman-explanation-textarea",
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-650 transition-all hover:scale-105 cursor-pointer flex items-center justify-center shadow-xs"
                            title="Kutipan / Blockquote (>)"
                          >
                            <Quote size={13} className="text-indigo-500" />
                          </button>

                          <span className="ml-auto text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Alat Bantu Format Aktif
                          </span>
                        </div>

                        <textarea
                          id="feynman-explanation-textarea"
                          rows={5}
                          value={feynmanExplanation}
                          onChange={(e) =>
                            setFeynmanExplanation(e.target.value)
                          }
                          placeholder="Tuliskan di sini... Cth: Bayangkan kamu mencari kata 'Zebra' di kamus tebal. Daripada mengecek halaman satu per satu dari huruf A (mencari linear), kamu langsung membuka bagian tengah kamus, mengecek hurufnya, jika terlalu depan kamu belah menjadi dua bagian lagi. Itu memotong waktu pencarian secara masif!"
                          className="w-full text-xs font-bold leading-relaxed px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-hidden focus:border-purple-500 focus:shadow-2xs h-32 text-slate-800"
                        />

                        {/* LIVE RENDER PREVIEW BOX */}
                        <div className="bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200 text-left space-y-1.5">
                          <span className="text-[8.5px] font-black uppercase text-purple-600 tracking-wider flex items-center gap-1">
                            Pratinjau Hasil Format (Live Preview)
                          </span>
                          <div className="p-2.5 bg-white/70 border border-slate-150 rounded-lg shadow-3xs max-h-36 overflow-y-auto">
                            {renderFormattedText(feynmanExplanation)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFeynmanStep(1)}
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer"
                        >
                          Sebelumnya
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeynmanStep(3)}
                          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          Langkah Selanjutnya (3)
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {feynmanStep === 3 && (
                    <div className="space-y-4 text-center py-2">
                      <p className="text-xs font-extrabold text-slate-700">
                        Latihlah artikulasi suaramu secara lisan.
                      </p>

                      <div className="flex flex-col items-center justify-center gap-4 py-3 bg-slate-50 rounded-2.5xl border border-slate-150">
                        {/* Mic Icon Sphere */}
                        <button
                          type="button"
                          onClick={handleToggleRecording}
                          className={`w-18 h-18 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg transform active:scale-95 ${
                            isRecordingSimulated
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-200"
                          }`}
                        >
                          {isRecordingSimulated ? (
                            <MicOff size={24} />
                          ) : (
                            <Mic size={24} />
                          )}
                        </button>

                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider block ${
                              isRecordingSimulated
                                ? "text-red-500"
                                : "text-indigo-600"
                            }`}
                          >
                            {isRecordingSimulated
                              ? "● MEREKAM AKTIF..."
                              : "SIAP MEREKAM"}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold px-4 max-w-sm">
                            {isRecordingSimulated
                              ? "Mulai jelaskan konsep sulitnya lewat suara keras. Tekan tombol jika sudah tuntas memaparkan."
                              : "Klik tombol mic di atas untuk memulai simulasi pengumpulan perekaman audio penjelasan materi."}
                          </p>
                        </div>

                        {/* Microphone waves simulator output */}
                        {isRecordingSimulated && (
                          <div className="flex justify-center items-end gap-1 px-4 h-8">
                            {micVisualBars.map((height, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-[#FF2D75] rounded-full"
                                style={{ height: `${height}%` }}
                                transition={{ ease: "easeInOut" }}
                              />
                            ))}
                          </div>
                        )}

                        {simulatedVoiceLog && (
                          <div className="mx-4 p-2.5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-2">
                            <span className="text-xs">💾</span>
                            <span className="text-[10px] font-sans text-green-800 font-extrabold">
                              {simulatedVoiceLog}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                beep(400, 100);
                                setSimulatedVoiceLog(null);
                              }}
                              className="text-[9px] font-black text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFeynmanStep(2)}
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer"
                        >
                          Sebelumnya
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeynmanStep(4)}
                          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          Langkah Selanjutnya (4)
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {feynmanStep === 4 && (
                    <div className="space-y-4 text-left">
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          INSTRUMEN EVALUASI PEMAHAMAN MANDIRI:
                        </label>

                        <div className="space-y-2">
                          {evaluationChecklist.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleEvaluation(item.id)}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                item.checked
                                  ? "bg-purple-50/50 border-purple-200 text-purple-950"
                                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <div
                                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                  item.checked
                                    ? "bg-purple-500 border-purple-500 text-white animate-pulse"
                                    : "border-slate-300"
                                }`}
                              >
                                {item.checked && <Check size={11} />}
                              </div>
                              <span className="text-[11px] font-extrabold">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-150">
                        <button
                          type="button"
                          onClick={() => setFeynmanStep(3)}
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer"
                        >
                          Sebelumnya
                        </button>
                        <button
                          type="button"
                          onClick={handleFinishFeynmanSession}
                          className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-150 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1.5 ml-auto"
                        >
                          <Save size={13} />
                          Tandai Selesai Sesi Feynman
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. SPACED REPETITION UI INTERFACE */}
            {selectedTech === "spaced" && (
              <motion.div
                key="spaced-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-5"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Layers size={16} className="text-teal-600" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Spaced Repetition Scheduler
                    </span>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-700">
                    Fase Pengulangan Berkala
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1">
                  <h4 className="text-xs font-black text-slate-800">
                    Sistem Belajar Mengatasi Lupa (Forgetting Curve)
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold text-slate-500">
                    Alih-alih merutinkan SKS (Kebut Semalam), pecah pemahaman
                    Anda menjadi beberapa interval pengulangan di bawah ini.
                    Centang tiap kali Anda meninjau ulang topik ini!
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    INTERVAL SESI & RENCANA REVIEW:
                  </p>

                  <div className="space-y-2">
                    {spacedSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleToggleSpacedSession(session.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          session.checked
                            ? "bg-teal-50/50 border-teal-200 text-teal-950"
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                              session.checked
                                ? "bg-teal-500 border-teal-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {session.checked && <Check size={11} />}
                          </div>
                          <span className="text-xs font-bold">
                            {session.label}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md ${
                            session.checked
                              ? "bg-teal-100 text-teal-850"
                              : "bg-slate-100 text-slate-505"
                          }`}
                        >
                          {session.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-150">
                  <span className="text-[10px] text-slate-400 font-bold block text-left">
                    *Mencatatkan progres akan menambah durasi belajar mandiri
                    Anda secara visual.
                  </span>
                  <button
                    type="button"
                    onClick={handleFinishSpacedRepetition}
                    className="py-2.5 px-5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-100 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1.5 ml-auto"
                  >
                    <Save size={13} />
                    Simpan Sesi Spaced Repetition
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. ACTIVE RECALL UI INTERFACE */}
            {selectedTech === "recall" && (
              <motion.div
                key="recall-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-5"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Bookmark size={16} className="text-amber-600" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Active Recall Flashcards
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCard(!showAddCard)}
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg font-black transition-all shadow-2xs"
                  >
                    {showAddCard ? "Kembali Ke Dek" : "+ Tambah Kartu Baru"}
                  </button>
                </div>

                {showAddCard ? (
                  <div className="space-y-4 text-left">
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-bold">
                      Tuliskan pertanyaan penguji di bagian depan, lalu kunci
                      jawabannya di bagian belakang untuk melatih daya ingat
                      Anda secara mandiri.
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">
                          Pertanyaan (Sisi Depan):
                        </label>
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Cth: Apa kompleksitas waktu terburuk dari Bubble Sort?"
                          className="w-full text-xs font-extrabold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">
                          Jawaban Kunci (Sisi Belakang):
                        </label>
                        <textarea
                          rows={3}
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          placeholder="Cth: O(n^2) karena memerlukan nested loops untuk membandingkan semua pasangan elemen."
                          className="w-full text-xs font-bold leading-normal px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 h-20 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCard(false)}
                        className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-slate-700 rounded-lg text-xs font-black"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddFlashcard}
                        className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black shadow-xs"
                      >
                        Simpan Kartu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {flashcards.length > 0 ? (
                      <div className="space-y-5">
                        {/* Flashcard Card with Flip Effect Style */}
                        <div
                          onClick={() => handleFlipCard(currentFcIndex)}
                          className="min-h-48 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/20 hover:bg-amber-50/30 p-6 flex flex-col items-center justify-center relative cursor-pointer transition-all shadow-2xs group"
                        >
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-black rounded-md tracking-wider">
                            KARTU {currentFcIndex + 1} DARI {flashcards.length}
                          </span>

                          <button
                            type="button"
                            onClick={(e) =>
                              handleDeleteFlashcard(
                                flashcards[currentFcIndex].id,
                                e,
                              )
                            }
                            className="absolute top-2 right-2 p-1.5 hover:bg-pink-50 text-slate-400 hover:text-[#FF2D75] rounded-lg transition-all"
                            title="Hapus Kartu ini"
                          >
                            <Trash2 size={13} className="text-[#FF2D75]" />
                          </button>

                          <div className="text-center space-y-3 px-4 py-2">
                            <span className="text-[9px] font-black uppercase text-amber-600 block tracking-widest leading-none">
                              {flashcards[currentFcIndex].flipped
                                ? "SISI BELAKANG (JAWABAN)"
                                : "SISI DEPAN (PERTANYAAN)"}
                            </span>

                            <p className="text-xs font-extrabold text-slate-800 leading-relaxed max-w-lg">
                              {flashcards[currentFcIndex].flipped
                                ? flashcards[currentFcIndex].answer
                                : flashcards[currentFcIndex].question}
                            </p>

                            <span className="text-[9px] font-black text-slate-400 group-hover:text-amber-500 block transition-all mt-1">
                              (Klik kartu untuk membalik)
                            </span>
                          </div>

                          {flashcards[currentFcIndex].correct !== null && (
                            <span
                              className={`absolute bottom-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-md ${
                                flashcards[currentFcIndex].correct
                                  ? "bg-green-100 text-green-850"
                                  : "bg-red-100 text-red-750"
                              }`}
                            >
                              {flashcards[currentFcIndex].correct
                                ? "Lunas Diingat"
                                : "Perlu Belajar Lagi"}
                            </span>
                          )}
                        </div>

                        {/* Navigation controls */}
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={currentFcIndex === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              beep(520, 80);
                              setCurrentFcIndex((prev) =>
                                Math.max(0, prev - 1),
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                              currentFcIndex === 0
                                ? "border-slate-150 text-slate-300 bg-slate-50/50 cursor-not-allowed"
                                : "border-slate-200 bg-white text-slate-600 hover:text-slate-850 cursor-pointer"
                            }`}
                          >
                            Sebelumnya
                          </button>

                          {/* Evaluation buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateRecall(currentFcIndex, false);
                              }}
                              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-black rounded-lg border border-red-200 cursor-pointer transition-all flex items-center gap-1"
                            >
                              ❌ Sulit / Lupa
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateRecall(currentFcIndex, true);
                              }}
                              className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-black rounded-lg border border-green-200 cursor-pointer transition-all flex items-center gap-1"
                            >
                              ✓ Ingat / Sempurna
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={currentFcIndex === flashcards.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              beep(520, 80);
                              setCurrentFcIndex((prev) =>
                                Math.min(flashcards.length - 1, prev + 1),
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                              currentFcIndex === flashcards.length - 1
                                ? "border-slate-150 text-slate-300 bg-slate-50/50 cursor-not-allowed"
                                : "border-slate-200 bg-white text-slate-600 hover:text-slate-850 cursor-pointer"
                            }`}
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center border border-dashed border-slate-200 rounded-3xl">
                        <Smile
                          className="mx-auto text-slate-300 animate-bounce mb-2"
                          size={24}
                        />
                        <h5 className="font-extrabold text-xs text-slate-700">
                          Dek Kartu Kosong
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Mulai dengan menambahkan kartu kilat pertamamu di
                          kanan atas!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. CORNELL NOTES UI INTERFACE */}
            {selectedTech === "cornell" && (
              <motion.div
                key="cornell-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Columns
                      size={16}
                      className="text-purple-650 text-purple-600"
                    />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Lembar Catatan Cornell (The Fischler)
                    </span>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                    Format Catatan Terstruktur
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-155 border-slate-200">
                  <h4 className="text-xs font-black text-slate-800">
                    Bagi Pemikiran Anda Secara Geografis
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold text-slate-500">
                    Atur kata kunci/pertanyaan penting di sebelah kiri, letakkan
                    poin catatan penjelasan detailnya di sebelah kanan, lalu
                    akhiri dengan merangkum materi secara luhur di kolom bawah
                    menggunakan bahasamu sendiri.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Left cues column (4 cols) */}
                  <div className="md:col-span-4 space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase text-purple-600 block">
                      KATA KUNCI / PERNYATAAN / CUES:
                    </label>
                    <textarea
                      rows={8}
                      value={cornellLeft}
                      onChange={(e) => setCornellLeft(e.target.value)}
                      placeholder="Tuliskan keyword kritis / pertanyaan pemicu di sini...&#10;- Subyek OOP&#10;- Apa itu Enkapsulasi?&#10;- Kenapa penting?"
                      className="w-full text-xs font-bold leading-relaxed px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-purple-500 h-64 text-slate-800 custom-scroll resize-none"
                    />
                  </div>

                  {/* Right main notes column (8 cols) */}
                  <div className="md:col-span-8 space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase text-slate-500 block">
                      POIN CATATAN INTI (SELAMA BELAJAR):
                    </label>

                    {/* FORMATTING TOOLBAR BAR */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "bold",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-[10px]"
                        title="Tebal (ctrl+b)"
                      >
                        <Bold size={11} className="mr-0.5" />B
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "italic",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-[10px] italic"
                        title="Miring (ctrl+i)"
                      >
                        <Italic size={11} className="mr-0.5" />I
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "underline",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-[10px] underline"
                        title="Garis Bawah"
                      >
                        <Underline size={11} className="mr-0.5" />U
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "strikethrough",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-[10px] line-through"
                        title="Coret"
                      >
                        <Strikethrough size={11} className="mr-0.5" />S
                      </button>

                      <div className="h-4 w-[1px] bg-slate-200 mx-0.5"></div>

                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "bullet",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
                        title="Bullet List (-)"
                      >
                        <List size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "number",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
                        title="Numbered List (1.)"
                      >
                        <ListOrdered size={11} />
                      </button>

                      <div className="h-4 w-[1px] bg-slate-200 mx-0.5"></div>

                      <button
                        type="button"
                        onClick={() =>
                          formatText(
                            setCornellRight,
                            cornellRight,
                            "highlight",
                            "cornell-right-textarea",
                          )
                        }
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
                        title="Stabilo (Highlight)"
                      >
                        <Highlighter
                          size={11}
                          className="text-amber-550 text-amber-500"
                        />
                      </button>
                    </div>

                    <textarea
                      id="cornell-right-textarea"
                      rows={8}
                      value={cornellRight}
                      onChange={(e) => setCornellRight(e.target.value)}
                      placeholder="Masukkan catatan lengkap, penjelasan logika, gambar pemikiran, dan fakta pendukung di sisi kanan ini secara leluasa...&#10;1. Enkapsulasi membungkus variabel & fungsi dalam satu entitas (Class).&#10;2. Menghalangi akses eksternal langsung menggunakan modifier PRIVATE."
                      className="w-full text-xs font-bold leading-relaxed px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-purple-500 h-64 text-slate-800 custom-scroll"
                    />

                    {/* LIVE RENDER PREVIEW BOX */}
                    <div className="bg-slate-50/50 rounded-xl p-2.5 border border-dashed border-slate-200 text-left space-y-1">
                      <span className="text-[8px] font-black uppercase text-purple-600 tracking-wider flex items-center gap-1">
                        Format Hasil Pratinjau
                      </span>
                      <div className="p-2.5 bg-white/70 border border-slate-155 rounded-lg shadow-3xs max-h-24 overflow-y-auto">
                        {renderFormattedText(cornellRight)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom summaries section */}
                <div className="space-y-1.5 text-left pt-2">
                  <label className="text-[9px] font-black uppercase text-pink-600 block">
                    RANGKUMAN MANIFESTASI (BAHASA SENDIRI):
                  </label>
                  <textarea
                    rows={3}
                    value={cornellSummary}
                    onChange={(e) => setCornellSummary(e.target.value)}
                    placeholder="Tulis ringkasan padat paling mendasar yang menjelaskan seluruh topik di atas menggunakan tata bahasa paling kasual Anda..."
                    className="w-full text-xs font-bold leading-relaxed px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-purple-500 h-24 text-slate-800 resize-none"
                  />
                </div>

                <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-150">
                  <span className="text-[10px] text-slate-400 font-semibold text-left">
                    *Menyimpan Cornell Notes akan menyumbangkan durasi 30 menit
                    ke target progres mingguan.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCornellNotes}
                    className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-[#FF2D75] text-white rounded-xl text-xs font-black shadow-md hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save size={13} />
                    Simpan Catatan Cornell
                  </button>
                </div>
              </motion.div>
            )}

            {/* 6. TIMEBOXING UI INTERFACE */}
            {selectedTech === "timeboxing" && (
              <motion.div
                key="timebox-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-5 text-center"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Flame size={16} className="text-indigo-600" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Timer Timeboxing (Eat the Frog)
                    </span>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-805 text-indigo-700">
                    Batas Fokus Absolut
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1">
                  <h4 className="text-xs font-black text-slate-800">
                    Selesaikan Tugas Tersulit Tanpa Henti
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold text-slate-550 mb-1 leading-relaxed">
                    Pilih "Katak Terbesar" Anda (tugas terpenting & paling
                    menantang hari ini), atur batas waktu mutlak (misalnya 60
                    menit), dan wajib mengerjakannya tanpa jeda atau berselancar
                    ke hal lain hingga alarm berbunyi.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      KATAK TERBESAR ANDA (EAT THE FROG):
                    </label>
                    <input
                      type="text"
                      value={frogTask}
                      onChange={(e) => setFrogTask(e.target.value)}
                      placeholder="Cth: Menguraikan Algoritma Dijkstra & Menghitung Beban Graf..."
                      className="w-full text-xs font-extrabold px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-hidden text-slate-800 focus:border-indigo-550"
                    />
                  </div>
                </div>

                {/* Circular timer indicator */}
                <div className="flex justify-center py-4 relative">
                  <div className="w-56 h-56 rounded-full iridescent-timer-bubble flex items-center justify-center p-3 relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <defs>
                        <linearGradient id="timeboxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                      </defs>

                      {/* Inner fine decorative guideline ring */}
                      <circle
                        cx="96"
                        cy="96"
                        r={circleRadius - 12}
                        className="stroke-slate-200/50"
                        strokeWidth="1"
                        fill="transparent"
                      />

                      {/* Radial analog tick marks (12 hours divisions) */}
                      {Array.from({ length: 12 }).map((_, index) => {
                        const angle = (index * 30 * Math.PI) / 180;
                        const x1 = 96 + Math.cos(angle) * 83;
                        const y1 = 96 + Math.sin(angle) * 83;
                        const x2 = 96 + Math.cos(angle) * 89;
                        const y2 = 96 + Math.sin(angle) * 89;
                        return (
                          <line
                            key={index}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            className="stroke-slate-300/60"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Track path */}
                      <circle
                        cx="96"
                        cy="96"
                        r={circleRadius}
                        className="stroke-slate-200/40"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Running percentage path */}
                      <circle
                        cx="96"
                        cy="96"
                        r={circleRadius}
                        stroke="url(#timeboxGrad)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={timeboxStrokeDashoffset}
                        strokeLinecap="round"
                        style={{
                          transition:
                            "stroke-dashoffset 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
                        }}
                      />
                    </svg>

                    {/* Centered Numbers */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
                      <span className="text-4xl font-extrabold font-sans text-slate-800 leading-none tracking-tight">
                        {formatTimerDigits(timeboxMinutes)}:
                        {formatTimerDigits(timeboxSeconds)}
                      </span>

                      {/* Percentage capsule */}
                      <span className="text-[8.5px] font-extrabold font-sans px-2 py-0.5 rounded-full bg-slate-500/5 text-slate-600 mt-2 mb-1.5 leading-none border border-slate-500/10 backdrop-blur-xs">
                        {Math.round(timeboxPercentLeft)}% Selesai
                      </span>

                      <span
                        className={`text-[8.5px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs ${
                          isTimeboxRunning
                            ? "bg-cyan-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isTimeboxRunning ? "TIMEBOXING AKTIF" : "PAUSED"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons controls */}
                <div className="flex justify-center items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      beep(430, 100);
                      setIsTimeboxRunning(false);
                      setTimeboxMinutes(timeboxDuration);
                      setTimeboxSeconds(0);
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 rounded-full cursor-pointer shadow-2xs transition-all hover:scale-105"
                    title="Reset Timer"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      beep(isTimeboxRunning ? 500 : 545, 120);
                      setIsTimeboxRunning(!isTimeboxRunning);
                    }}
                    className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wide cursor-pointer shadow-md transition-all flex items-center gap-2 ${
                      isTimeboxRunning
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {isTimeboxRunning ? (
                      <Pause size={13} />
                    ) : (
                      <Play size={13} />
                    )}
                    {isTimeboxRunning ? "Jeda Sesi" : "Mulai Sesi Absolut"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Ingin menyelesaikan waktu belajar (bypass/selesai awal) seketika untuk pengetesan?",
                        )
                      ) {
                        triggerTimeboxEnd();
                      }
                    }}
                    className="text-[9px] font-black border border-indigo-250 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all uppercase"
                  >
                    Instan Selesai
                  </button>
                </div>

                {/* Duration Picker slider scale */}
                <div className="bg-slate-100/60 border border-slate-200/60 p-4 rounded-2xl text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-500">
                      DURASI TIMEBOX ABSOLUT
                    </span>
                    <span className="text-xs font-bold font-sans text-[#FF2D75]">
                      {timeboxDuration} Menit
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={timeboxDuration}
                    onChange={(e) => setTimeboxDuration(Number(e.target.value))}
                    disabled={isTimeboxRunning}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF2D75] disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[8px] font-sans text-slate-400">
                    <span>15m</span>
                    <span>30m</span>
                    <span>45m</span>
                    <span>60m (Default)</span>
                    <span>90m</span>
                    <span>120m</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. LIVE MEMO INTERFACE */}
            {selectedTech === "live-memo" && (
              <motion.div
                id="selected-tech-content-window"
                key="live-memo-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-6"
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-pink-500" />
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Catatan Kalender Kelas (Live Memo)
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                        Sistem rekam audio, transkripsi verbatim otomatis, &
                        manajemen draf perkuliahan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openNewNoteModal}
                    className="self-start sm:self-center py-2 px-4 bg-[#FF2D75] hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle size={14} />
                    Catat Materi Baru
                  </button>
                </div>

                {/* Filter and Search Bar Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search input */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Cari matakuliah, topik, dosen, atau isi catatan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-hidden focus:border-pink-500 placeholder-slate-400 font-semibold"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scrollable tags - with dragging */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Filter size={12} className="text-slate-400 shrink-0" />
                    <div
                      ref={dragScrollRefLiveMemo}
                      onMouseDown={handleDragScrollMouseDown}
                      onMouseLeave={handleDragScrollMouseLeave}
                      onMouseUp={handleDragScrollMouseUp}
                      onMouseMove={handleDragScrollMouseMove}
                      className="flex gap-1.5 overflow-x-auto custom-scroll py-1 select-none cursor-grab active:cursor-grabbing w-full scroll-smooth"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedTag("Semua")}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg shrink-0 transition-all ${
                          selectedTag === "Semua"
                            ? "bg-pink-500 text-white shadow-xs"
                            : "bg-white/80 border border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        Semua ({notes.length})
                      </button>

                      {allUniqueTags.map((tg) => {
                        const count = notes.filter(
                          (n) => n.tags && n.tags.includes(tg),
                        ).length;
                        return (
                          <button
                            key={tg}
                            type="button"
                            onClick={() => setSelectedTag(tg)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg shrink-0 transition-all ${
                              selectedTag === tg
                                ? "bg-pink-500 text-white shadow-xs"
                                : "bg-white/80 border border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                          >
                            {tg} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Notes List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className="group p-5 bg-white/75 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-pink-300 shadow-3xs hover:shadow-xs transition-all cursor-pointer text-left flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-pink-50 text-[#FF2D75] font-black border border-pink-100 px-2 py-0.5 rounded-md">
                            {note.courseTitle}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold font-sans">
                            {note.date}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
                          {note.topic}
                        </h4>

                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                          {note.content}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1">
                          {note.tags &&
                            note.tags.slice(0, 3).map((tg) => (
                              <span
                                key={tg}
                                className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md"
                              >
                                #{tg}
                              </span>
                            ))}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditNoteModal(note);
                            }}
                            className="p-1.5 text-slate-450 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Catatan"
                          >
                            <Edit
                              size={12}
                              className="text-slate-450 hover:text-indigo-600"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="p-1.5 text-slate-450 hover:text-[#FF2D75] hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <Trash2
                              size={12}
                              className="text-[#FF2D75]"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredNotes.length === 0 && (
                    <div className="md:col-span-2 py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                      <Smile
                        className="mx-auto text-slate-350 animate-pulse mb-2"
                        size={24}
                      />
                      <p className="font-extrabold text-xs text-slate-600">
                        Catatan Kuliah Tidak Ditemukan
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Coba gunakan kata kunci lain atau silakan catat materi
                        baru!
                      </p>
                    </div>
                  )}
                </div>

                {/* Integration with Active study session tip */}
                <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl flex items-start gap-3 text-left">
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-extrabold text-slate-800">
                      Sinergi Draf Kuliah & Studio Belajar
                    </h5>
                    <p className="text-[10px] text-slate-550 leading-normal font-semibold">
                      Anda dapat mereferensikan catatan kuliah di sini saat
                      berkonsentrasi menggunakan teknik Feynman atau Spaced
                      Repetition di Ruang Belajar ini, menyalin draf dengan
                      mudah, serta merekam pembicaraan asisten/dosen secara
                      instan!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. MIND MAPPING INTERFACE */}
            {selectedTech === "mind-mapping" && (
              <motion.div
                id="selected-tech-content-window"
                key="mind-mapping-window"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/45 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/60 shadow-xs space-y-6"
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-500 text-white rounded-2xl">
                      <GitBranch size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Workspace Studio Mind Mapping
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                        Gambar konsep riset, skripsi, & mind maps belajar secara
                        visual tanpa batas.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveMindMapToCalendar}
                      className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Save size={13} />
                      Sinkronisasi Kalender
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const id = "node-" + Date.now();
                        const root = mindMapNodes.find((n) => !n.parentId);
                        const parentVal = root ? root.id : undefined;
                        const newNode: MindMapNode = {
                          id,
                          parentId: parentVal,
                          text: "Cabang Pikiran Baru",
                          x: Math.random() * 180 + 100,
                          y: Math.random() * 150 + 150,
                          color: "#4f46e5",
                          textColor: "text-white",
                        };
                        setMindMapNodes((prev) => [...prev, newNode]);
                        setSelectedNodeId(id);
                      }}
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <PlusCircle size={13} />
                      Buat Node Bebas
                    </button>
                  </div>
                </div>

                {/* Control Presets & Templates Row */}
                <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-100/50 p-2.5 rounded-2xl border border-slate-200/50">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wilder mr-1">
                      Muat Templat:
                    </span>
                    <button
                      type="button"
                      onClick={() => loadTemplate("skripsi")}
                      className="py-1 px-3 bg-white text-slate-700 hover:text-[#FF2D75] border border-slate-200 text-[10px] font-black rounded-lg cursor-pointer hover:border-[#FF2D75]/30 transition-all shadow-2xs"
                    >
                      Research & Skripsi
                    </button>
                    <button
                      type="button"
                      onClick={() => loadTemplate("db")}
                      className="py-1 px-3 bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 text-[10px] font-black rounded-lg cursor-pointer hover:border-indigo-600/30 transition-all shadow-2xs"
                    >
                      Skema Database
                    </button>
                    <button
                      type="button"
                      onClick={() => loadTemplate("empty")}
                      className="py-1 px-3 bg-white text-slate-705 text-slate-600 hover:text-rose-600 border border-dashed border-slate-200 text-[10px] font-black rounded-lg cursor-pointer hover:border-rose-450 transition-all shadow-2xs"
                    >
                      Kanvas Kosong
                    </button>
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 italic pr-1 select-none">
                    *Seret / Drag node di dalam kanvas untuk memosisikan ulang
                    konsep Anda!
                  </div>
                </div>

                {/* Main Dual Pane Layout: Canvas vs Editor Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* INDEPENDENT CANVAS CONTAINER (12 cols: 8 cols for canvas) */}
                  <div className="lg:col-span-8 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Koleksi Node ({mindMapNodes.length})
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        Resolusi Kanvas: Auto-Responsive
                      </span>
                    </div>

                    {/* Interactive Infinite Drag Area */}
                    <div
                      ref={canvasRef}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      onTouchMove={handleCanvasTouchMove}
                      onTouchEnd={handleCanvasMouseUp}
                      className="relative w-full h-[460px] bg-slate-50 border border-slate-200/80 rounded-[24px] overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center p-3"
                      style={{
                        backgroundImage:
                          "radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #f8fafc 0.75px)",
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 10px 10px",
                      }}
                    >
                      {connectingSourceId && (
                        <div className="absolute top-4 left-4 right-16 z-30 bg-amber-500 text-white px-3 py-2 rounded-xl text-[10px] font-bold flex items-center justify-between shadow-md border border-amber-400 animate-pulse">
                          <span className="flex items-center gap-1.5">
                            <GitBranch size={12} />
                            Mode Penghubung Jalur: Klik node tujuan untuk menyambungkan dari "{mindMapNodes.find((n) => n.id === connectingSourceId)?.text}"
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConnectingSourceId(null);
                            }}
                            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 rounded-md text-[9px] font-black cursor-pointer transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                      {/* Interactive Zoom Controls Overlay */}
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="absolute right-4 bottom-4 z-30 flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg select-none pointer-events-auto"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanvasScale((prev) =>
                              Math.max(0.5, Number((prev - 0.1).toFixed(1))),
                            );
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-600 hover:text-slate-900 flex items-center justify-center"
                          title="Perkecil (Zoom Out)"
                        >
                          <ZoomOut size={13} />
                        </button>

                        <span className="text-[10px] font-extrabold text-slate-700 min-w-[36px] text-center font-sans">
                          {Math.round(canvasScale * 100)}%
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanvasScale((prev) =>
                              Math.min(2.0, Number((prev + 0.1).toFixed(1))),
                            );
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-600 hover:text-slate-900 flex items-center justify-center"
                          title="Perbesar (Zoom In)"
                        >
                          <ZoomIn size={13} />
                        </button>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanvasScale(1.0);
                          }}
                          className="py-1 px-2 text-[9px] font-black bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer"
                          title="Reset Zoom ke 100%"
                        >
                          1:1
                        </button>
                      </div>

                      {/* Scale Wrapper Container */}
                      <div
                        className="w-full h-full relative transition-transform duration-150 ease-out origin-top-left"
                        style={{
                          transform: `scale(${canvasScale})`,
                          transformOrigin: "0 0",
                          width: `${100 / canvasScale}%`,
                          height: `${100 / canvasScale}%`,
                        }}
                      >
                        {/* SVG Vector connections layer */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                          {mindMapNodes.map((node) => {
                            if (!node.parentId) return null;
                            const parent = mindMapNodes.find(
                              (n) => n.id === node.parentId,
                            );
                            if (!parent) return null;

                            // Center coordinates approximations
                            const pX = parent.x + 95;
                            const pY = parent.y + 35;
                            const cX = node.x + 95;
                            const cY = node.y + 35;

                            // Beautiful rounded cubic bezier curves
                            return (
                              <g key={`link-${node.id}-${parent.id}`}>
                                <path
                                  d={`M ${pX} ${pY} C ${pX} ${(pY + cY) / 2}, ${cX} ${(pY + cY) / 2}, ${cX} ${cY}`}
                                  stroke={parent.color}
                                  strokeWidth="2.5"
                                  fill="none"
                                  opacity="0.55"
                                  className="transition-all duration-300"
                                />
                                {/* Flow indicator dot */}
                                <circle
                                  r="4"
                                  fill={parent.color}
                                  className="animate-pulse"
                                >
                                  <animateMotion
                                    path={`M ${pX} ${pY} C ${pX} ${(pY + cY) / 2}, ${cX} ${(pY + cY) / 2}, ${cX} ${cY}`}
                                    dur="4s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Node items layer */}
                        {mindMapNodes.map((node) => {
                          const isSelected = selectedNodeId === node.id;
                          return (
                            <motion.div
                              key={node.id}
                              onMouseDown={(e) => handleNodeMouseDown(e, node)}
                              onTouchStart={(e) =>
                                handleNodeTouchStart(e, node)
                              }
                              style={{
                                position: "absolute",
                                left: node.x,
                                top: node.y,
                                cursor:
                                  draggingNodeId === node.id
                                    ? "grabbing"
                                    : "grab",
                              }}
                              className={`min-w-[170px] max-w-[210px] p-3 rounded-2xl border flex flex-col gap-1.5 transition-all text-xs z-10 font-sans shadow-xs bg-white ${
                                isSelected
                                  ? "ring-3 ring-indigo-500 ring-offset-2 scale-102 z-20 shadow-lg"
                                  : "hover:scale-101 border-slate-300"
                              }`}
                            >
                              {/* Node Accent Header */}
                              <div className="flex items-center gap-1.5 justify-between">
                                <div className="flex items-center gap-1">
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0 block"
                                    style={{ backgroundColor: node.color }}
                                  />
                                  {!node.parentId && (
                                    <span className="text-[7.5px] bg-[#FF2D75]/10 text-[#FF2D75] px-1 py-0.2 rounded-md font-black uppercase">
                                      ROOT
                                    </span>
                                  )}
                                </div>
                                {/* Delete shortcut */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNode(node.id);
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-slate-400 hover:text-rose-500"
                                  title="Hapus Node"
                                >
                                  <X size={10} />
                                </button>
                              </div>

                              {/* Node Content Title */}
                              <span className="font-extrabold text-[#1e293b] text-[11px] leading-snug break-words">
                                {node.text}
                              </span>

                              {/* Image representation */}
                              {node.imageUrl && (
                                <img
                                  src={node.imageUrl}
                                  alt={node.text}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-11 object-cover rounded-lg border border-slate-100 shadow-3xs"
                                />
                              )}

                              {/* Checklist progress badge */}
                              {node.checklist && node.checklist.length > 0 && (
                                <div className="flex justify-between items-center text-[8.5px] font-black text-slate-450 uppercase bg-slate-50 border border-slate-200/50 p-1 rounded-lg">
                                  <span className="text-slate-450">TUGAS:</span>
                                  <span className="font-sans text-[#0d9488]">
                                    {
                                      node.checklist.filter((c) => c.done)
                                        .length
                                    }{" "}
                                    / {node.checklist.length} DONE
                                  </span>
                                </div>
                              )}

                              {/* Quick Action Buttons Row */}
                              <div className="flex gap-1.5 mt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const subId = "node-" + Date.now();
                                    const subNode: MindMapNode = {
                                      id: subId,
                                      parentId: node.id,
                                      text: "Sub-Cabang Pikiran",
                                      x: Math.min(
                                        600,
                                        node.x + (Math.random() * 40 + 60),
                                      ),
                                      y: Math.min(410, node.y + 90),
                                      color: node.color,
                                      textColor: "text-white",
                                    };
                                    setMindMapNodes((prev) => [
                                      ...prev,
                                      subNode,
                                    ]);
                                    setSelectedNodeId(subId);
                                  }}
                                  className="flex-1 py-1 px-1.5 border border-dashed border-slate-200 hover:border-indigo-400 text-indigo-650 hover:bg-indigo-50/50 rounded-lg text-[8px] font-black text-center cursor-pointer transition-all flex items-center justify-center gap-0.5"
                                  title="Tambah cabang/anak di bawah node ini"
                                >
                                  <PlusCircle size={9.5} />
                                  <span>+ Cabang</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (connectingSourceId === node.id) {
                                      setConnectingSourceId(null);
                                    } else {
                                      setConnectingSourceId(node.id);
                                    }
                                  }}
                                  className={`flex-1 py-1 px-1.5 border border-dashed rounded-lg text-[8px] font-black text-center cursor-pointer transition-all flex items-center justify-center gap-0.5 ${
                                    connectingSourceId === node.id
                                      ? "bg-amber-500 border-amber-500 text-white animate-pulse"
                                      : "border-slate-200 hover:border-amber-500 text-amber-600 hover:bg-amber-50/50"
                                  }`}
                                  title="Sambungkan jalur/aliran ke node lain"
                                >
                                  <GitBranch size={9.5} />
                                  <span>
                                    {connectingSourceId === node.id
                                      ? "Target..."
                                      : "Hubung Jalur"}
                                  </span>
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}

                        {mindMapNodes.length === 0 && (
                          <div className="text-center text-slate-400 p-6">
                            <Smile
                              className="mx-auto mb-2 text-slate-400"
                              size={32}
                            />
                            <p className="font-extrabold text-xs text-slate-600">
                              Opps, Kanvas Kosong!
                            </p>
                            <button
                              onClick={() => loadTemplate("skripsi")}
                              className="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-xs cursor-pointer"
                              type="button"
                            >
                              Reset Templat Contoh
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR: NODE DETAILED CUSTOMISATION EDITOR (4 COLS) */}
                  <div className="lg:col-span-4 flex flex-col">
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-[24px] p-4.5 space-y-4 flex-1 h-full flex flex-col justify-between">
                      {selectedNodeId ? (
                        (() => {
                          const activeNode = mindMapNodes.find(
                            (n) => n.id === selectedNodeId,
                          );
                          if (!activeNode) {
                            return (
                              <div className="text-center py-12 text-slate-400">
                                Node tidak ditemukan atau telah dihapus.
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4 flex-1 flex flex-col justify-between">
                              {/* Heading info */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider">
                                    Kustomisasi Node
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedNodeId(null)}
                                    className="text-slate-450 hover:text-slate-600 text-[10px] font-black"
                                  >
                                    Tutup
                                  </button>
                                </div>
                                <h4 className="font-extrabold text-xs text-slate-800 tracking-tight">
                                  Editor Detil Konsep
                                </h4>
                              </div>

                              {/* Form Fields container */}
                              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[340px] pr-1.5 custom-scroll">
                                {/* Label title */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                    Nama / Label Node
                                  </label>
                                  <input
                                    type="text"
                                    value={activeNode.text}
                                    onChange={(e) =>
                                      handleUpdateNodeProp(
                                        activeNode.id,
                                        "text",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-250 bg-white"
                                    placeholder="Ketik nama konsep..."
                                  />
                                </div>

                                {/* Parent Select */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                    Hubungkan ke Parent (Aliran)
                                  </label>
                                  <select
                                    value={activeNode.parentId || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleUpdateNodeProp(
                                        activeNode.id,
                                        "parentId",
                                        val ? val : undefined,
                                      );
                                    }}
                                    className="w-full text-[10.5px] font-bold p-2 bg-white rounded-xl border border-slate-250"
                                  >
                                    <option value="">
                                      -- Tanpa Parent (Topik Utama) --
                                    </option>
                                    {mindMapNodes
                                      .filter((n) => n.id !== activeNode.id)
                                      .map((n) => (
                                        <option key={n.id} value={n.id}>
                                          {n.text.substring(0, 30)}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                {/* Pick Accent Colors presets */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                                    Warna Aksent Cabang
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[
                                      { label: "Pink", hex: "#FF2D75" },
                                      { label: "Indigo", hex: "#4f46e5" },
                                      { label: "Teal", hex: "#0d9488" },
                                      { label: "Amber", hex: "#d97706" },
                                      { label: "Purple", hex: "#7c3aed" },
                                      { label: "Cyan", hex: "#0891b2" },
                                      { label: "Slate", hex: "#1e293b" },
                                    ].map((colorPreset) => (
                                      <button
                                        key={colorPreset.hex}
                                        type="button"
                                        onClick={() =>
                                          handleUpdateNodeProp(
                                            activeNode.id,
                                            "color",
                                            colorPreset.hex,
                                          )
                                        }
                                        title={colorPreset.label}
                                        style={{
                                          backgroundColor: colorPreset.hex,
                                        }}
                                        className={`w-5.5 h-5.5 rounded-full border border-white shrink-0 block shadow-3xs cursor-pointer transition-transform ${
                                          activeNode.color === colorPreset.hex
                                            ? "scale-120 ring-2 ring-indigo-500"
                                            : ""
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Notes textarea */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                                    <span>Catatan Ringkas</span>
                                    <span className="font-sans text-[8px] text-slate-400 font-normal">
                                      Optional
                                    </span>
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={activeNode.notes || ""}
                                    onChange={(e) =>
                                      handleUpdateNodeProp(
                                        activeNode.id,
                                        "notes",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis ringkasan rumus, definisi teori, atau referensi jurnal di sini..."
                                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-250 bg-white"
                                  />
                                </div>

                                {/* Image URL inserter */}
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                                    <span>URL Gambar Pendukung</span>
                                    <span className="font-sans text-[8px] text-indigo-600 font-bold">
                                      Image
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    value={activeNode.imageUrl || ""}
                                    onChange={(e) =>
                                      handleUpdateNodeProp(
                                        activeNode.id,
                                        "imageUrl",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Masukkan tautan gambar https://..."
                                    className="w-full text-[10px] font-sans p-2 rounded-xl border border-slate-205 border-slate-200 bg-white"
                                  />
                                  {activeNode.imageUrl && (
                                    <div className="flex gap-1.5 flex-wrap pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateNodeProp(
                                            activeNode.id,
                                            "imageUrl",
                                            "",
                                          )
                                        }
                                        className="text-[8.5px] font-black text-rose-600 hover:underline"
                                      >
                                        Hapus Tautan Gambar
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Checklist list manager */}
                                <div className="space-y-1.5 pt-1 border-t border-slate-200">
                                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                                    Daftar Sub-Tugas Checklist
                                  </label>

                                  <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                                    {(activeNode.checklist || []).map(
                                      (item) => (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200"
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleToggleChecklistItem(
                                                activeNode.id,
                                                item.id,
                                              )
                                            }
                                            className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                                          >
                                            <span
                                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                                item.done
                                                  ? "bg-[#0d9488] border-[#0d9488] text-white"
                                                  : "border-slate-350 bg-white"
                                              }`}
                                            >
                                              {item.done && "✔"}
                                            </span>
                                            <span
                                              className={`text-[10px] font-bold truncate ${
                                                item.done
                                                  ? "text-slate-400 line-through"
                                                  : "text-slate-700"
                                              }`}
                                            >
                                              {item.text}
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteChecklistItem(
                                                activeNode.id,
                                                item.id,
                                              )
                                            }
                                            className="text-slate-400 hover:text-rose-500 text-[10px] px-1"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ),
                                    )}
                                    {(!activeNode.checklist ||
                                      activeNode.checklist.length === 0) && (
                                      <p className="text-[9px] text-slate-400 italic">
                                        Belum ada tugas checklist.
                                      </p>
                                    )}
                                  </div>

                                  {/* Checklist input inline */}
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      value={newChecklistItem}
                                      onChange={(e) =>
                                        setNewChecklistItem(e.target.value)
                                      }
                                      placeholder="Item tugas..."
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddChecklistItem(activeNode.id);
                                        }
                                      }}
                                      className="flex-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddChecklistItem(activeNode.id)
                                      }
                                      className="px-2 bg-slate-900 text-white rounded-lg text-[9px] font-black cursor-pointer hover:bg-slate-800"
                                    >
                                      Tambah
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Delete node option */}
                              <div className="pt-2.5 border-t border-slate-200 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteNode(activeNode.id)
                                  }
                                  className="text-[10px] font-black text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 ml-auto"
                                >
                                  ☠ Hapus Node Ini
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="py-20 text-center text-slate-400 flex flex-col justify-center items-center h-full">
                          <GitBranch
                            className="text-slate-300 animate-pulse mb-3"
                            size={32}
                          />
                          <p className="font-extrabold text-[11px] text-slate-600 leading-snug">
                            Tidak Ada Node yang Terpilih
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-1 max-w-[190px] mx-auto font-semibold leading-normal">
                            Silakan klik salah satu node berbentuk kotak di
                            dalam kanvas untuk mengedit teks warna, checklist,
                            serta lampiran gambar!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PM TECHNICAL RECOMMENDATIONS & DB SCHEMAS SECTION */}
                <div className="mt-8 pt-5 border-t border-slate-200 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      Rekomendasi Arsitektur Teknis Senior PM (KampusMAHAS
                      Specialist)
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-semibold">
                      Sebagai Senior PM & Full-Stack Architect, berikut adalah
                      blueprints pengembangan tingkat lanjut untuk
                      diintegrasikan dalam rilis produksi web/mobile portal
                      KampusMAHAS.
                    </p>
                  </div>

                  {/* Grid 3 Columns Architecture Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Recommendation 1: Open Source Library */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5 text-left">
                      <span className="text-[8.5px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        1. Client Libraries
                      </span>
                      <h5 className="font-extrabold text-[11px] text-slate-800">
                        React Flow / Cytoscape.js
                      </h5>
                      <p className="text-[9.5px] text-slate-500 leading-relaxed font-medium">
                        <strong>React Flow (Direkomendasikan)</strong> sangat
                        ideal untuk UI berbasis nodal di React. Menyediakan
                        zooming, panning, custom node renderer (HTML/JSX), serta
                        docking panel. Alternatifnya:{" "}
                        <strong>Cytoscape.js</strong> untuk representasi
                        matematika yang sangat kompleks, atau{" "}
                        <strong>GoJS</strong> jika menargetkan diagram alur
                        komersial skala perusahaan.
                      </p>
                    </div>

                    {/* Recommendation 2: Relational DB Schema */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-left">
                      <span className="text-[8.5px] font-black text-teal-700 bg-teal-50 border border-teal-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        2. Relational Schema Draft (PostgreSQL)
                      </span>
                      <div className="p-2 bg-slate-900 rounded-xl text-[8px] font-sans text-cyan-400 overflow-x-auto select-all leading-normal max-h-[110px]">
                        {`CREATE TABLE mind_maps (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150),
  user_id INT REFERENCES members(id)
);
CREATE TABLE nodes (
  id VARCHAR(50) PRIMARY KEY,
  map_id VARCHAR(50) REFERENCES mind_maps(id) ON DELETE CASCADE,
  parent_id VARCHAR(50),
  node_text TEXT NOT NULL,
  pos_x INT NOT NULL,
  pos_y INT NOT NULL,
  color_code VARCHAR(15)
);`}
                      </div>
                      <p className="text-[8.5px] text-slate-450 italic font-semibold">
                        *Fleksibel dengan constraint referensial antar draf node
                        skripsi.
                      </p>
                    </div>

                    {/* Recommendation 3: NoSQL Document Structure */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-left">
                      <span className="text-[8.5px] font-black text-purple-700 bg-purple-50 border border-purple-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        3. NoSQL Schema Draft (MongoDB/Firestore)
                      </span>
                      <div className="p-2 bg-slate-900 rounded-xl text-[8px] font-sans text-purple-300 overflow-x-auto select-all leading-normal max-h-[110px]">
                        {`{
  "_id": "map_sc_90112",
  "ownerId": "usr_789",
  "nodes": [
    {
      "id": "node-root",
      "text": "Metodologi Al-Skripsi",
      "position": { "x": 230, "y": 45 },
      "props": { "color": "#FF2D75", "image": "..." },
      "checklist": [
        { "text": "Rumusan masalah", "done": true }
      ]
    }
  ]
}`}
                      </div>
                      <p className="text-[8.5px] text-slate-450 italic font-semibold">
                        *Format dokumen tunggal sangat menguntungkan untuk query
                        cepat.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* THREE PILLAR VISUAL STATS DASHBOARD - METRIC COUNTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 flex items-center gap-4 text-left shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#FF2D75] border border-pink-100 shadow-xs flex items-center justify-center shrink-0">
            <Clock size={20} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-black block uppercase tracking-wider font-sans">
              TOTAL DURASI DIKUMPULKAN
            </span>
            <span className="text-lg font-sans font-black text-slate-800">
              {totalMinStudied} Menit
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              dari semua rekam jejak tersimpan.
            </p>
          </div>
        </div>

        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 flex items-center gap-4 text-left shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-white text-indigo-600 border border-indigo-100 shadow-xs flex items-center justify-center shrink-0">
            <BarChart2 size={20} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-black block uppercase tracking-wider font-sans">
              TEKNIK TERPOPULER
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold font-sans text-slate-800">
                Pmd: {pomodoroCount}
              </span>
              <span className="text-xs text-slate-350 font-black">|</span>
              <span className="text-xs font-bold font-sans text-slate-800">
                Fyn: {feynmanCount}
              </span>
            </div>
            <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden mt-1 max-w-[120px]">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-indigo-500 rounded-full"
                style={{
                  width: `${totalCompletedSessions > 0 ? (pomodoroCount / totalCompletedSessions) * 100 : 50}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 flex items-center gap-4 text-left shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-white text-emerald-600 border border-emerald-100 shadow-xs flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-black block uppercase tracking-wider font-sans">
              PRESTASI AKTIVITAS HARI INI
            </span>
            <span className="text-lg font-sans font-black text-slate-800">
              {totalCompletedSessions} Sesi
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              Setiap sesi melipatgandakan retensi ingatan.
            </p>
          </div>
        </div>
      </div>

      {/* METRIC VISUAL INTERACTIVE WEEKLY ACTIVITY GRID */}
      <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-2">
          <Calendar size={15} className="text-[#FF2D75]" />
          Jejak Belajar Harian
        </h3>

        <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
          Visualisasi log di bawah ini menandakan keaktifan harian Anda. Tiap
          Dot berwarna melambangkan sesi belajar mandiri yang berhasil dikunci
          secara konsisten.{" "}
          <span className="text-indigo-600 underline">
            Klik pada salah satu hari
          </span>{" "}
          untuk melihat rincian serta topik spesifik yang Anda pelajari!
        </p>

        {/* Weekly matrix grid visualization block (interactive clickable days) */}
        <div className="grid grid-cols-7 gap-2.5 text-center pt-2">
          {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((dName, i) => {
            const dayName = dName.toLowerCase();
            const matchedLogs = logs.filter((l) => {
              if (!l.timestamp) return false;
              return l.timestamp.toLowerCase().includes(dayName);
            });
            const dayNode: { day: string; count: number; techs: string[] } = {
              day: dName,
              count: matchedLogs.length,
              techs: Array.from(new Set(matchedLogs.map((l) => l.technique))).filter((t): t is string => typeof t === "string"),
            };

            return (
              <button
                key={dayNode.day}
                type="button"
                onClick={() => handleDayClick(dayNode, i)}
                className="group p-3 bg-white/65 hover:bg-white hover:border-[#FF2D75]/45 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-between gap-2.5 shadow-2xs cursor-pointer hover:shadow-md hover:scale-[1.04] active:scale-95 transition-all duration-200 text-center w-full min-h-[110px] focus:outline-none focus:ring-2 focus:ring-pink-100"
                title={`Klik untuk detail sesi hari ${dayNode.day}`}
              >
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide group-hover:text-slate-800 transition-colors">
                {dayNode.day.substring(0, 3)}
              </span>

              {/* Dot color rendering logic matches technique */}
              <div className="flex flex-wrap justify-center gap-1.5 min-h-6 items-center">
                {dayNode.count === 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200/50 block group-hover:bg-slate-300/65 transition-colors"></span>
                ) : (
                  Array.from({ length: Math.min(4, dayNode.count) }).map(
                    (_, dotIdx) => {
                      const techIndex = i % 2 === 0;
                      return (
                        <span
                          key={dotIdx}
                          className={`w-3 h-3 rounded-full block ${
                            techIndex
                              ? "bg-gradient-to-tr from-pink-400 to-[#FF2D75] shadow-[0_2px_6px_rgba(255,45,117,0.3)]"
                              : "bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-[0_2px_6px_rgba(79,70,229,0.3)]"
                          }`}
                          title={techIndex ? "Pomodoro Sesi" : "Feynman Sesi"}
                        />
                      );
                    },
                  )
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-[9.5px] font-sans font-black text-slate-800 block">
                  {dayNode.count} sesi
                </span>
                <span className="text-[7.5px] font-black text-indigo-500 uppercase tracking-widest block opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-3 transition-all duration-200 leading-none">
                  Rincian
                </span>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {/* SESSION LOG LIST RECORD TABULAR */}
      <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-2">
            <ListTodo size={15} className="text-purple-600" />
            Riwayat Belajar ({logs.length})
          </h3>
        </div>

        {/* Log rows listed list */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scroll pr-1">
          {logs.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white/70 hover:bg-white rounded-3xl border border-slate-200/80 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-2xs text-left"
            >
              <div className="space-y-1 flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      item.technique === "Pomodoro"
                        ? "bg-pink-100 text-[#FF2D75] border border-pink-200"
                        : "bg-purple-100 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {item.technique}
                  </span>

                  <span className="text-[10px] text-slate-400 font-bold font-sans">
                    {item.timestamp}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-slate-800 truncate">
                  {item.topic}
                </h4>

                {item.noteExcerpt && (
                  <p className="text-[10px] text-slate-550 border-l-2 border-slate-205 pl-2 font-semibold italic text-slate-500 leading-relaxed max-w-2xl break-words mt-1">
                    "{item.noteExcerpt}"
                  </p>
                )}

                {item.evaluations && item.evaluations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.evaluations.map((labelStr, lIdx) => (
                      <span
                        key={lIdx}
                        className="text-[8px] bg-indigo-50 text-indigo-700 font-black px-1.5 py-0.5 rounded-sm"
                      >
                        ✓ {labelStr.substring(0, 30)}...
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="flex items-center gap-1.5 leading-none">
                  <Hourglass size={13} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-bold font-sans text-slate-850 text-slate-705">
                    {item.duration}m
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteLog(item.id)}
                  className="p-2 hover:bg-pink-50 text-[#FF2D75] hover:text-pink-700 border border-transparent hover:border-pink-100 rounded-xl cursor-pointer transition-all"
                  title="Hapus rekaman log"
                >
                  <Trash2 size={13} className="text-[#FF2D75]" />
                </button>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-400 p-4 border-2 border-dashed border-slate-200 rounded-3xl">
              <Smile
                className="mx-auto text-slate-350 animate-pulse mb-2.5"
                size={28}
              />
              <p className="font-extrabold text-sm text-slate-600">
                Belum Ada Sesi Belajar Tersimpan
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Pilihlah salah satu teknik belajar di atas dan mulai sesi
                pertamamu!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MONUMENTS LOG DETAIL POPUP MODAL (FROSTED GLASS EFFECT) */}
      <AnimatePresence>
        {selectedDayNode && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto pt-12 sm:pt-24">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-2xl rounded-3xl max-w-sm w-full p-6 text-left space-y-4 relative overflow-hidden my-0 max-h-[85vh] sm:max-h-[88vh] flex flex-col"
            >
              {/* Decorative top shimmer bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500" />

              <div className="flex justify-between items-start pt-1">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                    Sesi Tersimpan • {selectedDayNode.day}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 mt-1 flex items-center gap-2">
                    <Award size={18} className="text-yellow-500" />
                    Detail Pencapaian Belajar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    beep(440, 60);
                    setSelectedDayNode(null);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-[#FF2D75] transition-colors cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Stats overview banner inside modal */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-[8px] font-black uppercase text-slate-400">
                    Total Sesi
                  </span>
                  <p className="text-xl font-sans font-black text-slate-800">
                    {selectedDayNode.count} Sesi
                  </p>
                </div>
                <div className="space-y-0.5 text-center sm:text-left border-l border-slate-200 pl-3">
                  <span className="text-[8px] font-black uppercase text-slate-400">
                    Status Konsistensi
                  </span>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-center sm:justify-start">
                    {selectedDayNode.count > 0
                      ? "✓ Konsisten"
                      : "⊙ Hari Istirahat"}
                  </p>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                  RINCIAN SESI AKTIVITAS
                </span>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedDayNode.logsList.map((ses, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-1.5 hover:border-slate-300 transition-all text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md ${
                            ses.technique === "Pomodoro"
                              ? "bg-pink-50 text-[#FF2D75] border border-pink-100"
                              : ses.technique === "Feynman"
                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}
                        >
                          {ses.technique}
                        </span>

                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold font-sans">
                          <Clock size={10} />
                          <span>
                            {ses.time} • {ses.duration}m
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-xs text-slate-800">
                        {ses.topic}
                      </h4>

                      {ses.focusNote && (
                        <p className="text-[10px] text-slate-500 font-medium italic border-l-2 border-slate-200 pl-1.5 leading-relaxed">
                          "{ses.focusNote}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Encouragement footer */}
              <div className="pt-1.5 text-center">
                <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                  {selectedDayNode.count > 0
                    ? "Hebat! Pertahankan momentum belajar produktif ini untuk membuka pencapaian yang lebih tinggi!"
                    : "Ambil waktu jeda sejenak untuk memulihkan energi sebelum sesi belajar berikutnya."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    beep(440, 60);
                    setSelectedDayNode(null);
                  }}
                  className="mt-3 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Selesai Meninjau Sesi
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* LIVE MEMO CREATION & EDITING MODAL */}
        {showAddNoteModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto pt-6 sm:pt-12 md:pt-16">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-2xl rounded-3xl max-w-4xl w-full p-5 text-left relative overflow-hidden my-0 max-h-[85vh] sm:max-h-[88vh] flex flex-col"
            >
              {/* Top gradient indicator */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500" />

              <div className="flex justify-between items-center pb-3 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="text-pink-500" size={18} />
                  <h3 className="text-base font-extrabold text-slate-800">
                    {editingNoteId
                      ? "Edit Catatan Kuliah"
                      : "Buat Catatan Kuliah Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable container to keep the height beautifully constrained and robust */}
              <div className="flex-1 overflow-y-auto pr-1 py-3 scrollbar-thin scrollbar-thumb-slate-200 custom-scroll">
                {/* Major grid layout: Form left side, Dictation and Voice Transcription right side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* FORM COLUMN */}
                  <form
                    onSubmit={handleSaveNote}
                    className="space-y-4 text-xs font-semibold"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Course select or kustom */}
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">
                          Mata Kuliah *
                        </label>
                        <select
                          value={isCustomCourse ? "Kustom" : noteCourse}
                          onChange={(e) => {
                            if (e.target.value === "Kustom") {
                              setIsCustomCourse(true);
                            } else {
                              setIsCustomCourse(false);
                              setNoteCourse(e.target.value);
                            }
                          }}
                          className="w-full border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                        >
                          {agenda &&
                            agenda.map((a) => (
                              <option key={a.id} value={a.title}>
                                {a.title}
                              </option>
                            ))}
                          <option value="Kustom">+ Baru / Kustom...</option>
                        </select>
                      </div>

                      {/* custom course title */}
                      {isCustomCourse && (
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">
                            Nama Matakuliah Kustom *
                          </label>
                          <input
                            type="text"
                            value={customCourseTitle}
                            onChange={(e) =>
                              setCustomCourseTitle(e.target.value)
                            }
                            placeholder="Cth: Rekayasa Perangkat Lunak"
                            className="w-full border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lecturer name */}
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">
                          Dosen Pengampu / Pembicara
                        </label>
                        <input
                          type="text"
                          value={noteLecturer}
                          onChange={(e) => setNoteLecturer(e.target.value)}
                          placeholder="Nama Lengkap Dosen..."
                          className="w-full border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">
                          Tanggal Pertemuan *
                        </label>
                        <input
                          type="date"
                          value={noteDate}
                          onChange={(e) => setNoteDate(e.target.value)}
                          className="w-full border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Topic bahasan */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">
                        Topik Utama Bahasan *
                      </label>
                      <input
                        type="text"
                        value={noteTopic}
                        onChange={(e) => setNoteTopic(e.target.value)}
                        placeholder="Cth: Pointer dinamis heap & garbage collector"
                        className="w-full border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                      />
                    </div>

                    {/* Editor rich input toolbar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center bg-slate-50/50 p-1 rounded-t-xl border border-b-0 border-slate-200">
                        <label className="block font-bold text-slate-700 pl-1">
                          Isi Catatan Materi Kuliah *
                        </label>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => applyTemplateStructure("general")}
                            className="px-1.5 py-0.5 bg-pink-50 text-[#FF2D75] border border-pink-100 rounded text-[9px] font-extrabold hover:bg-pink-100 transition-all cursor-pointer bg-white"
                          >
                            + Templat Materi
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTemplateStructure("points")}
                            className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold hover:bg-emerald-100 transition-all cursor-pointer bg-white"
                          >
                            + Poin Rumus
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTemplateStructure("tasks")}
                            className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-extrabold hover:bg-amber-100 transition-all cursor-pointer bg-white"
                          >
                            + Semat Tugas
                          </button>
                        </div>
                      </div>

                      {/* RICH FORMATTING TOOLBAR BAR (Requested in Prompt 6) */}
                      <div className="flex flex-wrap gap-1.5 p-1 px-1.5 bg-slate-100 rounded-b-none border border-t-0 border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "bold",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 px-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-3xs cursor-pointer flex items-center justify-center font-black"
                          title="Tebal / Bold"
                        >
                          <Bold size={11} className="mr-0.5" /> B
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "italic",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 px-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 shadow-3xs cursor-pointer flex items-center justify-center italic"
                          title="Miring / Italic"
                        >
                          <Italic size={11} className="mr-0.5" /> I
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "underline",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 px-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 shadow-3xs cursor-pointer flex items-center justify-center underline"
                          title="Garis Bawah / Underline"
                        >
                          <Underline size={11} className="mr-0.5" /> U
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "strikethrough",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 px-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 shadow-3xs cursor-pointer flex items-center justify-center line-through"
                          title="Coret / Strikethrough"
                        >
                          <Strikethrough size={11} className="mr-0.5" /> S
                        </button>

                        <div className="h-5 w-[1px] bg-slate-250 self-center mx-1"></div>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "bullet",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 shadow-3xs cursor-pointer"
                          title="Bullet List •"
                        >
                          <List size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "number",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 shadow-3xs cursor-pointer"
                          title="Numbered List 1."
                        >
                          <ListOrdered size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "highlight",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 shadow-3xs cursor-pointer"
                          title="Highlighter / Stabilo"
                        >
                          <Highlighter size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            formatText(
                              setNoteContent,
                              noteContent,
                              "quote",
                              "note-content-textarea",
                            )
                          }
                          className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-950 shadow-3xs cursor-pointer"
                          title="Kutipan / Quote"
                        >
                          <Quote size={11} />
                        </button>
                      </div>

                      <textarea
                        id="note-content-textarea"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Tuliskan utasan penjelasan materi kuliah di sini secara mendalam... Hubungkan pointer penting."
                        className="w-full border border-t-0 border-slate-200 focus:outline-hidden focus:border-t focus:border-pink-300 p-2.5 rounded-b-xl font-semibold bg-white text-slate-800 leading-relaxed font-sans text-xs min-h-[100px]"
                      />

                      {/* LIVE RENDER PREVIEW BOX */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-dashed border-slate-200 text-left space-y-1">
                        <span className="text-[9px] font-black uppercase text-pink-500 tracking-wider flex items-center gap-1">
                          Pratinjau Hasil Format Tulisan (Live Render)
                        </span>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-3xs max-h-24 overflow-y-auto leading-relaxed whitespace-pre-wrap text-slate-700">
                          {noteContent.trim() ? (
                            renderFormattedText(noteContent)
                          ) : (
                            <span className="text-slate-400 italic">
                              Ketikkan catatan di atas untuk melihat preview
                              render real-time...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 mb-1">
                        Tags (Pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        value={noteTagsRaw}
                        onChange={(e) => setNoteTagsRaw(e.target.value)}
                        placeholder="Cth: Statistika, Rumus, Ujian"
                        className="w-full border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNoteModal(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#FF2D75] hover:bg-[#e21a5d] text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </form>

                  {/* RECORDING / DICTATION COLUMN */}
                  <div className="space-y-4 text-left border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Mic size={14} className="text-pink-500" />
                          Asisten Audio Dosen Kuliah Verbatim
                        </h4>
                        {isRecording && (
                          <span className="text-[10px] text-rose-500 animate-pulse bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-sm">
                            REC • {formatRecordingTime(recordingSeconds)}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        Sambil mendengarkan kuliah, aktifkan perekam di bawah!
                        Sistem akan menyalin ucapan lisan dosen secara verbatim
                        (kata per kata) ke panel transkrip. Anda dapat langsung
                        menyematkannya ke dalam draf catatan utama Anda!
                      </p>

                      {/* Microphone button trigger and simulasi button */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className={`font-semibold text-[10px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isRecording
                              ? "bg-rose-500 text-white shadow-xs"
                              : "bg-slate-900 text-white hover:bg-black/90 shadow-md"
                          }`}
                        >
                          {isRecording ? (
                            <MicOff size={11} />
                          ) : (
                            <Mic size={11} />
                          )}
                          {isRecording
                            ? "Hentikan Rekam Live"
                            : "Mulai Rekam Suara Dosen"}
                        </button>

                        <button
                          type="button"
                          onClick={handleStartSimulasi}
                          disabled={isRecording && !simulationInterval}
                          className="font-extrabold text-[10px] py-2.5 px-3 rounded-xl border border-pink-250 text-pink-600 hover:bg-pink-50/50 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                        >
                          Simulasikan Suara Dosen
                        </button>
                      </div>

                      {/* Status Logger box */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 text-[10px] font-semibold text-slate-500 text-left flex items-start gap-1.5 leading-relaxed">
                        <AlertCircle
                          size={12}
                          className="text-pink-400 shrink-0 mt-0.5"
                        />
                        <span>{recordingStatus}</span>
                      </div>

                      {/* Transcription container */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                          <span>HASIL TRANSKRIP VERBATIM:</span>
                          {transcription && (
                            <button
                              type="button"
                              onClick={() => setTranscription("")}
                              className="text-slate-400 hover:text-red-500 text-[10px] font-bold underline transition-colors cursor-pointer"
                            >
                              Hapus Hasil
                            </button>
                          )}
                        </div>

                        <textarea
                          readOnly
                          value={transcription}
                          placeholder="Transkrip uraian lisan penjelasan dosen akan tercetak verbatim otomatis di sini ketika perekaman suara aktif..."
                          className="w-full border border-slate-205 focus:outline-hidden p-2.5 rounded-xl font-sans text-[10px] leading-relaxed bg-white text-slate-700 font-semibold min-h-[85px]"
                        />
                      </div>
                    </div>

                    {/* Append transcript button */}
                    <div className="pt-3">
                      <button
                        type="button"
                        disabled={!transcription.trim()}
                        onClick={appendTranscriptToNote}
                        className="w-full py-2.5 bg-pink-100 hover:bg-[#FF2D75] text-[#FF2D75] hover:text-white border border-pink-200 text-xs font-black rounded-xl shadow-3xs cursor-pointer transition-all disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-201"
                      >
                        ✓ Masukkan Transkrip Dosen ke Catatan
                      </button>
                      <p className="text-[9px] text-slate-400 text-center font-bold mt-1.5">
                        Menempelkan verbatim suara secara instan di kursor/akhir
                        catatan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DETAILED NOTE PREVIEW MODAL */}
        {selectedNote && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto pt-10 sm:pt-20 md:pt-28">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-2xl rounded-3xl max-w-lg w-full p-6 text-left space-y-4 relative overflow-hidden my-0 max-h-[85vh] sm:max-h-[88vh] flex flex-col"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500" />

              <div className="flex justify-between items-start pt-1">
                <div>
                  <span className="text-[10px] font-black uppercase bg-pink-50 text-[#FF2D75] px-2.5 py-0.5 rounded-md border border-pink-100">
                    {selectedNote.courseTitle}
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold mt-1.5">
                    Dosen: {selectedNote.lecturerName}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <button
                    type="button"
                    onClick={() => setSelectedNote(null)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-[#FF2D75] transition-colors cursor-pointer text-xs font-bold"
                  >
                    ✕
                  </button>
                  <span className="text-[9px] text-slate-400 font-extrabold mt-1.5">
                    {selectedNote.date}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-black bg-slate-100 text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                  TOPIK JURNAL
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 leading-snug">
                  {selectedNote.topic}
                </h3>
              </div>

              {/* Rich contents */}
              <div className="leading-relaxed whitespace-pre-wrap font-semibold text-slate-700 bg-white p-4.5 rounded-2xl border border-pink-101 border-pink-100 rounded-2xl shadow-3xs max-h-80 overflow-y-auto leading-relaxed">
                {renderFormattedText(selectedNote.content)}
              </div>

              {/* tags display */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  Tag Kategori:
                </span>
                {selectedNote.tags &&
                  selectedNote.tags.map((tg) => (
                    <span
                      key={tg}
                      className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200"
                    >
                      #{tg}
                    </span>
                  ))}
              </div>

              <div className="text-[9px] text-[#FF2D75] font-extrabold text-right">
                Dibuat pada: {selectedNote.createdAt}
              </div>

              {/* Action buttons inside note modal */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const txt =
                      `Mata Kuliah: ${selectedNote.courseTitle}\n` +
                      `Dosen: ${selectedNote.lecturerName}\n` +
                      `Topik: ${selectedNote.topic}\n` +
                      `Tanggal: ${selectedNote.date}\n` +
                      `-------------------------------\n` +
                      `${selectedNote.content}`;
                    navigator.clipboard.writeText(txt);
                    alert(
                      "Sukses menyalin draf laporan materi perkuliahan ke papan klip!",
                    );
                  }}
                  className="w-full sm:w-auto text-[#FF2D75] hover:text-white hover:bg-[#FF2D75] border border-pink-200 hover:border-pink-400 bg-white py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy size={12} />
                  Salin Laporan
                </button>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => openEditNoteModal(selectedNote)}
                    className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 px-4 py-1.5 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit size={12} />
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="flex-1 sm:flex-none bg-pink-50 hover:bg-pink-100 text-[#FF2D75] border border-pink-100 px-3 py-1.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} className="text-[#FF2D75]" />
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Deletions */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-150">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 relative overflow-hidden"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-[#FF2D75]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Konfirmasi Hapus
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {deleteConfirm.type === 'note' && "Apakah Anda yakin ingin menghapus catatan materi kuliah ini?"}
                    {deleteConfirm.type === 'log' && "Apakah Anda yakin ingin menghapus data log aktivitas belajar ini?"}
                    {deleteConfirm.type === 'node' && "Apakah Anda yakin ingin menghapus node mind map ini beserta relasinya?"}
                    {deleteConfirm.type === 'flashcard' && "Hapus kartu kilat ini?"}
                    {deleteConfirm.type === 'checklist' && "Apakah Anda yakin ingin menghapus item checklist ini?"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirm.type === 'note') executeDeleteNote(deleteConfirm.id);
                    else if (deleteConfirm.type === 'log') executeDeleteLog(deleteConfirm.id);
                    else if (deleteConfirm.type === 'node') executeDeleteNode(deleteConfirm.id);
                    else if (deleteConfirm.type === 'flashcard') executeDeleteFlashcard(deleteConfirm.id);
                    else if (deleteConfirm.type === 'checklist') executeDeleteChecklistItem(deleteConfirm.nodeId || '', deleteConfirm.id);
                  }}
                  className="px-4 py-2 bg-[#FF2D75] hover:bg-pink-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
