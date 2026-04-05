// Mock data store for RJA Inventors

export interface Invention {
  id: string;
  title: string;
  inventor: string;
  inventorId: string;
  location: string;
  thumbnail: string;
  gallery: string[];
  videoUrl?: string;
  explanation: string;
  useCase: string;
  industrialApplication: string;
  prototypeDate: string;
  patentStatus: "pending" | "filed" | "granted" | "none";
  milestone: string;
  velocityScore: number;
  feasibilityRating: number;
  ratingCount: number;
  verified: boolean;
  globalPriority: boolean;
  fraudFlag: boolean;
  createdAt: string;
  updatedAt: string;
  updateHistory: { date: string; field: string }[];
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "inventor" | "investor" | "admin";
  verified: boolean;
  banned: boolean;
  joinedAt: string;
  inventionCount: number;
}

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface FraudReport {
  id: string;
  inventionId: string;
  inventionTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  timestamp: string;
  status: "pending" | "reviewed" | "dismissed";
}

const INVENTIONS_KEY = "rja_inventions";
const USERS_KEY = "rja_users";
const MESSAGES_KEY = "rja_messages";
const CURRENT_USER_KEY = "rja_current_user";
const ADMIN_PASSWORD_KEY = "rja_admin_password";
const FRAUD_REPORTS_KEY = "rja_fraud_reports";

const defaultInventions: Invention[] = [
  {
    id: "1",
    title: "Quantum-Flux Desalination Engine",
    inventor: "Dr. Elena Voss",
    inventorId: "u1",
    location: "Berlin, Germany",
    thumbnail: "",
    gallery: [],
    explanation: "A revolutionary membrane-free desalination system using quantum tunneling principles to separate salt ions from water molecules at 1/10th the energy cost of reverse osmosis. The core innovation lies in a graphene-lattice array that creates quantum wells precisely tuned to sodium and chloride ion wavelengths.",
    useCase: "Large-scale freshwater production for arid regions",
    industrialApplication: "Municipal water treatment, agricultural irrigation, disaster relief",
    prototypeDate: "2025-08-15",
    patentStatus: "filed",
    milestone: "Successfully desalinated 500L/hr in lab conditions",
    velocityScore: 94,
    feasibilityRating: 4.7,
    ratingCount: 23,
    verified: true,
    globalPriority: true,
    fraudFlag: false,
    createdAt: "2025-06-01",
    updatedAt: "2026-03-25",
    updateHistory: [
      { date: "2026-03-25", field: "explanation" },
      { date: "2026-03-20", field: "media" },
      { date: "2026-03-15", field: "milestone" },
    ],
    category: "Clean Energy",
  },
  {
    id: "2",
    title: "Neural-Mesh Prosthetic Interface",
    inventor: "Prof. Kwame Asante",
    inventorId: "u2",
    location: "Accra, Ghana",
    thumbnail: "",
    gallery: [],
    explanation: "A bio-compatible neural mesh that integrates directly with existing nerve endings to provide full sensory feedback in prosthetic limbs. Uses a proprietary conductive polymer that mimics myelin sheaths for zero-latency signal transmission.",
    useCase: "Next-gen prosthetics with full tactile sensation",
    industrialApplication: "Medical devices, rehabilitation, military",
    prototypeDate: "2025-11-02",
    patentStatus: "granted",
    milestone: "FDA Phase 2 trials initiated with 12 patients",
    velocityScore: 88,
    feasibilityRating: 4.5,
    ratingCount: 31,
    verified: true,
    globalPriority: false,
    fraudFlag: false,
    createdAt: "2025-04-10",
    updatedAt: "2026-03-22",
    updateHistory: [
      { date: "2026-03-22", field: "milestone" },
      { date: "2026-03-10", field: "explanation" },
    ],
    category: "BioTech",
  },
  {
    id: "3",
    title: "Atmospheric Carbon Crystallizer",
    inventor: "Dr. Yuki Tanaka",
    inventorId: "u3",
    location: "Tokyo, Japan",
    thumbnail: "",
    gallery: [],
    explanation: "Captures atmospheric CO2 and converts it into industrial-grade carbon nanotubes using a solar-thermal catalytic process. Each unit can process 10 tons of CO2 annually while producing high-value materials.",
    useCase: "Carbon capture with profitable material output",
    industrialApplication: "Manufacturing, construction, aerospace",
    prototypeDate: "2026-01-20",
    patentStatus: "pending",
    milestone: "First commercial pilot running in Osaka",
    velocityScore: 91,
    feasibilityRating: 4.3,
    ratingCount: 18,
    verified: true,
    globalPriority: true,
    fraudFlag: false,
    createdAt: "2025-09-15",
    updatedAt: "2026-03-24",
    updateHistory: [
      { date: "2026-03-24", field: "media" },
      { date: "2026-03-18", field: "explanation" },
      { date: "2026-03-12", field: "milestone" },
    ],
    category: "Clean Energy",
  },
  {
    id: "4",
    title: "Piezo-Kinetic Road Surface",
    inventor: "Eng. Maria Santos",
    inventorId: "u4",
    location: "São Paulo, Brazil",
    thumbnail: "",
    gallery: [],
    explanation: "Road tiles embedded with piezoelectric crystals that harvest kinetic energy from vehicle traffic. A single highway kilometer generates enough electricity to power 200 homes continuously.",
    useCase: "Infrastructure-integrated energy harvesting",
    industrialApplication: "Smart cities, highway systems, parking structures",
    prototypeDate: "2025-05-30",
    patentStatus: "granted",
    milestone: "500m test strip active on BR-101 highway",
    velocityScore: 76,
    feasibilityRating: 4.1,
    ratingCount: 14,
    verified: true,
    globalPriority: false,
    fraudFlag: false,
    createdAt: "2025-02-20",
    updatedAt: "2026-02-28",
    updateHistory: [
      { date: "2026-02-28", field: "explanation" },
    ],
    category: "Infrastructure",
  },
  {
    id: "5",
    title: "Mycelium-Based Structural Composite",
    inventor: "Dr. Aisha Bello",
    inventorId: "u5",
    location: "Lagos, Nigeria",
    thumbnail: "",
    gallery: [],
    explanation: "A building material grown from engineered fungal mycelium networks that exceeds the compressive strength of concrete while being fully biodegradable. Fire-resistant up to 800°C with zero carbon footprint in production.",
    useCase: "Sustainable construction material replacement",
    industrialApplication: "Residential construction, packaging, insulation",
    prototypeDate: "2025-07-12",
    patentStatus: "filed",
    milestone: "Two-story test structure standing for 8 months",
    velocityScore: 82,
    feasibilityRating: 4.0,
    ratingCount: 9,
    verified: false,
    globalPriority: false,
    fraudFlag: false,
    createdAt: "2025-05-01",
    updatedAt: "2026-03-10",
    updateHistory: [
      { date: "2026-03-10", field: "media" },
      { date: "2026-02-20", field: "explanation" },
    ],
    category: "Materials",
  },
];

const defaultUsers: User[] = [
  { id: "u1", name: "Dr. Elena Voss", email: "elena@quantum.de", password: "inventor123", role: "inventor", verified: true, banned: false, joinedAt: "2025-06-01", inventionCount: 1 },
  { id: "u2", name: "Prof. Kwame Asante", email: "kwame@neuralmesh.gh", password: "inventor123", role: "inventor", verified: true, banned: false, joinedAt: "2025-04-10", inventionCount: 1 },
  { id: "u3", name: "Dr. Yuki Tanaka", email: "yuki@carboncrystal.jp", password: "inventor123", role: "inventor", verified: true, banned: false, joinedAt: "2025-09-15", inventionCount: 1 },
  { id: "u4", name: "Eng. Maria Santos", email: "maria@piezokinetic.br", password: "inventor123", role: "inventor", verified: true, banned: false, joinedAt: "2025-02-20", inventionCount: 1 },
  { id: "u5", name: "Dr. Aisha Bello", email: "aisha@mycelium.ng", password: "inventor123", role: "inventor", verified: false, banned: false, joinedAt: "2025-05-01", inventionCount: 1 },
];

export function getInventions(): Invention[] {
  const stored = localStorage.getItem(INVENTIONS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(INVENTIONS_KEY, JSON.stringify(defaultInventions));
  return defaultInventions;
}

export function saveInventions(inventions: Invention[]) {
  localStorage.setItem(INVENTIONS_KEY, JSON.stringify(inventions));
}

export function getUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getMessages(): Message[] {
  const stored = localStorage.getItem(MESSAGES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveMessages(messages: Message[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}

export function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || "12345678";
}

export function setAdminPassword(pw: string) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, pw);
}

export function getFraudReports(): FraudReport[] {
  const stored = localStorage.getItem(FRAUD_REPORTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveFraudReports(reports: FraudReport[]) {
  localStorage.setItem(FRAUD_REPORTS_KEY, JSON.stringify(reports));
}

export function getTopInventions(count: number = 3): Invention[] {
  const all = getInventions().filter(i => i.verified);
  return all
    .sort((a, b) => {
      if (a.globalPriority && !b.globalPriority) return -1;
      if (!a.globalPriority && b.globalPriority) return 1;
      const scoreA = a.velocityScore * 0.6 + a.feasibilityRating * 20 * 0.4;
      const scoreB = b.velocityScore * 0.6 + b.feasibilityRating * 20 * 0.4;
      return scoreB - scoreA;
    })
    .slice(0, count);
}

export function calculateVelocity(history: { date: string; field: string }[]): number {
  if (history.length < 2) return history.length * 30;
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let totalDelta = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = new Date(sorted[i].date).getTime() - new Date(sorted[i + 1].date).getTime();
    totalDelta += diff;
  }
  const avgDelta = totalDelta / (sorted.length - 1);
  const daysAvg = avgDelta / (1000 * 60 * 60 * 24);
  const score = Math.max(0, Math.min(100, 100 - daysAvg * 5));
  return Math.round(score);
}

export function checkFraudAnomaly(history: { date: string; field: string }[]): boolean {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentUpdates = history.filter(h => new Date(h.date).getTime() > oneHourAgo);
  return recentUpdates.length >= 10;
}
