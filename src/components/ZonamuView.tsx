import React, { useState } from "react";
import { User, CheckSquare, Award, Briefcase, ShoppingBag, Heart, CheckCircle2, Award as AwardIcon, Shield, Layers, Sparkles, Upload, TrendingUp, Calendar, ChevronRight, Pencil, Percent } from "lucide-react";
import { UserProfile, Task, CampusEvent, Scholarship, Internship, Community, MarketplaceItem, getIpkClassification } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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

  // States for interactive learning curves
  const [chartMetric, setChartMetric] = useState<"tasks" | "learning">("tasks");
  const [chartTimeframe, setChartTimeframe] = useState<"weekly" | "monthly" | "semester">("semester");

  // Dynamically calculate actual completed tasks and total tasks
  const completedCount = tasks.filter(t => t.completed).length;

  // Real-time & realistic distribution for Tugas Selesai chart
  const tasksChartData = {
    weekly: [
      { name: "Senin", "Tugas Selesai": Math.max(0, completedCount - 4) },
      { name: "Selasa", "Tugas Selesai": Math.max(1, completedCount - 3) },
      { name: "Rabu", "Tugas Selesai": Math.max(1, completedCount - 2) },
      { name: "Kamis", "Tugas Selesai": Math.max(2, completedCount - 2) },
      { name: "Jumat", "Tugas Selesai": Math.max(2, completedCount - 1) },
      { name: "Sabtu", "Tugas Selesai": Math.max(3, completedCount) },
      { name: "Minggu", "Tugas Selesai": completedCount },
    ],
    monthly: [
      { name: "Minggu 1", "Tugas Selesai": Math.max(1, Math.floor(completedCount * 0.3)) },
      { name: "Minggu 2", "Tugas Selesai": Math.max(2, Math.floor(completedCount * 0.5)) },
      { name: "Minggu 3", "Tugas Selesai": Math.max(3, Math.floor(completedCount * 0.8)) },
      { name: "Minggu 4", "Tugas Selesai": completedCount },
    ],
    semester: [
      { name: "Bulan 1", "Tugas Selesai": Math.max(1, Math.floor(completedCount * 0.2)) },
      { name: "Bulan 2", "Tugas Selesai": Math.max(2, Math.floor(completedCount * 0.4)) },
      { name: "Bulan 3", "Tugas Selesai": Math.max(2, Math.floor(completedCount * 0.5)) },
      { name: "Bulan 4", "Tugas Selesai": Math.max(3, Math.floor(completedCount * 0.7)) },
      { name: "Bulan 5", "Tugas Selesai": Math.max(4, Math.floor(completedCount * 0.9)) },
      { name: "Bulan 6", "Tugas Selesai": completedCount },
    ]
  };

  // Learning progress improvement index (percentage or focus points, e.g., 0-100)
  const learningChartData = {
    weekly: [
      { name: "Senin", "Peningkatan Belajar": 72 },
      { name: "Selasa", "Peningkatan Belajar": 75 },
      { name: "Rabu", "Peningkatan Belajar": 78 },
      { name: "Kamis", "Peningkatan Belajar": 82 },
      { name: "Jumat", "Peningkatan Belajar": 85 },
      { name: "Sabtu", "Peningkatan Belajar": 89 },
      { name: "Minggu", "Peningkatan Belajar": 92 },
    ],
    monthly: [
      { name: "Minggu 1", "Peningkatan Belajar": 68 },
      { name: "Minggu 2", "Peningkatan Belajar": 74 },
      { name: "Minggu 3", "Peningkatan Belajar": 83 },
      { name: "Minggu 4", "Peningkatan Belajar": 91 },
    ],
    semester: [
      { name: "Bulan 1", "Peningkatan Belajar": 55 },
      { name: "Bulan 2", "Peningkatan Belajar": 63 },
      { name: "Bulan 3", "Peningkatan Belajar": 70 },
      { name: "Bulan 4", "Peningkatan Belajar": 78 },
      { name: "Bulan 5", "Peningkatan Belajar": 84 },
      { name: "Bulan 6", "Peningkatan Belajar": 92 },
    ]
  };

  const handleSelectMetric = (metric: "tasks" | "learning") => {
    setChartMetric(metric);
  };

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

  // Chart rendering helpers
  const currentChartData = (chartMetric === "tasks" 
    ? tasksChartData[chartTimeframe as keyof typeof tasksChartData]
    : learningChartData[chartTimeframe as keyof typeof learningChartData]) as any[];

  const currentStrokeColor = chartMetric === "tasks" ? "#FF2D75" : "#3B82F6";
  const currentFillId = chartMetric === "tasks" ? "url(#colorTasks)" : "url(#colorLearning)";
  const currentDataKey = chartMetric === "tasks" ? "Tugas Selesai" : "Peningkatan Belajar";

  return (
    <div className="space-y-6 text-left relative z-10">
      
      {/* Title */}
      <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-900 leading-tight">
            Profile (Laporan Aktivitas Mahasiswa){" "}
            <User className="text-[#FF2D75] inline-block align-middle ml-1.5" size={24} />
          </h2>
          <p className="text-xs text-slate-500 leading-normal font-semibold">
            Pusat pencatatan riwayat prestasi, data profil Anda, resume lamaran magang, beasiswa yang Anda ikuti, serta rekapitulasi data portfolio MahasSpace Anda.
          </p>
        </div>
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
                <span className="font-sans font-black text-[#FF2D75]">{profile.nim}</span>
              </div>
              <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <span className="text-slate-500 font-bold">IPK Kumulatif:</span>
                <span className="font-sans font-black text-[#FF2D75]">{profile.gpa} <span className="text-pink-600 font-extrabold text-[10px] ml-1">({getIpkClassification(profile.gpa)})</span></span>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-pink-50/50 p-4.5 rounded-2xl border border-pink-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <CheckSquare size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tugas Terselesaikan</p>
                  <p className="text-lg font-black text-slate-800">{completedTasksCount}/{totalTasksCount}</p>
                </div>
              </div>

              <div className="bg-pink-50/50 p-4.5 rounded-2xl border border-pink-100 text-left space-y-2.5 hover:shadow-md transition-all">
                <CheckCircle2 size={18} className="text-[#FF2D75]" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Kemahasiswaan</p>
                  <p className="text-sm font-black text-slate-850">Aktif & Terdaftar</p>
                </div>
              </div>

            </div>
          </div>

          {/* Grafik Perkembangan & Peningkatan Belajar */}
          <div className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-[#FF2D75]" />
                </div>
                <div>
                  <h3 className="font-extrabold font-display text-slate-800 text-sm">
                    Grafik Perkembangan & Peningkatan
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Visualisasi hasil belajar dan penyelesaian tugas Anda
                  </p>
                </div>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl self-start sm:self-center">
                <button
                  onClick={() => setChartTimeframe("weekly")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    chartTimeframe === "weekly"
                      ? `bg-white ${chartMetric === "tasks" ? "text-[#FF2D75]" : "text-blue-600"} shadow-xs`
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setChartTimeframe("monthly")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    chartTimeframe === "monthly"
                      ? `bg-white ${chartMetric === "tasks" ? "text-[#FF2D75]" : "text-blue-600"} shadow-xs`
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setChartTimeframe("semester")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    chartTimeframe === "semester"
                      ? `bg-white ${chartMetric === "tasks" ? "text-[#FF2D75]" : "text-blue-600"} shadow-xs`
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semester (6 Bln)
                </button>
              </div>
            </div>

            {/* Metric Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectMetric("tasks")}
                className={`flex-1 py-2.5 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  chartMetric === "tasks"
                    ? "bg-[#FF2D75] text-white border-[#FF2D75] shadow-md shadow-pink-500/10"
                    : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                }`}
              >
                <CheckSquare size={14} />
                <span>Tugas Selesai</span>
              </button>
              <button
                onClick={() => handleSelectMetric("learning")}
                className={`flex-1 py-2.5 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  chartMetric === "learning"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                    : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                }`}
              >
                <Pencil size={14} />
                <span>Peningkatan Belajar</span>
              </button>
            </div>

            {/* Responsive Chart */}
            <div className="h-64 w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentChartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF2D75" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF2D75" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorLearning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    domain={chartMetric === "tasks" ? [0, "auto"] : [0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900/90 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-[10px] backdrop-blur-xs">
                            <p className="font-extrabold text-slate-300 mb-1">{label}</p>
                            <p className="font-black flex items-center gap-1.5" style={{ color: currentStrokeColor }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStrokeColor }} />
                              <span>
                                {payload[0].name}: {payload[0].value}{" "}
                                {chartMetric === "tasks" ? "Tugas" : "% Perkembangan"}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={currentDataKey}
                    stroke={currentStrokeColor}
                    strokeWidth={3}
                    fill={currentFillId}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Insight Caption */}
            <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-left">
              <Percent size={14} className={chartMetric === 'tasks' ? 'text-[#FF2D75] shrink-0 mt-0.5' : 'text-blue-500 shrink-0 mt-0.5'} />
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                {chartMetric === "tasks" ? (
                  <span>
                    Anda telah menyelesaikan <strong className="text-slate-700">{completedCount} tugas</strong> kuliah. Kurva di atas menunjukkan tingkat penyelesaian tugas Anda yang terus meningkat secara konsisten pada periode <strong className="text-slate-700">{chartTimeframe === 'weekly' ? 'Mingguan' : chartTimeframe === 'monthly' ? 'Bulanan' : 'Semester'}</strong> ini!
                  </span>
                ) : (
                  <span>
                    Indeks peningkatan belajar Anda mencapai <strong className="text-slate-700">92%</strong> di akhir semester ini. Pertahankan ritme belajar, istirahat yang cukup, dan tingkatkan fokus Anda menggunakan teknik Pomodoro maupun Cornell di Ruang Belajar!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
