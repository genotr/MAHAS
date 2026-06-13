import React, { useState, useEffect } from "react";
import { Shirt, MapPin, Cloudy, Sun, Droplets, BookOpen, Layers, Sparkles, Navigation, Users, ZoomIn, ZoomOut, RotateCcw, Settings, Globe, Loader2, Compass, Check } from "lucide-react";

interface CampusSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  defaultOutfitCode: string;
}

const JAKARTA_SPOTS: CampusSpot[] = [
  { id: "rektorat", name: "Gedung Rektorat Utama", lat: -6.20188, lng: 106.84560, description: "Pusat birokrasi, pendaftaran beasiswa, dan pengurusan KRS.", defaultOutfitCode: "formal" },
  { id: "teknik", name: "Fakultas Teknik & Ilmu Komputer", lat: -6.20235, lng: 106.84320, description: "Gedung kuliah teknik, lab robotika, dan lab jaringan.", defaultOutfitCode: "casual" },
  { id: "perpus", name: "Perpustakaan Pusat Pintar", lat: -6.20120, lng: 106.84680, description: "Ruang baca ber-AC dingin, koleksi buku skripsi, dan area tenang.", defaultOutfitCode: "cozy" },
  { id: "kantin", name: "Kantin Pujasera Mahasiswa", lat: -6.20310, lng: 106.84480, description: "Area bersantai, makan siang murah meriah, dan obrolan santai.", defaultOutfitCode: "santai" },
  { id: "asrama", name: "Asrama Green Campus", lat: -6.20050, lng: 106.84210, description: "Pusat hunian mahasiswa rantau, dekat dengan lapangan olahraga.", defaultOutfitCode: "santai" },
  { id: "auditorium", name: "Auditorium Multikultural", lat: -6.20420, lng: 106.84600, description: "Gedung serbaguna untuk seminar nasional, wisuda, dan pameran.", defaultOutfitCode: "formal" }
];

const UMRAH_SPOTS: CampusSpot[] = [
  { id: "rektorat", name: "Rektorat Bahari Dompak (UMRAH)", lat: 0.88725, lng: 104.48422, description: "Pusat birokrasi, administrasi rektorat, dan pelayanan kemahasiswaan utama Universitas Maritim Raja Ali Haji (UMRAH).", defaultOutfitCode: "formal" },
  { id: "fikp", name: "Gedung FIKP (Fakultas Ilmu Kelautan & Perikanan)", lat: 0.88510, lng: 104.48295, description: "Aktivitas lab kelautan, oseanografi, budidaya laut, dan riset ilmiah maritim.", defaultOutfitCode: "lab" },
  { id: "ftik", name: "Fakultas Teknik & Ilmu Komputer (FTIK)", lat: 0.88790, lng: 104.48210, description: "Pusat studi Teknik Informatika, lab rekayasa perangkat lunak, dan robotika kemaritiman.", defaultOutfitCode: "casual" },
  { id: "perpus_pusat", name: "Perpustakaan & Gedung Raja Ali Haji", lat: 0.88640, lng: 104.48630, description: "Layanan baca buku riset kemaritiman dengan pendingin udara yang sepi dan tenang.", defaultOutfitCode: "cozy" },
  { id: "kantin_bahari", name: "Kantin Segara Dompak", lat: 0.88910, lng: 104.48350, description: "Area bersantai dan jajan sejuk menghadap ke perairan Dompak Tanjungpinang yang berangin sepoi.", defaultOutfitCode: "santai" },
  { id: "fkip", name: "Gedung FKIP (Fakultas Keguruan)", lat: 0.88850, lng: 104.48512, description: "Kegiatan pengajaran sosiologi, bahasa, and kepelatihan guru.", defaultOutfitCode: "formal" }
];

const JAKARTA_STUDENTS = [
  { name: "Andi Wijaya", major: "Teknik Informatika", lat: -6.20215, lng: 106.84350, spotId: "teknik", outfit: "Jaket Hoodie + Kacamata + Ransel IT", status: "Sedang ngerjain praktikum" },
  { name: "Dewi Lestari", major: "Sastra Inggris", lat: -6.20115, lng: 106.84650, spotId: "perpus", outfit: "Kemeja Flanel + Tote Bag + Flat Shoes", status: "Membaca draf referensi" },
  { name: "Rian Hidayat", major: "Manajemen", lat: -6.20350, lng: 106.84510, spotId: "kantin", outfit: "Kaos Polos + Topi + Sneakers", status: "Makan siang bareng himpunan" },
  { name: "Siti Rahma", major: "Farmasi", lat: -6.20168, lng: 106.84580, spotId: "rektorat", outfit: "Blazer Formal + Jilbab Pastel", status: "Urusi berkas beasiswa" }
];

const UMRAH_STUDENTS = [
  { name: "Muhammad Firnando", major: "Teknik Informatika (FTIK)", lat: 0.88780, lng: 104.48220, spotId: "ftik", outfit: "Jas Almamater Pasir Mas + Jeans Biru", status: "Praktikum Jaringan Laut" },
  { name: "Dewi Safitri", major: "Ilmu Kelautan (FIKP)", lat: 0.88515, lng: 104.48310, spotId: "fikp", outfit: "Weat-suit / Kemeja Linen + Topi Lapangan", status: "Uji kadar salinitas air laut Dompak" },
  { name: "Rian Hidayat", major: "Pendidikan Bahasa (FKIP)", lat: 0.88840, lng: 104.48520, spotId: "fkip", outfit: "Kemeja Batik Riau + Celana Bahan", status: "Bimbingan program magang mengajar" },
  { name: "Siti Rahma", major: "Sistem Informasi (FTIK)", lat: 0.88710, lng: 104.48410, spotId: "rektorat", outfit: "Blazer Hitam + Hijab Pastel", status: "Pengajuan beasiswa mahasiswa berprestasi" }
];

// Dynamic Database of multiple outfit combinations per category to allow continuous shuffling!
const OUTFIT_RECOMMENDATIONS: Record<string, Array<{
  combo: string;
  clothes: string;
  inner: string;
  footwear: string;
  accessories: string;
  petaConnection: string;
}>> = {
  hujan: [
    {
      combo: "Chic Rainproof Techwear ☔",
      clothes: "Jaket Bomber Tebal / Parker Anti-Air & Celana Cargo gelap",
      inner: "Kaos lengan panjang bahan combed 30s",
      footwear: "Sepatu boots kulit atau sneakers bersol karet tebal (anti-selip)",
      accessories: "Jas hujan lipat / Payung lipat saku + Backpack kedap air",
      petaConnection: "Cocok untuk berjalan kaki antar-fakultas tanpa takut basah kuyup."
    },
    {
      combo: "Cozy Rainy Day Classic 🌧️",
      clothes: "Hoodie Tebal Oversized & Celana Training Fleece",
      inner: "Singlet katun hangat",
      footwear: "Sepatu sport sneakers dengan spray anti-air",
      accessories: "Payung transparan ala drama Korea + Tumbler teh hangat",
      petaConnection: "Cocok untuk meringkuk di sudut kafe kantin sambil dengerin lagu galau."
    },
    {
      combo: "Smart Safe Windbreaker 🌬️",
      clothes: "Jaket Windbreaker Sporty & Celana Denim Jeans anti gerimis",
      inner: "Kaos Henley rajut",
      footwear: "Sepatu canvas high-top tebal",
      accessories: "Slayer leher pelindung dingin + Backpack anti basah",
      petaConnection: "Gaya tangguh menerobos badai angin dan rintik air di lapangan tengah."
    }
  ],
  panas: [
    {
      combo: "Effortless Breezy Summer ☀️",
      clothes: "Kemeja Semi-Oversized Katun Airism & Celana Chino Pendek/Chino Slimfit",
      inner: "Singlet katun penyerap keringat",
      footwear: "Sandals slip-on tali kain atau sneakers santai canvas",
      accessories: "Kacamata hitam pelindung UV + Botol minum tumbler es stainless dingin",
      petaConnection: "Pas sekali untuk berpindah dari Kantin menuju kelas di siang bolong."
    },
    {
      combo: "Streetwear Minimalist 🔥",
      clothes: "Kaos Grafis Drop-shoulder & Loose-fit Cargo Pants",
      inner: "Airism tanktop",
      footwear: "Retro running sneakers style",
      accessories: "Topi baseball cap + Tote bag kanvas tipis",
      petaConnection: "Sangat breathable untuk nongkrong asyik di bawah pohon rindang kampus."
    },
    {
      combo: "Smart Casual Academic 👔",
      clothes: "Polo Shirt rajut tipis & Celana Kulot / Linen Trousers",
      inner: "Tidak ada (bahan polo sudah sejuk)",
      footwear: "Sepatu slip-on mules atau minimalis sneakers",
      accessories: "Jam tangan strap karet sporty + Kipas angin saku portable USB",
      petaConnection: "Untuk tampilan santai tapi tetap rapi menawan saat bimbingan santai."
    }
  ],
  berawan: [
    {
      combo: "Urban Academic Aesthetic ☁️",
      clothes: "Sweater Crewneck rajut tipis / Kemeja Flanel bermotif kotak & Jeans Denim",
      inner: "Kaos polo putih",
      footwear: "Sepatu Loafers stylish atau Dokmart",
      accessories: "Tote bag kanvas berisi binder catatan + Jam tangan klasik",
      petaConnection: "Sangat estetis untuk berfoto OOTD di taman kampus & Perpustakaan Pusat."
    },
    {
      combo: "Sophisticated Preppy Look 🎓",
      clothes: "Cardigan Rajut Berkancing (V-neck) & Celana Pleated Trousers",
      inner: "Kemeja kerah tegak",
      footwear: "Chunky loafers atau leather boots",
      accessories: "Kacamata baca vintage + Notebook kulit coklat",
      petaConnection: "Tampil jenius dan puitis di sekitar area koridor gedung rektorat tua."
    },
    {
      combo: "Vintage Retro Oversized 📻",
      clothes: "Jaket Denim Vintage Washed & Celana Corduroy coklat hangat",
      inner: "Kaos putih bersih",
      footwear: "Sepatu sneakers klasik vintage (seperti Vans / Converse klasik)",
      accessories: "Headphone over-ear melingkar di leher + Tote bag ragi retro",
      petaConnection: "Gaya anak seni yang asyik bercengkerama tentang ide kreatif di pelataran perpus."
    }
  ],
  lab: [
    {
      combo: "Safety Laboratorium Professional 🥼",
      clothes: "Jas Lab Putih Tulang (lengan panjang terkancing rapis) & Celana Bahan Hitam Panjang",
      inner: "Kaos berkerah netral",
      footwear: "Sepatu pentofel kulit hitam tertutup rapat (menghindari tumpahan cairan)",
      accessories: "Masker medis + Kacamata Google safety + Sarung tangan karet steril di saku",
      petaConnection: "Khusus untuk penugasan di Fakultas Teknik & Lab Kimia Lantai 3."
    },
    {
      combo: "Geek Bio-Chemical Tech 🧪",
      clothes: "Jas Lab Bersih + Kemeja lengan panjang digulung rapi & Celana Chino tebal",
      inner: "Kaos dalam sejuk",
      footwear: "Sepatu kulit Docmart hitam legam",
      accessories: "Pulpen saku + Buku catatan lab tahan air + Name tag jas lab",
      petaConnection: "Tampil meyakinkan dan super fokus saat menyusun laporan kimia analitik."
    }
  ],
  formal: [
    {
      combo: "Elite Academic Diplomat 🎓",
      clothes: "Jas Almamater Kebanggaan Saku Emas & Kemeja Oxford Putih disetrika + Celana Kain Hitam",
      inner: "Kaos dalam polos",
      footwear: "Sepatu Oxford formal mengkilap / Heels tertutup bagi mahasiswi untuk kesopanan",
      accessories: "Map berkas skripsi + ID Card name-tag gantung",
      petaConnection: "Standar mutlak untuk memasuki Gedung Rektorat atau menghadiri Sidang Skripsi Utama."
    },
    {
      combo: "Executive Seminar Presenter 📈",
      clothes: "Blazer Formal Premium / Batik Sutra Lengan Panjang & Celana Pipa/Slimfit Trousers",
      inner: "Kemeja slimfit",
      footwear: "Monominimalist Leather Shoes / Loafers mengkilap",
      accessories: "Pointer laser presentasi + Cincin almamater megah",
      petaConnection: "Dipakai untuk presentasi konferensi ilmiah nasional berhadapan dengan dekanat."
    }
  ]
};

export default function OutfitPetaView() {
  const [currentCampus, setCurrentCampus] = useState<"umrah" | "jakarta" | "user">("user");
  const [mapsApiKey, setMapsApiKey] = useState<string>(() => {
    return localStorage.getItem("GOOGLE_MAPS_API_KEY") || "";
  });
  const [mapMode, setMapMode] = useState<"vector" | "google">("google");
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>(mapsApiKey);

  // Auto real-time weather stats computed using Open-Meteo
  const [useAutoWeather, setUseAutoWeather] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    windSpeed: number;
    weatherCode: number;
    description: string;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const [selectedWeather, setSelectedWeather] = useState<"hujan" | "panas" | "berawan" | "lab" | "formal">("panas");
  const [outfitIndexes, setOutfitIndexes] = useState<Record<string, number>>({
    hujan: 0,
    panas: 0,
    berawan: 0,
    lab: 0,
    formal: 0
  });

  const [userCustomLat, setUserCustomLat] = useState<number>(0.88725);
  const [userCustomLng, setUserCustomLng] = useState<number>(104.48422);

  const userSpot: CampusSpot = {
    id: "posisi_user",
    name: "📍 Lokasi Saya (GPS)",
    lat: userCustomLat,
    lng: userCustomLng,
    description: "Kamera satelit diarahkan langsung ke koordinat Anda saat ini. Cuaca dan peta berintegrasi secara adaptif.",
    defaultOutfitCode: "casual"
  };

  const campusSpots = [userSpot];

  const activeStudents = [
    {
      name: "Saya (Pengguna)",
      major: "Mahasiswa Aktif",
      lat: userCustomLat,
      lng: userCustomLng,
      spotId: "posisi_user",
      outfit: selectedWeather === "panas" ? "Kaos Santai Adem + Chino" : selectedWeather === "hujan" ? "Jaket Hoodie Tebal Kedap Air" : "Kemeja Flanel Santai",
      status: "Sedang memantau radar koordinat langsung di lokasi saat ini."
    }
  ];

  // Set default initial active spot to user's position
  const [activeSpot, setActiveSpot] = useState<CampusSpot>({
    id: "posisi_user",
    name: "📍 Lokasi Saya (GPS)",
    lat: 0.88725,
    lng: 104.48422,
    description: "Kamera satelit diarahkan langsung ke koordinat Anda saat ini. Cuaca dan peta berintegrasi secara adaptif.",
    defaultOutfitCode: "casual"
  }); 
  const [isLocating, setIsLocating] = useState(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(35);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);


  // Auto-detect GPS on initial component mount to locate user instantly worldwide!
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = parseFloat(position.coords.latitude.toFixed(5));
          const longitude = parseFloat(position.coords.longitude.toFixed(5));
          setUserCustomLat(latitude);
          setUserCustomLng(longitude);
          
          if (position.coords.accuracy) {
            setGpsAccuracy(Math.max(10, Math.min(100, Math.round(position.coords.accuracy))));
          } else {
            setGpsAccuracy(Math.floor(Math.random() * 25) + 15);
          }
          
          setActiveSpot({
            id: "posisi_user",
            name: "📍 Lokasi Saya (GPS)",
            lat: latitude,
            lng: longitude,
            description: "Kamera satelit diarahkan langsung ke koordinat Anda saat ini. Cuaca dan peta berintegrasi secara adaptif.",
            defaultOutfitCode: "casual"
          });
        },
        (error) => {
          console.log("Gelocation sensor blocked or delayed, using default coordinates:", error);
          setGpsAccuracy(35);
        }
      );
    }
  }, []);


  // Sync active spot coordinates if GPS user location receives updates
  useEffect(() => {
    setActiveSpot({
      id: "posisi_user",
      name: "📍 Lokasi Saya (GPS)",
      lat: userCustomLat,
      lng: userCustomLng,
      description: "Kamera satelit diarahkan langsung ke koordinat Anda saat ini. Cuaca dan peta berintegrasi secara adaptif.",
      defaultOutfitCode: "casual"
    });
  }, [userCustomLat, userCustomLng]);

  // Load official/server-configured API Key automatically if present, so user does not need to type it!
  useEffect(() => {
    const fetchMapsApiKey = async () => {
      try {
        const response = await fetch("/api/maps-key");
        if (response.ok) {
          const data = await response.json();
          if (data.key && data.key.trim()) {
            const localKey = localStorage.getItem("GOOGLE_MAPS_API_KEY");
            if (!localKey) {
              setMapsApiKey(data.key.trim());
              setTempKey(data.key.trim());
              setMapMode("google"); // Auto shift to Google satellite mode if key is available
            }
          }
        }
      } catch (err) {
        console.error("Gagal mendapatkan kunci sistem Google Maps:", err);
      }
    };
    fetchMapsApiKey();
  }, []);

  // Handle saving API key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("GOOGLE_MAPS_API_KEY", tempKey.trim());
    setMapsApiKey(tempKey.trim());
    setMapMode(tempKey.trim() ? "google" : "vector");
    setShowConfig(false);
  };

  // Fetch real-time localized weather via free satellite Open-Meteo API
  useEffect(() => {
    if (!useAutoWeather) return;

    let isMounted = true;
    const fetchWeather = async () => {
      try {
        if (isMounted) {
          setWeatherData(prev => ({
            temp: prev?.temp || 30,
            windSpeed: prev?.windSpeed || 10,
            weatherCode: prev?.weatherCode || 0,
            description: prev?.description || "Memuat cuaca...",
            loading: true,
            error: null
          }));
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${activeSpot.lat}&longitude=${activeSpot.lng}&current_weather=true&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil respon server prakiraan cuaca.");
        }

        const data = await response.json();
        const current = data.current_weather;

        if (!current) {
          throw new Error("Prakiraan cuaca untuk koordinat ini belum lengkap.");
        }

        // Map standard WMO weathercode to appropriate recommended OOTD clothes
        const code = current.weathercode;
        let mappedWeather: "hujan" | "panas" | "berawan" = "panas";
        let desc = "Cerah Terik";

        if (code === 0) {
          mappedWeather = "panas";
          desc = "Cerah Terik ☀️";
        } else if (code >= 1 && code <= 3) {
          mappedWeather = "berawan";
          desc = "Mendung Berawan ☁️";
        } else if (code === 45 || code === 48) {
          mappedWeather = "berawan";
          desc = "Berkabut Sejuk 🌫️";
        } else {
          // codes 51-99 represent drizzle, rain, storm showers and thunderstorms
          mappedWeather = "hujan";
          desc = "Hujan Berawan / Berangin 🌧️";
        }

        if (isMounted) {
          setWeatherData({
            temp: current.temperature,
            windSpeed: current.windspeed,
            weatherCode: code,
            description: desc,
            loading: false,
            error: null
          });

          // Update OOTD weather state automatically!
          setSelectedWeather(mappedWeather);
        }
      } catch (err: any) {
        console.error("Open-Meteo Weather API error:", err);
        if (isMounted) {
          setWeatherData(prev => ({
            temp: prev?.temp || 29,
            windSpeed: prev?.windSpeed || 15,
            weatherCode: prev?.weatherCode || 1,
            description: "Default (Simulasi)",
            loading: false,
            error: err.message || "Gagal sinkron cuaca realtime."
          }));
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [activeSpot.lat, activeSpot.lng, useAutoWeather]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.15, 2.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.15, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // Recommendations generator
  const getOutfitRecommendation = (weatherStr: string) => {
    const list = OUTFIT_RECOMMENDATIONS[weatherStr] || OUTFIT_RECOMMENDATIONS["panas"];
    const index = outfitIndexes[weatherStr] ?? 0;
    return list[index % list.length];
  };

  const cycleOutfit = (weatherStr: "hujan" | "panas" | "berawan" | "lab" | "formal") => {
    setOutfitIndexes(prev => {
      const list = OUTFIT_RECOMMENDATIONS[weatherStr];
      const nextIndex = (prev[weatherStr] + 1) % list.length;
      return {
        ...prev,
        [weatherStr]: nextIndex
      };
    });
  };

  const handleSelectWeather = (weather: "hujan" | "panas" | "berawan" | "lab" | "formal") => {
    setUseAutoWeather(false); // Disable auto-weather on manual weather button click so user can toggle
    setSelectedWeather(weather);
    cycleOutfit(weather);
  };

  const outfitDetail = getOutfitRecommendation(selectedWeather);

  // Trigger GPS locator simulating coordinates detection
  const handleDetectGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = parseFloat(position.coords.latitude.toFixed(5));
            const longitude = parseFloat(position.coords.longitude.toFixed(5));
            setUserCustomLat(latitude);
            setUserCustomLng(longitude);
            
            if (position.coords.accuracy) {
              setGpsAccuracy(Math.max(10, Math.min(100, Math.round(position.coords.accuracy))));
            } else {
              setGpsAccuracy(Math.floor(Math.random() * 25) + 15);
            }
            
            setIsLocating(false);
            
            // Find closest pre-defined spot to coordinate in the current campus
            let minDistance = Infinity;
            let closestSpot = campusSpots[0];
            campusSpots.forEach(spot => {
              const distance = Math.sqrt(Math.pow(spot.lat - latitude, 2) + Math.pow(spot.lng - longitude, 2));
              if (distance < minDistance) {
                minDistance = distance;
                closestSpot = spot;
              }
            });
            setActiveSpot(closestSpot);
          },
          () => {
            // Fallback mock movements if blocked or offline
            const randOffsetLat = (Math.random() - 0.5) * 0.003;
            const randOffsetLng = (Math.random() - 0.5) * 0.003;
            const targetBaseLat = 0.88725;
            const targetBaseLng = 104.48422;
            
            const latVal = parseFloat((targetBaseLat + randOffsetLat).toFixed(5));
            const lngVal = parseFloat((targetBaseLng + randOffsetLng).toFixed(5));
            setUserCustomLat(latVal);
            setUserCustomLng(lngVal);
            setGpsAccuracy(Math.floor(Math.random() * 40) + 20); // random beautiful dynamic accuracy
            setIsLocating(false);
          }
        );
      } else {
        setIsLocating(false);
      }
    }, 1200);
  };


  const handleSpotSelect = (spot: CampusSpot) => {
    setActiveSpot(spot);
    setUserCustomLat(spot.lat);
    setUserCustomLng(spot.lng);
  };

  const googleMapIframeSrc = `https://maps.google.com/maps?q=${activeSpot.lat},${activeSpot.lng}&z=${Math.min(21, Math.max(1, Math.floor(zoom * 3 + 14)))}&t=k&output=embed`;

  // Dynamic coordinates bounds calculation around user's custom location
  const mapWidth = 600;
  const mapHeight = 320;
  const boundsRange = 0.0035;
  const minLng = userCustomLng - boundsRange;
  const maxLng = userCustomLng + boundsRange;
  const minLat = userCustomLat - boundsRange;
  const maxLat = userCustomLat + boundsRange;

  const getNormX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 100) + 50;
  };

  const getNormY = (lat: number) => {
    // Invert the Y axis so traditional north is up
    return ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 100) + 50;
  };

  return (
    <div className="space-y-6 text-left relative z-10 font-sans">
      
      {/* Title Header with Campus Toggle and Settings Cog */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-pink-50 pb-4 animate-in fade-in duration-300">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-pink-100 text-[#FF2D75] text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Compass size={10} className="animate-spin" style={{ animationDuration: "12s" }} />
              GEOSPATIAL COORDS V2.1
            </span>
            <span className="bg-sky-100 text-sky-800 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sun size={10} />
              SATELIT OOTD AKTIF
            </span>
          </div>
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Shirt className="text-[#FF2D75]" />
            Penentu OOTD & Peta Koordinat Real-time
          </h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-3xl">
            Tentukan gaya berbusana terbaikmu sesuai prediksi cuaca koordinat GPS riil lokasi Anda hari ini. Didukung oleh integrasi satelit Google Maps penentu OOTD adaptif otomatis.
          </p>
        </div>

        {/* Campus & Key Controls Panel */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 shadow-xs">
            <div className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-[#FF2D75] shadow-xs flex items-center gap-1.5">
              <Navigation size={12} className="text-[#FF2D75] fill-rose-50" />
              📍 Lokasi Saya (GPS)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: OOTD SELECTOR CARD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm space-y-5">
            
            {/* Live Weather Forecast Header Status Bar */}
            <div className="bg-[#f0fdf4]/80 p-4 rounded-2xl border border-green-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] bg-green-500 text-white font-black px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping font-sans"></span>
                  Meteorologi Live (Satelit)
                </span>
                
                <span className="text-[10px] text-slate-500 font-bold">
                  Lokasi GPS Saya (Live) 📍
                </span>
              </div>
              
              {weatherData?.loading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 py-1">
                  <Loader2 size={14} className="animate-spin text-green-500" />
                  <span>Menghubungi satelit prakiraan cuaca Open-Meteo...</span>
                </div>
              ) : weatherData?.error ? (
                <div className="text-[10px] leading-tight text-amber-700 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100">
                  ⚠️ Gagal sinkronisasi cuaca otomatis: {weatherData.error}. Menggunakan mode simulasi manual.
                </div>
              ) : (
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 text-left">
                    <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wide">Status Cuaca Terkini</p>
                    <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                      {weatherData?.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] font-black font-display text-emerald-800 leading-none">
                      {weatherData?.temp}°C
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                      Angin: {weatherData?.windSpeed} km/h
                    </p>
                  </div>
                </div>
              )}
              
              <div className="text-[9.5px] text-slate-500 font-semibold leading-relaxed flex items-center gap-2 pt-1 border-t border-green-50">
                <span>🔄</span>
                <span>
                  <strong>Rekomendasi OOTD:</strong> Otomatis menyesuaikan dengan prakiraan cuaca di atas (saat ini merekomendasikan kategori <strong>{selectedWeather.toUpperCase()}</strong>).
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-[#2e1065] text-sm flex items-center gap-1.5 font-display">
                <Sparkles size={17} className="text-[#FF2D75] fill-pink-50" />
                Ganti & Cari Alternatif OOTD Kampus
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Pilih cuaca atau kategori agenda untuk mengubah fashion di bawah secara manual:</p>
            </div>

            {/* Weather Select Grid Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectWeather("panas")}
                className={`p-3 rounded-2xl border text-xs text-left transition-all cursor-pointer ${selectedWeather === "panas" ? "bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs scale-102" : "bg-white hover:bg-slate-50 border-slate-100"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sun size={15} className="text-amber-500 fill-amber-50" />
                  <span className="font-bold text-[11px]">Cerah Terik</span>
                </div>
                <p className="text-[9px] text-slate-400">Siang bolong kering</p>
              </button>

              <button
                onClick={() => handleSelectWeather("hujan")}
                className={`p-3 rounded-2xl border text-xs text-left transition-all cursor-pointer ${selectedWeather === "hujan" ? "bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-xs scale-102" : "bg-white hover:bg-slate-50 border-slate-100"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Droplets size={15} className="text-blue-500" />
                  <span className="font-bold text-[11px]">Hujan / Berangin</span>
                </div>
                <p className="text-[9px] text-slate-400">Suasana sejuk basah</p>
              </button>

              <button
                onClick={() => handleSelectWeather("berawan")}
                className={`p-3 rounded-2xl border text-xs text-left transition-all cursor-pointer ${selectedWeather === "berawan" ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-xs scale-102" : "bg-white hover:bg-slate-50 border-slate-100"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cloudy size={15} className="text-sky-400" />
                  <span className="font-bold text-[11px]">Mendung Kalem</span>
                </div>
                <p className="text-[9px] text-slate-400">Sejuk santai bersahabat</p>
              </button>

              <button
                onClick={() => handleSelectWeather("lab")}
                className={`p-3 rounded-2xl border text-xs text-left transition-all cursor-pointer ${selectedWeather === "lab" ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs scale-102" : "bg-white hover:bg-slate-50 border-slate-100"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={15} className="text-emerald-500" />
                  <span className="font-bold text-[11px]">Praktikum Lab</span>
                </div>
                <p className="text-[9px] text-slate-400">Wajib perlindungan</p>
              </button>
            </div>

            <button
              onClick={() => handleSelectWeather("formal")}
              className={`w-full p-3.5 rounded-2xl border text-xs text-left transition-all cursor-pointer ${selectedWeather === "formal" ? "bg-purple-50 border-purple-300 text-purple-800 font-bold shadow-xs scale-102" : "bg-white hover:bg-slate-50 border-slate-100"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers size={15} className="text-[#FF2D75]" />
                <span className="font-bold text-[11px]">Sidang / Acara Rektorat Formal</span>
              </div>
              <p className="text-[9px] text-slate-400">Presentasi krusial menguji reputasi kealmamateran</p>
            </button>

            {/* Recommended Visual Outfit Output Card */}
            <div 
              onClick={() => cycleOutfit(selectedWeather)}
              title="Klik di sini untuk melihat pilihan kombinasi fashion lainnya!"
              className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-3xl text-white space-y-3.5 relative overflow-hidden shadow-lg border border-white/10 hover:border-[#FF2D75]/40 cursor-pointer select-none transition-all group active:scale-98"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2D75]/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[9px] bg-gradient-to-r from-pink-500 to-[#FF2D75] text-white font-black px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                  OOTD ALTERNATIF 🔁
                </span>
                <span className="text-xs font-bold text-slate-350">{outfitDetail.combo}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Pakaian Utama</span>
                  <p className="font-black text-rose-300 text-sm mt-0.5 group-hover:text-pink-300 transition-colors">{outfitDetail.clothes || "Kemeja Flanel Casual"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Inner Layer</span>
                    <p className="font-extrabold text-slate-100 text-[11px] mt-0.5">{outfitDetail.inner}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Alas Kaki</span>
                    <p className="font-extrabold text-slate-100 text-[11px] mt-0.5">{outfitDetail.footwear}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Perlengkapan Tambahan</span>
                  <p className="font-medium text-amber-200 mt-0.5 leading-tight">{outfitDetail.accessories}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 font-medium flex justify-between items-center">
                💡 <span className="italic flex-1 ml-1 truncate">{outfitDetail.petaConnection}</span>
                <span className="text-[8px] bg-white/10 text-pink-200 px-1.5 py-0.5 rounded-sm font-black animate-pulse">KLIK UNTUK ACAK</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COORDINATE MAP VIEW */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4 flex flex-col justify-between">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-[#2e1065] text-sm flex items-center gap-1.5 font-display">
                  <MapPin size={17} className="text-[#FF2D75]" />
                  Peta Koordinat & Deteksi Lokasi Riil
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">Pindai koordinat GPS dan render peta secara dinamis.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all whitespace-nowrap"
                >
                  <Navigation size={13} className={isLocating ? "animate-spin" : ""} />
                  {isLocating ? "Mengukur GPS..." : "Pindai Sinar GPS Saya"}
                </button>
              </div>
            </div>

            {/* Geographical Coordinate Stats Panel */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[10px] font-bold font-mono">
              <div className="text-center border-r border-slate-200">
                <span className="text-[8px] text-slate-400 block uppercase font-sans">Garisan Lintang (Lat)</span>
                <span className="text-[#FF2D75]">{userCustomLat.toFixed(5)}° {userCustomLat >= 0 ? "N" : "S"}</span>
              </div>
              <div className="text-center border-r border-slate-200">
                <span className="text-[8px] text-slate-400 block uppercase font-sans">Garisan Bujur (Lng)</span>
                <span className="text-sky-600">{userCustomLng.toFixed(5)}° E</span>
              </div>
              <div className="text-center">
                <span className="text-[8px] text-slate-400 block uppercase font-sans">Satelit Gps Akurasi</span>
                <span className="text-emerald-600 font-sans font-bold">{Math.max(1, 100 - (gpsAccuracy / 5)).toFixed(1)}% ({gpsAccuracy <= 30 ? "Optimal" : "Sedang"})</span>
              </div>
            </div>

            {/* Interactive Accuracy Controller Slider */}
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-2 text-[10px] font-bold">
              <div className="flex justify-between items-center text-[10px] text-slate-600">
                <span className="flex items-center gap-1">
                  🌐 Radius Akurasi Bubble GPS: <strong className="text-[#FF2D75] font-mono text-xs">{gpsAccuracy} meter</strong>
                </span>
                <span className="text-[8.5px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  Dapat Diatur Manual
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={100}
                value={gpsAccuracy}
                onChange={(e) => setGpsAccuracy(Number(e.target.value))}
                className="w-full h-1.5 accent-[#FF2D75] cursor-pointer bg-slate-200 rounded-lg appearance-none transition-all focus:outline-hidden"
                style={{
                  background: `linear-gradient(to right, #ff2d75 0%, #ff2d75 ${(gpsAccuracy - 15) / (100 - 15) * 100}%, #e2e8f0 ${(gpsAccuracy - 15) / (100 - 15) * 100}%, #e2e8f0 100%)`
                }}
                title="Geser slider ini untuk memperbesar atau memperkecil akurasi radius visual lingkaran bubble interaktif di radar peta secara realtime"
              />
              <p className="text-[8.5px] text-slate-400 font-medium leading-none">
                💡 Geser untuk melihat rentang radius visual (lingkaran transparan) di penanda "Radar Vektor" membesar & mengecil.
              </p>
            </div>


            {/* HIGH FIDELITY INTERACTIVE MAP CONTAINER CAN SIGN-IN OR TOGGLE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setMapMode("vector")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${mapMode === "vector" ? "bg-white text-indigo-950 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🗺️ Radar Vektor
                  </button>
                  <button
                    onClick={() => setMapMode("google")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${mapMode === "google" ? "bg-white text-indigo-950 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🛰️ Citra Satelit (Google Maps)
                  </button>
                </div>

                <span className="text-[9px] text-slate-400 italic">
                  Zoom saat ini: {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* RENDER DYNAMIC CANVAS */}
              <div id="map-frame-wrapper" className="relative w-full h-[320px] bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-200/80 shadow-[0_15px_30px_rgba(0,0,0,0.06)]">
                
                {mapMode === "google" ? (
                  // REAL KEYLESS COALITION GOOGLE MAPS EMBED LIVE RENDERING!
                  <iframe
                    id="google-maps-embed-iframe"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    src={googleMapIframeSrc}
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                ) : (
                  // VECTOR RADAR MAP CANVAS
                  <div 
                    className="absolute inset-0 transition-transform duration-300 origin-center bg-[#eff6ff]/80" 
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* Soft topographic grid paths */}
                    <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
                    
                    {/* Fake Street Tracks */}
                    <div className="absolute h-4 w-full bg-slate-200/40 top-1/4 -translate-y-1/2 rotate-2 origin-center transform border-y border-white"></div>
                    <div className="absolute h-4 w-full bg-slate-200/40 bottom-1/3 -translate-y-1/2 -rotate-3 origin-center transform border-y border-white"></div>
                    <div className="absolute w-4 h-full bg-slate-200/40 left-1/3 -translate-x-1/2 rotate-1 origin-center transform border-x border-white"></div>
                    <div className="absolute w-4 h-full bg-slate-200/40 right-1/4 -translate-x-1/2 -rotate-1 origin-center transform border-x border-white"></div>
                    
                    {/* Campus Circle Center Core */}
                    <div className="absolute w-28 h-28 bg-[#38bdf8]/20 border border-indigo-400/40 rounded-full animate-ping pointer-events-none left-1/3 top-1/3" style={{ animationDuration: '7s' }}></div>
                    <div className="absolute w-16 h-16 bg-[#38bdf8]/10 border border-indigo-400/30 rounded-full left-1/3 top-1/3"></div>

                     {/* Render Spot Markers on SVG Canvas Grid */}
                     {campusSpots.map((spot) => {
                       const normX = getNormX(spot.lng);
                       const normY = getNormY(spot.lat);
                       const isSelected = activeSpot.id === spot.id;

                       if (spot.id === "posisi_user") {
                         return (
                           <div
                             key={spot.id}
                             className="absolute flex flex-col items-center justify-center select-none"
                             style={{ 
                               left: `${normX}px`, 
                               top: `${normY}px`, 
                               transform: "translate(-50%, -50%)",
                               zIndex: 50 
                             }}
                           >
                             {/* Outer Accuracy Radius (Dynamic based on gpsAccuracy) */}
                             <div 
                               className="absolute rounded-full bg-[#FF2D75]/10 border-2 border-[#FF2D75]/30 pointer-events-none transition-all duration-500 ease-out"
                               style={{
                                 width: `${gpsAccuracy * 1.5}px`,
                                 height: `${gpsAccuracy * 1.5}px`,
                                 filter: "drop-shadow(0 0 5px rgba(255, 45, 117, 0.15))"
                               }}
                             />

                             {/* Dual Radar Pulsing Ring Waves */}
                             <div className="absolute w-12 h-12 rounded-full bg-[#FF2D75]/15 border border-[#FF2D75]/40 radar-wave-heavy pointer-events-none" />
                             <div className="absolute w-12 h-12 rounded-full bg-[#FF2D75]/10 border border-[#FF2D75]/30 radar-wave-delayed pointer-events-none" />

                             {/* Main Interaktif Glassmorphic Bubble */}
                             <button
                               type="button"
                               onClick={() => {
                                 handleSpotSelect(spot);
                                 setShowTooltip(!showTooltip);
                               }}
                               onMouseEnter={() => setShowTooltip(true)}
                               onMouseLeave={() => setShowTooltip(false)}
                               className="relative w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border-2 border-[#FF2D75] flex items-center justify-center shadow-lg hover:scale-115 cursor-pointer active:scale-95 transition-all outline-hidden"
                               style={{
                                 backgroundImage: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 45, 117, 0.25) 100%)"
                               }}
                             >
                               {/* Glowing core blue/pink dot */}
                               <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF2D75] to-pink-400 border border-white flex items-center justify-center shadow-inner">
                                 {/* Solid center core white pulse dot or mini profile */}
                                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                               </div>

                               {/* Live Ring Status Indicator pin */}
                               <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
                                 <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                               </span>
                             </button>

                             {/* Sleek Tooltip/InfoWindow with smooth custom React animation */}
                             {showTooltip && (
                               <div className="absolute bottom-11 bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-xl border border-white/20 select-none pointer-events-none whitespace-nowrap z-50 flex flex-col items-start gap-0.5 transform origin-bottom transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                                 <div className="flex items-center gap-1">
                                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                   <span className="font-sans font-black text-[10px] uppercase tracking-wider text-pink-300">Lokasi Anda Sekarang</span>
                                 </div>
                                 <span className="font-sans text-[9px] font-bold text-slate-300 leading-none">
                                   Akurasi GPS: <strong className="text-white font-mono">{gpsAccuracy} meter</strong>
                                 </span>
                                 <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 rotate-45 border-r border-b border-white/20" />
                               </div>
                             )}

                             {/* Compact text anchor */}
                             <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-[#FF2D75] border border-pink-200 rounded-md mt-1.5 shadow-sm z-10 whitespace-nowrap uppercase tracking-wider">
                               🛰️ LOKASI SAYA
                             </span>
                           </div>
                         );
                       }

                       return (
                         <button
                           key={spot.id}
                           onClick={() => handleSpotSelect(spot)}
                           className="absolute cursor-pointer transition-all duration-200 hover:scale-115 flex flex-col items-center select-none"
                           style={{ left: `${normX}px`, top: `${normY}px`, transform: "translate(-50%, -50%)" }}
                           title={spot.name}
                         >
                           <div className={`p-2 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#FF2D75] text-white shadow-md animate-bounce" : "bg-white text-slate-800 border-[1.5px] border-slate-950 shadow-xs"}`}>
                             <MapPin size={12} className={isSelected ? "fill-white" : ""} />
                           </div>
                           <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md mt-1 shadow-md z-10 whitespace-nowrap ${isSelected ? "bg-slate-900 text-white" : "bg-white/90 text-slate-900 border border-slate-200"}`}>
                             {isSelected ? `📍 ${spot.name}` : spot.name.split(" ")[0]}
                           </span>
                         </button>
                       );
                     })}


                    {/* Active simulated student coordinates */}
                    {activeStudents.map((student, i) => {
                      const normX = getNormX(student.lng);
                      const normY = getNormY(student.lat);

                      return (
                        <div
                          key={i}
                          className="absolute select-none pointer-events-auto flex flex-col items-center"
                          style={{ left: `${normX + 15}px`, top: `${normY - 15}px` }}
                        >
                          <div className="w-5 h-5 bg-[#06b6d4] text-white font-sans font-bold border border-white flex items-center justify-center rounded-full text-[9px] shadow-md hover:scale-125 transition-transform" title={`${student.name} (${student.major})\nGaya: ${student.outfit}\nStatus: ${student.status}`}>
                            👤
                          </div>
                          <div className="hidden hover:block absolute bg-white/95 border border-slate-200 rounded-lg p-2 text-[9px] leading-tight text-slate-800 font-bold shadow-lg w-40 z-20 top-6">
                            <p className="text-[#FF2D75] font-black">{student.name}</p>
                            <p className="text-slate-500 text-[8px]">{student.major}</p>
                            <p className="mt-1">👔 {student.outfit}</p>
                            <p className="text-sky-600 italic">"{student.status}"</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Floating Map Zoom Controls Overlay (Visible in both vector and satellite zoom) */}
                <div 
                  id="map-zoom-controls"
                  className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20 bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200/80"
                >
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="w-8 h-8 rounded-lg text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                    title="Perbesar Peta (Zoom In)"
                  >
                    <ZoomIn size={15} className="text-slate-700 font-extrabold" />
                  </button>
                  <div className="h-[1px] bg-slate-200 mx-1"></div>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="w-8 h-8 rounded-lg text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                    title="Perkecil Peta (Zoom Out)"
                  >
                    <ZoomOut size={15} className="text-slate-700 font-extrabold" />
                  </button>
                  <div className="h-[1px] bg-slate-200 mx-1"></div>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="text-[9px] font-black tracking-tight text-[#FF2D75] hover:bg-rose-50 px-1 py-1 rounded-md flex flex-col items-center justify-center whitespace-nowrap"
                    title="Ulangi Zoom ke 100%"
                  >
                    <RotateCcw size={10} className="mb-0.5" />
                    <span>{Math.round(zoom * 100)}%</span>
                  </button>
                </div>

              </div>
            </div>

            {/* active building details */}
            <div className="bg-[#EBF8FF] p-4.5 rounded-3xl border border-sky-100 flex items-start gap-4">
              <span className="text-2xl pt-1">🏢</span>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[12px] text-[#2e1065]">{activeSpot.name}</h4>
                <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{activeSpot.description}</p>
                <div className="pt-2 flex flex-wrap gap-2 text-[9px] font-bold">
                  <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded-xl">Lintang (Lat): {activeSpot.lat}</span>
                  <span className="bg-pink-100 text-[#FF2D75] px-2 py-1 rounded-xl">Bujur (Lng): {activeSpot.lng}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-xl">Gaya Bawaan: {activeSpot.defaultOutfitCode.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* user coordinates activity grid list */}
            <div>
              <h4 className="font-extrabold text-[#2e1065] text-xs flex items-center gap-1.5 font-display mb-2.5">
                <Users size={14} className="text-[#FF2D75]" />
                Simulasi Kedekatan Mahasiswa Aktif Sekitar GPS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeStudents.map((student, idx) => (
                  <div key={idx} className="bg-white/60 p-3 rounded-2xl border border-slate-100 flex gap-3 text-xs justify-between items-center hover:border-pink-200 transition-all">
                    <div>
                      <p className="font-black text-slate-800">{student.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{student.major}</p>
                      <p className="text-[10px] text-slate-600 font-semibold mt-1">👔 {student.outfit}</p>
                    </div>
                    <span className="text-[9px] bg-sky-50 text-indigo-700 font-black px-2 py-1 rounded-xl italic">
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
