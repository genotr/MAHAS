import {
  Task,
  InteractiveCalendarEvent,
  AgendaItem,
  CampusEvent,
  Scholarship,
  Internship,
  Community,
  MarketplaceItem,
  Billing,
  AcademicCourse,
  MentalHealthJournal,
  UserProfile
} from "./types";

export const initialProfile: UserProfile = {
  name: "Nadia A.",
  role: "Mahasiswa",
  nim: "A11.2021.13456",
  major: "Teknik Informatika",
  semester: 1,
  gpa: 3.82,
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
};

const createInitialTaskDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}, 23:59`;
};

export const initialTasks: Task[] = [];

export const initialAgenda: AgendaItem[] = [];

export const getInitialCalendarEvents = (): InteractiveCalendarEvent[] => [];

export const initialEvents: CampusEvent[] = [
  {
    id: "event-1",
    title: "Seminar Nasional Digital Future 2024",
    date: "18 Mei 2024",
    location: "Online",
    category: "Seminar",
    registered: false,
    capacity: 500,
    description: "Seminar ini membahas tren teknologi masa depan termasuk AI, IoT, dan Web3.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "event-2",
    title: "Workshop UI/UX Design Basics",
    date: "20 Mei 2024",
    location: "Lab DKV Lt. 3",
    category: "Workshop",
    registered: false,
    capacity: 40,
    description: "Belajar dasar wireframing, moodboard, dan prototyping di Figma dengn mentor berpengalaman.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "event-3",
    title: "Career Talk: From Campus to Professional",
    date: "25 Mei 2024",
    location: "Aula Gedung A",
    category: "Sharing",
    registered: false,
    capacity: 150,
    description: "Kupas tuntas persiapan CV, portfolio, dan teknik wawancara kerja pasca-kelulusan.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600"
  }
];

export const initialScholarships: Scholarship[] = [
  {
    id: "sch-1",
    name: "Beasiswa Unggulan Bank Indonesia",
    provider: "Bank Indonesia",
    reward: "Rp 12.000.000 / Semester + Pelatihan Kepemimpinan",
    deadline: "15 Juni 2024",
    desc: "Beasiswa prestisius untuk mahasiswa S1 aktif semester 4-6 dengan IPK tinggi dan kontribusi sosial nyata.",
    registered: false,
    category: "Prestasi",
    requirements: ["Minimal IPK 3.50", "KTM Kampus Mitra", "Sertifikat TOEFL > 500", "Surat rekomendasi Dekan"]
  },
  {
    id: "sch-2",
    name: "Djarum Beasiswa Plus",
    provider: "Djarum Foundation",
    reward: "Rp 1.000.000 / Bulan (1 Tahun) + Soft Skills Training",
    deadline: "20 Juni 2024",
    desc: "Beasiswa eksklusif yang memfokuskan pada pengembangan soft skills berupa karakter, kepemimpinan, dan wawasan kebangsaan.",
    registered: false,
    category: "Prestasi",
    requirements: ["Mahasiswa aktif S1 Semester 4", "IPK minimal 3.20", "Aktif berorganisasi", "Lolos tes tertulis & wawancara"]
  },
  {
    id: "sch-3",
    name: "Beasiswa PPA (Peningkatan Prestasi Akademik)",
    provider: "Kemendikbud Ristek",
    reward: "Rp 6.000.000 / Tahun",
    deadline: "10 Juli 2024",
    desc: "Bantuan biaya pendidikan dari pemerintah bagi mahasiswa yang memiliki prestasi akademik tinggi namun berkendala finansial.",
    registered: false,
    category: "Bantuan",
    requirements: ["IPK minimal 3.00", "Surat Keterangan Tidak Mampu (SKTM)", "Rekomendasi dosen wali"]
  },
  {
    id: "sch-4",
    name: "Monbukagakusho (MEXT) Japan",
    provider: "Pemerintah Jepang",
    reward: "Full Tuition + Tiket Pesawat PP + Rp 15.000.000 Uang Saku Bulanan",
    deadline: "30 Juni 2024",
    desc: "Beasiswa penuh untuk melanjutkan studi S2 atau program pertukaran pelajar di universitas terbaik di Jepang.",
    registered: false,
    category: "Luar Negeri",
    requirements: ["Lulusan S1 dengan IPK minimal 3.40", "Sertifikat N3 JLPT atau IELTS 6.5", "Proposal Riset Akademik"]
  }
];

export const initialInternships: Internship[] = [
  {
    id: "intern-1",
    title: "UI/UX Designer Intern",
    company: "Tokopedia",
    location: "Jakarta (Hybrid)",
    type: "Internship",
    stipend: "Rp 3.500.000 / Bulan",
    registered: false,
    desc: "Ikutserta dalam tim product design Tokopedia untuk merancang user flow, wireframe, serta melakukan usability testing pada fitur-fitur baru.",
    requirements: ["Familiar dengan Figma dan Miro", "Portofolio UI/UX yang menunjukkan proses desain", "Mahasiswa tingkat akhir atau baru lulus"]
  },
  {
    id: "intern-2",
    title: "Software Engineer Intern (Frontend)",
    company: "Gojek",
    location: "Jakarta (On-site)",
    type: "Internship",
    stipend: "Rp 4.500.000 / Bulan",
    registered: false,
    desc: "Membantu pengembangan ekosistem web internal Gojek menggunakan React, TypeScript, dan optimalisasi performa front-end.",
    requirements: ["Menguasai JavaScript & CSS level menengah", "Paham dasar-dasar framework modern React/Vue", "Mengerti git workflow"]
  },
  {
    id: "intern-3",
    title: "Social Media Strategist & Content Creator",
    company: "Ruangguru",
    location: "Yogyakarta (Remote)",
    type: "Part-time",
    stipend: "Rp 2.000.000 / Bulan",
    registered: false,
    desc: "Membuat video pendek, riset topik pendidikan terkini, serta mengelola interaksi akun resmi sosial media Ruangguru.",
    requirements: ["Percaya diri di depan kamera", "Mampu mengedit video pendek di CapCut/Premiere", "Up-to-date dengan tren TikTok"]
  }
];

export const initialCommunities: Community[] = [
  {
    id: "comm-1",
    name: "Desain Bersatu",
    members: 1234,
    isJoined: false,
    category: "Seni & Desain",
    desc: "Komunitas wadah berkumpulnya mahasiswa kreatif pecinta desain grafis, UI/UX, ilustrasi, 3D art, dan visual branding."
  },
  {
    id: "comm-2",
    name: "Mahasiswa Produktif",
    members: 2345,
    isJoined: false,
    category: "Akademik & Karir",
    desc: "Fokus belajar bersama, berbagi tips produktivitas, manajemen waktu, hack Notion harian, persiapan beasiswa, dan sertifikasi."
  },
  {
    id: "comm-3",
    name: "Anak Rantau Indonesia",
    members: 3210,
    isJoined: false,
    category: "Sosial & Budaya",
    desc: "Tempat berkumpul mahasiswa luar kota untuk saling bantu info kosan murah, resep masakan rice cooker hemat, dan kegiatan mudik bersama."
  },
  {
    id: "comm-4",
    name: "Google Developer Student Clubs (GDSC)",
    members: 1840,
    isJoined: true,
    category: "Teknologi",
    desc: "Komunitas berbasis teknologi dari Google bagi mahasiswa untuk mengasah skill code, ikut hackathon, dan membuat solusi nyata."
  }
];

export const initialMarketplace: MarketplaceItem[] = [
  {
    id: "mkt-1",
    title: "Buku Kalkulus Purcel Edisi 9 (Bekas/Mulus)",
    price: 85000,
    seller: "Andi Saputra",
    location: "Kos Pandega Indah (Dekat Kampus)",
    category: "Buku",
    rating: 4.8,
    isSaved: false,
    desc: "Buku cetakan asli, halaman masih sangat lengkap, bersih dari coretan pensil. Sangat berguna untuk mahasiswa semester 1-2.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "mkt-2",
    title: "iPad Air 4 64GB Rosegold + Apple Pencil 2",
    price: 6800000,
    seller: "Gaby Anastasia",
    location: "Apartemen Kampus Tembalang",
    category: "Elektronik",
    rating: 4.9,
    isSaved: true,
    desc: "Kondisi fisik 97% mulus, baterai health 89%. Bonus case magnetik dan paperlike screen protector. Dipakai hanya untuk kuliah online catat PDF.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "mkt-3",
    title: "Jasa Print & Jilid Skripsi / Laporan Murah",
    price: 350,
    seller: "Kopy Mandiri Print",
    location: "Jl. Margonda Raya No. 12",
    category: "Kosan & Jasa",
    rating: 4.7,
    isSaved: false,
    desc: "Harga per halaman hitam putih Rp350, warna Rp800. Jilid hardcover mewah pengerjaan kilat hanya 4 jam langsung jadi.",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "mkt-4",
    title: "Set Meja Belajar Lipat Minimalis Kayu",
    price: 120000,
    seller: "Rian F.",
    location: "Kost Mulia Pogung Baru",
    category: "Alat Tulis",
    rating: 4.5,
    isSaved: false,
    desc: "Meja lipat portable yang kokoh, bahan kayu jati belanda ringan, cocok untuk kamar kos sempit. Kondisi masih sangat baik.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400"
  }
];

export const initialBillings: Billing[] = [
  {
    id: "bill-1",
    title: "Pembayaran UKT Semester 6",
    amount: 5400000,
    dueDate: "2026-06-30",
    status: "Belum Lunas",
    category: "UKT"
  },
  {
    id: "bill-2",
    title: "Iuran Organisasi & Kemahasiswaan",
    amount: 150000,
    dueDate: "2026-05-15",
    status: "Lunas",
    category: "Kemahasiswaan"
  },
  {
    id: "bill-3",
    title: "Denda Pengembalian Buku Perpustakaan",
    amount: 15000,
    dueDate: "2026-05-25",
    status: "Lunas",
    category: "Perpustakaan"
  }
];

export const initialCourses: AcademicCourse[] = [];

export const initialJournals: MentalHealthJournal[] = [
  {
    id: "jrn-1",
    date: "26 Mei 2026",
    moodValue: "Baik",
    note: "Sangat senang dapet feedback positif dari dosen review prototype Figma tadi siang.",
    anonymous: true
  },
  {
    id: "jrn-2",
    date: "25 Mei 2026",
    moodValue: "Lelah",
    note: "Begadang ngerjain tugas laporan kodingan, agak pusing tapi akhirnya selesai tepat waktu.",
    anonymous: false
  }
];

export const IndonesianQuotes = [
  "Progres kecil setiap hari akan membawa hasil besar di masa depan.",
  "Setiap perjuangan yang kamu hadapi hari ini adalah bekal ketangguhan di hari esok.",
  "Gagal itu urusan nanti, yang terpenting jangan pernah lelah untuk mencoba dan berproses.",
  "Pendidikan bukan sekadar kuliah dan nilai, melainkan pembentukan karakter diri menuju masa depan.",
  "Nikmati sisa masa perkuliahanmu dengan belajar sungguh-sungguh, berjejaring, dan merawat kesehatan mentalmu."
];
