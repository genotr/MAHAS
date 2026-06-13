import React, { useState } from "react";
import { Users, Search, Plus, ThumbsUp, MessageSquare, Compass, CheckCircle, Sparkles } from "lucide-react";
import { Community } from "../types";

interface KomunitasViewProps {
  communities: Community[];
  toggleCommunityJoin: (id: string) => void;
}

export default function KomunitasView({ communities, toggleCommunityJoin }: KomunitasViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const filtered = communities.filter(comm => {
    const matchesKeyword = comm.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           comm.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Semua" || comm.category === categoryFilter;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* Title */}
      <div className="space-y-1.5 animate-fade-in">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
          <Users className="text-[#FF2D75]" />
          Komunitas Mahasiswa & Unit Kegiatan Kampus
        </h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Perbanyak relasi, temukan kelompok minat bakat, kolaborasi proyek riset, atau cari teman sehobi dengan bergabung ke berbagai UKM & club resmi di MahasSpace.
        </p>
      </div>

      {/* Filters and search */}
      <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {["Semua", "Seni & Desain", "Akademik & Karir", "Sosial & Budaya", "Teknologi"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${categoryFilter === cat ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md shadow-pink-100" : "bg-white/60 text-slate-655 hover:bg-white/80 border border-white/85"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Cari klub atau pembuat konten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-4 pr-10 py-2.5 border border-pink-100 rounded-2xl focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
          />
        </div>
      </div>

      {/* Grid of communities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((comm) => (
          <div 
            key={comm.id}
            className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 hover:border-pink-200 transition-all flex flex-col justify-between text-left space-y-4 shadow-xs"
          >
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="bg-[#FFF0F5] text-[#FF2D75] px-2.5 py-1 rounded-xl uppercase tracking-wider font-extrabold">
                  {comm.category}
                </span>
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Compass size={12} className="text-[#FF2D75]" />
                  Unit Kegiatan
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#2e1065] leading-snug">{comm.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  {(comm.isJoined ? comm.members + 1 : comm.members).toLocaleString("id-ID")} anggota terhubung
                </p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {comm.desc}
              </p>
            </div>

            <div className="border-t border-white/60 pt-4 flex justify-between items-center text-xs">
              <span className="text-[10px] text-slate-400 font-bold">Resmi Terverifikasi Kampus</span>
              <button
                onClick={() => toggleCommunityJoin(comm.id)}
                className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 cursor-pointer ${
                  comm.isJoined 
                    ? "bg-[#E6F4EA] text-[#137333] border border-emerald-100" 
                    : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white shadow-md shadow-pink-100"
                }`}
              >
                {comm.isJoined ? "✓ Tergabung" : "Gabung Komunitas"}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl space-y-2">
            <span className="text-3xl">👥</span>
            <p className="font-bold text-slate-500 text-xs text-slate-650">Wah, belum ada data komunitas yang sesuai pencarian Anda.</p>
          </div>
        )}
      </div>

    </div>
  );
}
