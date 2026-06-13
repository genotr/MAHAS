import React, { useState } from "react";
import { Award, Search, CheckCircle2, AlertCircle, FileText, ChevronRight, Check, Sparkles } from "lucide-react";
import { Scholarship } from "../types";

interface BeasiswaViewProps {
  scholarships: Scholarship[];
  toggleScholarshipReg: (id: string) => void;
}

export default function BeasiswaView({ scholarships, toggleScholarshipReg }: BeasiswaViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [selectedSch, setSelectedSch] = useState<Scholarship | null>(null);

  const filtered = scholarships.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Semua" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* Title */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
          <Award className="text-[#FF2D75]" />
          Peluang Beasiswa Internal & Eksternal
        </h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Dapatkan bantuan finansial, biaya hidup penuh, sertifikasi kompetensi, serta bimbingan kepemimpinan dari berbagai yayasan terpercaya.
        </p>
      </div>

      {/* Filter and search */}
      <div className="bg-white/45 backdrop-blur-md p-4 rounded-3xl border border-white/60 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {["Semua", "Prestasi", "Bantuan", "Luar Negeri"].map((cat) => (
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
            placeholder="Cari beasiswa atau penyedia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-4 pr-10 py-2.5 border border-pink-100 rounded-2xl focus:outline-hidden focus:border-pink-300 bg-white/60 font-semibold"
          />
        </div>
      </div>

      {/* Scholarship Content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left main: Scholarship Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((sch) => (
              <div 
                key={sch.id}
                onClick={() => setSelectedSch(sch)}
                className={`bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 text-left cursor-pointer transition-all hover:border-pink-200 hover:shadow-md flex flex-col justify-between space-y-4 ${selectedSch?.id === sch.id ? "ring-2 ring-pink-400 border-pink-200" : ""}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xl bg-[#FFF0F5] text-[#FF2D75]">
                      {sch.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Tutup: {sch.deadline}</span>
                  </div>
                  <h3 className="font-extrabold text-xs text-[#2e1065] line-clamp-2 leading-snug">{sch.name}</h3>
                  <p className="text-[10px] text-[#FF2D75] font-black">{sch.provider}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 font-bold">{sch.desc}</p>
                </div>

                <div className="border-t border-white/60 pt-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-700 font-mono">{sch.reward.split("+")[0]}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleScholarshipReg(sch.id);
                      }}
                      className={`text-[10px] px-3 py-1.5 rounded-xl font-black transition-all ${sch.registered ? "bg-[#E6F4EA] text-[#137333] border border-emerald-200 cursor-pointer" : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white cursor-pointer hover:scale-105"}`}
                    >
                      {sch.registered ? "✓ Terdaftar" : "Daftar Beasiswa"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl space-y-2">
                <span className="text-3xl">🧩</span>
                <p className="font-bold text-slate-500 text-xs">Tidak ada pendaftaran beasiswa yang cocok.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right main side column: Detail info */}
        <div>
          {selectedSch ? (
            <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs text-left space-y-4 animate-in slide-in-from-right-3 duration-200">
              <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Detail Aplikasi Pendaftaran</h3>
              
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-[#FF2D75]">{selectedSch.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold">Penyedia: {selectedSch.provider}</p>
              </div>

              <div className="p-4 bg-[#FFF0F5] rounded-2xl border border-pink-100/50 space-y-0.5 text-slate-700 font-bold text-[11px]">
                <p className="text-[10px] text-[#FF2D75] font-extrabold uppercase tracking-wider">Benefit Pokok Beasiswa</p>
                <p className="leading-relaxed font-black text-slate-800">{selectedSch.reward}</p>
              </div>

              <div className="space-y-2">
                <p className="font-black text-[10px] uppercase text-[#FF2D75] tracking-wider flex items-center gap-1.5">
                  <FileText size={12} />
                  Kriteria Syarat Dokumen
                </p>
                <ul className="space-y-1.5">
                  {selectedSch.requirements.map((req, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5 font-bold">
                      <span className="text-[#FF2D75] mt-1 select-none">✔</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/60 pt-4 flex flex-col gap-2">
                <button
                  onClick={() => toggleScholarshipReg(selectedSch.id)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${selectedSch.registered ? "bg-[#FFF0F5] text-[#FF2D75] border border-pink-200" : "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white text-center shadow"}`}
                >
                  {selectedSch.registered ? "✓ Batalkan Registrasi Formulir" : "Ajukan Berkas Pendaftaran"}
                </button>
                <p className="text-[9px] text-slate-400 text-center leading-relaxed font-bold">
                  Berkas Anda (CV, Surat Rekomendasi, KHS) akan dikirim langsung ke tim seleksi {selectedSch.provider}.
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-md border border-pink-100/50 text-slate-400 p-8 rounded-3xl text-center space-y-3">
              <div className="p-3 bg-white w-fit mx-auto rounded-2xl shadow-xs">
                <Award size={28} className="text-[#FF2D75]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Pilih Info Beasiswa</p>
                <p className="text-[10px] leading-relaxed text-slate-400 font-semibold mt-1">Klik salah satu kartu beasiswa di samping kiri untuk melihat kriteria persyaratan dokumen secara lengkap.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
