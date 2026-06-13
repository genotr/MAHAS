import React, { useState } from "react";
import { User, CheckSquare, Award, Briefcase, ShoppingBag, Heart, CheckCircle2, Award as AwardIcon, Shield, Layers, Sparkles, Upload } from "lucide-react";
import { UserProfile, Task, CampusEvent, Scholarship, Internship, Community, MarketplaceItem, getIpkClassification } from "../types";

interface ZonamuViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  tasks: Task[];
  events: CampusEvent[];
  scholarships: Scholarship[];
  internships: Internship[];
  communities: Community[];
  marketplaceItems: MarketplaceItem[];
}

export default function ZonamuView({
  profile,
  setProfile,
  tasks,
  events,
  scholarships,
  internships,
  communities,
  marketplaceItems
}: ZonamuViewProps) {
  // Editing state for profile configuration
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editMajor, setEditMajor] = useState(profile.major);
  const [editGpa, setEditGpa] = useState(profile.gpa);
  const [editNim, setEditNim] = useState(profile.nim);
  const [editSemester, setEditSemester] = useState(profile.semester);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editName,
      major: editMajor,
      gpa: Number(editGpa) || 3.0,
      nim: editNim,
      semester: Number(editSemester) || 4,
      avatar: editAvatar
    }));
    setIsEditing(false);
  };

  // Compute stats
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const registeredEventsCount = events.filter(e => e.registered).length;
  const appliedJobsCount = internships.filter(j => j.registered).length;
  const appliedScholarshipsCount = scholarships.filter(s => s.registered).length;
  const joinedCommunitiesCount = communities.filter(c => c.isJoined).length;

  return (
    <div className="space-y-6 text-left relative z-10">
      
      {/* Title */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
          <User className="text-[#FF2D75]" />
          Zonamu (Laporan Aktivitas Mahasiswa)
        </h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Pusat pencatatan riwayat prestasi, data profil Anda, resume lamaran magang, beasiswa yang Anda ikuti, serta rekapitulasi data portfolio MahasSpace Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Personal info summary */}
        <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs space-y-5">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover border-4 border-pink-100 shadow-md mx-auto"
              />
              <span className="absolute bottom-1 right-1 bg-[#FF2D75] text-white p-1 rounded-full text-[10px] font-black w-6 h-6 flex items-center justify-center border-2 border-white">
                ✓
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">{profile.name}</h3>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-wide uppercase">{profile.major} • Semester {profile.semester}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-slate-100 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Edit Nama Panggilan</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs rounded-2xl bg-white/60 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Program Studi / Jurusan</label>
                <input
                  type="text"
                  required
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs rounded-2xl bg-white/60 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs rounded-2xl bg-white font-semibold text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIM</label>
                  <input
                    type="text"
                    required
                    value={editNim}
                    onChange={(e) => setEditNim(e.target.value)}
                    className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs rounded-2xl bg-white/60 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IPK Kumulatif</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="4.0"
                  required
                  value={editGpa}
                  onChange={(e) => setEditGpa(e.target.value)}
                  className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs rounded-2xl bg-white/60 font-semibold text-slate-800"
                />
              </div>

              <div>
                {/* Device/Album Local File Upload Option */}
                <div className="mb-3 bg-pink-50/40 p-2.5 rounded-2xl border border-pink-100/50">
                  <label className="block text-[10px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Upload size={11} className="text-[#FF2D75]" />
                    <span>Unggah dari File / Album Device</span>
                  </label>
                  <label 
                    htmlFor="device-avatar-upload" 
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-pink-200/70 hover:border-pink-300 hover:bg-white bg-white/45 py-2 px-3 rounded-xl cursor-pointer transition-all text-center select-none"
                  >
                    <Upload size={13} className="text-[#FF2D75]" />
                    <span className="text-[10px] text-slate-600 font-extrabold">Pilih Berkas Foto</span>
                    <input
                      type="file"
                      id="device-avatar-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <label className="block font-bold text-slate-500 mb-1 text-[9px]">Atau Tempel URL Foto Kustom</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full border border-pink-100 focus:outline-hidden focus:border-pink-300 p-2 text-[10px] rounded-xl bg-white/60 font-mono text-slate-800"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <span className="text-slate-500 font-bold">NIM Mahasiswa:</span>
                <span className="font-mono font-black text-[#FF2D75]">{profile.nim}</span>
              </div>
              <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <span className="text-slate-500 font-bold">IPK Kumulatif:</span>
                <span className="font-mono font-black text-[#FF2D75]">{profile.gpa} <span className="text-pink-600 font-extrabold text-[10px] ml-1">({getIpkClassification(profile.gpa)})</span></span>
              </div>
              <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <span className="text-slate-500 font-bold">Semester:</span>
                <span className="font-black text-[#2e1065]">{profile.semester} ({profile.semester % 2 === 0 ? "Genap" : "Ganjil"})</span>
              </div>

              <button
                onClick={() => {
                  setEditName(profile.name);
                  setEditMajor(profile.major);
                  setEditGpa(profile.gpa);
                  setEditNim(profile.nim);
                  setEditSemester(profile.semester);
                  setEditAvatar(profile.avatar);
                  setIsEditing(true);
                }}
                className="w-full py-2.5 border border-dashed border-pink-200 hover:border-pink-300 text-slate-600 hover:text-pink-600 font-extrabold text-center rounded-2xl transition-all cursor-pointer text-[11px] bg-white/20"
              >
                Ubah Data Profil Kamu
              </button>
            </div>
          )}
        </div>

        {/* Right Columns: Dynamic statistics resume */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs">
            <h3 className="font-extrabold font-display text-slate-800 text-sm mb-4">Ringkasan Riwayat Portofolio</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              
              <div className="bg-[#FFF5E6] p-4.5 rounded-2xl border border-orange-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <CheckSquare size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tugas Terselesaikan</p>
                  <p className="text-lg font-black text-slate-800">{completedTasksCount}/{totalTasksCount}</p>
                </div>
              </div>

              <div className="bg-pink-50/50 p-4.5 rounded-2xl border border-pink-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <AwardIcon size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pendaftaran Beasiswa</p>
                  <p className="text-lg font-black text-slate-800">{appliedScholarshipsCount} Diikuti</p>
                </div>
              </div>

              <div className="bg-sky-50/50 p-4.5 rounded-2xl border border-sky-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <Briefcase size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aplikasi Kerja Magang</p>
                  <p className="text-lg font-black text-slate-800">{appliedJobsCount} Dilamar</p>
                </div>
              </div>

              <div className="bg-[#FAF5FF] p-4.5 rounded-2xl border border-purple-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <Shield size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Klub Komunitas Diikuti</p>
                  <p className="text-lg font-black text-slate-800">{joinedCommunitiesCount} Grup</p>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4.5 rounded-2xl border border-emerald-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <Layers size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pendaftaran Webinar</p>
                  <p className="text-lg font-black text-slate-800">{registeredEventsCount} Terdaftar</p>
                </div>
              </div>

            </div>
          </div>

          {/* Connected applications status listings */}
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-4">
            <h3 className="font-extrabold font-display text-slate-800 text-sm">Status Berkas Lamaran & Rujukan Akademik</h3>
            <div className="space-y-3">
              {internships.filter(j => j.registered).map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-slate-800 truncate">{job.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{job.company}</p>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-widest">
                    Menunggu Review Berkas
                  </span>
                </div>
              ))}
              
              {scholarships.filter(s => s.registered).map((sch) => (
                <div key={sch.id} className="flex justify-between items-center p-3.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-slate-800 truncate">{sch.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sch.provider}</p>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-[#FFF0F5] text-[#FF2D75] border border-pink-100 uppercase tracking-widest">
                    Sesi Wawancara (Juni)
                  </span>
                </div>
              ))}

              {internships.filter(j => j.registered).length === 0 && scholarships.filter(s => s.registered).length === 0 && (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-bold text-slate-700">Tidak ada lamaran aktif saat ini.</p>
                  <p className="text-[10px] text-slate-400">Silakan buka tab Karir atau Beasiswa untuk mendaftar!</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
