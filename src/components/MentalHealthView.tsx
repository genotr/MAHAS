import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  Smile, 
  FileText, 
  Send, 
  Calendar, 
  Users, 
  EyeOff, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Award,
  AlertCircle,
  Wind,
  Play,
  Pause,
  Volume2,
  Music,
  Activity,
  Key,
  Search
} from "lucide-react";
import { MentalHealthJournal, CounselorSession } from "../types";

interface MentalHealthViewProps {
  journals: MentalHealthJournal[];
  setJournals: React.Dispatch<React.SetStateAction<MentalHealthJournal[]>>;
  sessions: CounselorSession[];
  setSessions: React.Dispatch<React.SetStateAction<CounselorSession[]>>;
}

export default function MentalHealthView({
  journals,
  setJournals,
  sessions,
  setSessions
}: MentalHealthViewProps) {
  const [moodWord, setMoodWord] = useState<"Sempurna" | "Baik" | "Biasa Saja" | "Lelah" | "Bad Mood">("Baik");
  const [journalNote, setJournalNote] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Relax & Stress Test States (Replacing Halodoc)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "holdIn" | "exhale" | "holdOut">("inhale");
  const [breathingProgress, setBreathingProgress] = useState(35);
  const [breathingTime, setBreathingTime] = useState(4);
  const [breathingCycles, setBreathingCycles] = useState(0);
  const [breathingTechnique, setBreathingTechnique] = useState<"box" | "relax" | "coherence">("box");

  const [quizAnswers, setQuizAnswers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCurrentStep, setQuizCurrentStep] = useState(0);

  const [ambientPlay, setAmbientPlay] = useState(false);
  const [ambientType, setAmbientType] = useState<"rain" | "waves" | "campfire">("rain");
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Empathetic Chatbot state simulation
  const [chatMessages, setChatMessages] = useState<Array<{sender: "user" | "ai", text: string}>>([
    { sender: "ai", text: "Halo Temanku! Saya adalah Sahabat Rasa, rekan curhat AI setiamu. Apabila dadamu terasa sesak, pikiranmu penuh, atau kamu merasa lelah dengan tugas kuliah dan skripsi, tumpahkan seluruh keluh kesahmu di sini. Saya selalu bersedia memvalidasi perasaan harianmu secara tulus tanpa menghakimi. ❤️" }
  ]);
  const [chatbotInput, setChatbotInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTabMode, setActiveTabMode] = useState<"chatbot" | "relax" | "jurnal" | "halodoc">("chatbot");

  // Halodoc Telekonsultasi States
  const [halodocApiKey, setHalodocApiKey] = useState(() => {
    return localStorage.getItem("HALODOC_API_KEY") || "";
  });
  const [tempHalodocKey, setTempHalodocKey] = useState(halodocApiKey);
  const [showHalodocConfig, setShowHalodocConfig] = useState(false);
  const [halodocQuery, setHalodocQuery] = useState("Kecemasan");
  const [halodocConsultants, setHalodocConsultants] = useState<any[]>([]);
  const [loadingHalodoc, setLoadingHalodoc] = useState(false);
  const [halodocSource, setHalodocSource] = useState("Local Feed");

  // Chat overlay states
  const [showConsultationChat, setShowConsultationChat] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<any | null>(null);
  const [halodocChatMessages, setHalodocChatMessages] = useState<Array<{sender: "user" | "doctor", text: string}>>([]);
  const [halodocChatInput, setHalodocChatInput] = useState("");
  const [loadingDoctorChat, setLoadingDoctorChat] = useState(false);

  const fetchHalodocConsultants = async (queryVal: string) => {
    setLoadingHalodoc(true);
    try {
      const activeKey = localStorage.getItem("HALODOC_API_KEY") || halodocApiKey;
      const resp = await fetch(`/api/halodoc-consultants?q=${encodeURIComponent(queryVal)}`, {
        headers: {
          "X-Halodoc-API-Key": activeKey
        }
      });
      const data = await resp.json();
      if (data) {
        setHalodocConsultants(data.consultants || []);
        setHalodocSource(data.source || "Offline Doctor Cache");
      }
    } catch (err) {
      console.error("Gagal menarik data Halodoc:", err);
    } finally {
      setLoadingHalodoc(false);
    }
  };

  useEffect(() => {
    if (activeTabMode === "halodoc") {
      fetchHalodocConsultants(halodocQuery);
    }
  }, [activeTabMode]);

  const handleSaveHalodocKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("HALODOC_API_KEY", tempHalodocKey.trim());
    setHalodocApiKey(tempHalodocKey.trim());
    setShowHalodocConfig(false);
    fetchHalodocConsultants(halodocQuery);
  };

  const startConsultationChat = (doctor: any) => {
    setActiveDoctor(doctor);
    setShowConsultationChat(true);
    setHalodocChatMessages([
      { sender: "doctor", text: `Halo, perkenalkan saya ${doctor.name}. Senang sekali bisa terhubung dengan Anda melalui konsultasi Halodoc ini. Silakan ceritakan keluhan kecemasan, kejenuhan, or stresor akademik yang sedang Anda rasakan saat ini. Saya siap menyimak dan memvalidasi perasaan Anda.` }
    ]);
  };

  const submitHalodocChat = async () => {
    if (!halodocChatInput.trim() || !activeDoctor) return;
    
    const userMsg = halodocChatInput.trim();
    setHalodocChatInput("");
    
    const nextMsgs = [
      ...halodocChatMessages,
      { sender: "user" as const, text: userMsg }
    ];
    setHalodocChatMessages(nextMsgs);
    setLoadingDoctorChat(true);

    try {
      const historyFormatted = nextMsgs.map(m => ({
        sender: m.sender === "user" ? "user" : "doctor",
        text: m.text
      }));

      const response = await fetch("/api/halodoc-chat-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName: activeDoctor.name,
          alumni: activeDoctor.alumni || "Universitas Indonesia",
          messageInput: userMsg,
          messageHistory: historyFormatted
        })
      });

      const data = await response.json();
      if (data && data.text) {
        setHalodocChatMessages(prev => [...prev, { sender: "doctor", text: data.text }]);
      }
    } catch (err) {
      console.error("Gagal mengobrol dengan Dokter Halodoc:", err);
      setHalodocChatMessages(prev => [...prev, { sender: "doctor", text: "Maaf, sepertinya sambungan video/chat medis kita terhambat sekejap. Yuk bisa dicoba kirim pesan lagi." }]);
    } finally {
      setLoadingDoctorChat(false);
    }
  };

  const triggerChatSubmit = async (customText?: string) => {
    const textToSend = customText || chatbotInput;
    if (!textToSend.trim()) return;

    if (!customText) {
      setChatbotInput("");
    }

    const newUserMsg = { sender: "user" as const, text: textToSend };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/curhat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, newUserMsg]
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: "ai", text: data.text || "Saya di sini mendengarmu..." }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: "ai", text: "Aduh, sepertinya jaringan batin kita terganggu sekejap. Tapi tidak apa-apa menceritakan lagi ya, saya tetap mendengarkan!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Breathing Guide Tickers and Progress effect
  useEffect(() => {
    let timer: any = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathingTime((prevTime) => {
          if (prevTime <= 1) {
            if (breathingTechnique === "box") {
              if (breathingPhase === "inhale") {
                setBreathingPhase("holdIn");
                return 4;
              } else if (breathingPhase === "holdIn") {
                setBreathingPhase("exhale");
                return 4;
              } else if (breathingPhase === "exhale") {
                setBreathingPhase("holdOut");
                return 4;
              } else {
                setBreathingPhase("inhale");
                setBreathingCycles((c) => c + 1);
                return 4;
              }
            } else if (breathingTechnique === "relax") {
              if (breathingPhase === "inhale") {
                setBreathingPhase("holdIn");
                return 7;
              } else if (breathingPhase === "holdIn") {
                setBreathingPhase("exhale");
                return 8;
              } else {
                setBreathingPhase("inhale");
                setBreathingCycles((c) => c + 1);
                return 4;
              }
            } else {
              if (breathingPhase === "inhale") {
                setBreathingPhase("exhale");
                return 5;
              } else {
                setBreathingPhase("inhale");
                setBreathingCycles((c) => c + 1);
                return 5;
              }
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      const initialMap = { box: 4, relax: 4, coherence: 5 };
      setBreathingTime(initialMap[breathingTechnique]);
      setBreathingPhase("inhale");
      setBreathingCycles(0);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathingPhase, breathingTechnique]);

  // Breathing expand/contract scale visual loop
  useEffect(() => {
    let subTimer: any = null;
    if (breathingActive) {
      subTimer = setInterval(() => {
        const durationMap = {
          box: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
          relax: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
          coherence: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
        };
        const maxTime = durationMap[breathingTechnique][breathingPhase] || 4;
        
        setBreathingProgress((prev) => {
          if (breathingPhase === "inhale") {
            const next = prev + (65 / (maxTime * 10));
            return next > 100 ? 100 : next;
          } else if (breathingPhase === "holdIn") {
            return 100;
          } else if (breathingPhase === "exhale") {
            const next = prev - (65 / (maxTime * 10));
            return next < 35 ? 35 : next;
          } else {
            return 35;
          }
        });
      }, 100);
    } else {
      setBreathingProgress(40);
    }
    return () => clearInterval(subTimer);
  }, [breathingActive, breathingPhase, breathingTechnique]);

  // Web Audio Context Synthesizer for Natural Noise (Rain/Waves/Campfire)
  useEffect(() => {
    let source: AudioBufferSourceNode | null = null;
    let localCtx: AudioContext | null = null;
    let waveInterval: any = null;
    let crackleInterval: any = null;

    if (ambientPlay) {
      try {
        const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (CtxClass) {
          localCtx = new CtxClass();
          setAudioCtx(localCtx);
          
          const bufferSize = 2 * localCtx.sampleRate;
          const noiseBuffer = localCtx.createBuffer(1, bufferSize, localCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (ambientType === "rain") {
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.08; 
              b6 = white * 0.115926;
            } else if (ambientType === "waves") {
              b0 = 0.997 * b0 + white * 0.085;
              output[i] = b0 * 0.12;
            } else {
              output[i] = white * 0.08;
            }
          }

          source = localCtx.createBufferSource();
          source.buffer = noiseBuffer;
          source.loop = true;

          const lowpass = localCtx.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = ambientType === "rain" ? 1200 : ambientType === "waves" ? 500 : 900;

          const gain = localCtx.createGain();
          gain.gain.value = 0.1;

          if (ambientType === "waves") {
            let time = 0;
            waveInterval = setInterval(() => {
              if (localCtx) {
                time += 0.08;
                const targetFreq = 350 + Math.sin(time) * 200;
                const targetGain = 0.03 + (Math.sin(time) + 1) * 0.04;
                lowpass.frequency.setValueAtTime(targetFreq, localCtx.currentTime);
                gain.gain.setValueAtTime(targetGain, localCtx.currentTime);
              }
            }, 80);
          } else if (ambientType === "campfire") {
            crackleInterval = setInterval(() => {
              if (localCtx && Math.random() > 0.82) {
                gain.gain.setValueAtTime(0.25, localCtx.currentTime);
                setTimeout(() => {
                  if (localCtx) gain.gain.setValueAtTime(0.08, localCtx.currentTime);
                }, 50 + Math.random() * 80);
              }
            }, 120);
          }

          source.connect(lowpass);
          lowpass.connect(gain);
          gain.connect(localCtx.destination);
          source.start(0);
        }
      } catch (err) {
        console.warn("Could not load browser synthetic AudioContext:", err);
      }
    }

    return () => {
      if (waveInterval) clearInterval(waveInterval);
      if (crackleInterval) clearInterval(crackleInterval);
      if (source) {
        try { source.stop(); } catch(e){}
      }
      if (localCtx) {
        try { localCtx.close(); } catch(e){}
      }
    };
  }, [ambientPlay, ambientType]);

  // Counselor list for appointments
  const counselors = [
    { name: "Dr. Indah Permatasari, M.Psi.", specialty: "Kecemasan Akademik & burnout", desc: "Berpengalaman 8 tahun menangani stres kuliah, skripsi, dan tekanan perfeksionisme.", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200" },
    { name: "Muhammad Rian, S.Psi., M.A.", specialty: "Hubungan Sosial & Eksistensial", desc: "Konsultasi adaptasi lingkungan rantau baru, konflik pertemanan, dan pencarian jati diri.", avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200" }
  ];

  const [selectedCounselor, setSelectedCounselor] = useState(counselors[0].name);
  const [appointDate, setAppointDate] = useState("2026-06-02");
  const [appointTime, setAppointTime] = useState("14:00");
  const [appointTopic, setAppointTopic] = useState("Stres mengurus skripsi dan tugas numpuk");

  const handleLogJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalNote) return;

    const newJournal: MentalHealthJournal = {
      id: "jrn-" + Date.now(),
      date: "Hari Ini, " + new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
      moodValue: moodWord,
      note: journalNote,
      anonymous: isAnon
    };

    setJournals(prev => [newJournal, ...prev]);
    setJournalNote("");
    setIsAnon(false);
  };

  const handleBookCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSession: CounselorSession = {
      id: "sess-" + Date.now(),
      date: appointDate,
      time: appointTime,
      counselorName: selectedCounselor,
      topic: appointTopic,
      type: "VideoCall",
      status: "Scheduled"
    };

    setSessions(prev => [newSession, ...prev]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
    }, 4000);

    setAppointTopic("");
  };

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* Title */}
      <div className="space-y-1.5 animate-fade-in">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
          <HeartHandshake className="text-[#FF2D75]" />
          Pusat Curhat AI & Kesehatan Mental Kampus
        </h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Kesehatan mentalmu sama pentingnya dengan nilai akademik. Tumpahkan beban pikiranmu ke Chatbot AI Sahabat Rasa yang super peka dan memahami perasaanmu harian, atau tulis jurnal emosi pribadimu dengan aman.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: AI Chatbot / Journaling Space */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tab Selector Buttons */}
          <div className="flex gap-1.5 border-b border-pink-100 pb-1 flex-wrap">
            <button
              onClick={() => {
                setActiveTabMode("chatbot");
              }}
              className={`pb-3.5 px-3 font-black text-xs cursor-pointer transition-all border-b-2 ${
                activeTabMode === "chatbot" 
                  ? "border-[#FF2D75] text-[#FF2D75]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              💬 Curhat AI Sahabat Rasa
            </button>
            <button
              onClick={() => {
                setActiveTabMode("relax");
              }}
              className={`pb-3.5 px-3 font-black text-xs cursor-pointer transition-all border-b-2 ${
                activeTabMode === "relax" 
                  ? "border-[#0284c7] text-[#0284c7]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              🧘 Ruang Tenang & Tes Stres
            </button>
            <button
              onClick={() => {
                setActiveTabMode("jurnal");
              }}
              className={`pb-3.5 px-3 font-black text-xs cursor-pointer transition-all border-b-2 ${
                activeTabMode === "jurnal" 
                  ? "border-[#FF2D75] text-[#FF2D75]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              📓 Buku Jurnal Mental Mandiri
            </button>
            <button
              onClick={() => {
                setActiveTabMode("halodoc");
              }}
              className={`pb-3.5 px-3 font-black text-xs cursor-pointer transition-all border-b-2 ${
                activeTabMode === "halodoc" 
                  ? "border-red-500 text-red-500 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              🩺 Halodoc Telekonsultasi
            </button>
          </div>

          {activeTabMode === "chatbot" ? (
            /* AI EMPATHETIC CHATBOT COMPONENT PANEL */
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-xs space-y-5 flex flex-col justify-between h-[520px]">
              
              {/* Inner Dialogue History Thread */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scroll">
                {chatMessages.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}>
                      {!isUser && (
                        <span className="w-8 h-8 rounded-full bg-[#FF2D75]/10 border border-[#FF2D75]/20 flex items-center justify-center text-xs shrink-0 self-start mt-1">
                          💖
                        </span>
                      )}
                      <div className="max-w-[80%] space-y-0.5 text-left">
                        <span className="text-[9px] font-bold text-slate-400 block">
                          {isUser ? "Saya (Nadia)" : "Sahabat Rasa AI"}
                        </span>
                        <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed font-bold ${
                          isUser 
                            ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white rounded-tr-none text-right" 
                            : "bg-pink-50/40 text-slate-800 border border-pink-100 rounded-tl-none text-left"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#FF2D75]/10 flex items-center justify-center text-xs">
                      💖
                    </span>
                    <div className="bg-pink-50/20 border border-pink-100 p-3.5 rounded-2xl rounded-tl-none text-[10px] text-slate-450 italic font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#FF2D75] rounded-full animate-ping"></span>
                      <span>Sedang mencoba memahami perasaanmu, bersabarlah...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stress / Feeling suggest chips */}
              <div className="space-y-1.5">
                <span className="text-[8px] text-slate-400 font-extrabold block uppercase tracking-wider text-left">KONDISI EMOSIMU SAAT INI:</span>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {[
                    { label: "Saya cemas mau Ujian 😭", prompt: "Saya sedang sangat cemas karena besok ada ujian besar dan rasanya materi belum ada yang masuk ke otak saya." },
                    { label: "Lelah direvisi dosen mulu 💔", prompt: "Skripsi saya dicoret-coret mulu sama dosen pembimbing saya. Rasanya lelah sekali mental ini." },
                    { label: "Butuh afirmasi positif ✨", prompt: "Bisakah kamu berikan saya afirmasi positif and suntikan semangat hangat hari ini?" },
                    { label: "Stress tugas numpuk... 🤯", prompt: "Tugas perkuliahan saya menumpuk parah minggu ini, kepala saya rasanya ingin pecah menghadapi deadline-nya." }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => triggerChatSubmit(chip.prompt)}
                      disabled={chatLoading}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-pink-100 hover:border-[#FF2D75] hover:bg-pink-50/20 bg-white cursor-pointer select-none text-slate-600 transition-all active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input section bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                <input
                  type="text"
                  placeholder="Ketik apa saja yang mengganjal hatimu... (misal: 'Saya sedih sekali hari ini...')"
                  value={chatbotInput}
                  onChange={(e) => setChatbotInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && triggerChatSubmit()}
                  disabled={chatLoading}
                  className="flex-1 border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-2xl font-semibold text-xs bg-slate-50 text-slate-800"
                />
                <button
                  onClick={() => triggerChatSubmit()}
                  disabled={chatLoading || !chatbotInput.trim()}
                  className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 disabled:opacity-40 text-white p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-pink-100 shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>

            </div>
          ) : activeTabMode === "relax" ? (
            /* RELAX & STRESS TEST ROOM */
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Alert / Wellness Quote Banner */}
              <div className="bg-gradient-to-r from-sky-400 via-[#38bdf8] to-[#0284c7] text-white p-5 rounded-3xl border border-sky-200/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white border border-white/25 uppercase tracking-wide">
                      Mindfulness Center
                    </span>
                    <span className="text-xs font-bold">
                      🧘 Ambil Jeda, Sehatkan Jiwa
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-50 font-bold leading-relaxed max-w-xl">
                    "Kesehatan batinmu adalah aset akademik terpenting. Latihlah pernapasan kotak penenang batin secara instan, dengarkan suara melodi bising alam, dan diagnosis kondisi jiwamu secara rahasia."
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <span className="text-[10px] text-white/80 font-mono tracking-wider block font-bold">STABILITAS EMOSI</span>
                  <span className="text-sm font-black tracking-tight">{breathingCycles} Kali Tarik Napas</span>
                </div>
              </div>

              {/* Row 1: Visual Breathing and Ambient Sound side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                
                {/* Visual Breathing Card */}
                <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs flex flex-col justify-between items-center text-center space-y-4">
                  <div className="w-full text-left">
                    <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wide flex items-center gap-1.5 font-display mb-1">
                      <Wind className="text-sky-500 animate-pulse" size={15} />
                      Atur Napas (Breathing Guide)
                    </h4>
                    <p className="text-[10px] text-slate-450 font-bold leading-normal">
                      Metode klinis penurun pemicu kecemasan dan stresor harian Anda.
                    </p>
                  </div>

                  {/* Visual expand-contract circle */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div 
                      className="absolute rounded-full bg-sky-200/40 border border-sky-300/30 transition-all duration-300 ease-out animate-ping"
                      style={{ 
                        width: `${breathingProgress + 15}%`, 
                        height: `${breathingProgress + 15}%`,
                        opacity: breathingActive ? 0.3 : 0 
                      }}
                    ></div>
                    <div 
                      className="absolute rounded-full bg-gradient-to-tr from-sky-450 to-sky-600 border border-white shadow-md transition-all duration-300 ease-out flex flex-col justify-center items-center text-white"
                      style={{ 
                        width: `${breathingProgress}%`, 
                        height: `${breathingProgress}%` 
                      }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider block opacity-95">
                        {breathingPhase === "inhale" ? "Tarik Napas" : 
                         breathingPhase === "holdIn" ? "Tahan Napas" : 
                         breathingPhase === "exhale" ? "Hembuskan" : "Tahan"}
                      </span>
                      <span className="text-lg font-black font-display tracking-tight mt-0.5">
                        {breathingTime}s
                      </span>
                    </div>
                  </div>

                  {/* Tech selection */}
                  <div className="text-left py-1.5 px-3 bg-sky-50/50 rounded-xl border border-sky-100/60 w-full flex justify-between items-center text-[10.5px]">
                    <span className="font-bold text-slate-500">Pilihan Pola:</span>
                    <select
                      value={breathingTechnique}
                      onChange={(e) => {
                        setBreathingActive(false);
                        setBreathingTechnique(e.target.value as any);
                      }}
                      className="bg-transparent border-none py-0.5 focus:ring-0 font-extrabold text-[#0284c7] cursor-pointer"
                    >
                      <option value="box">Box Breathing (4-4-4-4)</option>
                      <option value="relax">Relaksasi 4-7-8 Deep Sleep</option>
                      <option value="coherence">Cardiac Coherence 5-5</option>
                    </select>
                  </div>

                  {/* Timer trigger button */}
                  <button
                    type="button"
                    onClick={() => setBreathingActive(!breathingActive)}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-2xs ${
                      breathingActive 
                        ? "bg-slate-800 text-white hover:bg-slate-900" 
                        : "bg-[#38bdf8] hover:bg-[#0284c7] text-white"
                    }`}
                  >
                    {breathingActive ? (
                      <>
                        <Pause size={13} />
                        Hentikan Latihan
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        Mulai Relaksasi Napas
                      </>
                    )}
                  </button>
                </div>

                {/* Ambient Sound Card */}
                <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs flex flex-col justify-between text-left space-y-4">
                  <div>
                    <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wide flex items-center gap-1.5 font-display mb-1">
                      <Music className="text-pink-500" size={15} />
                      Generator Suara Alam Penenang
                    </h4>
                    <p className="text-[10px] text-slate-450 font-bold leading-normal">
                      Putar melodi ambient alami untuk pengantar tidur asrama or melatih fokus ujian.
                    </p>
                  </div>

                  {/* Sound choices */}
                  <div className="space-y-2">
                    {[
                      { type: "rain", label: "🌧️ Hujan Sore Pembawa Tenang", desc: "Suara rintik hujan melankolis and teduh." },
                      { type: "waves", label: "🌊 Pantai & Debiran Ombak Lembut", desc: "Suara pasang surut air laut penyapu jenuh." },
                      { type: "campfire", label: "🔥 Derak Kayu Bakar Hangat", desc: "Efek creaking kayu bakar pegunungan yang rileks." }
                    ].map((sound) => {
                      const isSelected = ambientType === sound.type;
                      return (
                        <div 
                          key={sound.type}
                          onClick={() => {
                            setAmbientPlay(false);
                            setAmbientType(sound.type as any);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs flex justify-between items-center ${
                            isSelected 
                              ? "bg-white border-pink-300 shadow-2xs font-extrabold" 
                              : "bg-white/45 border-slate-100 hover:bg-white text-slate-600"
                          }`}
                        >
                          <div>
                            <p className={`font-black text-[10.5px] ${isSelected ? "text-pink-600" : "text-slate-700"}`}>{sound.label}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{sound.desc}</p>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* indicator display of sound wave feedback lines */}
                  {ambientPlay ? (
                    <div className="flex gap-1 justify-center items-end h-7 py-1 bg-white/45 rounded-xl border border-white/50">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
                        <span 
                          key={idx} 
                          className="w-1 bg-[#2e1065] rounded-full animate-bounce" 
                          style={{ 
                            height: `${Math.floor(Math.random() * 80) + 20}%`,
                            animationDuration: `${0.7 + idx * 0.05}s` 
                          }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    <div className="h-7 border border-dashed border-slate-200/85 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      🔇 Ambient Suara Berhenti Diputar
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setAmbientPlay(!ambientPlay)}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      ambientPlay 
                        ? "bg-rose-50 border border-pink-200 text-pink-700 hover:bg-rose-100" 
                        : "bg-slate-800 text-white hover:bg-slate-900"
                    }`}
                  >
                    {ambientPlay ? (
                      <>
                        <Pause size={13} />
                        Hentikan Suara
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} />
                        Putar Ambient Relaksasi
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Stress Quiz assessment element */}
              <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs text-left space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2 pb-2.5 border-b border-slate-100/50">
                  <div>
                    <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wide flex items-center gap-1.5 font-display">
                      <Activity className="text-orange-500" size={15} />
                      Asesmen Pendeteksi Kepenatan Mental (Stress Test)
                    </h4>
                    <p className="text-[10px] text-slate-450 font-bold mt-0.5 leading-normal">
                      Kalkulasi cepat potensi academic fatigue, kejenuhan skripsi, kecemasan sosial, or impostor syndrome.
                    </p>
                  </div>
                  {quizSubmitted && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizAnswers([0, 0, 0, 0, 0]);
                        setQuizSubmitted(false);
                        setQuizCurrentStep(0);
                      }}
                      className="px-2.5 py-1 text-[9px] font-black bg-orange-100 text-orange-700 hover:bg-orange-150 border border-orange-200 rounded-lg cursor-pointer"
                    >
                      Ulangi Tes
                    </button>
                  )}
                </div>

                {!quizSubmitted ? (
                  /* Doing Quiz phase */
                  <div className="space-y-4 animate-fade-in text-xs font-bold text-[#2e1065]">
                    
                    {/* Question navigation tabs */}
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[9.5px] font-bold">PERNYATAAN {quizCurrentStep + 1} DARI 5</span>
                      {/* simple bar */}
                      <div className="w-1/2 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-400 h-full transition-all duration-300"
                          style={{ width: `${(quizCurrentStep + 1) * 20}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Question item */}
                    <div className="bg-orange-50/60 text-orange-950 p-4 border border-orange-100/40 rounded-2xl flex gap-3 items-start animate-fade-in">
                      <span className="text-2xl pt-0.5 select-none shrink-0" role="img" aria-label="quiz icon">
                        {["📚", "🌙", "🔋", "👤", "🔮"][quizCurrentStep]}
                      </span>
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] tracking-wider text-orange-700 font-extrabold uppercase">ASPEK EVALUASI KE-{quizCurrentStep+1}</p>
                        <p className="text-slate-800 leading-relaxed font-extrabold text-[11px]">
                          {[
                            "Seberapa sering kamu merasa terbebani, cemas, atau mengalami stresor berat akibat penatnya jadwal kuliah/skripsi belakangan ini?",
                            "Seberapa parah kecemasan harian Anda mencederai kualitas istirahat malam (sulit memejamkan mata or overthinking berkepanjangan)?",
                            "Apakah kamu merasa kehilangan energi emosional (burnout), apatis terhadap cita-cita, or terbebani sisa tenaga harian?",
                            "Seberapa sering kamu mengalami krisis percaya diri (minder) or kecemasan berbicara di lingkungan persahabatan kampus?",
                            "Seberapa parah kekhawatiranmu meragukan kemampuan pribadi (impostor syndrome) and masa depanmu sendiri pasca kelulusan nanti?"
                          ][quizCurrentStep]}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 select-none text-left">
                      {[
                        { val: 0, text: "Tidak Pernah Sama Sekali (0 Poin)", color: "bg-emerald-50/50 hover:bg-emerald-100/30 border-emerald-150 text-emerald-800" },
                        { val: 1, text: "Jarang / Kadang-Kadang (1 Poin)", color: "bg-amber-50/35 hover:bg-amber-100/30 border-amber-150 text-amber-700" },
                        { val: 2, text: "Sering Mengalami Stresor (2 Poin)", color: "bg-orange-50/50 hover:bg-orange-100/35 border-orange-150 text-orange-850" },
                        { val: 3, text: "Hampir Setiap Hari Terjadi (3 Poin)", color: "bg-red-50/50 hover:bg-red-100/35 border-red-150 text-red-800" }
                      ].map((opt) => {
                        const isChosen = quizAnswers[quizCurrentStep] === opt.val;
                        return (
                          <div 
                            key={opt.val}
                            onClick={() => {
                              const newAns = [...quizAnswers];
                              newAns[quizCurrentStep] = opt.val;
                              setQuizAnswers(newAns);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer text-[10.5px] font-bold ${
                              isChosen 
                                ? "bg-slate-800 border-slate-900 text-white shadow-2xs" 
                                : opt.color
                            }`}
                          >
                            {opt.text}
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation bar buttons */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setQuizCurrentStep((s) => s - 1)}
                        disabled={quizCurrentStep === 0}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-45 text-slate-500 font-bold rounded-xl text-[11px] cursor-pointer"
                      >
                        Sebelumnya
                      </button>

                      {quizCurrentStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setQuizCurrentStep((s) => s + 1)}
                          className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-black rounded-xl text-[11px] cursor-pointer"
                        >
                          Lanjutkan Pernyataan →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setQuizSubmitted(true)}
                          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-105 text-white font-black rounded-xl text-[11px] shadow-sm cursor-pointer animate-pulse"
                        >
                          Kalkulasi Hasil Tes Stres
                        </button>
                      )}
                    </div>

                  </div>
                ) : (
                  /* Quiz Results phase */
                  <div className="space-y-4 animate-fade-in text-xs font-bold text-slate-700">
                    
                    {(() => {
                      const totalScore = quizAnswers.reduce((a, b) => a + b, 0);
                      let level = "Rendah (Jiwa Stabil)";
                      let levelCol = "text-emerald-600 bg-emerald-50 border-emerald-150";
                      let desc = "Kondisi mentalmu luar biasa kokoh, tangguh, and rileks! Kamu memiliki saringan stressor yang solid dalam menyeimbangkan rutinitas akademik. Tetap jaga pola makan bergizi, penuhi asupan cairan tubuh, and bincang-bincang bersama teman terdekat.";
                      if (totalScore >= 5 && totalScore <= 9) {
                        level = "Sedang (Pikiran Mulai Lelah)";
                        levelCol = "text-orange-600 bg-orange-50 border-orange-150";
                        desc = "Kamu mengindikasikan ketegangan emosional serta kepenatan kuliah yang sedang merangkak naik. Segera imbangi dengan menyelingi jam belajarmu memakai pemulihan napas, batasi layar gadget menjelang malam, and mari lepaskan unek-unek kepada Sahabat Rasa AI di sebelah kiri.";
                      } else if (totalScore >= 10) {
                        level = "Tinggi (Ambang Burnout Patologis!)";
                        levelCol = "text-red-650 bg-red-50 border-red-150";
                        desc = "Suku cadang energi batinmu telah memasuki zona kritis! Overthinking and sindrom kepenatan ini sangat mengganggu fokus produktif harianmu. Ambil waktu istirahat tidur penuh malam ini, putar getaran rintik hujan di atas, and pertimbangkan menjadwalkan konseling psikologi bersama kawan konselor kampus di sidebar kanan.";
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                          {/* Score indicator panel */}
                          <div className={`p-5 border rounded-3xl text-center flex flex-col justify-center items-center h-full gap-2 ${levelCol}`}>
                            <span className="text-[9px] font-black tracking-wider block uppercase">Skor Kepenatan Mental</span>
                            <div className="w-18 h-18 rounded-full border-4 border-current flex items-center justify-center font-display font-black text-2xl">
                              {totalScore}
                              <span className="text-[10px] font-normal text-slate-450 block absolute mt-11">/ 15 Poin</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-black tracking-tight block uppercase">{level}</span>
                            </div>
                          </div>

                          {/* Level description and recommendations panel */}
                          <div className="md:col-span-2 space-y-4 text-xs font-bold text-slate-700 text-left">
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-[#2e1065] text-xs">Penjelasan Klinis Asesmen Anda:</h5>
                              <p className="leading-relaxed text-slate-500 text-[11px] font-semibold">{desc}</p>
                            </div>

                            {/* Recommendations chips */}
                            <div className="space-y-2">
                              <p className="font-mono text-[9px] text-[#2e1065] tracking-widest uppercase mb-1">Anjuran Tindakan Cepat:</p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBreathingActive(true);
                                    setBreathingTechnique("box");
                                    setBreathingProgress(45);
                                  }}
                                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-150 text-sky-800 rounded-xl cursor-pointer"
                                >
                                  🧘 Latih Box Breathing (4 Detik)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAmbientPlay(true);
                                    setAmbientType("waves");
                                  }}
                                  className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-150 text-pink-900 rounded-xl cursor-pointer"
                                >
                                  🌊 Putar Gelombang Pantai Relaksasi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTabMode("chatbot");
                                    triggerChatSubmit(`Halo Sahabat Rasa, saya baru saja melakukan tes kestabilan stres mandiri dan mendapatkan skor total ${totalScore}/15 (${level}). Bisakah kamu menyemangati saya and mendengarkan keluh kesah saya malam ini?`);
                                  }}
                                  className="px-3 py-1.5 bg-[#FF2D75]/5 hover:bg-[#FF2D75]/10 border border-[#FF2D75]/15 text-[#FF2D75] rounded-xl cursor-pointer"
                                >
                                  💬 Bincang Curhat Sahabat Rasa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                )}
              </div>

            </div>
          ) : activeTabMode === "jurnal" ? (
            /* ORIGINAL MENTAL HEALTH JOURNAL INPUT FORM PANEL */
            <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-4">
              <h3 className="font-extrabold text-[#2e1065] text-sm flex items-center gap-1.5 font-display">
                <Smile size={18} className="text-amber-500" />
                Bagaimana Harimu? Ekspresikan Perasaanmu
              </h3>
              
              <form onSubmit={handleLogJournal} className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  {(["Sempurna", "Baik", "Biasa Saja", "Lelah", "Bad Mood"] as const).map((moodVal) => {
                    let badgeCol = "bg-white/60 border-slate-200 text-slate-600";
                    if (moodWord === moodVal) {
                      if (moodVal === "Sempurna") badgeCol = "bg-[#F3E8FF] border-purple-300 text-purple-700 font-extrabold";
                      else if (moodVal === "Baik") badgeCol = "bg-[#E6F4EA] border-emerald-300 text-emerald-800 font-extrabold";
                      else if (moodVal === "Biasa Saja") badgeCol = "bg-[#E8F0FE] border-blue-300 text-blue-700 font-extrabold";
                      else if (moodVal === "Lelah") badgeCol = "bg-[#FEF7E0] border-amber-300 text-amber-700 font-extrabold";
                      else if (moodVal === "Bad Mood") badgeCol = "bg-[#FCE8E6] border-red-300 text-red-700 font-extrabold";
                    }

                    return (
                      <button
                        key={moodVal}
                        type="button"
                        onClick={() => setMoodWord(moodVal)}
                        className={`px-3.5 py-2.5 rounded-2xl border text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 ${badgeCol}`}
                      >
                        {moodVal === "Sempurna" ? "🤩 Sempurna" : moodVal === "Baik" ? "😊 Baik" : moodVal === "Biasa Saja" ? "😐 Biasa" : moodVal === "Lelah" ? "😴 Lelah" : "😡 Bad Mood"}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={3}
                  placeholder="Tulis keluh kesah kuliah atau apa pun yang memenuhi pikiranmu saat ini... (misal: 'Agak pusing ngerjain tugas statistika, tapi lega akhirnya ketemu rumusnya...')"
                  required
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  className="w-full text-xs p-4 rounded-2xl border border-pink-100 focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <label className="flex items-center gap-2 text-slate-550 font-bold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnon}
                      onChange={(e) => setIsAnon(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-pink-200"
                    />
                    <EyeOff size={13} className="text-[#FF2D75]" />
                    <span>Kirim secara Anonim (Sembunyikan profil saya)</span>
                  </label>

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-md shadow-pink-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={12} />
                    Posting Jurnal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* activeTabMode === "halodoc" */
            <div className="space-y-6 animate-fade-in text-left">
              {/* Alert / Wellness Banner */}
              <div className="bg-gradient-to-r from-red-500 via-[#FF2D75] to-[#db2777] text-white p-5 rounded-3xl border border-pink-200/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md text-left animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white border border-white/25 uppercase tracking-wide">
                      Official Halodoc Teleconsul
                    </span>
                    <span className="text-xs font-bold">
                      🩺 Konsultasi Medis Mental Tepercaya
                    </span>
                  </div>
                  <p className="text-[11px] text-pink-50 font-bold leading-relaxed max-w-xl">
                    Koneksi instan ke psikolog dan psikiater berlisensi nasional dari Halodoc. Masukkan API Key Anda untuk mencocokkan jadwal dokter terbaik secara real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHalodocConfig(!showHalodocConfig)}
                  className="px-4 py-2 text-xs font-black bg-white text-[#FF2D75] hover:bg-pink-50 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
                >
                  <Key size={13} />
                  {halodocApiKey ? "Kelola API Key" : "Konfigurasi Halodoc Key"}
                </button>
              </div>

              {/* API Key Form Config */}
              {showHalodocConfig && (
                <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wide flex items-center gap-2">
                      💡 Konfigurasi Integrasi API Halodoc
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setShowHalodocConfig(false)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  <form onSubmit={handleSaveHalodocKey} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      placeholder="Masukkan Halodoc API Key Anda..."
                      value={tempHalodocKey}
                      onChange={(e) => setTempHalodocKey(e.target.value)}
                      className="flex-1 border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-2xl font-semibold text-xs bg-white text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 border border-slate-950 text-white hover:bg-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      Simpan & Muat Ulang
                    </button>
                  </form>
                </div>
              )}

              {/* Filtering and Search Section */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari spesialisasi (misal: Kecemasan, Burnout, Overthinking)..."
                    value={halodocQuery}
                    onChange={(e) => setHalodocQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchHalodocConsultants(halodocQuery)}
                    className="w-full text-xs pl-10 pr-24 py-3 border border-pink-100 bg-white/45 backdrop-blur-md rounded-2xl font-semibold text-slate-800 focus:outline-hidden focus:border-pink-300 focus:bg-white transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => fetchHalodocConsultants(halodocQuery)}
                    className="absolute right-1.5 top-1.5 bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:brightness-105 font-black text-[10px] px-3.5 py-1.5 rounded-xl transition-all shadow-sm shadow-pink-100 cursor-pointer"
                  >
                    Cari Dokter
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 text-right w-full sm:w-auto justify-end">
                  <span>Sumber Data:</span>
                  <span className="bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe] px-2 py-0.5 rounded-lg uppercase tracking-wide font-black">
                    {halodocSource}
                  </span>
                </div>
              </div>

              {/* Doctors Grid Display */}
              {loadingHalodoc ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <RefreshCw className="animate-spin text-[#FF2D75]" size={28} />
                  <p className="text-xs font-black text-slate-500 animate-pulse">Menghubungkan ke Jaringan Direktori Halodoc...</p>
                </div>
              ) : halodocConsultants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 bg-white/10 rounded-3xl p-5 w-full">
                  <span className="text-4xl">🔬</span>
                  <p className="text-xs font-black text-slate-700 mt-3">Tidak Ada Dokter yang Ditemukan</p>
                  <p className="text-[11px] text-slate-450 mt-1 max-w-sm font-semibold">Coba sesuaikan kata kunci pencarian Anda dengan keluhan mental misal 'Burnout' or 'Insecure'.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  {halodocConsultants.map((doc, idx) => (
                    <div 
                      key={doc.id || idx} 
                      className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-3.5 items-start">
                        <img 
                          src={doc.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2"} 
                          alt={doc.name} 
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0 bg-slate-100"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-xs text-[#2e1065] truncate">{doc.name}</h4>
                            <span className="text-[8px] font-black bg-[#E6F4EA] text-emerald-800 px-2 py-0.5 rounded-xl uppercase tracking-wider scale-90 border border-emerald-100">
                              ★ {doc.rating || "5.0"}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-extrabold flex items-center gap-1">
                            🎓 Alumnus <strong className="text-slate-700">{doc.alumni}</strong>
                          </p>
                          <p className="text-[9px] text-[#FF2D75] font-black tracking-wider uppercase">{doc.experience} Pengalaman</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(doc.specialties || []).map((spec: string) => (
                              <span key={spec} className="text-[8px] font-black bg-pink-50 text-pink-700 border border-pink-100 px-1.5 py-0.5 rounded-lg animate-fade-in">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-[10.5px] text-slate-550 leading-relaxed font-semibold pl-1 border-l-2 border-pink-300">
                        {doc.description}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100/50">
                        <div>
                          <span className="text-[8.5px] text-slate-400 block font-bold leading-none">Tarif Konsul</span>
                          <span className="text-xs font-black font-mono text-emerald-600 leading-normal">{doc.price || "Rp 35.000"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startConsultationChat(doc)}
                          className="bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:brightness-105 font-black text-[10.5px] px-4 py-2 rounded-2xl shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                        >
                          💬 Mulai Konsul Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consultation Chat Simulator */}
              {showConsultationChat && activeDoctor && (
                <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[520px]">
                    {/* Header bar */}
                    <div className="bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white px-5 py-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <img 
                          src={activeDoctor.avatar} 
                          alt={activeDoctor.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shrink-0"
                        />
                        <div className="text-left">
                          <h4 className="font-extrabold text-[11px] leading-tight">{activeDoctor.name}</h4>
                          <span className="text-[8.5px] font-black opacity-85 uppercase tracking-widest block mt-0.5">🟢 Konselor Halodoc Live</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowConsultationChat(false);
                          setActiveDoctor(null);
                        }}
                        className="p-1 px-2.5 rounded-lg hover:bg-white/25 text-white font-black text-xs cursor-pointer"
                      >
                        ✕ Selesai
                      </button>
                    </div>

                    <div className="bg-pink-50 border-b border-pink-100 px-4 py-2.5 text-[10px] text-pink-700 font-extrabold flex items-center gap-1 text-left select-none">
                      🛡️ Sesi Live Chat Terenkripsi & Terintegrasi Halodoc Sandboxing.
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-slate-50/50">
                      {halodocChatMessages.map((msg, idx) => {
                        const isDoc = msg.sender === "doctor";
                        return (
                          <div key={idx} className={`flex ${isDoc ? "justify-start" : "justify-end"} items-start gap-2.5 animate-fade-in`}>
                            {isDoc && (
                              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-xs shrink-0 mt-1 shadow-3xs border border-pink-200">
                                🩺
                              </span>
                            )}
                            <div className="max-w-[80%] space-y-0.5 text-left">
                              <span className="text-[8.5px] font-bold text-slate-400 block pr-1">
                                {isDoc ? activeDoctor.name : "Pasien Mandiri"}
                              </span>
                              <div className={`p-3 rounded-2xl text-[10.5px] leading-relaxed font-bold border ${
                                isDoc 
                                  ? "bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-3xs" 
                                  : "bg-slate-900 border-slate-950 text-white rounded-tr-none shadow-3xs"
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {loadingDoctorChat && (
                        <div className="flex justify-start items-center gap-2.5 animate-pulse pl-12">
                          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 bg-white px-3.5 py-2 flex gap-1.5 overflow-x-auto select-none shrink-0 custom-scroll">
                      {[
                        "Saya cemas skripsi ditolak dosen killer.",
                        "Saya merasa burnout mengurus krs dan tugas.",
                        "Saya susah istirahat tidur malam hari."
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setHalodocChatInput(sug);
                          }}
                          className="px-2.5 py-1 text-[9px] bg-slate-100 border border-slate-150 hover:bg-slate-200 text-slate-700 whitespace-nowrap rounded-lg font-black cursor-pointer shadow-3xs active:scale-[0.97]"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>

                    {/* Sender bar */}
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Ketik balasan Anda ke dokter..."
                        value={halodocChatInput}
                        onChange={(e) => setHalodocChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitHalodocChat()}
                        disabled={loadingDoctorChat}
                        className="flex-1 border border-slate-200 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-2xl font-bold bg-slate-50 text-slate-850 text-xs shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={submitHalodocChat}
                        disabled={loadingDoctorChat || !halodocChatInput.trim()}
                        className="bg-gradient-to-r from-pink-500 to-[#FF2D75] disabled:opacity-40 text-white p-2.5 rounded-xl flex items-center justify-center cursor-pointer shadow shadow-pink-100 shrink-0 select-none"
                      >
                        <Send size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historic logs of feelings */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-[#2e1065] text-sm flex items-center gap-1.5 text-left font-display">
              <FileText size={16} className="text-[#FF2D75]" />
              Catatan Rasa & Inspirasi Pendukung
            </h3>

            <div className="space-y-3">
              {journals.map((j) => (
                <div key={j.id} className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 text-left space-y-2 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">{j.date}</span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-xl ${
                        j.moodValue === "Sempurna" ? "bg-purple-100 text-purple-700 font-extrabold" :
                        j.moodValue === "Baik" ? "bg-[#E6F4EA] text-emerald-800 font-extrabold" :
                        j.moodValue === "Biasa Saja" ? "bg-blue-100 text-blue-700 font-extrabold" :
                        j.moodValue === "Lelah" ? "bg-amber-100 text-amber-800 font-extrabold" : "bg-red-100 text-red-750 font-extrabold"
                      }`}>
                        {j.moodValue}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold italic">
                      {j.anonymous ? "👤 Anonim" : "👤 Nadia A."}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-bold">
                    "{j.note}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Counselor Booking Form */}
        <div className="space-y-6 text-left">
          
          {/* Booking session form card */}
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-4">
            <h3 className="font-extrabold text-[#2e1065] text-sm font-display">Jadwalkan Sesi Konseling</h3>

            {bookingSuccess && (
              <div className="bg-[#E6F4EA] border border-emerald-250 text-[#137333] p-3.5 rounded-2xl text-xs space-y-1">
                <p className="font-black flex items-center gap-1">
                  <CheckCircle size={14} className="text-[#137333]" /> Sesi Terjadwal!
                </p>
                <p className="text-[10px] font-bold">Silakan buka kalender utama atau tunggu link video call dikirim melalui WhatsApp.</p>
              </div>
            )}

            <form onSubmit={handleBookCounseling} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Konselor Idola *</label>
                <select
                  value={selectedCounselor}
                  onChange={(e) => setSelectedCounselor(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs bg-white rounded-xl font-bold cursor-pointer"
                >
                  {counselors.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Konsultasi *</label>
                <input
                  type="date"
                  required
                  value={appointDate}
                  onChange={(e) => setAppointDate(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alokasi Jam *</label>
                <input
                  type="text"
                  placeholder="Contoh: 14:00 WIB"
                  required
                  value={appointTime}
                  onChange={(e) => setAppointTime(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sebutkan Topik / Beban Masalah *</label>
                <input
                  type="text"
                  placeholder="Ceritakan gambaran singkat keluhanmu..."
                  required
                  value={appointTopic}
                  onChange={(e) => setAppointTopic(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white font-black py-2.5 rounded-2xl shadow-md shadow-pink-100 transition-all active:scale-95 cursor-pointer"
              >
                Konfirmasi Booking Jadwal
              </button>
            </form>
          </div>

          {/* Certified human counselors info list */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wider font-display">Daftar Konselor Profesional</h4>
            {counselors.map((c) => (
              <div key={c.name} className="bg-white/45 backdrop-blur-md p-3.5 rounded-3xl border border-white/60 flex gap-3 text-left shadow-xs hover:border-pink-200 transition-all">
                <img 
                  src={c.avatar} 
                  alt={c.name} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0 shadow-xs"
                />
                <div className="space-y-1 min-w-0">
                  <h5 className="font-extrabold text-[11px] text-[#2e1065] truncate">{c.name}</h5>
                  <p className="text-[9px] text-[#FF2D75] font-black tracking-wider uppercase">{c.specialty}</p>
                  <p className="text-[10px] text-slate-500 leading-snug font-bold">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduled video listings */}
          {sessions.length > 0 && (
            <div className="bg-[#E6F4EA] p-4 rounded-3xl border border-[#A3E635]/30 space-y-2 text-[#137333]">
              <h4 className="font-black text-xs flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#137333]" /> Sesi Terdekat Terjadwal
              </h4>
              {sessions.map((sess) => (
                <div key={sess.id} className="text-[11px] font-bold space-y-0.5 border-l-2 border-emerald-500 pl-3 py-0.5">
                  <p className="font-black text-slate-800">{sess.counselorName}</p>
                  <p className="text-[10px] text-slate-550">{sess.date} — {sess.time}</p>
                  <p className="text-[10px] italic text-slate-500 font-semibold">Topic: "{sess.topic}"</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
