import express from "express";
import path from "path";
import fs from "fs";
import os from "os";

import { execFile } from "child_process";
import { promisify } from "util";

import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

const execFileAsync = promisify(execFile);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoint for Cloud Run container probes
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });

  // API Route to retrieve Google Maps API Key from server environment variable
  app.get("/api/maps-key", (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_PLATFORM_KEY || "" });
  });

  // Initialize Gemini SDK with the official User-Agent header
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Helper for resilient Gemini API calls with automatic model fallback (3.5-flash -> 2.5-flash -> 1.5-flash) upon high demand (503/429/UNAVAILABLE/Resource Exhausted)
  async function safeGenerateContent(aiClient: GoogleGenAI, params: any) {
    try {
      return await aiClient.models.generateContent(params);
    } catch (err: any) {
      const errStr = String(err?.message || err || "").toLowerCase();
      const isOverloaded = 
        err?.status === 503 || 
        err?.status === 429 || 
        errStr.includes("503") || 
        errStr.includes("429") || 
        errStr.includes("unavailable") || 
        errStr.includes("high demand") || 
        errStr.includes("resource exhausted") || 
        errStr.includes("busy") || 
        errStr.includes("limit") ||
        errStr.includes("overloaded");
      
      if (isOverloaded) {
        const currentModel = params.model;
        let nextModel = "";
        
        if (currentModel === "gemini-3.6-flash") {
          nextModel = "gemini-3.1-flash-lite";
        } else if (currentModel === "gemini-3.1-flash-lite") {
          nextModel = "gemini-flash-latest";
        }
        
        if (nextModel) {
          console.warn(`[Gemini Safe Mode] Model ${currentModel} busy or unavailable. Error: ${err?.message || err}. Falling back to ${nextModel}...`);
          try {
            const fallbackParams = {
              ...params,
              model: nextModel
            };
            return await safeGenerateContent(aiClient, fallbackParams);
          } catch (fallbackErr: any) {
            console.error(`[Gemini Safe Mode] Fallback model ${nextModel} also failed:`, fallbackErr);
            throw fallbackErr;
          }
        }
      }
      throw err;
    }
  }

  // API Route for Curhat AI Chatbot (Feeling aware counselor)
  app.post("/api/curhat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Kolom messages harus dikirim sebagai array." });
    }

    try {
      if (!ai) {
        // Fallback simulation responses if API key is not yet set
        const lastUserMsg = messages[messages.length - 1]?.text || "stres";
        return res.json({
          text: `[Simulasi Offline] Saya mendengar kekhawatiranmu mengenai "${lastUserMsg}". Ingatlah bahwa dinamika perkuliahan memang penuh tantangan, tetapi kamu sudah berjuang luar biasa sejauh ini. Ambil napas dalam-dalam, istirahat sejenak, dan mari kita hadapi ini perlahan demi perlahan. Saya selalu ada di sini sebagai teman ceritamu! ❤️`
        });
      }

      // Convert messages array to user prompt
      const conversationHistory = messages.map(m => `${m.sender === "user" ? "Pengguna" : "Konselor AI"}: ${m.text}`).join("\n");
      const systemInstruction = 
        "Anda adalah 'Sahabat Rasa', konselor AI yang memiliki kecerdasan emosional tinggi, hangat, ramah, jujur, serta penuh empati di lingkungan kampus. " +
        "Tugas Anda adalah mendengarkan keluh kesah mahasiswa yang sedang tertekan, cemas, atau lelah secara batin, dan memberikan respons yang tulus, memvalidasi perasaan mereka tanpa menghakimi, dan menawarkan kata-kata penghibur yang membangkitkan harapan. " +
        "Bicara menggunakan bahasa Indonesia yang santai, bersahabat, penuh kehangatan (emotional-friendly). Berikan bimbingan koping yang sehat (seperti meminta mereka bernapas dalam, minum air, atau rehat sejenak). " +
        "Jaga respons agar tetap hangat, ringkas (maksimal 150 kata), dan hindari respon kaku seperti robot.";

      let response;
      try {
        response = await safeGenerateContent(ai, {
          model: "gemini-3.6-flash",
          contents: `Berikut adalah riwayat obrolan sejauh ini:\n${conversationHistory}\n\nBerikan tanggapan hangat berikutnya dari sisi Anda selaku Konselor AI yang sangat memahami perasaan:`,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.8,
          }
        });
      } catch (geminiErr: any) {
        console.warn("safeGenerateContent completely failed for curhat. Using dynamic simulation response as fallback.", geminiErr);
        const lastUserMsg = messages[messages.length - 1]?.text || "stres";
        return res.json({
          text: `[Sahabat Rasa] Maaf ya, jaringan batin saya sedikit padat saat ini, tapi saya mendengarmu mengenai "${lastUserMsg}". Tetap kuat ya, tarik napas dalam-dalam sejenak, dan mari lalui hari ini pelan-pelan bersama. Aku selalu ada untukmu! ❤️`
        });
      }

      res.json({ text: response.text || "Saya mendengarkanmu. Ceritakan lebih lanjut ya..." });
    } catch (err: any) {
      console.error("Gagal memanggil Gemini pada /api/curhat:", err);
      res.status(500).json({ 
        error: "Terjadi gangguan koneksi dengan AI. Tetap semangat, saya siap mendengar curhatanmu!",
        details: err?.message 
      });
    }
  });

  // API Route for Thesis Guidance Simulation
  app.post("/api/bimbingan-simulasi", async (req, res) => {
    const { character, title, progress, files, messageInput } = req.body;

    if (!character || !title) {
      return res.status(400).json({ error: "Kolom character dan title wajib diisi." });
    }

    try {
      const fileNames = files && Array.isArray(files) ? files.map((f: any) => f.name).join(", ") : "Tidak ada file";
         if (!ai) {
        // Fallback simulation based on character if API key is missing
        if (character === "ramah" || character === "angel") {
          return res.json({
            text: `[Simulasi Prof. Topus - Bertindak Lembut]\n"Halo bimbingan saya! Membaca draf yang Anda unggah (${fileNames}) dengan topik '${title}', saya sangat bangga melihat antusiasme Anda yang luar biasa. Saya membimbing anda dengan baik memberi arahan dan dorongan mental yang positif setiap kesalahan anda direvisi dan dikemas dengan bahasa santun penuh kasih sayang, lembut, dan tulus untuk kelulusan Anda! Untuk kelanjutan Bab ${progress}, silakan bapak tunggu bab berikutnya ya. Tetap semangat!"`
          });
        } else {
          return res.json({
            text: `[Simulasi Prof. Octo - Menguji Kritis]\n"Selamat pagi. Saya sudah melihat draf Anda '${title}' dengan lampiran dokumen: [${fileNames}]. Melakukan pengujian akademik yang mendalam juga kritis ialah cara saya untuk menguji anda. melakukan koreksi dengan super teliti bahkan hingga kesalahan kecil tetap saya perhatikan demi kemampuan pemahaman anda. Silakan revisi Bab ${progress} ini dengan referensi yang relevan dan kirimkan kembali kepada saya."`
          });
        }
      }

      let systemInstruction = "";
      if (character === "ramah" || character === "angel") {
        systemInstruction = 
          "Nama Anda adalah Prof. Topus, dosen pembimbing skripsi yang bertindak lembut. " +
          "Anda berbicara dengan panggilan saya ('Saya melihat...', 'Menurut saya ya...'), menyukai kalimat yang baik, ramah, dan santun. " +
          "Gaya bimbingan Anda: 'Saya membimbing anda dengan baik memberi arahan dan dorongan mental yang positif setiap kesalahan anda direvisi dan dikemas dengan bahasa santun penuh kasih sayang, lembut, dan tulus untuk kelulusan Anda!' " +
          "Maksimal 150 kata.";
      } else {
        systemInstruction = 
          "Nama Anda adalah Prof. Octo, dosen pembimbing skripsi senior yang menguji secara kritis. " +
          "Gaya bimbingan Anda: 'Melakukan pengujian akademik yang mendalam juga kritis ialah cara saya untuk menguji anda. melakukan koreksi dengan super teliti bahkan hingga kesalahan kecil tetap saya perhatikan demi kemampuan pemahaman anda.' " +
          "Anda mengoreksi dengan sangat kritis dan teliti, namun tetap bertujuan baik demi peningkatan pemahaman akademik mahasiswa. Maksimal 150 kata.";
      }

      const promptContext = 
        `Topik Skripsi: "${title}"\n` +
        `Bab yang Sedang Dikonsultasikan: "${progress}"\n` +
        `Dokumen Skripsi yang Diunggah Mahasiswa: "${fileNames}"\n` +
        `Pesan/Pertanyaan Mahasiswa ketika bimbingan: "${messageInput || "Mohon koreksi dan bimbingannya, Prof/Dokter."}"\n\n` +
        `Tanggapi secara interaktif dan langsung bersuara sebagai dosen pembimbing sesuai karakter instruksi sistem Anda:`;

      let response;
      try {
        response = await safeGenerateContent(ai, {
          model: "gemini-3.6-flash",
          contents: promptContext,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.75,
          }
        });
      } catch (geminiErr: any) {
        console.warn("safeGenerateContent failed for bimbingan-simulasi. Using simulation response.", geminiErr);
        if (character === "ramah" || character === "angel") {
          return res.json({
            text: `[Simulasi Prof. Topus - Bertindak Lembut]\n"Halo bimbingan saya! Mohon maaf ada sedikit kendala jaringan, namun membaca draf yang Anda unggah (${fileNames}) dengan topik '${title}', saya membimbing anda dengan baik memberi arahan yang positif. Silakan teruskan penulisan Bab ${progress} ini ya. Tetap semangat!"`
          });
        } else {
          return res.json({
            text: `[Simulasi Prof. Octo - Menguji Kritis]\n"Selamat pagi. Ada kendala jaringan bimbingan, tapi saya sudah mencatat draf Anda '${title}' [${fileNames}]. Saya harapkan Anda tetap menguji landasan teori Anda dengan kritis. Sempurnakan draf Bab ${progress} ini secara mendalam sebelum dikirim kembali."`
          });
        }
      }

      res.json({ text: response.text || "Silakan revisi bagian tersebut terlebih dahulu ya." });
    } catch (err: any) {
      console.error("Gagal memanggil Gemini pada /api/bimbingan-simulasi:", err);
      res.status(500).json({ 
        error: "Koneksi bimbingan terputus dengan dosen. Silakan coba kirim berkas draf skripsi Anda sekali lagi.",
        details: err?.message
      });
    }
  });

  // API Route for real-time reliable voice recording transcription using AssemblyAI as PRIMARY
  app.post("/api/transcribe", async (req, res) => {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Kolom audioData wajib diisi dengan tipe base64 string." });
    }

    const aaiApiKey = process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLY_AI_API_KEY;
    const audioBuffer = Buffer.from(audioData, "base64");

    // PRIMARY PATH: AssemblyAI
    if (aaiApiKey) {
      try {
        console.log("Mengunggah audio ke AssemblyAI (Primary)...");
        const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
          method: "POST",
          headers: {
            "Authorization": aaiApiKey,
            "Content-Type": "application/octet-stream"
          },
          body: audioBuffer
        });

        if (uploadResponse.ok) {
          const uploadResult: any = await uploadResponse.json();
          const uploadUrl = uploadResult.upload_url;

          if (uploadUrl) {
            console.log("Memulai transkripsi di AssemblyAI...");
            const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
              method: "POST",
              headers: {
                "Authorization": aaiApiKey,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                audio_url: uploadUrl,
                language_detection: true,
                punctuate: true,
                format_text: true
              })
            });

            if (transcriptResponse.ok) {
              const transcriptResult: any = await transcriptResponse.json();
              const transcriptId = transcriptResult.id;

              console.log(`Transkripsi AssemblyAI ID: ${transcriptId}. Polling status...`);
              
              let status = "queued";
              let pollingAttempts = 0;
              const maxAttempts = 30;
              let resultText = "";

              while ((status === "queued" || status === "processing") && pollingAttempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 400));
                pollingAttempts++;

                const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                  method: "GET",
                  headers: {
                    "Authorization": aaiApiKey
                  }
                });

                if (pollRes.ok) {
                  const pollResult: any = await pollRes.json();
                  status = pollResult.status;
                  if (status === "completed") {
                    resultText = pollResult.text || "";
                    break;
                  } else if (status === "error") {
                    throw new Error(`AssemblyAI error: ${pollResult.error}`);
                  }
                }
              }

              if (status === "completed" && resultText.trim() !== "") {
                console.log("Transkripsi AssemblyAI berhasil.");
                return res.json({
                  transcript: resultText.trim(),
                  engine: "AssemblyAI (Primary)",
                  success: true
                });
              }
            } else {
              const errMsg = await transcriptResponse.text();
              console.warn(`AssemblyAI create transcript error: ${errMsg}`);
            }
          }
        } else {
          const uploadErr = await uploadResponse.text();
          console.warn(`AssemblyAI upload error: ${uploadErr}`);
        }
      } catch (aaiErr: any) {
        console.warn("AssemblyAI mengalami kendala, beralih ke cadangan Gemini:", aaiErr?.message || aaiErr);
      }
    } else {
      console.log("ASSEMBLYAI_API_KEY belum terdeteksi. Menggunakan Gemini sebagai cadangan.");
    }

    // FALLBACK PATH: Gemini AI
    try {
      if (!ai) {
        return res.status(400).json({ 
          error: "ASSEMBLYAI_API_KEY tidak terkonfigurasi dan GEMINI_API_KEY tidak ditemukan. Harap masukkan ASSEMBLYAI_API_KEY di Settings!" 
        });
      }

      const audioPart = {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audioData
        }
      };

      const systemInstruction = 
        "Tugasmu adalah melakukan transkripsi audio ke teks secepat dan seakurat mungkin. " +
        "Tuliskan apa saja kata yang diucapkan secara verbatim dalam bahasa Indonesia/bahasa penutur. " +
        "DILARANG KERAS memberikan kalimat pembuka/penutup seperti 'Berikut transkripsinya' atau tanda kutip. " +
        "Langsung keluarkan teks transkrip murni. Jika suara tidak ada atau hening, kembalikan teks kosong.";

      const response = await safeGenerateContent(ai, {
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            audioPart,
            { text: "Transkrip audio ini menjadi teks segera." }
          ]
        },
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1,
        }
      });

      const transcript = response.text || "";
      return res.json({ 
        transcript: transcript.trim(), 
        engine: "Gemini AI (Cadangan)",
        success: true 
      });
    } catch (fallbackErr: any) {
      console.error("Transkripsi gagal:", fallbackErr);
      res.status(500).json({ 
        error: "Gagal melakukan transkripsi audio.",
        details: fallbackErr?.message 
      });
    }
  });

  // Mount Vite middleware for asset serving in dev environments
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : path.join(__dirname);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
