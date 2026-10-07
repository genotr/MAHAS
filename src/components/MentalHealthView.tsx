import React, { useState, useEffect } from "react";
import { 
  Heart, 
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
  Activity
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
  const [activeTabMode, setActiveTabMode] = useState<"chatbot" | "relax">("chatbot");

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

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* Title */}
      <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-900 leading-tight">
            Obrolan Kesehatan Mental Anda{" "}
            <Heart className="text-[#FF2D75] inline-block align-middle ml-1.5" size={24} />
          </h2>
          <p className="text-xs text-slate-500 leading-normal font-semibold">
            Kesehatan mentalmu sama pentingnya dengan nilai akademik. Tumpahkan beban pikiranmu ke Chatbot AI Sahabat Rasa yang super peka dan memahami perasaanmu harian, serta relaksasi diri di Ruang Tenang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: AI Chatbot / Relaxation Space */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tab Selector Buttons - Beautiful Segmented Control Button-style Base with same style as Title Card */}
          <div className="bg-white/45 backdrop-blur-md p-1.5 rounded-3xl border border-white/60 flex gap-2 w-full shadow-xs">
            <button
              onClick={() => {
                setActiveTabMode("chatbot");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs cursor-pointer transition-all ${
                activeTabMode === "chatbot" 
                  ? "bg-pink-50/80 border-2 border-[#FF2D75] text-[#FF2D75] shadow-sm" 
                  : "bg-white/40 border border-pink-200/50 text-slate-500 hover:text-[#FF2D75] hover:border-[#FF2D75] hover:bg-pink-50/20"
              }`}
            >
              <span className="text-sm">💬</span> Curhat AI Sahabat Rasa
            </button>
            <button
              onClick={() => {
                setActiveTabMode("relax");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs cursor-pointer transition-all ${
                activeTabMode === "relax" 
                  ? "bg-sky-50/80 border-2 border-[#0284c7] text-[#0284c7] shadow-sm" 
                  : "bg-white/40 border border-sky-200/50 text-slate-500 hover:text-[#0284c7] hover:border-[#0284c7] hover:bg-sky-50/20"
              }`}
            >
              <span className="text-sm">🧘</span> Ruang Tenang & Tes Stres
            </button>
          </div>

          {activeTabMode === "chatbot" ? (
            /* AI EMPATHETIC CHATBOT COMPONENT PANEL - Style unified with Obrolan Kesehatan Mental Anda */
            <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-5 flex flex-col justify-between h-[520px]">
              
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
          ) : (
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
          )}

        </div>

        {/* Right column */}
        <div className="space-y-6 text-left">
          
          {/* Scheduled video listings */}
          {sessions.length > 0 && (
            <div className="bg-[#E6F4EA] p-5 rounded-3xl border border-emerald-100 space-y-2.5 text-emerald-800 shadow-3xs">
              <h4 className="font-extrabold text-xs flex items-center gap-1.5 font-display">
                <CheckCircle size={14} className="text-emerald-600" /> Sesi Terdekat Terjadwal
              </h4>
              {sessions.map((sess) => (
                <div key={sess.id} className="text-[11px] font-bold space-y-0.5 border-l-2 border-emerald-500 pl-3 py-0.5">
                  <p className="font-black text-slate-800">{sess.counselorName}</p>
                  <p className="text-[10px] text-slate-500">{sess.date} — {sess.time}</p>
                  <p className="text-[10px] italic text-slate-500 font-semibold">Topik: "{sess.topic}"</p>
                </div>
              ))}
            </div>
          )}

          {/* New Self-Care Tip Card */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-pink-100 shadow-xs space-y-3.5">
            <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wider font-display flex items-center gap-1.5">
              Tips Relaksasi Hari Ini
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Kelelahan belajar seringkali datang akibat durasi duduk yang terlalu lama. Cobalah aturan <b>20-20-20</b>: Setiap 20 menit menatap layar komputer, lihatlah objek sejauh 20 kaki (6 meter) selama 20 detik untuk mengistirahatkan saraf mata dan otakmu.
            </p>
          </div>

          {/* 5-4-3-2-1 Grounding Method Widget */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-pink-50/50 backdrop-blur-md p-5 rounded-3xl border border-pink-100/60 shadow-xs space-y-4">
            <h4 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wider font-display flex items-center gap-1.5">
              <Wind size={14} className="text-indigo-600 animate-pulse" />
              Metode Redakan Panik (5-4-3-2-1)
            </h4>
            <p className="text-[11px] text-slate-500 font-semibold">
              Jika kamu merasa tiba-tiba sangat cemas atau panik karena tekanan tugas kuliah, diamlah sejenak dan sebutkan di dalam hati:
            </p>
            <div className="space-y-2.5 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-xs shrink-0 font-extrabold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center">5</span>
                <span>Hal yang bisa kamu <b>lihat</b> di sekitarmu</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-xs shrink-0 font-extrabold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center">4</span>
                <span>Benda fisik yang bisa kamu <b>sentuh</b></span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-xs shrink-0 font-extrabold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center">3</span>
                <span>Suara berbeda yang bisa kamu <b>dengar</b></span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-xs shrink-0 font-extrabold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center">2</span>
                <span>Aroma harum/khas yang bisa di<b>hirup</b></span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-xs shrink-0 font-extrabold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center">1</span>
                <span>Hal baik yang bisa kamu <b>rasakan / syukuri</b></span>
              </div>
            </div>
          </div>

          {/* Positive Affirmation Card */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2 text-center">
            <span className="text-2xl block animate-bounce">💬</span>
            <p className="text-[11px] text-slate-450 font-black uppercase tracking-widest text-[#FF2D75]">Afirmasi Diri</p>
            <p className="text-xs text-slate-700 italic font-extrabold leading-relaxed">
              "Nilai indeks prestasi penting, namun kedamaian jiwamu jauh lebih berharga. Kamu telah berusaha luar biasa hari ini, berterimakasihlah pada dirimu sendiri."
            </p>
          </div>


        </div>

      </div>

    </div>
  );
}
