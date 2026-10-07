import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, BookOpen, Laptop, Calculator, Award, Coffee, Brain, 
  Mic, Heart, ShieldCheck, Sparkles, CheckSquare, ArrowRight, Play, Check, AlertCircle, Sparkle,
  ChevronDown, HelpCircle, LogIn
} from "lucide-react";
import { motion } from "motion/react";
// @ts-ignore
import mahasLogo from "../assets/images/regenerated_image_1784117604430.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isBgAnimated, setIsBgAnimated] = useState(true);
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 30, 20, 45, 10, 35, 25, 40, 15, 30, 20]);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqData = [
    {
      q: "Apakah saya bisa menghubungkan Google Classroom saya?",
      a: "Tentu saja! Fitur Sinkronisasi Tugas kami memungkinkan Anda menghubungkan akun Google Classroom untuk menyatukan jadwal tenggat waktu tugas, kuis, dan draf materi kuliah secara otomatis dan terintegrasi."
    },
    {
      q: "Apa itu fitur Simulasi Bimbingan bersama Prof. Topus?",
      a: "Ini adalah simulator bimbingan skripsi interaktif bertenaga AI untuk melatih kesiapan mental dan akademis Anda dalam menghadapi dosen pembimbing nyata, baik dosen berkarakter lembut penyayang (Prof. Topus) maupun yang sangat kritis analitis (Prof. Octo)."
    },
    {
      q: "Apakah data rekaman perkuliahan saya aman dan bersifat pribadi?",
      a: "Ya, data kamu ditangani sesuai dengan kebijakan privasi dan penyimpanan data MAHAS. Informasi mengenai bagaimana rekaman dan transkrip disimpan, berapa lama data dipertahankan, siapa yang dapat mengaksesnya, dan kapan data dihapus dapat dilihat pada Privacy Policy MAHAS."
    },
    {
      q: "Seberapa akurat hasil transkripsi MAHAS?",
      a: "MAHAS menghasilkan transkripsi dengan tingkat akurasi yang tinggi, tetapi hasilnya dapat dipengaruhi oleh kualitas audio, kebisingan latar belakang, aksen, serta seberapa jelas pembicara berbicara."
    },
    {
      q: "Apakah saya bisa mengunggah rekaman audio atau video yang sudah ada?",
      a: "Ya. Kamu dapat mengunggah rekaman yang sudah kamu miliki dan mengubahnya menjadi teks yang dapat dicari tanpa perlu merekam ulang."
    },
    {
      q: "Apakah MAHAS bisa merangkum materi kuliah?",
      a: "Ya, jika paket yang kamu gunakan mencakup fitur AI Summarization. Kamu dapat mengubah transkrip panjang menjadi ringkasan dan materi belajar yang lebih singkat sehingga lebih mudah untuk dipelajari kembali."
    }
  ];

  // Simulate audio wave fluctuation in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 35) + 10));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="campushub_root" className="min-h-screen bg-transparent flex flex-col font-sans relative overflow-x-hidden text-slate-800 p-2 md:p-4 selection:bg-pink-150 selection:text-[#FF2D75]">
      
      {/* 3D GLASSMORPHIC ATMOSPHERIC LIGHT BLUE BACKGROUND (Identical to main app for perfect visual coherence) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-tr from-[#e0f2fe] via-[#bae6fd]/40 to-[#f0f9ff]">
        {/* Soft high-blur beautiful light blue atmospheric cloud blobs */}
        <div className={`absolute top-10 left-10 w-[70vw] h-[55vh] bg-[#38bdf8]/25 rounded-full blur-[130px] transform -translate-x-12 -translate-y-12 ${isBgAnimated ? "animate-float-slow" : ""}`}></div>
        <div className={`absolute bottom-10 right-10 w-[60vw] h-[50vh] bg-[#0ea5e9]/20 rounded-full blur-[120px] transform translate-x-12 translate-y-12 ${isBgAnimated ? "animate-float-medium" : ""}`}></div>
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#bae6fd]/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#e0f2fe]/45 rounded-full blur-[90px]"></div>
      </div>

      {/* 3D FLOATING BACKGROUND ACCENTS (Cohesive with AppDashboard) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        
        {/* Graduation Cap - Top Left */}
        <div 
          className="absolute w-16 h-16 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-rose-500/25 via-pink-500/35 to-white/80 shadow-[0_15px_35px_rgba(219,39,119,0.35)] p-3.5 flex items-center justify-center left-6 md:left-[8%] top-[10%] animate-float-slow"
          title="Pendidikan Tinggi"
        >
          <GraduationCap className="w-8 h-8 text-[#FF2D75] drop-shadow-[0_4px_8px_rgba(255,45,117,0.55)] relative z-10" />
        </div>

        {/* Book Open - Mid Left Gutter */}
        <div 
          className="absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-sky-400/30 via-blue-500/25 to-white/80 shadow-[0_15px_35px_rgba(14,165,233,0.35)] p-3 flex items-center justify-center left-[15%] top-[25%] animate-float-medium"
          title="Perpustakaan Literasi"
        >
          <BookOpen className="w-7 h-7 text-sky-600 drop-shadow-[0_3px_8px_rgba(14,165,233,0.5)] relative z-10" />
        </div>

        {/* Laptop - Mid Right Side */}
        <div 
          className="absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-purple-500/30 via-indigo-500/25 to-white/70 shadow-[0_15px_35px_rgba(168,85,247,0.35)] p-3 flex items-center justify-center right-4 md:right-[6%] top-[35%] animate-float-medium"
          title="Teknologi Developer"
        >
          <Laptop className="w-7 h-7 text-indigo-700 drop-shadow-[0_4px_10px_rgba(168,85,247,0.5)] relative z-10" />
        </div>

        {/* Brain Sparkle boost - Mid Left Gutter */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-pink-500/30 via-purple-500/20 to-white/80 shadow-[0_15px_30px_rgba(236,72,153,0.25)] p-3 flex items-center justify-center left-4 md:left-[5%] top-[50%] animate-pulse"
          title="Kreativitas Mahasiswa"
        >
          <Brain className="w-7 h-7 text-pink-600 drop-shadow-[0_3px_6px_rgba(219,39,119,0.4)] relative z-10" />
        </div>

        {/* Award Medal - Bottom Right Corner */}
        <div 
          className="absolute w-16 h-16 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-emerald-500/30 via-teal-500/25 to-white/70 shadow-[0_20px_45px_rgba(16,185,129,0.35)] p-3 flex items-center justify-center right-4 md:right-[10%] bottom-[15%] animate-float-fast"
          title="Medali Cum Laude"
        >
          <Award className="w-8 h-8 text-emerald-650 drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)] relative z-10" />
        </div>

        {/* Steaming Coffee Cup - Bottom Left Gutter */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-amber-500/25 via-red-500/20 to-white/80 shadow-[0_15px_30px_rgba(239,68,68,0.25)] p-3 flex items-center justify-center left-6 md:left-[12%] bottom-[12%] animate-float-slow"
          title="Kopi Begadang Nugas"
        >
          <Coffee className="w-7 h-7 text-amber-900 drop-shadow-[0_3px_6px_rgba(146,64,14,0.4)] relative z-10" />
        </div>

        {/* Calculator - Lower Mid Left */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-emerald-500/25 via-teal-500/25 to-white/80 shadow-[0_15px_30px_rgba(16,185,129,0.35)] p-3.5 flex items-center justify-center left-[22%] bottom-[25%] animate-float-slow"
          title="Kalkulator IPK"
        >
          <Calculator className="w-7 h-7 text-emerald-650 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)] relative z-10" />
        </div>

        {/* CheckSquare - Top Right Side */}
        <div 
          className="absolute w-14 h-14 rounded-2xl select-none opacity-95 border-2 border-white/90 bg-gradient-to-tr from-teal-400/25 via-emerald-400/25 to-white/80 shadow-[0_15px_30px_rgba(20,184,166,0.3)] p-3 flex items-center justify-center right-[18%] top-[12%] animate-float-slow"
          title="Tugas & Deadline"
        >
          <CheckSquare className="w-7 h-7 text-teal-600 drop-shadow-[0_4px_8px_rgba(20,184,166,0.4)] relative z-10" />
        </div>

        {/* Heart - Mid Left Gutter */}
        <div 
          className="absolute w-13 h-13 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-pink-400/35 to-white/70 shadow-[0_10px_25px_rgba(244,63,94,0.3)] p-3 flex items-center justify-center left-[5%] top-[35%] animate-pulse"
          title="Mental Health Counselor"
        >
          <Heart className="w-6 h-6 text-pink-500 drop-shadow-[0_3px_6px_rgba(244,63,94,0.4)] relative z-10" />
        </div>

        {/* Mic - Bottom Right Gutter */}
        <div 
          className="absolute w-15 h-15 rounded-2xl select-none opacity-95 border-2 border-white/95 bg-gradient-to-tr from-pink-500/25 via-[#FF2D75]/35 to-white/80 shadow-[0_15px_35px_rgba(219,39,119,0.3)] p-3 flex items-center justify-center right-[15%] bottom-[35%] animate-float-fast"
          title="Perekam Suara Verbatim"
        >
          <Mic className="w-7 h-7 text-[#FF2D75] drop-shadow-[0_4px_8px_rgba(255,45,117,0.5)] relative z-10" />
        </div>

        {/* Sparkle 1 - Top Center Left */}
        <div className="absolute w-10 h-10 rounded-xl border border-white/90 bg-white/75 shadow-3xs p-2.5 flex items-center justify-center left-[35%] top-[15%] animate-pulse">
          <Sparkle size={16} className="text-amber-450" />
        </div>

        {/* Sparkle 2 - Bottom Center Right */}
        <div className="absolute w-10 h-10 rounded-xl border border-white/90 bg-white/75 shadow-3xs p-2.5 flex items-center justify-center right-[35%] bottom-[20%] animate-pulse">
          <Sparkle size={16} className="text-[#FF2D75]" />
        </div>

        {/* MahasSpace Glass Capsule */}
        <div className="absolute w-32 h-10 rounded-full select-none opacity-95 shadow-[0_12px_20px_rgba(16,185,129,0.15)] bg-gradient-to-r from-white/80 to-emerald-200/50 backdrop-blur-md border-2 border-white/90 left-[18%] bottom-[12%] animate-float-slow flex items-center justify-center">
          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">MahasSpace</span>
        </div>

        {/* GPA Badge Glass Capsule */}
        <div className="absolute w-24 h-11 rounded-full select-none opacity-95 backdrop-blur-md border-2 border-white/90 bg-gradient-to-r from-amber-400/30 to-orange-400/20 shadow-[0_12px_30px_rgba(245,158,11,0.25)] flex items-center justify-center right-[28%] top-[25%] animate-float-medium">
          <span className="text-[11px] font-black tracking-widest text-amber-800 font-mono">★ GPA 4.0</span>
        </div>
      </div>

      {/* HEADER SECTION (Beautiful glassy, matching the app's structural look) */}
      <header className="w-[calc(100%-16px)] md:w-[calc(100%-32px)] max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-white/80 rounded-[16px] shadow-[0_12px_32px_rgba(79,70,229,0.04)] py-3 px-3 md:px-6 flex items-center justify-between gap-2 z-50 fixed top-2 md:top-4 left-1/2 -translate-x-1/2 transition-all duration-300 overflow-hidden">
        {/* Scroll-Driven Solid Pink Progress Line (Instant, No Delay, No Gradient) */}
        <div 
          className="absolute bottom-0 left-0 h-[2.5px] bg-[#FF2D75] z-20 pointer-events-none"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0 relative z-10">
          <img 
            src={mahasLogo} 
            alt="Mahas Logo" 
            className="w-[50px] h-[50px] object-contain rounded-[9px]"
            referrerPolicy="no-referrer" 
          />
          <span 
            className="font-bold tracking-tight text-slate-900 select-none flex items-center"
            style={{ 
              fontFamily: "'Unbounded', sans-serif", 
              fontWeight: 700,
              width: "126.24px",
              height: "38.9974px",
              paddingLeft: "0px",
              paddingRight: "0px",
              paddingTop: "0px",
              paddingBottom: "5px",
              marginLeft: "-4px",
              marginBottom: "0px",
              marginTop: "0px",
              fontSize: "26px",
              lineHeight: "16px"
            }}
          >
            mahas
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] md:text-xs font-black text-slate-650 absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="hover:text-[#FF2D75] transition-colors">Fitur</a>
          <a href="#how-it-works" className="hover:text-[#FF2D75] transition-colors">Cara Kerja</a>
          <a href="#faq" className="hover:text-[#FF2D75] transition-colors">FAQ's</a>
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2.5 flex-shrink-0">
          {/* Animated Clockwise Thin Pink Border Button "Mulai" (Opens Login Modal) */}
          <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
            {/* Clockwise rotating conic pink gradient line */}
            <div 
              className="absolute inset-[-150%] animate-spin-clockwise opacity-90 pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, transparent 0 300deg, #FF2D75 340deg, #fb7185 360deg)"
              }}
            />
            {/* White button */}
            <button 
              onClick={() => navigate("/home", { state: { openAuthModal: true } })}
              className="relative z-10 h-8 md:h-10 px-4 md:px-6 text-[11px] md:text-xs font-bold text-slate-800 bg-white hover:bg-white rounded-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer select-none transition-transform duration-150 active:scale-[0.98]"
            >
              <span>Mulai</span>
              <ArrowRight size={13} className="text-[#FF2D75] md:w-3.5 md:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 md:pt-36 md:pb-28 z-20 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl space-y-6"
        >
          <h1 
            className="text-3xl md:text-5xl font-bold tracking-tight text-slate-950 leading-tight leading-[1.05] px-0 ml-0 mt-[30px] mb-[29px]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            The #1 <span className="text-[#FF2D75] underline decoration-slate-950 decoration-[3px] underline-offset-8">Speech to Text</span> Class Recorder for Students
          </h1>

          <p className="text-[13px] leading-[15px] font-bold text-slate-600 max-w-xl mx-auto">
            Sistem asisten rekam lisan dosen secara verbatim otomatis ke transkrip dan manajemen draf materi kuliah bertenaga AI. Jadikan setiap ucapan dosen sebagai draf belajar terbaik Anda!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate("/home")}
              className="w-full sm:w-auto h-12 px-8 text-xs font-black text-white bg-gradient-to-r from-pink-500 via-[#FF2D75] to-rose-600 shadow-[0_8px_24px_rgba(255,45,117,0.3)] hover:opacity-95 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-103 transition-all"
            >
              Mulai Rekam Suara Sekarang
              <ArrowRight size={15} />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto h-12 px-6 text-xs font-bold text-slate-650 hover:text-slate-800 bg-white/70 hover:bg-white border border-slate-200 backdrop-blur-md rounded-xl flex items-center justify-center gap-2 transition-all shadow-3xs"
            >
              Pelajari Fitur-Fitur
            </a>
          </div>
        </motion.div>

        {/* INTERACTIVE MOCKUP VIEW (Satisfying "tampilan tidak jauh berbeda dengan isinya") */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          id="how-it-works"
          className="w-full max-w-4xl mt-20 md:mt-28 bg-white/95 border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.06)] overflow-hidden p-4 md:p-6 text-left"
        >
          {/* Mockup Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-450"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-wide">Main Feature Preview</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-pink-50 text-[#FF2D75] text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D75] animate-pulse"></span>
              Live Demo
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left side: Recording status & waves */}
            <div className="md:col-span-2 flex flex-col justify-between">
              <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Perekaman</span>
                
                {/* Simulated sound waveform */}
                <div className="h-14 flex items-center justify-center gap-1 bg-white rounded-xl border border-slate-100 px-4 shadow-3xs">
                  {waveHeights.map((ht, idx) => (
                    <div 
                      key={idx} 
                      className="w-1 bg-[#FF2D75] rounded-full transition-all duration-150"
                      style={{ height: `${ht}%` }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                    Merekam Sesi...
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">03:24</span>
                </div>
              </div>
            </div>

            {/* Right side: Real-time Transcript Stream Box */}
            <div className="md:col-span-3 p-6 bg-white rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4 min-h-[180px]">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hasil Transkrip Verbatim</span>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                  "...maka untuk struktur algoritma pencarian biner kita harus memastikan datanya sudah terurut secara menaik terlebih dahulu, jika data acak lakukan sorting. Setelah itu, ambil indeks tengah kemudian..."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100/70 flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-pink-500 uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded-md">Verbatim Active</span>
                <button 
                  onClick={() => navigate("/home")}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF2D75] to-rose-600 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-1 cursor-pointer hover:opacity-90"
                >
                  Cobalah Sekarang
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* CORE MODULES / FEATURES SECTION (Redesigned matching requested minimal card style) */}
      <section id="features" className="w-full max-w-7xl mx-auto px-4 pt-16 pb-16 md:pt-24 md:pb-24 z-20 relative">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-14">
          <h2 
            className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Solusi Cerdas Perkuliahan
          </h2>
          <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed">
            Atasi semua kendala akademik utama mahasiswa dalam satu platform AI terintegrasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          
          {/* Column 1: Slow / Tertinggal Catatan */}
          <div className="flex flex-col justify-between group cursor-pointer" onClick={() => navigate("/home")}>
            <div className="space-y-2 mb-6">
              <span className="text-base font-bold text-sky-500 block">Tertinggal</span>
              <p className="text-sm font-normal text-slate-400 leading-relaxed">
                <strong className="font-bold text-slate-900">Mencatat penjelasan dosen terlalu lambat — </strong>
                padahal Anda membutuhkan transkrip verbatim otomatis agar materi perkuliahan tidak ada yang terlewat.
              </p>
            </div>
            <div className="w-full h-48 bg-sky-100/60 group-hover:bg-sky-100 transition-colors duration-300 rounded-[24px] flex items-center justify-center p-6 border border-sky-200/40">
              <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <Mic size={24} />
              </div>
            </div>
          </div>

          {/* Column 2: Expensive / Biaya Skripsi & Bimbingan */}
          <div className="flex flex-col justify-between group cursor-pointer" onClick={() => navigate("/home")}>
            <div className="space-y-2 mb-6">
              <span className="text-base font-bold text-pink-500 block">Cemas Skripsi</span>
              <p className="text-sm font-normal text-slate-400 leading-relaxed">
                <strong className="font-bold text-slate-900">Takut menghadapi dosen pembimbing — </strong>
                tanpa latihan simulasi bimbingan interaktif yang menguji kesiapan mental & penguasaan draf materi Anda.
              </p>
            </div>
            <div className="w-full h-48 bg-pink-100/60 group-hover:bg-pink-100 transition-colors duration-300 rounded-[24px] flex items-center justify-center p-6 border border-pink-200/40">
              <div className="w-12 h-12 rounded-full bg-[#FF2D75] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <GraduationCap size={24} />
              </div>
            </div>
          </div>

          {/* Column 3: Confusing / Rumit & Stres */}
          <div className="flex flex-col justify-between group cursor-pointer" onClick={() => navigate("/home")}>
            <div className="space-y-2 mb-6">
              <span className="text-base font-bold text-indigo-500 block">Membingungkan</span>
              <p className="text-sm font-normal text-slate-400 leading-relaxed">
                <strong className="font-bold text-slate-900">Jadwal tugas & stres akademik menumpuk — </strong>
                membutuhkan sinkronisasi Google Classroom otomatis serta tempat mencurahkan keletihan batin 24 jam.
              </p>
            </div>
            <div className="w-full h-48 bg-purple-100/60 group-hover:bg-purple-100 transition-colors duration-300 rounded-[24px] flex items-center justify-center p-6 border border-purple-200/40">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <Heart size={24} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="w-full max-w-3xl mx-auto px-4 py-12 md:py-16 z-20 relative">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 
            className="text-[30px] md:text-[35px] leading-[32px] md:leading-[35px] text-center font-bold text-slate-900 tracking-tight h-auto px-0 pt-0"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Do you have any questions? We have the answer.
          </h2>
        </div>

        <div className="space-y-2">
          {faqData.map((faq, index) => {
            const isOpen = openFaqIndices.includes(index);
            return (
              <div 
                key={index}
                className="bg-white/85 border border-white/80 rounded-xl shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => {
                    setOpenFaqIndices(prev => 
                      prev.includes(index) 
                        ? prev.filter(i => i !== index) 
                        : [...prev, index]
                    );
                  }}
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 text-left flex items-center justify-between gap-3 font-black text-xs md:text-sm text-slate-800 hover:text-[#FF2D75] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={16} className="text-[#FF2D75] flex-shrink-0" />
                    {faq.q}
                  </span>
                  <div
                    className={`text-slate-400 transition-none ${isOpen ? "rotate-180" : ""}`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <div
                  className={isOpen ? "block" : "hidden"}
                >
                  <div className="px-4 pb-3.5 pt-1 md:px-5 md:pb-4 text-xs font-semibold text-slate-500 leading-relaxed border-t border-slate-100/60 pl-9 md:pl-10">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="-mx-2 md:-mx-4 w-[calc(100%+16px)] md:w-[calc(100%+32px)] bg-[#060608] text-[#FFFFFF] pt-16 pb-10 px-8 md:px-16 rounded-none z-20 relative mt-auto space-y-12 text-left shadow-[0_-12px_40px_rgba(6,6,8,0.2)]">
        {/* Concave Top Curve (Radius menghadap luar / scooped corners) */}
        <div className="absolute top-0 left-0 right-0 h-10 -translate-y-[99%] pointer-events-none select-none overflow-hidden">
          <svg viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none" className="w-full h-full text-[#060608]">
            <path d="M0 0 C 0 28, 50 40, 100 40 H 1340 C 1390 40, 1440 28, 1440 0 V 40 H 0 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 pb-8">
          
          {/* Column 1: MAHAS Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={mahasLogo} 
                alt="Mahas Logo" 
                className="w-10 h-10 object-contain rounded-[10px] border-2 border-white/10 shadow-3xs"
                referrerPolicy="no-referrer"
              />
              <span 
                className="font-medium text-[#FFFFFF] tracking-tight"
                style={{ 
                  fontFamily: "'Unbounded', sans-serif", 
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "25px",
                  marginLeft: "-8px",
                  marginRight: "0px",
                  marginTop: "-3px",
                  paddingLeft: "0px",
                  paddingTop: "0px"
                }}
              >
                mahas
              </span>
            </div>
            <p 
              className="text-xs font-light text-[#FFFFFF]/80 max-w-xs"
              style={{
                marginLeft: "0px",
                marginRight: "0px",
                marginTop: "0px",
                marginBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                paddingTop: "0px",
                paddingBottom: "0px",
                lineHeight: "16.5px"
              }}
            >
              Ubah ucapan lisan dosen secara instan menjadi catatan perkuliahan yang siap pakai.
            </p>
          </div>

          {/* Column 2: FEATURES */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-light uppercase tracking-widest text-[#FF2D75]">Features</h4>
            <ul className="space-y-2.5 text-xs font-light text-[#FFFFFF]/90">
              <li>
                <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors inline-block" onClick={() => navigate("/home")}>
                  Transkrip Suara
                </span>
              </li>
              <li>
                <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors inline-block" onClick={() => navigate("/home")}>
                  Simulasi Bimbingan
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: TOOLS */}
          <div 
            className="space-y-3.5"
            style={{
              height: "138.5px",
              marginLeft: "0px"
            }}
          >
            <h4 className="text-xs font-light uppercase tracking-widest text-[#FF2D75]">Tools</h4>
            <ul className="space-y-2.5 text-xs font-light text-[#FFFFFF]/90">
              <li>
                <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors inline-block" onClick={() => navigate("/home")}>
                  Sahabat Rasa AI
                </span>
              </li>
              <li>
                <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors inline-block" onClick={() => navigate("/home")}>
                  Sinkronisasi Classroom
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: COMPANY */}
          <div 
            className="space-y-3.5"
            style={{
              marginTop: "0px",
              marginRight: "0px",
              marginBottom: "0px",
              marginLeft: "0px",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px"
            }}
          >
            <h4 className="text-xs font-light uppercase tracking-widest text-[#FF2D75]">Company</h4>
            <ul className="space-y-2.5 text-xs font-light text-[#FFFFFF]/90">
              <li>
                <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors inline-block">
                  Kebijakan Privasi
                </span>
              </li>
              <li>
                <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors inline-block">
                  Syarat Penggunaan
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-[#FFFFFF]/70">
          <span>
            &copy; 2026 MAHAS. Hak Cipta Dilindungi Undang-Undang.
          </span>
          <div className="flex gap-4">
            <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors">Bantuan</span>
            <span className="hover:text-[#FF2D75] hover:underline active:text-[#FF2D75] active:underline focus:text-[#FF2D75] focus:underline cursor-pointer transition-colors">Kontak</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
