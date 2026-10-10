import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, MicOff, Sparkles, Sparkle, AlertCircle, Search, Filter, PlusCircle, 
  FileText, Copy, Edit, Trash2, Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Highlighter, Quote, Calendar, User, Save, X, BookOpen, Volume2, AudioLines,
  BarChart2, Clock, Award, Upload, AlertTriangle, ExternalLink, Pause, Play,
  ChevronDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { AgendaItem, CalendarNote, AcademicCourse } from "../types";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isPaused?: boolean;
}

function AudioVisualizer({ stream, isRecording, isPaused = false }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isRecording || !stream || isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (!isPaused && audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      return;
    }

    let isCancelled = false;

    const setupAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const audioCtx = new AudioContextClass();
        if (isCancelled) {
          audioCtx.close();
          return;
        }
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (isCancelled || !canvasRef.current) return;
          animationRef.current = requestAnimationFrame(draw);

          analyser.getByteFrequencyData(dataArray);

          const width = canvas.width;
          const height = canvas.height;
          canvasCtx.clearRect(0, 0, width, height);

          // Number of bars we want to display (symmetrically centered)
          const barCount = 36;
          const barWidth = 3.5;
          const gap = 3;
          const totalWidth = (barCount * barWidth) + ((barCount - 1) * gap);
          const startX = (width - totalWidth) / 2;

          for (let i = 0; i < barCount; i++) {
            const half = barCount / 2;
            const distFromCenter = Math.abs(i - (barCount - 1) / 2);
            let dataIndex = 0;
            if (i < half) {
              dataIndex = Math.floor((i / half) * (bufferLength / 2));
            } else {
              dataIndex = Math.floor(((barCount - 1 - i) / half) * (bufferLength / 2));
            }

            const rawPercent = dataArray[dataIndex] / 255;
            
            let percent = 0;
            if (rawPercent > 0.08) {
              percent = rawPercent;
            } else if (rawPercent > 0.02 && distFromCenter < 6) {
              percent = rawPercent * (1 - distFromCenter / 6) * 0.8;
            } else {
              percent = 0.05;
            }

            const barHeight = Math.max(4, Math.min(height * 0.92, percent * height * 1.1));

            // Clean crisp linear gradient with authentic brand coral-pink
            const gradient = canvasCtx.createLinearGradient(0, (height - barHeight) / 2, 0, (height + barHeight) / 2);
            gradient.addColorStop(0, "#FF2D75");
            gradient.addColorStop(1, "#f43f5e");
            canvasCtx.fillStyle = gradient;

            const x = startX + i * (barWidth + gap);
            const yPos = (height - barHeight) / 2;
            
            canvasCtx.beginPath();
            if (canvasCtx.roundRect) {
              canvasCtx.roundRect(x, yPos, barWidth, barHeight, 2);
            } else {
              canvasCtx.rect(x, yPos, barWidth, barHeight);
            }
            canvasCtx.fill();
          }
        };

        draw();
      } catch (err) {
        console.warn("AudioContext setup failed or was blocked by browser autoplay policy:", err);
      }
    };

    setupAudio();

    return () => {
      isCancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream, isRecording, isPaused]);

  return (
    <div className="w-full h-15 bg-gradient-to-b from-white to-pink-50/25 border border-pink-100/90 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-2 relative shadow-inner">
      {isRecording && !isPaused ? (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <canvas ref={canvasRef} className="w-full h-8 block" width={320} height={32} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex gap-1.5 items-center justify-center">
            {Array.from({ length: 28 }).map((_, idx) => {
              const distFromMid = Math.abs(idx - 13.5);
              const heightMultiplier = Math.max(0.25, 1 - distFromMid / 14);
              return (
                <div
                  key={idx}
                  className="w-1 bg-slate-200 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.round(4 + heightMultiplier * 12)}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface TeksSuaraViewProps {
  agenda: AgendaItem[];
  courses?: AcademicCourse[];
  onWritingNoteChange?: (isWriting: boolean) => void;
}

export default function TeksSuaraView({ agenda, courses = [], onWritingNoteChange }: TeksSuaraViewProps) {
  // Audio state
  const [soundEnabled] = useState(true);

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
        e
      );
    }
  };

  // Notes state initialized from localStorage
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

  // Load study logs to compute dynamic statistics
  const [studyLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("mahas_space_study_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);
  const totalMinStudied = studyLogs.reduce((acc, curr) => acc + curr.duration, 0);
  const pomodoroCount = studyLogs.filter((l) => l.technique?.toLowerCase() === "pomodoro").length;
  const feynmanCount = studyLogs.filter((l) => l.technique?.toLowerCase() === "feynman").length;
  const totalCompletedSessions = studyLogs.length;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");
  const [selectedNote, setSelectedNote] = useState<CalendarNote | null>(null);

  // Drag scroll ref
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

  // Modals & fields
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>("");
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [recordingStatus, setRecordingStatus] = useState(
    "Siap merekam audio dosen di kelas.",
  );
  const [micError, setMicError] = useState<string | null>(null);
  const recordingModeRef = useRef<"mic" | "upload" | "none">("none");

  const audioUploadInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Open the note modal if it is not already visible
    if (!showAddNoteModal) {
      openNewNoteModal();
    }

    setRecordingStatus(`🔄 Membaca file ${file.name}...`);
    setIsRecording(true);
    setIsPaused(false);
    recordingModeRef.current = "upload";
    setTranscription("");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const base64Payload = base64data.split(",")[1];
      const mimeType = file.type || "audio/mp3";

      setRecordingStatus(`🔄 Mengirim berkas audio (${file.name}) ke AI untuk transkripsi verbatim...`);

      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: base64Payload,
            mimeType: mimeType,
          }),
        });

        const resText = await res.text();
        let data: any;
        try {
          data = JSON.parse(resText);
        } catch (parseErr) {
          console.error("Gagal melakukan parse JSON respon server:", resText.slice(0, 500));
          throw new Error(`Server mengembalikan respon non-JSON (HTML/Teks biasa) dengan status ${res.status}.`);
        }

        if (!res.ok) {
          throw new Error(data.error || "Gagal memproses berkas audio.");
        }
        if (data.transcript && data.transcript.trim() !== "") {
          setTranscription(data.transcript);
          setRecordingStatus(`⏹️ [Transkrip Berhasil] Transkrip percakapan menjadi teks telah berhasil!`);
        } else {
          setTranscription("[Hening / Suara Kurang Jelas]");
          setRecordingStatus("⏹️ [Transkrip Selesai] Tidak terdeteksi suara lisan yang jelas.");
        }
      } catch (err: any) {
        console.error("Audio File Upload Transcribe Error:", err);
        setRecordingStatus(`⚠️ Transkripsi berkas gagal: ${err.message || err}`);
      } finally {
        setIsRecording(false);
        setIsPaused(false);
        recordingModeRef.current = "none";
        // Reset file input value to allow re-uploading the same file
        if (event.target) {
          event.target.value = "";
        }
      }
    };
  };

  // Note form fields
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

  // Custom interactive date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerViewYear, setPickerViewYear] = useState(() => new Date().getFullYear());
  const [pickerViewMonth, setPickerViewMonth] = useState(() => new Date().getMonth());

  const openDatePicker = () => {
    let y = new Date().getFullYear();
    let m = new Date().getMonth();
    if (noteDate) {
      const parts = noteDate.split("-");
      if (parts.length === 3) {
        y = parseInt(parts[0], 10) || y;
        m = (parseInt(parts[1], 10) - 1) || m;
      }
    }
    setPickerViewYear(y);
    setPickerViewMonth(m);
    setIsDatePickerOpen(true);
  };

  // Timing effects
  useEffect(() => {
    let timerId: any = null;
    if (isRecording && !isPaused) {
      timerId = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRecording, isPaused]);

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

  const handleStartRecording = async () => {
    if (isRecording) {
      stopAllRecordingActivity();
      return;
    }

    setTranscription("");
    liveTranscriptRef.current = "";
    setMicError(null);
    setIsPaused(false);
    audioChunksRef.current = [];

    // Initialize browser's real-time Web Speech Recognition for ultra-instant live preview
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "id-ID";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          const cleanText = currentTranscript.trim();
          if (cleanText) {
            liveTranscriptRef.current = cleanText;
            setTranscription(cleanText);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition warning/info:", e?.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recErr) {
        console.warn("SpeechRecognition init error:", recErr);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setActiveStream(stream);
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
        setActiveStream(null);

        // If SpeechRecognition already captured live transcript accurately, finalize instantly
        if (liveTranscriptRef.current && liveTranscriptRef.current.trim().length > 5) {
          setTranscription(liveTranscriptRef.current.trim());
          setRecordingStatus("⏹️ [Transkrip Sukses] Transkrip percakapan menjadi teks telah berhasil!");
          setIsRecording(false);
          setIsPaused(false);
          recordingModeRef.current = "none";
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        if (audioBlob.size === 0) {
          setRecordingStatus(
            "⚠️ Rekaman kosong. Silakan coba berbicara kembali.",
          );
          setIsRecording(false);
          setIsPaused(false);
          recordingModeRef.current = "none";
          return;
        }

        setRecordingStatus(
          "🔄 Memproses transkripsi teks kilat dengan AI...",
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

            const resText = await res.text();
            let data: any;
            try {
              data = JSON.parse(resText);
            } catch (parseErr) {
              console.error("Gagal melakukan parse JSON respon server:", resText.slice(0, 500));
              throw new Error(`Server mengembalikan respon non-JSON (HTML/Teks biasa) dengan status ${res.status}.`);
            }

            if (!res.ok) {
              throw new Error(data.error || "Gagal memproses audio.");
            }
            if (data.transcript && data.transcript.trim() !== "") {
              setTranscription(data.transcript);
              setRecordingStatus(
                `⏹️ [Transkrip Sukses] Transkrip percakapan menjadi teks telah berhasil!`,
              );
            } else {
              setTranscription(liveTranscriptRef.current || "[Hening / Suara Kurang Jelas]");
              setRecordingStatus(
                "⏹️ [Transkrip Selesai] Transkripsi audio selesai diproses.",
              );
            }
          } catch (err: any) {
            console.error("API Transcribe Error:", err);
            if (liveTranscriptRef.current) {
              setTranscription(liveTranscriptRef.current);
              setRecordingStatus("⏹️ [Transkrip Berhasil] Transkrip lisan selesai!");
            } else {
              setRecordingStatus(
                `⚠️ Transkripsi gagal: ${err.message || err}. Buka di Tab Baru bila berlanjut.`,
              );
            }
          } finally {
            setIsRecording(false);
            setIsPaused(false);
            recordingModeRef.current = "none";
          }
        };
      };

      mediaRecorder.start(250);
      recordingModeRef.current = "mic";
      setRecordingStatus(
        "🎤 Mikrofon Aktif & Merekam... Suara dikonversi langsung secara real-time.",
      );
      setRecordingSeconds(0);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err: any) {
      console.error("Gagal mendapatkan izin mic:", err);
      setMicError(err?.message || "Permission denied");
      setRecordingStatus(
        "⚠️ Gagal mendapatkan izin mikrofon. Silakan buka aplikasi di Tab Baru atau unggah file audio.",
      );
    }
  };

  const handleTogglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    try {
      if (isPaused) {
        // Resume
        if (mediaRecorderRef.current.state === "paused") {
          mediaRecorderRef.current.resume();
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
        setIsPaused(false);
        setRecordingStatus("🎤 Mikrofon dilanjutkan & kembali merekam...");
      } else {
        // Pause
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.pause();
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
        setIsPaused(true);
        setRecordingStatus("⏸️ Perekaman dijeda (Pause). Tekan 'Lanjutkan' untuk meneruskan.");
      }
    } catch (err) {
      console.error("Error toggle pause recording:", err);
    }
  };

  const stopAllRecordingActivity = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      setActiveStream(null);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setIsPaused(false);
    recordingModeRef.current = "none";
  };

  useEffect(() => {
    if (!showAddNoteModal && activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      setActiveStream(null);
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [showAddNoteModal, activeStream]);

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

  const openNewNoteModal = () => {
    setEditingNoteId(null);
    setNoteLecturer("");
    setNoteTopic("");
    setNoteContent("");
    setNoteTagsRaw("");
    setNoteDate(new Date().toISOString().split("T")[0]);
    setIsCustomCourse(false);

    if (courses && courses.length > 0) {
      setNoteCourse(courses[0].name);
      setNoteLecturer(courses[0].lecturer || "");
    } else if (agenda && agenda.length > 0) {
      setNoteCourse(agenda[0].title);
    } else {
      setNoteCourse("Kustom");
      setIsCustomCourse(true);
    }

    setShowAddNoteModal(true);
  };

  const openEditNoteModal = (note: CalendarNote) => {
    setEditingNoteId(note.id);
    const inCourses = courses && courses.some((c) => c.name === note.courseTitle);
    const inAgenda = agenda && agenda.some((a) => a.title === note.courseTitle);
    if (inCourses) {
      setNoteCourse(note.courseTitle);
      setIsCustomCourse(false);
    } else if (inAgenda) {
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
    if (isRecording) {
      alert("Perekaman Suara Teks belum selesai! Harap hentikan rekaman live terlebih dahulu dengan menekan 'Hentikan Rekam Live' sebelum menyimpan.");
      return;
    }
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
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
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

  // Text Formatter Utility
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
    beep(523, 60);
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

    setTimeout(() => {
      textarea.focus();
      const newSelStart = start;
      const newSelEnd = start + newText.length;
      textarea.setSelectionRange(newSelStart, newSelEnd);
    }, 10);
  };

  const parseStyleMarkers = (text: string) => {
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
                <span className="text-indigo-600 mr-1.5 font-black font-mono">
                  {numMatch[1]}.
                </span>
              );
            }
          }

          if (line.trim().startsWith("> ")) {
            return (
              <blockquote key={idx} className="border-l-4 border-pink-500 pl-3.5 my-2.5 py-1 bg-pink-50/40 rounded-r-xl italic text-slate-650 font-medium">
                {parseStyleMarkers(line.trim().substring(2))}
              </blockquote>
            );
          }

          if (isList) {
            return (
              <div key={idx} className="flex items-start pl-3 my-0.5">
                {listPrefix}
                <div className="flex-1">
                  {parseStyleMarkers(content)}
                </div>
              </div>
            );
          }

          return (
            <p key={idx} className="min-h-[1rem]">
              {parseStyleMarkers(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Filter notes
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

  // Calculate unique tags
  const allUniqueTags: string[] = [];
  notes.forEach((n) => {
    if (n.tags) {
      n.tags.forEach((t) => {
        if (!allUniqueTags.includes(t)) {
          allUniqueTags.push(t);
        }
      });
    }
  });

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      {/* SECTION A: HEADER & ACTIONS */}
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-5 md:p-6 shadow-xs relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="text-left flex-1 space-y-3.5">
              <div>
                <h1 className="text-xl font-black font-display text-slate-900 tracking-tight leading-tight">
                  Suara Teks (Live Memo){" "}
                  <Mic size={22} className="text-[#FF2D75] inline-block align-middle ml-1" />
                </h1>
                <p className="text-xs text-slate-500 leading-normal font-semibold">
                  Sistem asisten rekam lisan dosen secara verbatim otomatis ke transkrip dan manajemen draf materi kuliah.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={openNewNoteModal}
                  className="relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center py-2.5 px-5 text-white text-xs font-black rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer gap-2 border border-white/25"
                  style={{ background: "linear-gradient(135deg, #ec4899 0%, #FF2D75 100%)" }}
                >
                  {/* Shimmer sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" />
                  
                  {/* Floating micro-stars */}
                  <div className="absolute top-1 left-3 animate-float-sparkle-1 opacity-80 pointer-events-none">
                    <Sparkle size={6} className="text-white fill-white" />
                  </div>
                  <div className="absolute bottom-1 right-3 animate-float-sparkle-2 opacity-75 pointer-events-none">
                    <Sparkle size={6} className="text-pink-200 fill-pink-200" />
                  </div>
                  <div className="absolute top-1.5 right-6 animate-float-sparkle-3 opacity-90 pointer-events-none">
                    <Sparkle size={5} className="text-white fill-white" />
                  </div>

                  <div className="relative flex items-center justify-center shrink-0">
                    <Mic size={15} className="relative z-10" />
                    <Sparkle 
                      size={10} 
                      className="absolute -top-2 -right-2 text-white fill-white animate-twinkle-4point-fast drop-shadow-[0_0_5px_rgba(255,255,255,0.95)]" 
                    />
                  </div>
                  <span className="relative z-10">Mulai Rekam Suara</span>
                  <div className="flex items-center gap-1 shrink-0 relative z-10">
                    <Sparkle 
                      size={11} 
                      className="text-white fill-white animate-twinkle-4point-fast drop-shadow-[0_0_5px_rgba(255,255,255,0.95)]" 
                    />
                    <Sparkle 
                      size={8} 
                      className="text-white fill-white opacity-90 animate-twinkle-4point-slow drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]" 
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => audioUploadInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center py-2.5 px-5 bg-white border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-[#FF2D75] hover:bg-pink-50 text-xs font-black rounded-xl shadow-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer gap-2"
                >
                  <Upload size={15} />
                  Unggah Audio
                </button>
                <input
                  type="file"
                  ref={audioUploadInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*, .mp3, .wav, .m4a, .ogg, .aac, .flac, .wma"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: PENCARIAN & FILTER DISATUKAN */}
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari matakuliah, topik, dosen, atau isi catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-pink-500 placeholder-slate-400 font-semibold shadow-3xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-slate-650 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tags scrolling list */}
          <div className="flex items-center gap-2 overflow-hidden bg-white/50 border border-slate-200/60 p-2.5 pb-2 px-3 rounded-xl shadow-3xs">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <div
              ref={dragScrollRefLiveMemo}
              onMouseDown={handleDragScrollMouseDown}
              onMouseLeave={handleDragScrollMouseLeave}
              onMouseUp={handleDragScrollMouseUp}
              onMouseMove={handleDragScrollMouseMove}
              className="flex gap-2 overflow-x-auto custom-scroll pb-2 select-none cursor-grab active:cursor-grabbing w-full scroll-smooth"
            >
              <button
                type="button"
                onClick={() => setSelectedTag("Semua")}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg shrink-0 transition-all cursor-pointer ${
                  selectedTag === "Semua"
                    ? "bg-[#FF2D75] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg shrink-0 transition-all cursor-pointer ${
                      selectedTag === tg
                        ? "bg-[#FF2D75] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tg} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: HASIL REKAMAN SUARA */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-[#000000] tracking-wider">
            Daftar Rekaman & Transkrip Suara
          </h3>
          <span className="text-[10px] font-bold text-[#000000]">
            {filteredNotes.length} Catatan Tersimpan
          </span>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs flex flex-col justify-between hover:border-pink-100 hover:shadow-md transition-all duration-150 cursor-pointer group relative text-left will-change-transform"
              >
                <div className="space-y-3.5 text-left">
                  {/* Header status info */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="text-[#FF2D75] pt-0.5 shrink-0">
                        <AudioLines size={19} className="text-[#FF2D75] group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#000000] leading-snug line-clamp-1 group-hover:text-[#FF2D75] transition-colors">
                          {note.topic}
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 font-bold">
                          {note.courseTitle}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-[#000000] shrink-0">
                      {note.date}
                    </span>
                  </div>

                  {/* Note details snippet */}
                  <p className="text-[11px] text-slate-655 bg-white/40 border border-white/50 p-3 rounded-xl flex items-start gap-1.5 leading-relaxed font-semibold line-clamp-3">
                    <FileText size={13} className="text-pink-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{note.content}</span>
                  </p>

                  {/* Lecturer Info & Tags */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-bold text-black pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <User size={11} className="text-[#FF2D75]" />
                      <span className="text-slate-600 font-bold">Dosen: {noteLecturer || note.lecturerName || "Dosen Pengampu"}</span>
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {note.tags.slice(0, 2).map((tg) => (
                          <span
                            key={tg}
                            className="text-[9px] font-black text-[#FF2D75] bg-pink-50/70 border border-pink-100/70 px-2 py-0.5 rounded-md"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action operations on bottom card */}
                <div className="border-t border-white/40 mt-4 pt-3 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedNote(note)}
                    className="text-[10px] font-black text-[#000000] hover:text-[#FF2D75] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <BookOpen size={12} className="text-[#000000]" />
                    Baca Catatan Lengkap
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditNoteModal(note)}
                      className="transition-colors duration-200 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-[#000000]"
                      title="Edit catatan"
                    >
                      <Edit size={13} className="text-[#000000]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ id: note.id })}
                      className="transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer text-[#ff0000]"
                      title="Hapus catatan"
                    >
                      <Trash2 size={13} className="text-[#ff0000]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white/50 border border-dashed border-slate-200 rounded-3xl text-slate-400 space-y-3 min-h-[300px]">
            <FileText size={48} className="text-slate-300 stroke-1" />
            <p className="text-xs font-bold">Tidak ada catatan kelas "Suara Teks" yang cocok.</p>
          </div>
        )}
      </div>

      {/* ALL MODALS */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {/* LIVE MEMO CREATION & EDITING MODAL */}
          {showAddNoteModal && (
            <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-5xl shadow-2xl border border-white/80 overflow-hidden text-left max-h-[92vh] flex flex-col ring-1 ring-black/5 will-change-transform"
            >
              {/* Header with Senior UI Branding and Micro-badges */}
              <div className="bg-gradient-to-r from-pink-50/70 via-white to-sky-50/50 px-6 sm:px-7 py-4.5 flex justify-between items-center shrink-0 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF2D75] via-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0 ring-4 ring-pink-50">
                    <Mic size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold font-display text-slate-900 text-base sm:text-lg tracking-tight">
                        {editingNoteId ? "Edit Catatan Kuliah" : "Studio Rekam & Draf Kuliah"}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {editingNoteId ? "Perbarui rangkuman materi dan transkrip suara" : "Rekam penjelasan dosen secara verbatim atau tulis ringkasan perkuliahan"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isRecording) {
                      alert("Perekaman Suara Teks belum selesai! Harap hentikan rekaman live terlebih dahulu sebelum menutup.");
                    } else {
                      setShowAddNoteModal(false);
                    }
                  }}
                  className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 hover:border-rose-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
                  aria-label="Tutup Modal"
                  title="Tutup Modal"
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs custom-scroll space-y-5">
                  
                  {isRecording && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-rose-500 via-[#FF2D75] to-pink-500 text-white p-3.5 px-4.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg shadow-pink-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <div>
                          <p className="font-extrabold text-xs text-white tracking-wide">
                            Perekaman Suara Dosen Aktif • {formatRecordingTime(recordingSeconds)}
                          </p>
                          <p className="text-[11px] text-pink-100 font-medium">
                            AI sedang menyimak audio secara langsung untuk menghasilkan transkrip.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-3.5 py-1.5 bg-white text-[#FF2D75] hover:bg-pink-50 text-[11px] font-extrabold rounded-xl cursor-pointer transition-all shadow-sm"
                      >
                        Hentikan Rekam
                      </button>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Form Fields and Main Editor */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Course select or kustom */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Mata Kuliah <span className="text-[#FF2D75]">*</span>
                          </label>
                          <select
                            value={isCustomCourse ? "Kustom" : noteCourse}
                            onChange={(e) => {
                              if (e.target.value === "Kustom") {
                                setIsCustomCourse(true);
                              } else {
                                setIsCustomCourse(false);
                                setNoteCourse(e.target.value);
                                if (courses) {
                                  const foundCourse = courses.find((c) => c.name === e.target.value);
                                  if (foundCourse) {
                                    setNoteLecturer(foundCourse.lecturer || "");
                                  }
                                }
                              }
                            }}
                            className="w-full border border-slate-200/90 focus:border-[#FF2D75] focus:ring-3 focus:ring-pink-500/10 focus:outline-hidden p-2.5 rounded-xl font-semibold bg-white text-slate-800 cursor-pointer text-xs transition-all shadow-3xs"
                          >
                            {courses && courses.length > 0 ? (
                              courses.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))
                            ) : agenda && agenda.length > 0 ? (
                              agenda.map((a) => (
                                <option key={a.id} value={a.title}>
                                  {a.title}
                                </option>
                              ))
                            ) : (
                              <option value="">-- Pilih Mata Kuliah --</option>
                            )}
                            <option value="Kustom">+ Tambah Mata Kuliah Kustom...</option>
                          </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Tanggal Pertemuan <span className="text-[#FF2D75]">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="date"
                              value={noteDate}
                              onChange={(e) => setNoteDate(e.target.value)}
                              onClick={(e) => {
                                e.preventDefault();
                                openDatePicker();
                              }}
                              className="w-full border border-slate-200/90 focus:border-[#FF2D75] focus:ring-3 focus:ring-pink-500/10 focus:outline-hidden p-2.5 pr-14 rounded-xl font-semibold bg-white text-slate-800 cursor-pointer text-xs transition-all shadow-3xs select-none hide-native-picker-icon"
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              aria-label="Pilih tanggal pertemuan"
                              onClick={openDatePicker}
                              className="absolute right-2.5 flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors p-1 rounded-md hover:bg-pink-50 cursor-pointer"
                              title="Klik untuk memilih tanggal pertemuan"
                            >
                              <Calendar className="w-3.5 h-3.5 pointer-events-none" />
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-600 pointer-events-none" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* custom course title */}
                      {isCustomCourse && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Nama Mata Kuliah Baru <span className="text-[#FF2D75]">*</span>
                          </label>
                          <input
                            type="text"
                            value={customCourseTitle}
                            onChange={(e) => setCustomCourseTitle(e.target.value)}
                            placeholder="Contoh: Rekayasa Perangkat Lunak"
                            className="w-full border border-slate-200/90 focus:border-[#FF2D75] focus:ring-3 focus:ring-pink-500/10 focus:outline-hidden p-2.5 rounded-xl font-semibold bg-white text-slate-800 text-xs transition-all shadow-3xs"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Topic bahasan */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Topik Pembahasan <span className="text-[#FF2D75]">*</span>
                          </label>
                          <input
                            type="text"
                            value={noteTopic}
                            onChange={(e) => setNoteTopic(e.target.value)}
                            placeholder="Contoh: Hipotesis Testing & P-Value"
                            className="w-full border border-slate-200/90 focus:border-[#FF2D75] focus:ring-3 focus:ring-pink-500/10 focus:outline-hidden p-2.5 rounded-xl font-semibold bg-white text-slate-800 text-xs transition-all shadow-3xs"
                          />
                        </div>

                        {/* Lecturer name */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Dosen Pengampu / Pembicara
                          </label>
                          <input
                            type="text"
                            value={noteLecturer}
                            onChange={(e) => setNoteLecturer(e.target.value)}
                            placeholder="Nama Dosen..."
                            className="w-full border border-slate-200/90 focus:border-[#FF2D75] focus:ring-3 focus:ring-pink-500/10 focus:outline-hidden p-2.5 rounded-xl font-semibold bg-white text-slate-800 text-xs transition-all shadow-3xs"
                          />
                        </div>
                      </div>

                      {/* Editor rich input toolbar */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Isi Catatan Materi <span className="text-[#FF2D75]">*</span>
                          </label>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => applyTemplateStructure("general")}
                              className="px-2.5 py-1 bg-sky-50/80 hover:bg-sky-100 text-sky-700 border border-sky-200/70 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              + Templat Rangkuman
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplateStructure("points")}
                              className="px-2.5 py-1 bg-pink-50/80 hover:bg-pink-100 text-[#FF2D75] border border-pink-200/70 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              + Poin Penting
                            </button>
                          </div>
                        </div>

                        {/* Rich text container with design system elevation */}
                        <div className="border border-slate-200/90 rounded-2xl overflow-hidden focus-within:border-[#FF2D75] focus-within:ring-3 focus-within:ring-pink-500/10 bg-white transition-all shadow-3xs">
                          <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-gradient-to-r from-slate-50 via-white to-pink-50/20 border-b border-slate-200/80 text-slate-700">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  formatText(
                                    setNoteContent,
                                    noteContent,
                                    "bold",
                                    "teks-suara-textarea",
                                  )
                                }
                                className="w-7 h-7 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-800 hover:text-[#FF2D75] rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer transition-all shadow-2xs"
                                title="Tebal (Bold)"
                              >
                                B
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  formatText(
                                    setNoteContent,
                                    noteContent,
                                    "italic",
                                    "teks-suara-textarea",
                                  )
                                }
                                className="w-7 h-7 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-800 hover:text-[#FF2D75] rounded-lg flex items-center justify-center italic font-serif text-xs cursor-pointer transition-all shadow-2xs"
                                title="Miring (Italic)"
                              >
                                I
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  formatText(
                                    setNoteContent,
                                    noteContent,
                                    "underline",
                                    "teks-suara-textarea",
                                  )
                                }
                                className="w-7 h-7 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-800 hover:text-[#FF2D75] rounded-lg flex items-center justify-center underline text-xs cursor-pointer transition-all shadow-2xs"
                                title="Garis Bawah (Underline)"
                              >
                                U
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  formatText(
                                    setNoteContent,
                                    noteContent,
                                    "bullet",
                                    "teks-suara-textarea",
                                  )
                                }
                                className="px-2.5 h-7 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-800 hover:text-[#FF2D75] rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all shadow-2xs"
                                title="Daftar Poin"
                              >
                                • Daftar
                              </button>
                            </div>

                            <span className="text-[10px] text-slate-400 font-semibold pr-1.5 hidden sm:inline">
                              Format Markdown Aktif
                            </span>
                          </div>

                          <textarea
                            id="teks-suara-textarea"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Tuliskan ringkasan materi perkuliahan, rumus, definisi konsep, atau kutipan dosen..."
                            className="w-full p-4 focus:outline-hidden font-normal text-slate-800 leading-relaxed font-sans text-xs min-h-[210px] resize-y bg-transparent"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Label / Tag <span className="text-slate-400 font-medium">(opsional, pisahkan dengan koma)</span>
                        </label>
                        <input
                          type="text"
                          value={noteTagsRaw}
                          onChange={(e) => setNoteTagsRaw(e.target.value)}
                          placeholder="Contoh: Teori, Ujian, Rumus, Praktikum"
                          className="w-full border border-slate-200/90 focus:border-[#FF2D75] focus:ring-3 focus:ring-pink-500/10 focus:outline-hidden p-2.5 rounded-xl font-semibold bg-white text-slate-800 text-xs transition-all shadow-3xs"
                        />
                      </div>
                    </div>

                    {/* Right Column: Audio Recording and Assistant Panel */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-gradient-to-br from-pink-50/40 via-white to-sky-50/40 border border-pink-100/90 p-5 rounded-3xl space-y-4 shadow-sm ring-1 ring-pink-500/5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D75] ring-4 ring-pink-100" />
                            Perekam Suara & Transkrip
                          </h4>
                          {isRecording ? (
                            <span className="text-[10px] text-white bg-[#FF2D75] px-2.5 py-0.5 rounded-full font-black animate-pulse shadow-xs">
                              LIVE {formatRecordingTime(recordingSeconds)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full font-bold">
                              AI Transkrip
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          Gunakan mikrofon saat perkuliahan berlangsung atau unggah berkas audio rekaman untuk transkripsi otomatis.
                        </p>

                        {/* Microphone permission instructions helper */}
                        {micError && (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed space-y-2">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertTriangle size={13} className="text-amber-700 shrink-0" />
                              <span>Akses Mikrofon Dibatasi</span>
                            </div>
                            <p className="text-[10px] text-amber-800">
                              Browser membatasi izin mikrofon pada tab tersemat. Buka aplikasi di jendela browser baru agar rekaman berjalan optimal.
                            </p>
                            <a
                              href="/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              <ExternalLink size={11} />
                              Buka di Tab Baru
                            </a>
                          </div>
                        )}

                        {/* Audio Wave Visualizer */}
                        <div className="bg-white p-1 rounded-2xl border border-pink-100/90 shadow-2xs">
                          <AudioVisualizer stream={activeStream} isRecording={isRecording} isPaused={isPaused} />
                        </div>

                        {/* Action buttons with cohesive visual tokens */}
                        <div className="space-y-2">
                          {isRecording ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={handleTogglePause}
                                className={`text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                  isPaused
                                    ? "bg-sky-600 hover:bg-sky-700 text-white border-sky-600 shadow-xs"
                                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs"
                                }`}
                              >
                                {isPaused ? <Play size={12} className="fill-white" /> : <Pause size={12} />}
                                {isPaused ? "Lanjutkan" : "Jeda"}
                              </button>

                              <button
                                type="button"
                                onClick={handleStartRecording}
                                className="text-[11px] font-bold py-2.5 px-3 rounded-xl bg-[#FF2D75] hover:bg-pink-600 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-pink-500/20"
                              >
                                <MicOff size={12} />
                                Hentikan Rekam
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStartRecording}
                              className="relative overflow-hidden w-full text-xs font-black py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF2D75] via-pink-500 to-rose-500 hover:opacity-95 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/25 active:scale-[0.98] border border-white/20"
                            >
                              {/* Shimmer sweep effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" />
                              
                              {/* Floating micro-stars */}
                              <div className="absolute top-1 left-4 animate-float-sparkle-1 opacity-80 pointer-events-none">
                                <Sparkle size={6} className="text-white fill-white" />
                              </div>
                              <div className="absolute bottom-1 right-4 animate-float-sparkle-2 opacity-75 pointer-events-none">
                                <Sparkle size={6} className="text-pink-200 fill-pink-200" />
                              </div>
                              <div className="absolute top-1.5 right-8 animate-float-sparkle-3 opacity-90 pointer-events-none">
                                <Sparkle size={5} className="text-white fill-white" />
                              </div>

                              <div className="relative flex items-center justify-center shrink-0">
                                <Mic size={15} className="text-white stroke-[2.5] relative z-10" />
                                <Sparkle 
                                  size={10} 
                                  className="absolute -top-2 -right-2 text-white fill-white animate-twinkle-4point-fast drop-shadow-[0_0_5px_rgba(255,255,255,0.95)]" 
                                />
                              </div>
                              <span className="relative z-10">Mulai Rekam Suara Dosen</span>
                              <div className="flex items-center gap-1 shrink-0 relative z-10">
                                <Sparkle 
                                  size={11} 
                                  className="text-white fill-white animate-twinkle-4point-fast drop-shadow-[0_0_5px_rgba(255,255,255,0.95)]" 
                                />
                                <Sparkle 
                                  size={8} 
                                  className="text-white fill-white opacity-90 animate-twinkle-4point-slow drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]" 
                                />
                              </div>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => audioUploadInputRef.current?.click()}
                            className="w-full text-[11px] font-bold py-2.5 px-3 rounded-xl border border-sky-200/90 bg-sky-50/60 hover:bg-sky-100 text-sky-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Upload size={13} className="text-sky-600" />
                            Unggah Berkas Audio (MP3/WAV/M4A)
                          </button>
                        </div>

                        {/* Status Message */}
                        <div className={`p-2.5 px-3 rounded-xl text-[11px] font-semibold border ${
                          recordingStatus.includes("Transkrip Sukses") || recordingStatus.includes("Transkrip Berhasil")
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-white border-pink-100 text-slate-700 shadow-3xs"
                        }`}>
                          <div className="flex items-start gap-2">
                            {!(recordingStatus.includes("Transkrip Sukses") || recordingStatus.includes("Transkrip Berhasil")) && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D75] mt-1.5 shrink-0" />
                            )}
                            <span className="leading-snug">{recordingStatus}</span>
                          </div>
                        </div>

                        {/* Transcript Area */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-700">Hasil Salinan Transkrip:</span>
                            {transcription && (
                              <button
                                type="button"
                                onClick={() => setTranscription("")}
                                className="text-slate-400 hover:text-[#FF2D75] text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Bersihkan
                              </button>
                            )}
                          </div>

                          <textarea
                            readOnly
                            value={transcription}
                            placeholder="Teks transkrip perkuliahan akan muncul di sini secara otomatis saat rekaman berjalan atau audio diproses..."
                            className="w-full border border-pink-100/90 focus:border-[#FF2D75] focus:ring-2 focus:ring-pink-500/15 p-3 rounded-2xl font-mono text-[11px] leading-relaxed bg-white text-slate-800 min-h-[110px] focus:outline-hidden transition-all shadow-3xs"
                          />

                          <button
                            type="button"
                            disabled={!transcription.trim()}
                            onClick={appendTranscriptToNote}
                            className="w-full py-2.5 bg-gradient-to-r from-pink-50 to-sky-50 hover:from-[#FF2D75] hover:to-pink-600 hover:text-white text-[#FF2D75] border border-pink-200/80 text-xs font-black rounded-xl cursor-pointer transition-all shadow-2xs disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                          >
                            + Sisipkan Transkrip ke Isi Catatan
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer buttons */}
                <div className="px-6 sm:px-7 py-4 bg-gradient-to-r from-slate-50 via-white to-pink-50/20 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecording) {
                        alert("Perekaman Suara Teks belum selesai! Harap hentikan rekaman live terlebih dahulu sebelum membatalkan.");
                      } else {
                        setShowAddNoteModal(false);
                      }
                    }}
                    className="px-5 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all shadow-2xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D75] via-pink-500 to-rose-500 hover:opacity-95 text-white font-black rounded-xl text-xs cursor-pointer transition-all shadow-md shadow-pink-500/25 active:scale-[0.98]"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* DETAILED NOTE PREVIEW MODAL */}
        {selectedNote && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 z-[99999] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-3xl max-w-xl w-full p-5 sm:p-6 text-left space-y-4 relative overflow-hidden my-auto max-h-[90vh] flex flex-col z-[100000] will-change-transform"
            >
              {/* Header card info */}
              <div className="flex justify-between items-start pt-1 border-b border-pink-100/70 pb-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black bg-pink-50 text-[#FF2D75] px-2.5 py-0.5 rounded-full border border-pink-200 uppercase tracking-wider">
                      {selectedNote.courseTitle}
                    </span>
                    <span className="text-[11px] font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {selectedNote.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    Dosen Pengampu: <strong className="text-slate-800">{selectedNote.lecturerName || "-"}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNote(null)}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 hover:border-rose-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
                  title="Tutup Modal"
                  aria-label="Tutup"
                >
                  <X size={16} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#FF2D75] uppercase tracking-wider">
                  Topik Pembahasan
                </span>
                <h3 className="text-base font-extrabold font-display text-slate-800 leading-snug">
                  {selectedNote.topic}
                </h3>
              </div>

              {/* Rich contents */}
              <div className="leading-relaxed whitespace-pre-wrap font-normal text-slate-800 bg-gradient-to-br from-pink-50/20 via-white to-sky-50/20 p-4.5 rounded-2xl border border-pink-100/80 text-xs max-h-80 overflow-y-auto custom-scroll shadow-2xs">
                {renderFormattedText(selectedNote.content)}
              </div>

              {/* tags display */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400">
                    Label:
                  </span>
                  {selectedNote.tags.map((tg) => (
                    <span
                      key={tg}
                      className="text-[10px] font-bold text-[#FF2D75] bg-pink-50/60 px-2.5 py-0.5 rounded-lg border border-pink-100"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons inside note modal */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-pink-100/70">
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
                  className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 bg-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy size={13} className="text-sky-600" />
                  Salin Catatan
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => openEditNoteModal(selectedNote)}
                    className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Edit size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ id: selectedNote.id })}
                    className="flex-1 sm:flex-none bg-pink-50 hover:bg-pink-100 text-[#FF2D75] border border-pink-200 px-4 py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                </div>
              </div>
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
                  <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-[#FF2D75]" />
                  </div>
                  <h3 className="font-black font-display text-slate-900 text-sm">Konfirmasi Hapus</h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Apakah Anda yakin ingin menghapus catatan materi kuliah ini? Tindakan ini tidak dapat dibatalkan.
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
                    onClick={() => handleDeleteNote(deleteConfirm.id)}
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

      {/* Custom Universal Date Picker Modal for Tanggal Pertemuan (Works 100% reliably in cross-origin iframes, renders instantly without lag) */}
      {typeof document !== 'undefined' && isDatePickerOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100000] p-4">
          <div className="bg-white rounded-3xl border border-pink-100 max-w-sm w-full p-5 shadow-2xl space-y-4 text-left select-none animate-in fade-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-pink-100/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-[#FF2D75] text-white flex items-center justify-center shadow-md shadow-pink-200">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Pilih Tanggal Pertemuan
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Jadwal Pertemuan Kuliah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body: Date Picker Mode */}
            <div>
              {/* Month / Year Navigator */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={() => {
                    let newM = pickerViewMonth - 1;
                    let newY = pickerViewYear;
                    if (newM < 0) {
                      newM = 11;
                      newY -= 1;
                    }
                    setPickerViewMonth(newM);
                    setPickerViewYear(newY);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-pink-50 hover:text-pink-600 text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-xs text-slate-800">
                  {new Date(pickerViewYear, pickerViewMonth, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    let newM = pickerViewMonth + 1;
                    let newY = pickerViewYear;
                    if (newM > 11) {
                      newM = 0;
                      newY += 1;
                    }
                    setPickerViewMonth(newM);
                    setPickerViewYear(newY);
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
                  const firstDayIdx = new Date(pickerViewYear, pickerViewMonth, 1).getDay();
                  const daysInMonth = new Date(pickerViewYear, pickerViewMonth + 1, 0).getDate();
                  const cells = [];
                  
                  const todayStr = (() => {
                    const t = new Date();
                    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                  })();

                  // Empty padding cells
                  for (let i = 0; i < firstDayIdx; i++) {
                    cells.push(<div key={`pad-${i}`} className="h-8" />);
                  }

                  // Day buttons
                  for (let day = 1; day <= daysInMonth; day++) {
                    const mStr = String(pickerViewMonth + 1).padStart(2, "0");
                    const dStr = String(day).padStart(2, "0");
                    const cellDateStr = `${pickerViewYear}-${mStr}-${dStr}`;
                    const isSelected = noteDate === cellDateStr;
                    const isToday = todayStr === cellDateStr;

                    cells.push(
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() => {
                          setNoteDate(cellDateStr);
                          setIsDatePickerOpen(false);
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
                    setNoteDate(str);
                    setIsDatePickerOpen(false);
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
                    setNoteDate(str);
                    setIsDatePickerOpen(false);
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
                    setNoteDate(str);
                    setIsDatePickerOpen(false);
                  }}
                  className="flex-1 py-1.5 text-[11px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors cursor-pointer"
                >
                  +7 Hari
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
