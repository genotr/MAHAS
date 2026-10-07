import React, { useState, useRef } from "react";
import { GraduationCap, Upload, FileText, CheckCircle2, UserCheck, AlertTriangle, Send, RefreshCw, MessageSquare } from "lucide-react";
// @ts-ignore
import profTopusSidebar from "../assets/images/regenerated_image_1784284340198.png";
// @ts-ignore
import profOctoSidebar from "../assets/images/regenerated_image_1784284342341.png";
// @ts-ignore
import profTopusActive from "../assets/images/regenerated_image_1784284344517.png";
// @ts-ignore
import profOctoActive from "../assets/images/regenerated_image_1784284346334.png";

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
}

export default function SimulasiBimbinganView() {
  const [character, setCharacter] = useState<"angel" | "devil">("angel");
  const [title, setTitle] = useState("");
  const [progressStep, setProgressStep] = useState("Bab 1 - Pendahuluan");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "advisor",
      text: "Halo! Silakan unggah dokumen skripsi terbaru Anda baik dalam format PDF, DOCX, atau lainnya, lalu masukkan topik skripsi Anda. Bapak/Ibu akan periksa dengan seksama draf penelitian Anda ya.",
      timestamp: "Baru saja"
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterDetails = {
    angel: {
      name: "Prof. Topus",
      title: "Dosen Pembimbing I (Bertindak lembut)",
      intro: "Saya membimbing anda dengan baik memberi arahan dan dorongan mental yang positif setiap kesalahan anda direvisi dan dikemas dengan bahasa santun penuh kasih sayang, lembut, dan tulus untuk kelulusan Anda!"
    },
    devil: {
      name: "Prof. Octo",
      title: "Dosen Pembimbing I (Menguji Kritis)",
      intro: "Melakukan pengujian akademik yang mendalam juga kritis ialah cara saya untuk menguji anda. melakukan koreksi dengan super teliti bahkan hingga kesalahan kecil tetap saya perhatikan demi kemampuan pemahaman anda."
    }
  };

  const renderAdvisorAvatar = (
    advisorKey: "angel" | "devil", 
    extraClasses: string = "", 
    context: "sidebar" | "active" = "active"
  ) => {
    const hasSize = extraClasses.includes("w-") || extraClasses.includes("h-");
    const baseSize = hasSize ? "" : "w-11 h-11";
    if (advisorKey === "angel") {
      return (
        <img
          src={context === "sidebar" ? profTopusSidebar : profTopusActive}
          alt="Prof. Topus"
          referrerPolicy="no-referrer"
          className={`rounded-full object-cover shadow-sm shrink-0 select-none ${baseSize} ${extraClasses}`}
        />
      );
    } else {
      return (
        <img
          src={context === "sidebar" ? profOctoSidebar : profOctoActive}
          alt="Prof. Octo"
          referrerPolicy="no-referrer"
          className={`rounded-full object-cover shadow-sm shrink-0 select-none ${baseSize} ${extraClasses}`}
        />
      );
    }
  };

  // Drag and Drop files handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addUploadedFiles(e.dataTransfer.files);
    }
  };

  const addUploadedFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const sizeInMBNum = f.size / (1024 * 1024);
      if (sizeInMBNum > 50) {
        alert(`Gagal mengunggah "${f.name}". Ukuran berkas melebihi batas maksimal 50MB.`);
        continue;
      }
      const sizeInMB = sizeInMBNum.toFixed(2);
      newFiles.push({
        name: f.name,
        size: `${sizeInMB} MB`,
        type: f.name.split(".").pop()?.toUpperCase() || "FILE"
      });
    }
    if (newFiles.length === 0) return;
    setFiles(prev => [...prev, ...newFiles]);

    // System bubble message confirmation 
    const isFriendly = character === "angel";
    const systemRepl = isFriendly 
      ? `Terima kasih banyak sudah mengunggah draf skripsi Anda: [${newFiles.map(fn => fn.name).join(", ")}]. Silakan ketik pertanyaan atau pesan Anda ke bapak, nanti langsung bapak beri ulasan hangat sekarang ya!`
      : `Saya telah menerima unggahan dokumen Anda: [${newFiles.map(fn => fn.name).join(", ")}]. Masukkan penjelasan ringkas di kolom chat mengenai apa yang Anda revisi kali ini. Jangan kirim draf kosong tanpa analisis!`;

    setChatHistory(prev => [
      ...prev,
      {
        id: "sys-" + Date.now(),
        sender: "advisor",
        text: systemRepl,
        timestamp: "Sistem unggah"
      }
    ]);
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addUploadedFiles(e.target.files);
    }
  };

  // Submit chat or request bimbingan review
  const handleSendBimbingan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!title.trim()) {
      alert("Harap masukkan Judul Skripsi terlebih dahulu!");
      return;
    }

    const userMsgText = messageInput;
    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setMessageInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/bimbingan-simulasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: character,
          title: title,
          progress: progressStep,
          files: files,
          messageInput: userMsgText
        })
      });

      const data = await response.json();
      const advisorMsg: ChatMessage = {
        id: "adv-" + Date.now(),
        sender: "advisor",
        text: data.text || "Terjadi kendala dalam bimbingan, silakan hubungi asisten dosen.",
        timestamp: new Date().toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistory(prev => [...prev, advisorMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: "adv-err-" + Date.now(),
        sender: "advisor",
        text: character === "angel"
          ? "Aduh beringas jaringan sepertinya putus sebentar bimbingan-ku... Coba dikirim ulang ya, bapak tunggu di sini."
          : "Format draf Anda atau koneksi skripsi ini bermasalah. Segera perbaiki jaringan Anda dan unggah ulang skripsinya dengan baik!",
        timestamp: "Error"
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([
      {
        id: "initial",
        sender: "advisor",
        text: `Halo kembali! Saya ${characterDetails[character].name} siap mendampingi proses pengerjaan tulisan Anda. Masukkan Judul Skripsi dan bab yang sedang dikerjakan, mari kita mulai bimbingannya!`,
        timestamp: "Baru saja"
      }
    ]);
    setFiles([]);
  };

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* View Title Header */}
      <div className="bg-white/45 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-300">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-900 leading-tight">
            Simulasi Sidang & Bimbingan Skripsi AI{" "}
            <GraduationCap className="text-[#FF2D75] inline-block align-middle ml-1.5" size={24} />
          </h2>
          <p className="text-xs text-slate-500 leading-normal font-semibold">
            Rasakan simulasi mental bimbingan tugas akhir skripsi interaktif. Pilih tipe dosen pembimbing dambaanmu atau pembimbing killer teruji, unggah berkas draf tulisanmu, dan lakukan tanya-jawab ulasan draf ilmiah instan!
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="bg-white/80 hover:bg-slate-100 text-slate-700 font-bold text-xs p-3.5 rounded-2xl flex items-center justify-center gap-1.5 border border-slate-200 shrink-0 cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} />
          Mulai Ulang Sesi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: ADVISER SELECTOR & FILES PANEL */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Character Selector Options */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-[#2e1065] text-sm font-display">
              1. Tentukan Karakter Dosen Pembimbing
            </h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => setCharacter("angel")}
                className={`p-4 rounded-3xl border-2 text-left transition-all relative cursor-pointer ${
                  character === "angel" 
                    ? "border-emerald-500 bg-white shadow-xs" 
                    : "border-slate-100 hover:border-slate-300 bg-white"
                }`}
              >
                {character === "angel" && (
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full text-[8px] font-black leading-none">
                    ACTIVE
                  </span>
                )}
                <div className="flex items-center gap-3">
                  {renderAdvisorAvatar("angel", "border-2 border-slate-900", "sidebar")}
                  <div>
                    <p className="font-extrabold text-[12px] text-slate-850">Prof. Topus</p>
                    <p className="text-[9px] text-emerald-700 font-black">Bertindak lembut</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCharacter("devil")}
                className={`p-4 rounded-3xl border-2 text-left transition-all relative cursor-pointer ${
                  character === "devil" 
                    ? "border-rose-500 bg-white shadow-xs" 
                    : "border-slate-100 hover:border-slate-300 bg-white"
                }`}
              >
                {character === "devil" && (
                  <span className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full text-[8px] font-black leading-none">
                    ACTIVE
                  </span>
                )}
                <div className="flex items-center gap-3">
                  {renderAdvisorAvatar("devil", "border-2 border-slate-900", "sidebar")}
                  <div>
                    <p className="font-extrabold text-[12px] text-slate-850">Prof. Octo</p>
                    <p className="text-[9px] text-rose-700 font-black">Menguji Kritis</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Selected Dosen Intro Card */}
            <div className={`p-4 rounded-2xl border-2 bg-white space-y-1 transition-all shadow-xs ${
              character === "angel"
                ? "border-emerald-500"
                : "border-rose-500"
            }`}>
              <p className={`font-extrabold text-[11px] ${
                character === "angel" ? "text-emerald-700" : "text-rose-700"
              }`}>
                {characterDetails[character].name}
              </p>
              <p className={`text-[9px] font-bold ${
                character === "angel" ? "text-emerald-600" : "text-rose-600"
              }`}>
                {characterDetails[character].title}
              </p>
              <p className="text-[10px] text-slate-600 leading-relaxed font-semibold italic mt-1">
                "{characterDetails[character].intro}"
              </p>
            </div>
          </div>

          {/* Title & Progress Inputs */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-[#2e1065] text-sm font-display">
              2. Detail Kriteria Skripsi Anda
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Penelitian Skripsi *</label>
                <textarea
                  rows={2}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 rounded-xl font-bold bg-white/60 text-xs text-slate-800"
                  placeholder="Contoh: Implementasi Jaringan Syaraf Tiruan Untuk Klasifikasi Citra Rontgen Paru"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bab Skripsi yang Ingin Diuji *</label>
                <select
                  value={progressStep}
                  onChange={(e) => setProgressStep(e.target.value)}
                  className="w-full border border-pink-150 focus:outline-hidden focus:border-pink-300 p-2.5 text-xs bg-white rounded-xl font-bold cursor-pointer"
                >
                  <option value="Bab 1 - Pendahuluan">Bab 1 - Pendahuluan</option>
                  <option value="Bab 2 - Tinjauan Pustaka">Bab 2 - Tinjauan Pustaka</option>
                  <option value="Bab 3 - Metodologi Penelitian">Bab 3 - Metodologi Penelitian</option>
                  <option value="Bab 4 - Hasil dan Pembahasan">Bab 4 - Hasil dan Pembahasan</option>
                  <option value="Bab 5 - Penutup dan Saran">Bab 5 - Penutup dan Saran</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Drag & Drop Upload Zone */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-[#2e1065] text-sm font-display">
              3. Unggah Berkas Skripsi (PDF / DOCX)
            </h3>

            {/* Drag Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center transition-all ${
                isDragging 
                  ? "border-[#FF2D75] bg-pink-50/50" 
                  : "border-pink-150 bg-white/60 hover:bg-white hover:border-[#FF2D75]"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                onChange={handleManualUpload} 
                className="hidden" 
                accept=".pdf,.docx,.doc,.txt"
              />
              <Upload size={24} className="text-[#FF2D75] animate-pulse" />
              <div>
                <p className="text-xs font-black text-slate-800">Tarik & Lepas draf skripsi ke sini</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Atau klik untuk pilih file dari komputer Anda</p>
              </div>
              <span className="text-[8px] bg-slate-100 text-slate-500 font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                PDF, DOCX, DOC, TXT (MAKS. 50MB)
              </span>
            </div>

            {/* List of successfully uploaded drafts */}
            {files.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-500 text-[10px] uppercase">DRAFS TERUNGGAH ({files.length}):</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-150">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800 truncate text-[11px]">{f.name}</span>
                      </div>
                      <span className="text-[9px] text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 font-mono">
                        {f.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COMPONENT: ACTIVE CHAT DIALOGUE WITH ADVISOR */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-pink-100 shadow-sm flex flex-col justify-between overflow-hidden h-[635px]">
            
            {/* Adviser Active Identity Bar */}
            <div className="bg-gradient-to-r from-slate-700 via-zinc-800 to-zinc-950 px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  {renderAdvisorAvatar(character, "w-10 h-10 border-2 " + (character === "angel" ? "border-emerald-500" : "border-[#FF2D75]"))}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[12px] text-white leading-tight">
                    {characterDetails[character].name}
                  </h4>
                  <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${character === "angel" ? "text-emerald-400" : "text-[#FF2D75]"}`}>
                    PEMBIMBING {character === "angel" ? "LEMBUT" : "KRITIS"} SAKTI
                  </p>
                </div>
              </div>


            </div>

            {/* Communication dialogue container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/50 custom-scroll">
              
              {chatHistory.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-150`}
                  >
                    {!isUser && renderAdvisorAvatar(character, "w-8 h-8 border border-slate-200 mt-1") }
                    
                    <div className="space-y-0.5 text-xs max-w-[80%]">
                      <p className={`text-[9px] font-bold text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
                        {isUser ? "Saya (Mahasiswa)" : characterDetails[character].name} • {msg.timestamp}
                      </p>
                      
                      <div className={`p-4 rounded-3xl leading-relaxed text-[11.5px] font-bold relative ${
                        isUser 
                          ? "bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white rounded-tr-none shadow-xs text-right" 
                          : "bg-white text-slate-800 rounded-tl-none border border-pink-100 shadow-3xs text-left"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start items-center gap-3">
                  {renderAdvisorAvatar(character, "w-8 h-8 border border-slate-200")}
                  <div className="bg-white border border-pink-100 p-4 rounded-3xl rounded-tl-none text-xs text-slate-500 font-semibold italic flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF2D75] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-[#FF2D75] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-[#FF2D75] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    <span>Sedang membaca draf skripsi Anda...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Submission Footer bar */}
            <form onSubmit={handleSendBimbingan} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2.5 shrink-0">
              <input
                type="text"
                placeholder={
                  files.length === 0 
                  ? "💡 Tips: Unggah draf skripsi dulu di sebelah kiri..." 
                  : "Ketik pengaduan / bimbingan / revisian Anda di sini..."
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 border border-pink-100 focus:outline-hidden focus:border-pink-300 p-3 rounded-2xl font-semibold text-xs bg-slate-50 text-slate-800 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !messageInput.trim()}
                className="bg-gradient-to-r from-pink-500 to-[#FF2D75] hover:brightness-105 disabled:opacity-40 text-white p-3 rounded-2xl flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-md shadow-pink-100 active:scale-95"
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
