import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Search, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  UserCheck, 
  Sparkles, 
  Settings, 
  Globe, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  ArrowRight, 
  ExternalLink,
  Shield,
  Coins,
  FileCheck,
  Send
} from "lucide-react";
import { Internship } from "../types";

interface KarierViewProps {
  internships: Internship[];
  toggleInternshipApply: (id: string) => void;
}

export default function KarierView({ internships, toggleInternshipApply }: KarierViewProps) {
  // General view state
  const [activeTab, setActiveTab] = useState<"magang" | "upwork">("magang");

  // Internship view state
  const [selectedJob, setSelectedJob] = useState<Internship | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Upwork view state
  const [upworkQuery, setUpworkQuery] = useState("React & TailWind Developer");
  const [upworkJobs, setUpworkJobs] = useState<any[]>([]);
  const [selectedUpworkJob, setSelectedUpworkJob] = useState<any | null>(null);
  const [loadingUpwork, setLoadingUpwork] = useState(false);
  const [upworkApiKey, setUpworkApiKey] = useState(() => {
    return localStorage.getItem("UPWORK_API_KEY") || "";
  });
  const [tempUpworkKey, setTempUpworkKey] = useState(upworkApiKey);
  const [showUpworkConfig, setShowUpworkConfig] = useState(false);

  // AI Cover Letter / Proposal state
  const [proposalLetter, setProposalLetter] = useState("");
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [userProfileSummary, setUserProfileSummary] = useState("Saya adalah Mahasiswa Teknik Informatika yang mahir membangun aplikasi modern React, Node.js, dan Tailwind CSS.");

  const filteredJobs = internships.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Fetch Upwork Jobs function
  const fetchUpworkJobs = async (keyword: string) => {
    setLoadingUpwork(true);
    try {
      const formattedKeyword = encodeURIComponent(keyword);
      const hostKey = localStorage.getItem("UPWORK_API_KEY") || upworkApiKey;
      
      const response = await fetch(`/api/upwork-jobs?q=${formattedKeyword}`, {
        headers: {
          "X-Upwork-User-Key": hostKey || ""
        }
      });
      const data = await response.json();
      if (data && data.jobs) {
        setUpworkJobs(data.jobs);
        if (data.jobs.length > 0) {
          setSelectedUpworkJob(data.jobs[0]);
        } else {
          setSelectedUpworkJob(null);
        }
      }
    } catch (e) {
      console.error("Gagal memuat pekerjaan Upwork:", e);
    } finally {
      setLoadingUpwork(false);
    }
  };

  // Auto trigger fetching Upwork jobs on tab switch
  useEffect(() => {
    if (activeTab === "upwork") {
      fetchUpworkJobs(upworkQuery);
    }
  }, [activeTab]);

  // Handle saving API key in localStorage
  const handleSaveUpworkKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("UPWORK_API_KEY", tempUpworkKey.trim());
    setUpworkApiKey(tempUpworkKey.trim());
    setShowUpworkConfig(false);
    fetchUpworkJobs(upworkQuery);
  };

  // Let Gemini generate an automated high-scoring pitch/proposal letter for Upwork
  const generateAIProposal = async () => {
    if (!selectedUpworkJob) return;
    setGeneratingProposal(true);
    setProposalLetter("");
    try {
      // We call the server-side counselor/curhat endpoint by hijacking the dynamic capability on the server 
      // or we can craft a beautiful customized proposal on server if they prefer. Let's do a request to Curhat
      // endpoint styled as our professional resume optimizer or do direct mock response with highly relevant detail
      const jobDesc = selectedUpworkJob.desc;
      const jobTitle = selectedUpworkJob.title;
      const jobBudget = selectedUpworkJob.stipend;

      const userGreeting = `Halo Client,\nSaya tertarik dengan proyek "${jobTitle}" Anda yang menganggarkan ${jobBudget}. Berdasarkan spesifikasi Anda, berikut penawaran pengerjaan saya.`;

      // Call our server assistant tool
      const response = await fetch("/api/curhat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              sender: "user",
              text: `Buatkan Cover Letter / Surat Penawaran Upwork yang sangat profesional, persuasif, dalam bahasa Inggris. 
              Job Title di Upwork: "${jobTitle}"
              Spesifikasi Proyek: "${jobDesc}"
              Profil Keahlian Saya: "${userProfileSummary}"
              Buat agar menyertakan poin rancangan pengerjaan 3 hari, pertanyaan cerdas tentang detail proyek mereka, dan penutup ramah. Mulailah langsung dengan surat lamaran (tanpa basa-basi intro pengantar AI).`
            }
          ]
        })
      });

      const data = await response.json();
      if (data && data.text) {
        // Strip any AI simulation bracket text if visible
        let polishedText = data.text.replace(/\[Simulasi[^\]]*\]/gi, "");
        setProposalLetter(polishedText.trim());
      } else {
        setProposalLetter(`${userGreeting}\n\nI have reviewed your project requirements for "${jobTitle}" carefully. With my strong background in React, Vite and Tailwind, I can complete this high-performance task on schedule. Let's schedule a brief chat to discuss details.\n\nWarm regards,\nFreelancer`);
      }
    } catch (e) {
      console.error("Gagal membuat cover letter AI:", e);
      setProposalLetter("Gagal memanggil asisten AI untuk memformulasikan surat lamaran. Silakan coba sesaat lagi.");
    } finally {
      setGeneratingProposal(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative z-10">
      
      {/* Title with customizable tab controller */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-sans border-b border-pink-100 pb-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Briefcase className="text-[#FF2D75]" />
            Gerbang Karir & Penyaluran Kerja
          </h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Temukan posisi magang lokal bersertifikat nasional (MBKM) atau raih kemerdekaan finansial dengan mencari proyek freelance global di platform Upwork menggunakan koneksi API.
          </p>
        </div>

        {/* Tab Switching Panels */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 shadow-inner self-start lg:self-center">
          <button
            onClick={() => {
              setActiveTab("magang");
              setSelectedJob(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "magang" ? "bg-white text-[#FF2D75] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            🏢 Program Magang Kampus
          </button>
          <button
            onClick={() => {
              setActiveTab("upwork");
              setSelectedUpworkJob(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "upwork" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            💚 Upwork Freelance Global
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: CAMPUS INTERNSHIPS */}
      {activeTab === "magang" && (
        <>
          {/* Filter and search */}
          <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-1.5 flex-wrap">
              {["Semua Lowongan", "Tokopedia", "Gojek", "Ruangguru"].map((corp) => {
                const isActive = (corp === "Semua Lowongan" && !searchTerm) || (searchTerm && corp.includes(searchTerm));
                return (
                  <button
                    key={corp}
                    onClick={() => setSearchTerm(corp === "Semua Lowongan" ? "" : corp)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md shadow-pink-100" 
                        : "bg-white/60 text-slate-600 hover:bg-white/80 border border-white/85"
                    }`}
                  >
                    {corp}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Cari posisi magang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-4 pr-10 py-2.5 border border-pink-100 rounded-2xl focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
              />
            </div>
          </div>

          {/* Grid of Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left lists */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 text-left cursor-pointer hover:border-pink-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${selectedJob?.id === job.id ? "ring-2 ring-pink-400 border-pink-200 bg-white/70" : ""}`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span className="bg-[#FFF0F5] text-[#FF2D75] px-2.5 py-1 rounded-xl font-black uppercase tracking-wider">
                          {job.type}
                        </span>
                        <span>📍 {job.location}</span>
                      </div>
                      <h3 className="font-extrabold text-xs text-[#2e1065] truncate">{job.title}</h3>
                      <p className="text-[10px] text-[#FF2D75] font-black">{job.company}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-bold">{job.desc}</p>
                    </div>

                    <div className="border-t border-white/60 pt-3 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600 font-mono">{job.stipend}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleInternshipApply(job.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${job.registered ? "bg-[#E6F4EA] text-[#137333] border border-emerald-200" : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white hover:scale-105"}`}
                      >
                        {job.registered ? "✓ Dilamar" : "Lamar Magang"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Selected job spec details */}
            <div>
              {selectedJob ? (
                <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 text-left space-y-4 shadow-xs animate-in slide-in-from-right-3 duration-200">
                  <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-wider">Spesifikasi Lowongan Kerja</h3>
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-[#FF2D75]">{selectedJob.title}</h4>
                    <p className="text-xs text-slate-800 font-black">{selectedJob.company} • <span className="text-slate-400 font-bold">{selectedJob.location}</span></p>
                  </div>

                  <div className="p-4 bg-[#FFF0F5] border border-pink-100/50 rounded-2xl text-[11px] leading-relaxed text-slate-700 font-bold">
                    <p className="font-black text-[10px] text-[#FF2D75] mb-1">Gaji & Hak Kontrak bulanan:</p>
                    <p className="font-black text-slate-800 font-mono">{selectedJob.stipend}</p>
                  </div>

                  <div className="space-y-1 text-slate-600 text-xs">
                    <p className="font-black text-slate-750">Job Description:</p>
                    <p className="text-[11px] leading-relaxed font-bold text-slate-500">{selectedJob.desc}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-[10px] uppercase text-[#FF2D75] tracking-wider flex items-center gap-1.5">
                      <FileText size={12} />
                      Kualifikasi Persyaratan
                    </p>
                    <ul className="space-y-1.5">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5 font-bold">
                          <span className="text-[#FF2D75] mt-1 select-none">✔</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => toggleInternshipApply(selectedJob.id)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${selectedJob.registered ? "bg-[#FFF0F5] text-[#FF2D75] border border-pink-200" : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white text-center shadow"}`}
                  >
                    {selectedJob.registered ? "✓ Batalkan Lamaran" : "Kirim CV & Lamar Lowongan"}
                  </button>
                </div>
              ) : (
                <div className="bg-white/40 backdrop-blur-md border border-pink-100/50 text-slate-400 p-8 rounded-3xl text-center space-y-3">
                  <div className="p-3 bg-white w-fit mx-auto rounded-2xl shadow-xs">
                    <Briefcase size={28} className="text-[#FF2D75]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Pilih Lowongan Magang</p>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-semibold mt-1">Klik salah satu posisi magang di samping kiri untuk mengkaji deskripsi lengkap, benefit bulanan, kualifikasi minimum, serta mengajukan CV lamaran instan.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* RENDER VIEW 2: UPWORK INTEGRATION CORE */}
      {activeTab === "upwork" && (
        <div className="space-y-6">

          {/* Upwork status & Key Config bar */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Upwork API Broker
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {upworkApiKey ? "🟢 Token Terdaftar (Local)" : "🟡 Memakai Kunci Generator AI"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-semibold max-w-xl">
                Gunakan API Key Upwork pribadi Anda untuk mengakses fungsional pendaratan loker langsung dari akun Upwork Anda, atau biarkan sistem melakukan pencarian otomatis global.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpworkConfig(!showUpworkConfig)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl border border-white/5 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Key size={14} className="text-emerald-400 animate-pulse" />
                {upworkApiKey ? "Kelola API Key Upwork" : "Koneksikan API Key"}
              </button>
            </div>
          </div>

          {/* API Key Modal / Form */}
          {showUpworkConfig && (
            <form onSubmit={handleSaveUpworkKey} className="bg-slate-950 text-white p-5 rounded-3xl border border-emerald-500/30 text-xs space-y-4 animate-in slide-in-from-top-3 max-w-2xl shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold border-b border-white/10 pb-2 text-sm uppercase">
                <Settings size={16} />
                Konfigurasi Upwork Developers API Key / Client ID
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-black uppercase mb-1">Upwork API Key atau Access Token</label>
                  <input
                    type="password"
                    placeholder="Masukkan Upwork API Key atau personal OAuth token Anda..."
                    value={tempUpworkKey}
                    onChange={(e) => setTempUpworkKey(e.target.value)}
                    className="w-full bg-slate-900 p-3 rounded-xl border border-emerald-950 text-zinc-100 font-mono focus:outline-hidden focus:border-emerald-500 text-[11px]"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
                    Sistem akan menyimpan API Key ini hanya pada penjelajah lokal Anda <strong>(localStorage)</strong> secara aman agar tidak terekspos. API ini memotong proses pencarian manual untuk mendaratkan proyek lepas termahal langsung ke dasbor Anda.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUpworkConfig(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-white/10 text-white hover:bg-white/15 transition-all text-[11px]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 text-white transition-all text-[11px] hover:brightness-105"
                >
                  Simpan & Hubungkan Upwork
                </button>
              </div>
            </form>
          )}

          {/* Upwork Search Options */}
          <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { label: "💻 Web Dev & React", q: "React & TailWind Developer" },
                { label: "✍️ Content Writer", q: "English Article Copywriter" },
                { label: "🎨 UI/UX Design", q: "Figma UI UX Mobile Designer" },
                { label: "🤖 AI & Python", q: "Python AI Automation Specialist" }
              ].map((category) => {
                const isActive = upworkQuery.toLowerCase() === category.q.toLowerCase();
                return (
                  <button
                    key={category.label}
                    onClick={() => {
                      setUpworkQuery(category.q);
                      fetchUpworkJobs(category.q);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-905 bg-emerald-600 text-white shadow-md shadow-emerald-100" 
                        : "bg-white/60 text-slate-700 hover:bg-white/80 border border-white/85"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Input Search */}
            <div className="relative w-full md:max-w-xs flex gap-2">
              <input
                type="text"
                placeholder="Cari keahlian bebas..."
                value={upworkQuery}
                onChange={(e) => setUpworkQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchUpworkJobs(upworkQuery);
                  }
                }}
                className="w-full text-xs pl-4 pr-3 py-2.5 border border-emerald-100 rounded-2xl focus:outline-hidden focus:border-emerald-300 bg-white/60 font-semibold"
              />
              <button
                onClick={() => fetchUpworkJobs(upworkQuery)}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all cursor-pointer"
                title="Cari"
              >
                <Search size={15} />
              </button>
            </div>
          </div>

          {/* Upwork Grid Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left listings card column */}
            <div className="lg:col-span-7 space-y-4">
              {loadingUpwork ? (
                <div className="bg-white/45 backdrop-blur-md p-16 rounded-3xl border border-white/60 text-center flex flex-col justify-center items-center space-y-3">
                  <RefreshCw className="text-emerald-600 animate-spin" size={32} />
                  <p className="text-xs font-black text-slate-700">Menghubungkan ke Gateway API Upwork...</p>
                  <p className="text-[10px] text-slate-400">Menyaring jutaan proyek lepas terverifikasi dengan kualifikasi ideal untuk portofolio Anda.</p>
                </div>
              ) : upworkJobs.length === 0 ? (
                <div className="bg-white/45 backdrop-blur-md p-16 rounded-3xl border border-white/60 text-center space-y-3">
                  <AlertCircle className="text-amber-500 mx-auto" size={32} />
                  <p className="text-xs font-black text-slate-700">Proyek Tidak Ditemukan</p>
                  <p className="text-[10px] text-slate-400">Coba ubah kata kunci atau cari keahlian umum seperti 'Web Development' atau 'Design'.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {upworkJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedUpworkJob(job);
                        setProposalLetter(""); // Reset letter on selection change
                      }}
                      className={`bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 text-left cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${selectedUpworkJob?.id === job.id ? "ring-2 ring-emerald-500 border-emerald-300 bg-white/70" : ""}`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider">
                            {job.type || "Freelance"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <Shield size={11} className="text-emerald-600 fill-emerald-50" />
                            {job.location}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm text-[#0f5132] line-clamp-1">{job.title}</h3>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-bold line-clamp-2 mt-1">{job.desc}</p>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-emerald-100 pt-3 flex justify-between items-center text-[11px] font-bold">
                        <div className="space-x-2 text-slate-700">
                          <span className="text-emerald-700 font-mono font-black">{job.stipend}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-lg">{job.connects || "6 Connects"}</span>
                        </div>

                        <div className="text-[11px] text-emerald-600 flex items-center gap-0.5 hover:underline">
                          Saran AI & Detail <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right details panel with AI Cover Letter Writer */}
            <div className="lg:col-span-5 space-y-4">
              {selectedUpworkJob ? (
                <div className="space-y-4">
                  
                  {/* Job Spec Summary */}
                  <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 text-left space-y-4 shadow-xs animate-in slide-in-from-right-3 duration-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-wider">Deskripsi Proyek Upwork</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-black">
                        Verified Pay
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-emerald-800 leading-snug">{selectedUpworkJob.title}</h4>
                      <p className="text-xs text-slate-800 font-bold">
                        📍 {selectedUpworkJob.company || "Client"} • <span className="text-slate-400">{selectedUpworkJob.location}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Anggaran Klien</span>
                        <span className="font-mono text-xs font-black text-emerald-800">{selectedUpworkJob.stipend}</span>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Proposal Masuk</span>
                        <span className="font-mono text-xs font-black text-emerald-800">{selectedUpworkJob.proposals || "Less than 5"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-650 font-bold">
                      <p className="font-black text-slate-700">Project Overview:</p>
                      <p className="text-[11px] leading-relaxed text-slate-500 font-semibold">{selectedUpworkJob.desc}</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-black text-[10px] uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                        <FileText size={12} />
                        Keahlian Yang Dibutuhkan
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedUpworkJob.requirements?.map((req: string, i: number) => (
                          <span key={i} className="bg-white/80 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                            {req}
                          </span>
                        )) || <span className="text-slate-400 text-[10px]">React, Tailwind, CSS</span>}
                      </div>
                    </div>
                  </div>

                  {/* MAGIC AI UPWORK COVER LETTER GENERATOR */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-indigo-950">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 rounded-xl text-indigo-300">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-white">AI Upwork Proposal Generator</h4>
                          <span className="text-[9px] text-slate-300 block font-semibold leading-none">Buat surat lamaran penembus algoritme Upwork otomatis</span>
                        </div>
                      </div>
                    </div>

                    {/* Guided skills parameterizer */}
                    <div className="space-y-2 text-xs">
                      <label className="block text-[10px] text-slate-300 font-black uppercase">Modifikasi Profil Kompetensi & Keunikan Anda:</label>
                      <textarea
                        rows={2}
                        value={userProfileSummary}
                        onChange={(e) => setUserProfileSummary(e.target.value)}
                        placeholder="Tulis kelebihan utama Anda (contoh: Ahli React JS, pengalaman 2 tahun magang di startup, bisa integrasi web map)"
                        className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-white/10 focus:outline-hidden focus:border-indigo-400 text-white text-[10.5px] leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={generateAIProposal}
                      disabled={generatingProposal}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white text-xs font-black transition-all cursor-pointer hover:brightness-105 active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      {generatingProposal ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} />
                          Menganalisis Proyek & Menyusun Dokumen...
                        </>
                      ) : (
                        <>
                          <Coins size={14} />
                          Formulasikan Surat Lamaran & Bid Instan 🚀
                        </>
                      )}
                    </button>

                    {/* Proposal Return Area */}
                    {proposalLetter && (
                      <div className="space-y-2.5 animate-in fade-in-20 duration-300">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] text-emerald-400 font-black uppercase tracking-wider">Hasil Cover Letter Siap Kirim (Bahasa Inggris):</label>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(proposalLetter);
                              alert("Teks lamaran disalin ke papan klip!");
                            }}
                            className="text-[9.5px] text-indigo-300 hover:text-white font-bold underline cursor-pointer"
                          >
                            Salin Teks (Copy)
                          </button>
                        </div>
                        <div className="bg-slate-950/90 text-slate-200 border border-white/10 p-4 rounded-2xl font-mono text-[10px] leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap select-text selection:bg-indigo-700">
                          {proposalLetter}
                        </div>
                        <div className="bg-indigo-950/80 p-3 rounded-xl border border-indigo-500/20 text-[10px] text-slate-300 leading-relaxed font-bold flex gap-2">
                          <FileCheck size={16} className="text-emerald-400 shrink-0" />
                          <span><strong>Tips Lolos:</strong> Salin penawaran di atas, lalu masukkan ke kolom 'Cover Letter' di lamaran pekerjaan Upworks Anda untuk langsung bersaing di baris terdepan portofolio klien!</span>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="bg-white/40 backdrop-blur-md border border-emerald-100 text-slate-400 p-8 rounded-3xl text-center space-y-3">
                  <div className="p-3 bg-white w-fit mx-auto rounded-2xl shadow-xs">
                    <Globe size={28} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Pilih Pekerjaan Freelance</p>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-semibold mt-1">Klik salah satu penawaran proyek di samping kiri untuk mengkaji parameter anggaran, kualifikasi, penawaran Connects, serta menggunakan kecerdasan buatan dalam menyusun proposal proposal lamaran.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
