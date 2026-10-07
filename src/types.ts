export interface Task {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  daysLeft: number;
  completed: boolean;
  notes?: string;
}

export interface InteractiveCalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  category: "Pribadi" | "Tugas" | "Lainnya";
  completed?: boolean;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  location: string;
  type: "class" | "discussion" | "webinar";
  color: string;
  completed?: boolean;
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  registered: boolean;
  capacity?: number;
  description?: string;
  image?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  reward: string;
  deadline: string;
  desc: string;
  registered: boolean;
  category: "Prestasi" | "Bantuan" | "Kemitraan" | "Luar Negeri";
  requirements: string[];
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Internship" | "Part-time" | "Full-time";
  stipend: string;
  registered: boolean;
  desc: string;
  requirements: string[];
}

export interface Community {
  id: string;
  name: string;
  members: number;
  isJoined: boolean;
  category: string;
  desc: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  seller: string;
  location: string;
  category: "Buku" | "Elektronik" | "Alat Tulis" | "Kosan & Jasa" | "Lainnya";
  rating: number;
  isSaved: boolean;
  desc: string;
  image: string;
}

export interface CounselorSession {
  id: string;
  date: string;
  time: string;
  counselorName: string;
  topic: string;
  type: "Chat" | "VideoCall";
  status: "Scheduled" | "Completed";
}

export interface Billing {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "Lunas" | "Belum Lunas";
  category: "UKT" | "Kemahasiswaan" | "Perpustakaan" | "Denda";
}

export interface AcademicCourse {
  id: string;
  code: string;
  name: string;
  sks: number;
  grade?: string;
  semester: number;
  lecturer: string;
  room: string;
  day: string;
  time: string;
}

export interface MentalHealthJournal {
  id: string;
  date: string;
  moodValue: "Sempurna" | "Baik" | "Biasa Saja" | "Lelah" | "Bad Mood";
  note: string;
  anonymous: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  nim: string;
  major: string;
  semester: number;
  gpa: number;
  avatar: string;
}

export interface CalendarNote {
  id: string;
  courseTitle: string;
  lecturerName: string;
  topic: string;
  content: string;
  date: string;
  createdAt: string;
  tags?: string[];
}

export function getIpkClassification(gpa: number | string): string {
  const score = parseFloat(String(gpa));
  if (isNaN(score) || score < 1.00) return "Semangat & Terus Berlatih";
  if (score >= 1.00 && score < 2.50) return "Semangat & Terus Berlatih";
  if (score >= 2.50 && score < 3.00) return "Sobat Ambis";
  if (score >= 3.00 && score < 3.50) return "Mahasiswa Andalan";
  if (score >= 3.50 && score <= 4.00) return "Sangat Memuaskan";
  return "Sangat Memuaskan";
}

