import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Share2, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  Edit, 
  Search, 
  FileText, 
  Filter, 
  Check, 
  X,
  PlusCircle,
  Mic,
  MicOff
} from "lucide-react";
import { AgendaItem, CalendarNote } from "../types";

interface JadwalViewProps {
  agenda: AgendaItem[];
  setAgenda: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
  onWritingNoteChange?: (isWriting: boolean) => void;
}

export default function JadwalView({ agenda, setAgenda, onWritingNoteChange }: JadwalViewProps) {
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"jadwal" | "catatan">("jadwal");

  // New agenda form fields
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState<"class" | "discussion" | "webinar">("class");

  // Notes state
  const [notes, setNotes] = useState<CalendarNote[]>(() => {
    const saved = localStorage.getItem("campushub_calendar_notes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "note-1",
        courseTitle: "Statistika Terapan & Analisis Data",
        lecturerName: "Dr. Eng. Irfan Subakti",
        topic: "Hipotesis Testing & P-Value",
        date: "2026-06-05",
        createdAt: "05 Juni 2026, 14:15",
        content: `📌 METODE HIPOTESIS TESTING\nMateri perkuliahan hari ini sangat krusial membahas tentang Null Hypothesis (H0) dan Alternative Hypothesis (H1).\n\nPoin Penting:\n1. P-Value < alpha (0.05) -> TOLAK H0, terima H1. Berarti ada perbedaan signifikan.\n2. Type I Error (Alpha) & Type II Error (Beta).\n3. Contoh kasus: uji keampuhan obat baru dibanding plasebo.\n\nTugas / Follow Up:\nKerjakan soal halaman 142 nomor 1-5 menggunakan SPSS/R Studio. Kumpulkan minggu depan di ketua kelas.`,
        tags: ["Statistika", "Rumus", "Tugas"]
      },
      {
        id: "note-2",
        courseTitle: "Algoritma & Pemrograman II",
        lecturerName: "Prof. Hermawan, M.T.",
        topic: "Alokasi Memori Dinamis & Pointer",
        date: "2026-06-03",
        createdAt: "03 Juni 2026, 10:45",
        content: `🔒 POINTER DAN DYNAMIC MEMORY (C/C++)\nHari ini fokus pada penggunaan malloc, calloc, realloc, dan free untuk mengontrol memori dinamis di Heap area.\n\nCatatan Penting:\n- Selalu free() memori yang telah di-allocate untuk menghindari "Memory Leak"!\n- Pointer menunjuk ke alamat memori fisik variabel lain.\n- Perbedaan malloc (tidak auto clean) vs calloc (pemberian inisialisasi nol).\n\nTips Dosen:\n"Gunakan Valgrind untuk mendeteksi memory leak sebelum dikumpulkan ke aslab!"`,
        tags: ["Coding", "Pointer", "Ujian"]
      }
    ];
  });

  // State update helper with persistence
  const updateNotesState = (newNotes: CalendarNote[]) => {
    setNotes(newNotes);
    localStorage.setItem("campushub_calendar_notes", JSON.stringify(newNotes));
  };

  // Notes Search and Tag States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");
  const [selectedNote, setSelectedNote] = useState<CalendarNote | null>(null);

  // drag scroll states for categories
  const dragScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragDown, setIsDragDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleDragScrollMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragDown(true);
    if (dragScrollRef.current) {
      setDragStartX(e.pageX - dragScrollRef.current.offsetLeft);
      setDragScrollLeft(dragScrollRef.current.scrollLeft);
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
    if (dragScrollRef.current) {
      const x = e.pageX - dragScrollRef.current.offsetLeft;
      const walk = (x - dragStartX) * 1.5; // Scroll speed multiplier
      dragScrollRef.current.scrollLeft = dragScrollLeft - walk;
    }
  };
  
  // Note Creation/Editing States
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Voice Recording and Speech to Text states
  const startSimulasiRef = React.useRef<() => void>(undefined);
  const mediaRecorderRef = React.useRef<any>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [recordingStatus, setRecordingStatus] = useState("Siap merekam audio dosen di kelas.");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [simulationInterval, setSimulationInterval] = useState<any>(null);

  useEffect(() => {
    let timerId: any = null;
    if (isRecording) {
      setRecordingSeconds(0);
      timerId = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
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
    "[PENJELASAN DOSEN]: Baik, untuk materi penutup, perhatikan penggunaan indeks pada database relasional. Indeks mempercepat proses pembacaan data, tetapi perlu diingat bahwa terlalu banyak indeks juga akan memperlambat operasi penulisan data seperti INSERT atau UPDATE. Gunakan indeks hanya pada kolom yang sering dicari."
  ];

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setIsSpeechSupported(true);
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "id-ID";

      rec.onstart = () => {
        setRecordingStatus("🎤 Perekaman aktif (Live). Silakan berbicara sekarang, suara Anda akan langsung berubah menjadi teks...");
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setRecordingStatus("❌ Akses mikrofon diblokir oleh browser. Klik tombol 'Simulasikan Dosen' untuk mengetes audio ke teks!");
          setIsRecording(false);
        } else if (e.error === "no-speech") {
          setRecordingStatus("⚠️ Mikrofon tidak menangkap suara. Silakan berbicara lebih keras...");
          setIsRecording(false);
        } else if (e.error === "network") {
          setRecordingStatus("⚠️ Koneksi mikrofon dibatasi sandbox iFrame (Kesalahan Jaringan). Mengaktifkan otomatis ke Mode Simulasi Dosen agar tetap dapat diuji! Tip: Buka aplikasi di Tab Baru untuk mic asli.");
          setTimeout(() => {
            if (startSimulasiRef.current) {
              startSimulasiRef.current();
            }
          }, 2000);
        } else {
          setRecordingStatus(`⚠️ Kesalahan mikrofon: ${e.error}. Menyediakan simulasi otomatis...`);
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
    setRecordingStatus("🎙️ [MODE SIMULASI] Mensimulasikan materi penjelasan dosen secara visual...");
    setTranscription("");

    const textChoice = lectureSimulationTexts[Math.floor(Math.random() * lectureSimulationTexts.length)];
    
    const words = textChoice.split(" ");
    let i = 0;
    let accumulated = "";

    const timer = setInterval(() => {
      if (i < words.length) {
        accumulated += (i === 0 ? "" : " ") + words[i];
        setTranscription(accumulated);
        i++;
      } else {
        clearInterval(timer);
        setSimulationInterval(null);
        setIsRecording(false);
        setRecordingStatus("⏹️ [SIMULASI Selesai] Transkrip audio dosen sukses disimpan!");
      }
    }, 285);

    setSimulationInterval(timer);
  };

  useEffect(() => {
    startSimulasiRef.current = handleStartSimulasi;
  }, [simulationInterval]);

  const handleToggleVoiceRecording = async () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
          setRecordingStatus("⏹️ Menghentikan perekaman... Sedang memproses transkripsi AI.");
        } catch (e) {
          console.error("Gagal menghentikan media recorder:", e);
          setIsRecording(false);
          setRecordingStatus("⏹️ Perekaman dihentikan.");
        }
      } else {
        setIsRecording(false);
        setRecordingStatus("⏹️ Perekaman/Simulasi dihentikan.");
      }
    } else {
      setTranscription("");
      
      try {
        setRecordingStatus("🎤 Menghubungkan mikrofon... Harap berikan izin akses.");
        setIsRecording(true);
        audioChunksRef.current = [];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Determine the best supported mimeType
        let options = { mimeType: "audio/webm" };
        if (typeof MediaRecorder !== "undefined") {
          if (!MediaRecorder.isTypeSupported("audio/webm")) {
            options = { mimeType: "audio/ogg" };
          }
          if (!MediaRecorder.isTypeSupported("audio/ogg") && !MediaRecorder.isTypeSupported("audio/webm")) {
            // let browser select default
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
          // Clean up track streams to release hardware indicator
          stream.getTracks().forEach((track) => track.stop());
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
          if (audioBlob.size === 0) {
            setRecordingStatus("⚠️ Rekaman kosong. Silakan coba berbicara kembali.");
            setIsRecording(false);
            return;
          }

          setRecordingStatus("🔄 Mengirim rekaman suara ke AI untuk transkripsi verbatim...");
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
                  mimeType: mediaRecorder.mimeType || "audio/webm"
                })
              });

              if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Gagal memproses audio.");
              }

              const data = await res.json();
              if (data.transcript && data.transcript.trim() !== "") {
                setTranscription(data.transcript);
                setRecordingStatus("⏹️ [Transkrip Sukses] Transkrip audio dosen sukses disimpan!");
              } else {
                setTranscription("[Hening / Suara Kurang Jeles]");
                setRecordingStatus("⏹️ [Transkrip Selesai] Tidak terdeteksi materi suara yang jelas.");
              }
            } catch (err: any) {
              console.error("API Transcribe Error:", err);
              setRecordingStatus(`⚠️ Transkripsi gagal: ${err.message || err}. Buka di Tab Baru bila berlanjut.`);
            } finally {
              setIsRecording(false);
            }
          };
        };

        mediaRecorder.start(250);
        setRecordingStatus("🎤 Mikrofon Aktif & Merekam... Silakan berbicara sekarang. Tekan 'Hentikan Rekam' untuk melihat transkrip.");
      } catch (err: any) {
        console.error("Gagal mendapatkan izin mic:", err);
        setRecordingStatus("⚠️ Koneksi mikrofon langsung dibatasi sandbox iFrame browser. Mengaktifkan Mode Simulasi Dosen...");
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
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
    setNoteContent(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n📝 [REKAMAN SUARA DOSEN]\n${transcription}` : `📝 [REKAMAN SUARA DOSEN]\n${transcription}`;
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

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation) {
      alert("Isi judul dan ruang lokasi!");
      return;
    }

    const item: AgendaItem = {
      id: "agenda-" + Date.now(),
      title: newTitle,
      time: newTime,
      location: newLocation,
      type: newType,
      color: newType === "class" ? "blue" : newType === "discussion" ? "teal" : "purple"
    };

    setAgenda(prev => [...prev, item].sort((a,b) => a.time.localeCompare(b.time)));
    setNewTitle("");
    setNewLocation("");
    setShowAddModal(false);
  };

  const handleDeleteAgenda = (id: string) => {
    setAgenda(prev => prev.filter(a => a.id !== id));
  };

  // Note actions
  const openNewNoteModal = () => {
    setEditingNoteId(null);
    setNoteLecturer("");
    setNoteTopic("");
    setNoteContent("");
    setNoteTagsRaw("");
    setNoteDate(new Date().toISOString().split("T")[0]);
    setIsCustomCourse(false);
    
    if (agenda.length > 0) {
      setNoteCourse(agenda[0].title);
    } else {
      setNoteCourse("Kustom");
      setIsCustomCourse(true);
    }
    
    setShowAddNoteModal(true);
  };

  const openEditNoteModal = (note: CalendarNote) => {
    setEditingNoteId(note.id);
    const inAgenda = agenda.some(a => a.title === note.courseTitle);
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
    setSelectedNote(null); // Close reading modal if open
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
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const formattedDate = () => {
      try {
        const d = new Date(noteDate);
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch {
        return noteDate;
      }
    };

    if (editingNoteId) {
      // Editing
      const idx = notes.findIndex(n => n.id === editingNoteId);
      if (idx !== -1) {
        const updated = [...notes];
        updated[idx] = {
          ...updated[idx],
          courseTitle: finalCourseTitle,
          lecturerName: noteLecturer || "Dosen Pengampu",
          topic: noteTopic,
          content: noteContent,
          date: noteDate,
          createdAt: `${formattedDate()}, ${new Date().toTimeString().split(" ")[0].slice(0,5)}`,
          tags: parsedTags.length > 0 ? parsedTags : ["Kuliah"]
        };
        updateNotesState(updated);
      }
    } else {
      // Creating
      const newNote: CalendarNote = {
        id: "note-" + Date.now(),
        courseTitle: finalCourseTitle,
        lecturerName: noteLecturer || "Dosen Pengampu",
        topic: noteTopic,
        content: noteContent,
        date: noteDate,
        createdAt: `${formattedDate()}, ${new Date().toTimeString().split(" ")[0].slice(0,5)}`,
        tags: parsedTags.length > 0 ? parsedTags : ["Kuliah"]
      };
      updateNotesState([newNote, ...notes]);
    }

    setShowAddNoteModal(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan materi kuliah ini?")) {
      const remaining = notes.filter(n => n.id !== id);
      updateNotesState(remaining);
      setSelectedNote(null);
    }
  };

  // Helper template structures to auto-insert
  const applyTemplateStructure = (type: "general" | "points" | "tasks") => {
    let structure = "";
    if (type === "general") {
      structure = `📌 UTAS MATERI KULIAH:\n- \n\n📖 DETAIL PENJELASAN:\n- \n\n🔑 POIN UTAMA JANGAN DILUPAKAN:\n- \n`;
    } else if (type === "points") {
      structure = `🔑 POIN-POIN & RUMUS UTAMA:\n• \n• \n\n💬 PENJELASAN DOSEN:\n" "\n\n💡 LINK REFERENSI:\n- \n`;
    } else if (type === "tasks") {
      structure = `⚠️ TUGAS & PR MANDIRI DI KELAS:\n- Tugas: \n- Deadline: \n- Dikumpulkan ke: \n\n📋 CATATAN PERSIAPAN:\n- \n`;
    }
    setNoteContent(prev => prev + (prev ? "\n\n" : "") + structure);
  };

  // Gather all unique tags
  const allUniqueTags = Array.from(
    new Set(notes.flatMap(n => n.tags || []))
  );

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const query = searchTerm.toLowerCase();
    const matchQuery = 
      n.courseTitle.toLowerCase().includes(query) ||
      n.topic.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.lecturerName.toLowerCase().includes(query);
      
    const matchTag = selectedTag === "Semua" || (n.tags && n.tags.includes(selectedTag));
    return matchQuery && matchTag;
  });

  return (
    <div className="space-y-6 text-left relative z-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Calendar className="text-[#FF2D75]" />
            Jadwal & Catatan Kalender Kelas
          </h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Kelola agenda harian, dan catat materi yang diberikan oleh dosen secara langsung di kelas saat perkuliahan berlangsung.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="bg-white/60 hover:bg-white text-slate-700 border border-pink-100 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all text-center cursor-pointer active:scale-95 shadow-xs"
          >
            {copied ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-55" />
                Disalin
              </>
            ) : (
              <>
                <Copy size={13} className="text-[#FF2D75]" />
                Bagikan Kalender
              </>
            )}
          </button>
          
          {activeSubTab === "jadwal" ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-pink-100 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={14} />
              Agendakan Aktivitas
            </button>
          ) : (
            <button
              onClick={openNewNoteModal}
              className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-pink-100 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              Mulai Catat Materi
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Switcher */}
      <div className="flex border-b border-[#FF2D75]/10 gap-6">
        <button 
          onClick={() => setActiveSubTab("jadwal")}
          className={`pb-3 px-1 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "jadwal" 
              ? "border-[#FF2D75] text-[#FF2D75]" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Clock size={13} />
          Jadwal Kuliah & Agenda
        </button>
        <button 
          onClick={() => setActiveSubTab("catatan")}
          className={`pb-3 px-1 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "catatan" 
              ? "border-[#FF2D75] text-[#FF2D75]" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileText size={13} />
          <span>📝 Catatan Kalender Kelas (Live Memo)</span>
          <span className="bg-[#FF2D75]/10 text-[#FF2D75] text-[10px] px-2 py-0.5 rounded-full font-bold">
            {notes.length}
          </span>
        </button>
      </div>

      {/* RENDER TAB 1: SCHEDULE & AGENDA */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 always-sparkle-shine p-5 sm:p-6 rounded-[32px] ${activeSubTab === "jadwal" ? "" : "hidden"}`}>
          
          {/* Left Column: Agenda List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs">
              <h3 className="font-extrabold font-display text-slate-800 text-sm mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#FF2D75] rounded-full"></span>
                Timeline Jadwal Terdekat
              </h3>

              <div className="relative border-l-2 border-pink-100/60 pl-6 ml-2.5 space-y-6">
                {agenda.map((item) => {
                  let pillBg = "bg-blue-50 text-blue-700 border border-blue-100";
                  let badgeType = "Mata Kuliah";
                  if (item.type === "discussion") {
                    pillBg = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                    badgeType = "Diskusi";
                  } else if (item.type === "webinar") {
                    pillBg = "bg-purple-50 text-purple-700 border border-purple-100";
                    badgeType = "Webinar";
                  }

                  return (
                    <div key={item.id} className="relative group text-left">
                      {/* Visual node on timeline */}
                      <div className="absolute -left-[31px] top-1.5 w-[14px] h-[14px] rounded-full bg-white border-4 border-[#FF2D75] flex items-center justify-center shadow-xs">
                      </div>

                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 flex justify-between items-start gap-3 hover:border-pink-200 hover:bg-white/60 transition-all shadow-xs">
                        <div className="space-y-1.5 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${pillBg}`}>
                              {badgeType}
                            </span>
                            <span className="text-[9px] text-white font-extrabold bg-[#FF2D75]/95 px-2 py-0.5 rounded border border-[#FF2D75]/35 shadow-xs shrink-0 tracking-wide">
                              {item.time} WIB
                            </span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-800 truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <MapPin size={10} className="text-[#FF2D75]" />
                            {item.location}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteAgenda(item.id)}
                          className="text-slate-400 hover:text-red-500 text-[10px] font-bold py-1 px-2 hover:bg-white rounded-lg border border-slate-100 hover:border-red-100 transition-all cursor-pointer bg-slate-50/50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
                {agenda.length === 0 && (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <span className="text-3xl">☕</span>
                    <p className="text-xs font-bold text-slate-700">Tidak ada jadwal kuliah atau agenda tersisa hari ini!</p>
                    <p className="text-[10px] text-slate-400">Waktunya istirahat atau nulis agenda pribadi baru.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Information Board */}
          <div className="space-y-5">
            <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs text-left">
              <h3 className="font-extrabold font-display text-slate-800 text-sm mb-3">Informasi Kelas Pengganti</h3>
              <div className="space-y-3">
                <div className="bg-[#FFF5E6] border border-orange-100 p-4 rounded-2xl text-slate-700 space-y-1.5">
                  <p className="text-xs font-black text-amber-800 flex items-center gap-1">
                    <AlertCircle size={14} className="text-amber-600" />
                    Pengumuman Kelas Bergeser
                  </p>
                  <p className="text-[10px] leading-relaxed font-bold text-slate-650">
                    Kelas <strong>Statistika Terapan & Analisis Data</strong> dipindah ke hari Jum'at pukul 13.00 WIB karena dosen menghadiri seminar dekanat.
                  </p>
                </div>

                <div className="border border-pink-100/60 p-4 rounded-xl text-[10px] font-bold leading-relaxed space-y-1 text-slate-550 bg-white/20">
                  <p className="font-extrabold text-[#FF2D75]">Petunjuk Sinkronisasi Google Calendar:</p>
                  <p>Saat Anda mendaftar event kampus, Webinar, atau Beasiswa, jadwal tersebut secara otomatis tersinkronisasi dan tampil di tab beranda maupun kalender.</p>
                </div>

                <div onClick={() => setActiveSubTab("catatan")} className="border-2 border-dashed border-[#FF2D75]/40 hover:border-[#FF2D75] hover:bg-white p-4 rounded-2xl transition-all cursor-pointer text-center space-y-1.5">
                  <p className="font-black text-xs text-[#FF2D75] flex items-center justify-center gap-1">
                    <BookOpen size={13} />
                    Catat Materi Kuliah Langsung
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Jangan lewatkan penjelasan dosen. Klik untuk membuat memo, meringkas rumus, atau mencatat tugas langsung di kelas!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      {/* RENDER TAB 2: CALENDAR LECTURE NOTES (LIVE NOTEPAD) */}
      <div 
        className={`space-y-4 always-sparkle-shine p-5 sm:p-6 rounded-[32px] ${activeSubTab === "catatan" ? "block" : "hidden"}`}
      >
        
        {/* DRAGGABLE CATEGORY SELECTOR (div:nth-of-type(1)) */}
        <div 
          ref={dragScrollRef}
          onMouseDown={handleDragScrollMouseDown}
          onMouseLeave={handleDragScrollMouseLeave}
          onMouseUp={handleDragScrollMouseUp}
          onMouseMove={handleDragScrollMouseMove}
          className="flex gap-1.5 overflow-x-auto select-none shrink-0 scrollbar-none pb-2 cursor-grab active:cursor-grabbing"
        >
          {["Semua", "Statistika", "Rumus", "Tugas", "Coding", "Pointer", "Ujian", "Lainnya"].map((tg) => {
            const isActive = selectedTag === tg;
            return (
              <button
                key={tg}
                type="button"
                onClick={() => setSelectedTag(tg)}
                className={`px-3.5 py-2 text-[11px] font-black rounded-xl transition-all whitespace-nowrap border shrink-0 ${
                  isActive 
                    ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white border-white/20 shadow-md shadow-pink-100" 
                    : "bg-white/60 text-slate-600 hover:bg-white/80 border-slate-200"
                }`}
              >
                {tg}
              </button>
            );
          })}
        </div>

        {/* Filters shelf (div:nth-of-type(2)) */}
        <div className="bg-white/45 backdrop-blur-md p-4 rounded-2xl border border-white/60 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
          
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari matakuliah, topik, dosen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-pink-100/80 focus:outline-hidden focus:border-pink-300 rounded-xl text-[11px] font-semibold bg-white/60 text-slate-800"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5 hover:text-slate-700 text-slate-400">
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => { setSearchTerm(""); setSelectedTag("Semua"); }}
            className="text-[10px] font-extrabold text-[#FF2D75] flex items-center gap-1 hover:opacity-80 active:scale-95 transition-all bg-white px-3 py-2 rounded-xl border border-pink-100"
          >
            <Sparkles size={11} />
            Reset Pencarian
          </button>
        </div>

        <div className="text-[10px] font-extrabold text-[#FF2D75] flex items-center gap-1 px-1">
          <Sparkles size={11} />
          <span>Menampilkan {filteredNotes.length} berkas jurnal catatan kelas</span>
        </div>

          {/* Grid stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Quick Draft block card */}
            <div 
              onClick={openNewNoteModal}
              className="border-2 border-dashed border-pink-200/60 hover:border-pink-400 bg-pink-50/10 hover:bg-pink-50/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[170px] transition-all group scale-100 active:scale-98"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 text-[#FF2D75] flex items-center justify-center mb-3 group-hover:scale-105 transition-all">
                <Plus size={20} />
              </div>
              <h4 className="font-extrabold text-xs text-slate-700 group-hover:text-[#FF2D75] transition-colors">Buat Catatan Baru</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[190px]">Tulis penjelasan materi dosen, poin rumus, & tugas mandiri langsung di sini.</p>
            </div>

            {/* List notes */}
            {filteredNotes.map(n => (
              <div 
                key={n.id}
                className="bg-white/45 hover:bg-white/65 border border-white/60 hover:border-pink-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-xs transition-all relative overflow-hidden group min-h-[170px]"
              >
                {/* Cute paper corner bookmark detail */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-pink-100 to-transparent pointer-events-none group-hover:from-pink-200/50 transition-all rounded-bl-xl"></div>
                
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-white truncate max-w-[80%] shadow-xs">
                      {n.courseTitle}
                    </span>
                    <span className="text-[8px] text-slate-400 font-extrabold shrink-0 mt-0.5">{n.date}</span>
                  </div>

                  <div>
                    <h4 
                      onClick={() => setSelectedNote(n)}
                      className="font-black text-xs text-slate-800 hover:text-[#FF2D75] transition-colors cursor-pointer line-clamp-1 flex items-center gap-1"
                    >
                      {n.topic}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Dosen: {n.lecturerName}</p>
                  </div>

                  <p className="text-[10px] text-slate-550 line-clamp-3 leading-relaxed whitespace-pre-line font-medium pr-1">
                    {n.content}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100/80 flex justify-between items-center mt-3 gap-2">
                  <div className="flex gap-1 flex-wrap max-w-[60%]">
                    {n.tags && n.tags.slice(0, 3).map(tg => (
                      <span key={tg} className="text-[8px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                        #{tg}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedNote(n)}
                      className="text-[#FF2D75] bg-pink-50/60 hover:bg-[#FF2D75] hover:text-white border border-pink-100/60 px-2 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                    >
                      Baca
                    </button>
                    <button
                      onClick={() => openEditNoteModal(n)}
                      className="text-white hover:text-white bg-slate-950 hover:bg-black border border-slate-950 px-1.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Edit size={10} />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="text-slate-405 hover:text-red-500 hover:bg-red-50/40 p-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && notes.length > 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-2xl">🔎</span>
              <p className="text-xs font-bold text-slate-700">Catatan tidak ditemukan!</p>
              <p className="text-[10px] text-slate-400">Silakan bersihkan filter pencarian atau kata kunci tag.</p>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedTag("Semua"); }}
                className="text-xs font-bold text-[#FF2D75] underline cursor-pointer hover:opacity-85"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

      {/* MODAL 1: ADD / EDIT AGENDA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-x2 max-w-sm w-full rounded-2xl shadow-2xl border border-white/80 overflow-hidden text-left transform animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white p-5 flex justify-between items-center">
              <h3 className="font-black font-display text-sm flex items-center gap-1">
                <Sparkles size={16} className="fill-white" />
                Tambahkan Agenda Pribadi Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:opacity-85 transition-all text-sm font-black cursor-pointer"
              >
                Tutup
              </button>
            </div>
            
            <form onSubmit={handleCreateAgenda} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Agenda / Aktivitas *</label>
                <input
                  type="text"
                  placeholder="Contoh: Belajar Kelompok IoT atau Ujian Lab"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-pink-100/80 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Waktu *</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Contoh: 14:30"
                    className="w-full border border-pink-100/80 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Agenda *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full border border-pink-100/80 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                  >
                    <option value="class">Kelas Kuliah</option>
                    <option value="discussion">Diskusi Kelompok</option>
                    <option value="webinar">Seminar / Webinar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi / Link Zoom *</label>
                <input
                  type="text"
                  placeholder="Contoh: Lab Komputer 1 atau Online (Link Zoom)"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full border border-pink-100/80 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WRITE / EDIT CALENDAR NOTES */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-white/60 overflow-hidden text-left my-8 transform animate-in zoom-in-95 duration-200">
            
            {/* Header banner */}
            <div className="bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white p-5 flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="font-extrabold font-display text-sm flex items-center gap-1.5 text-white">
                  <BookOpen size={16} />
                  {editingNoteId ? "Ubah Catatan Jurnal Kuliah" : "Mulai Catat Materi Perkuliahan"}
                </h3>
                <p className="text-[10px] text-pink-100">Tulis materi penting, rumus, atau rekam audio dosen langsung di kelas.</p>
              </div>
              <button
                type="button"
                onClick={() => { stopAllRecordingActivity(); setShowAddNoteModal(false); }}
                className="text-white hover:opacity-85 text-xs font-black cursor-pointer bg-black/10 px-2.5 py-1.5 rounded-xl border border-white/10"
              >
                X Tutup
              </button>
            </div>

            {/* Split layout: Form (Left) & STT Live Pad (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              
              {/* LEFT COLUMN: Main Form */}
              <form onSubmit={handleSaveNote} className="lg:col-span-7 p-6 space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Select Course from Agenda list */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mata Kuliah *</label>
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
                      className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white text-slate-800"
                    >
                      {agenda.map(a => (
                        <option key={a.id} value={a.title}>{a.title}</option>
                      ))}
                      <option value="Kustom">-- Matakuliah Lain (Ketik Manual) --</option>
                    </select>
                  </div>

                  {/* Custom Course Text Box */}
                  {isCustomCourse && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ketik Nama Matakuliah Kustom *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kewirausahaan II"
                        value={customCourseTitle}
                        onChange={(e) => setCustomCourseTitle(e.target.value)}
                        className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-slate-800"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Lecturer Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosen Pengampu / Pembicara</label>
                    <input
                      type="text"
                      placeholder="Contoh: Dr. Ir. Joko Susilo"
                      value={noteLecturer}
                      onChange={(e) => setNoteLecturer(e.target.value)}
                      className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-slate-800"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Pertemuan *</label>
                    <input
                      type="date"
                      required
                      value={noteDate}
                      onChange={(e) => setNoteDate(e.target.value)}
                      className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-slate-800"
                    />
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topik Utama Bahasan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengantar Transformasi Fourier, Bab 4 Aljabar Linier"
                    required
                    value={noteTopic}
                    onChange={(e) => setNoteTopic(e.target.value)}
                    className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-slate-800"
                  />
                </div>

                {/* Note Content and Quick Formatting Utilities */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold text-slate-700">Isi Catatan Materi Kuliah *</label>
                    
                    {/* Template Structures Triggers */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold text-slate-400">Format:</span>
                      <button
                        type="button"
                        onClick={() => applyTemplateStructure("general")}
                        className="px-1.5 py-0.5 bg-pink-50 text-[#FF2D75] border border-pink-100 rounded text-[9px] font-extrabold hover:bg-pink-100 transition-all cursor-pointer bg-white"
                      >
                        + Umum
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplateStructure("points")}
                        className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold hover:bg-emerald-100 transition-all cursor-pointer bg-white"
                      >
                        + Rumus
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplateStructure("tasks")}
                        className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-extrabold hover:bg-amber-100 transition-all cursor-pointer bg-white"
                      >
                        + Tugas
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    placeholder="Ketik pembahasan, poin kritis materi, atau rumus krusial di sini... (Atau gunakan perekam suara di sebelah kanan)"
                    required
                    rows={8}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-3 rounded-xl font-semibold bg-white/60 text-slate-800 leading-relaxed font-sans text-xs"
                  />
                  
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                    <span>Gunakan tanda bintang (*) atau nomor untuk penulisan yang rapi</span>
                    <span>{noteContent.length} Karakter | {noteContent.split(/\s+/).filter(Boolean).length} Kata</span>
                  </div>
                </div>

                {/* Tags raw split */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tags (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Matematika, PR, BahanUAS, Esai"
                    value={noteTagsRaw}
                    onChange={(e) => setNoteTagsRaw(e.target.value)}
                    className="w-full border border-pink-100/85 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-slate-800"
                  />
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Memudahkan pencarian dan pengelompokan berdasarkan ujian atau tugas.</p>
                </div>

                {/* Button actions of form */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { stopAllRecordingActivity(); setShowAddNoteModal(false); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Simpan Catatan Kelas
                  </button>
                </div>
              </form>

              {/* RIGHT COLUMN: Bilah Tambahan Khusus untuk Teks dari Suara */}
              <div className="lg:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-150 rounded-b-3xl lg:rounded-b-none">
                
                <div className="space-y-4 text-left">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-pink-100/30 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-2.5 w-2.5">
                        {isRecording && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRecording ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Mic size={13} className="text-[#FF2D75]" />
                        Bilah Transkripsi Suara Kelas
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono transition-all flex items-center gap-1.5 ${
                      isRecording 
                        ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
                      Durasi: {formatRecordingTime(recordingSeconds)}
                    </span>
                  </div>

                  {/* Audio Wave Simulation Box */}
                  <div className={`h-12 rounded-xl flex items-center justify-center gap-1.5 transition-all ${isRecording ? 'bg-red-50 border border-red-100/60' : 'bg-slate-100/80 border border-dashed border-slate-200'}`}>
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[10px] text-red-650 font-black animate-pulse mr-2">Dosen berbicara...</span>
                        <div className="h-4 w-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }}></div>
                        <div className="h-7 w-1 bg-gradient-to-t from-red-400 to-[#FF2D75] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.8s' }}></div>
                        <div className="h-5 w-1 bg-[#FF2D75] rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }}></div>
                        <div className="h-8 w-1 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }}></div>
                        <div className="h-3 w-1 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.4s' }}></div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Mic size={12} className="text-slate-400" />
                        Tekan 'Aktifkan Mic' di bawah untuk merekam live
                      </p>
                    )}
                  </div>

                  {/* Recording control buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className={`flex-1 font-extrabold text-[10px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-100' 
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-250'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff size={13} />
                          <span>Hentikan Rekam</span>
                        </>
                      ) : (
                        <>
                          <Mic size={13} className="text-[#FF2D75]" />
                          <span>Aktifkan Mic</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleStartSimulasi}
                      disabled={isRecording && !simulationInterval}
                      className="font-extrabold text-[10px] py-2.5 px-3 rounded-xl border border-pink-200 text-[#FF2D75] hover:bg-pink-50/50 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                      title="Menguji fitur transkripsi dengan penjelasan dosen simulasi"
                    >
                      <Sparkles size={13} />
                      <span>Simulasikan Dosen</span>
                    </button>
                  </div>

                  {/* Recording status descriptor box */}
                  <div className="bg-white border border-pink-100/60 rounded-xl p-3 text-[9px] font-semibold text-slate-500 text-left flex items-start gap-1.5 leading-relaxed">
                    <span className="text-[#FF2D75]">⚡</span>
                    <span className="text-slate-600">{recordingStatus}</span>
                  </div>

                  {/* Transcription Area Header & Output */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                      <span>Bilamana Dosen Berbicara (Live Transkrip):</span>
                      {transcription && (
                        <button
                          type="button"
                          onClick={() => setTranscription("")}
                          className="text-slate-400 hover:text-red-500 text-[9px] font-bold underline transition-colors cursor-pointer"
                        >
                          Bersihkan Teks
                        </button>
                      )}
                    </div>
                    
                    <textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      placeholder="Bagian ini khusus menangkap rekapan teks dari materi suara dosen secara otomatis. Anda juga dapat memperbaikinya di sini..."
                      rows={6}
                      className="w-full border border-pink-100/75 focus:outline-hidden focus:border-pink-350 p-3 rounded-xl font-mono text-[10px] leading-relaxed bg-white text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Footer panel controls: Append to left notes content */}
                <div className="pt-3 border-t border-slate-200/60 space-y-2 text-left">
                  <button
                    type="button"
                    onClick={appendTranscriptToNote}
                    disabled={!transcription.trim()}
                    className="w-full bg-[#FF2D75] disabled:bg-[#FF2D75]/10 text-white disabled:text-[#FF2D75]/40 hover:brightness-105 font-black text-[11px] py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-99"
                  >
                    <span>📥 Salin & Sematkan ke Catatan Utama</span>
                  </button>
                  <p className="text-[9px] text-slate-400 text-center font-bold">
                    Tekan tombol di atas untuk memasukkan teks suara ini ke akhir catatan utama kelas Anda secara otomatis.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: DISCOVERY READING LIGHTBOX FOR NOTES */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-white/60 overflow-hidden text-left relative transform animate-in fade-in duration-200">
            {/* Elegant warm notebook-like header */}
            <div className="bg-slate-50 border-b border-pink-50 p-6 flex justify-between items-start">
              <div className="space-y-1.5 max-w-[85%] text-left">
                <div className="flex gap-2 items-center">
                  <span className="text-[9px] font-black uppercase bg-[#FF2D75]/10 text-[#FF2D75] px-2 py-0.5 rounded border border-[#FF2D75]/20">
                    {selectedNote.courseTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-extrabold">{selectedNote.date}</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                  {selectedNote.topic}
                </h3>
                <p className="text-[10px] font-bold text-slate-500">
                  Diajarkan oleh: <span className="text-[#FF2D75]">{selectedNote.lecturerName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black p-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Note details content inside scrolling frame */}
            <div className="p-6 bg-pink-50/5 text-xs text-left text-slate-720 max-h-[350px] overflow-y-auto space-y-4">
              <div className="leading-relaxed whitespace-pre-wrap font-semibold text-slate-700 bg-white p-4.5 rounded-2xl border border-pink-100/50 shadow-xs">
                {selectedNote.content}
              </div>

              {/* Tag display row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tag Kategori:</span>
                {selectedNote.tags && selectedNote.tags.map(tg => (
                  <span key={tg} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    #{tg}
                  </span>
                ))}
              </div>

              <div className="text-[9px] text-slate-400 font-extrabold text-right">
                Diperbarui pada: {selectedNote.createdAt}
              </div>
            </div>

            {/* Bottom action toolbox */}
            <div className="bg-slate-50 p-4 border-t border-pink-50 flex justify-between items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `=== CATATAN MATERI KULIAH ===\n` +
                    `Mata Kuliah: ${selectedNote.courseTitle}\n` +
                    `Dosen: ${selectedNote.lecturerName}\n` +
                    `Topik: ${selectedNote.topic}\n` +
                    `Tanggal: ${selectedNote.date}\n` +
                    `-----------------------------\n\n` +
                    `${selectedNote.content}`
                  );
                  alert("Seluruh materi catatan berhasil disalin ke clipboard!");
                }}
                className="text-[#FF2D75] hover:text-white hover:bg-[#FF2D75] border border-pink-200 hover:border-pink-400 bg-white py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy size={12} />
                <span>Salin Seluruh Catatan</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditNoteModal(selectedNote)}
                  className="bg-slate-100 hover:bg-slate-200 px-4 py-1.5 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit size={12} />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-3 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
