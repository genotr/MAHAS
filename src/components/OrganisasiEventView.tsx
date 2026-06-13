import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Search, 
  Plus, 
  CheckCircle, 
  Compass, 
  Sparkles, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  SlidersHorizontal,
  BookmarkCheck,
  BookmarkPlus,
  ArrowUpRight,
  UserCheck,
  Award,
  BookOpen,
  MapPin,
  Settings,
  ShieldAlert
} from "lucide-react";
import { CampusEvent, Community } from "../types";

interface OrganisasiEventViewProps {
  events: CampusEvent[];
  communities: Community[];
  toggleEventRegistration: (id: string) => void;
  toggleCommunityJoin: (id: string) => void;
}

export default function OrganisasiEventView({ 
  events, 
  communities, 
  toggleEventRegistration, 
  toggleCommunityJoin 
}: OrganisasiEventViewProps) {
  
  // Dashboard segment tabs
  const [activeTab, setActiveTab] = useState<"internal" | "rapid">("internal");
  
  // Local Event filters
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategory, setEventCategory] = useState("Semua");

  // RapidAPI variables
  const [rapidQuery, setRapidQuery] = useState("Computer Science");
  const [rapidKey, setRapidKey] = useState(() => {
    return localStorage.getItem("RAPIDAPI_KEY") || "";
  });
  const [tempRapidKey, setTempRapidKey] = useState(rapidKey);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiSource, setApiSource] = useState("Local Feed");

  // State arrays for dynamic RapidAPI outputs
  const [rapidEvents, setRapidEvents] = useState<CampusEvent[]>([]);
  const [rapidOrgs, setRapidOrgs] = useState<any[]>([]);

  // Registered states for rapid events & joins
  const [registeredRapidEvents, setRegisteredRapidEvents] = useState<string[]>([]);
  const [joinedRapidOrgs, setJoinedRapidOrgs] = useState<string[]>([]);

  // Category listing
  const categories = ["Semua", "Seminar", "Workshop", "Sharing"];

  // Fetch from RapidAPI proxy endpoint
  const queryRapidEvents = async (queryVal: string) => {
    setLoading(true);
    try {
      const activeKey = localStorage.getItem("RAPIDAPI_KEY") || rapidKey;
      const resp = await fetch(`/api/rapid-events?q=${encodeURIComponent(queryVal)}`, {
        headers: {
          "X-RapidAPI-Key": activeKey || ""
        }
      });
      const data = await resp.json();
      if (data) {
        setApiSource(data.source || "Semantic AI Gateway");
        setRapidEvents(data.events || []);
        setRapidOrgs(data.organizations || []);
      }
    } catch (err) {
      console.error("Gagal menarik data RapidAPI:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger rapid api search on initial switch to rapid tab
  useEffect(() => {
    if (activeTab === "rapid") {
      queryRapidEvents(rapidQuery);
    }
  }, [activeTab]);

  const handleSaveRapidKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("RAPIDAPI_KEY", tempRapidKey.trim());
    setRapidKey(tempRapidKey.trim());
    setShowConfig(false);
    queryRapidEvents(rapidQuery);
  };

  // Filter internal events
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(eventSearch.toLowerCase()) || 
                          ev.description?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesCategory = eventCategory === "Semua" || ev.category === eventCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLocalRapidEvent = (id: string, evTitle: string, evLoc: string) => {
    if (registeredRapidEvents.includes(id)) {
      setRegisteredRapidEvents(prev => prev.filter(item => item !== id));
    } else {
      setRegisteredRapidEvents(prev => [...prev, id]);
      // Instantly inject into simulated calendar/schedule via a custom success toast visual
      alert(`Sukses mendaftar "${evTitle}"! Agenda ini juga sinkron dengan dashboard mahasiswa Anda.`);
    }
  };

  const toggleLocalRapidOrg = (id: string, name: string) => {
    if (joinedRapidOrgs.includes(id)) {
      setJoinedRapidOrgs(prev => prev.filter(item => item !== id));
    } else {
      setJoinedRapidOrgs(prev => [...prev, id]);
      alert(`Selamat bergabung dng club "${name}"! Jadwal sekretariat dan forum chat Anda telah dibuka.`);
    }
  };

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Users className="text-[#FF2D75]" />
            Organisasi, Komunitas & Event Penyaluran Bakat
          </h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Perluas jejaring networking dengan mengikuti seminar kampus, workshop bersertifikat, atau temukan klub global melalui integrasi instan RapidAPI.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 shadow-inner self-start lg:self-center shrink-0">
          <button
            onClick={() => setActiveTab("internal")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "internal" ? "bg-white text-[#FF2D75] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            🏢 Agenda & Kampus Hub
          </button>
          <button
            onClick={() => setActiveTab("rapid")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "rapid" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            🌍 RapidAPI Event Finder
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: INTERNAL CAMPUS EVENTS & ORGANISATIONS */}
      {activeTab === "internal" && (
        <div className="space-y-8">
          
          {/* Sub Filters for internal events */}
          <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEventCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${eventCategory === cat ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md shadow-pink-100" : "bg-white/60 text-slate-650 hover:bg-white/80 border border-white/85"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Cari event atau seminar..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full text-xs pl-4 pr-10 py-2.5 border border-pink-100 rounded-2xl focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
              />
            </div>
          </div>

          {/* Grid of internal events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white/50 backdrop-blur-md rounded-3xl overflow-hidden border border-white/60 shadow-xs flex flex-col justify-between hover:scale-[1.01] hover:border-pink-200 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="relative">
                    <img 
                      src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600"} 
                      alt={event.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#FFF0F5] border border-pink-100/50 text-[#FF2D75] px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider">
                      {event.category}
                    </span>
                  </div>
                  
                  <div className="p-5 space-y-2">
                    <span className="text-[9px] text-[#FF2D75] font-black uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={11} /> {event.date}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#2e1065] leading-snug line-clamp-1">{event.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold line-clamp-2">{event.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-dashed border-pink-100/60 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                    📍 {event.location}
                  </span>
                  <button
                    onClick={() => toggleEventRegistration(event.id)}
                    className={`px-4 py-2 font-black text-xs rounded-xl transition-all cursor-pointer ${
                      event.registered 
                        ? "bg-[#E6F4EA] text-[#137333] border border-emerald-250 font-extrabold" 
                        : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-xs hover:brightness-105"
                    }`}
                  >
                    {event.registered ? "✓ Terdaftar" : "Daftar Event"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="py-16 text-center bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl space-y-2">
              <span className="text-3xl">📅</span>
              <p className="font-bold text-slate-500 text-xs">Tidak ada event kampusnya yang cocok dng penyaringan Anda.</p>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 2: RAPIDAPI EVENT FINDER & DIRECTORIES */}
      {activeTab === "rapid" && (
        <div className="space-y-6">
          
          {/* Rapid API connection banner */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Global RapidAPI Gateway
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {rapidKey ? "🟢 Terpasang di Browser" : "🟡 Menggunakan Simulator Jaringan AI"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-bold max-w-xl">
                Cari pameran sains mahasiswa, komunitas riset, hackathon dunia, atau paguyuban regional menggunakan API Rapid Anda secara langsung!
              </p>
            </div>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl border border-white/5 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Key size={14} className="text-emerald-400" />
              {rapidKey ? "Ubah API Key Rapid" : "Masukkan API Key Rapid"}
            </button>
          </div>

          {/* Form configuration toggled */}
          {showConfig && (
            <form onSubmit={handleSaveRapidKey} className="bg-slate-950 text-white p-5 rounded-3xl border border-emerald-500/30 text-xs space-y-4 animate-in slide-in-from-top-3 max-w-2xl shadow-xl">
              <div className="flex items-center gap-2 text-emerald-405 font-black border-b border-white/10 pb-2 text-sm uppercase">
                <Settings size={16} />
                Hubungkan API Key RapidAPI (X-RapidAPI-Key)
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-black uppercase mb-1">X-RapidAPI-Key Token</label>
                  <input
                    type="password"
                    placeholder="Masukkan X-RapidAPI-Key Anda di sini..."
                    value={tempRapidKey}
                    onChange={(e) => setTempRapidKey(e.target.value)}
                    className="w-full bg-slate-900 p-3 rounded-xl border border-teal-950 text-zinc-100 font-mono focus:outline-hidden focus:border-emerald-500 text-[11px]"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
                    Kunci ini disimpan aman pada memori penjelajah lokal <strong>(localStorage)</strong> pribadi Anda dan digunakan untuk mendelegasikan request secara real-time ke RapidAPI directories.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-white/10 text-white hover:bg-white/15 transition-all text-[11px]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 text-white transition-all text-[11px] hover:brightness-105 shadow-md shadow-emerald-950"
                >
                  Verifikasi & Terapkan Kunci
                </button>
              </div>
            </form>
          )}

          {/* Rapid Search query bar */}
          <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { label: "🤖 AI & Robotics", q: "Artificial Intelligence" },
                { label: "🎨 Seni Rupa & Batik", q: "Seni Budaya Batik" },
                { label: "🎵 Musik & Band", q: "Music Jam Student" },
                { label: "🚀 Startups & Venture", q: "Business Hatchery" }
              ].map((category) => {
                const isActive = rapidQuery.toLowerCase() === category.q.toLowerCase();
                return (
                  <button
                    key={category.label}
                    onClick={() => {
                      setRapidQuery(category.q);
                      queryRapidEvents(category.q);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" 
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
                placeholder="Cari tema / bidang minat..."
                value={rapidQuery}
                onChange={(e) => setRapidQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    queryRapidEvents(rapidQuery);
                  }
                }}
                className="w-full text-xs pl-4 pr-3 py-2.5 border border-emerald-100 rounded-2xl focus:outline-hidden focus:border-emerald-300 bg-white/60 font-semibold"
              />
              <button
                onClick={() => queryRapidEvents(rapidQuery)}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all cursor-pointer shrink-0"
                title="Cari RapidAPI"
              >
                <Search size={15} />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 font-extrabold flex items-center gap-1 bg-white/50 w-fit px-3 py-1.5 rounded-xl border border-slate-200">
            <Compass size={12} className="text-emerald-600" />
            Terhubung via: <span className="text-emerald-700 underline font-black">{apiSource}</span>
          </div>

          {/* Results Lists */}
          {loading ? (
            <div className="bg-white/45 backdrop-blur-md p-16 rounded-3xl border border-white/60 text-center flex flex-col justify-center items-center space-y-3">
              <RefreshCw className="text-emerald-600 animate-spin" size={32} />
              <p className="text-xs font-black text-slate-700 font-display">Mengontak Repositori RapidAPI Gateway...</p>
              <p className="text-[10px] text-slate-400 font-bold">Kami sedang memilah seminar terakreditasi dan klub pelajar aktif paling prestisius.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Dynamic Rapid events */}
              <div className="space-y-4 text-left">
                <h3 className="font-black text-[11px] uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Calendar size={14} />
                  Event Global & Webinar Ditemukan ({rapidEvents.length})
                </h3>
                
                <div className="space-y-4">
                  {rapidEvents.map((ev) => {
                    const isRegistered = registeredRapidEvents.includes(ev.id);
                    return (
                      <div 
                        key={ev.id}
                        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 hover:border-emerald-250 hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex gap-1.5 items-center">
                            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase">
                              {ev.category || "General"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{ev.date}</span>
                          </div>
                          
                          <h4 className="font-extrabold text-xs text-slate-800">{ev.title}</h4>
                          <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{ev.description}</p>
                          <p className="text-[9.5px] text-emerald-700 font-bold flex items-center gap-0.5">
                            <MapPin size={10} /> {ev.location}
                          </p>
                        </div>

                        <div className="flex md:flex-col justify-between items-end shrink-0 md:min-h-[70px]">
                          <span className="text-[10px] text-slate-400 font-bold">Kapasitas: {ev.capacity || "Unlimited"}</span>
                          <button
                            onClick={() => toggleLocalRapidEvent(ev.id, ev.title, ev.location)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                              isRegistered 
                                ? "bg-emerald-100 text-teal-800 border border-emerald-200" 
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {isRegistered ? "✓ Terdaftar" : "Join Event"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Rapid Organizations */}
              <div className="space-y-4 text-left">
                <h3 className="font-black text-[11px] uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Users size={14} />
                  Klub Mahasiswa & Circles Ditemukan ({rapidOrgs.length})
                </h3>

                <div className="space-y-4">
                  {rapidOrgs.map((org) => {
                    const isJoined = joinedRapidOrgs.includes(org.id);
                    return (
                      <div 
                        key={org.id}
                        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 hover:border-emerald-250 hover:shadow-md transition-all flex justify-between items-center gap-4"
                      >
                        <div className="space-y-1.5">
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase">
                            {org.category || "Student Club"}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-850">{org.name}</h4>
                          <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{org.desc}</p>
                          <span className="text-[10px] text-zinc-400 block font-bold">👥 {(isJoined ? org.members + 1 : org.members).toLocaleString("id-ID")} connect-members</span>
                        </div>

                        <button
                          onClick={() => toggleLocalRapidOrg(org.id, org.name)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                            isJoined 
                              ? "bg-[#E6F4EA] text-[#137333] border border-emerald-100" 
                              : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-105"
                          }`}
                        >
                          {isJoined ? "✓ Joined" : "Join Club"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
