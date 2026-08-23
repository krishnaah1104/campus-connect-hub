export const BATCHES = ["2030", "2029", "2028", "2027"] as const;
export const COURSES = ["CS + AI", "AI + B"] as const;
export const DEGREES = ["IITM", "BITS"] as const;
export const HOSTELS = ["Uniworld 1", "Uniworld 2", "Day Scholar"] as const;

export const SKILLS = [
  "DSA",
  "Python",
  "React",
  "Machine Learning",
  "Node.js",
  "Figma",
  "Solidity",
  "C++",
  "Go",
] as const;

export const CLUBS = [
  "AI Club",
  "Robotics",
  "Open Source",
  "CP",
  "Media 404",
  "E-Cell",
  "Cultural Club",
] as const;

export const ACHIEVEMENTS = [
  "GSoC",
  "LFX",
  "ICPC Regionalist",
  "Hackathon Winner",
  "SIH Winner",
  "Open Source Contributor",
] as const;

export const ROLES = [
  "Instructor",
  "Club President",
  "Vice President",
  "Core Member",
  "Tech Lead",
  "Organizer",
  "Hostel Incharge",
] as const;

export const LIFE_STATUSES = [
  { emoji: "💼", label: "Doing internship right now" },
  { emoji: "💻", label: "Preparing for DSA & interviews" },
  { emoji: "🏡", label: "At home in my hometown" },
  { emoji: "🎮", label: "Chilling after exams" },
  { emoji: "🚀", label: "Building side projects" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export function degreeLockedFor(batch: string | null | undefined) {
  return batch === "2028" || batch === "2027";
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ACRONYM_MAP: Record<string, string> = {
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "dsa": "DSA",
  "ai/ml": "AI/ML",
  "aiml": "AI/ML",
  "ml": "ML",
  "ai": "AI",
  "nlp": "NLP",
  "cv": "CV",
  "llm": "LLM",
  "llms": "LLMs",
  "gsoc": "GSoC",
  "lfx": "LFX",
  "icpc": "ICPC",
  "sih": "SIH",
  "ui/ux": "UI/UX",
  "ui": "UI",
  "ux": "UX",
  "os": "OS",
  "dbms": "DBMS",
  "sql": "SQL",
  "nosql": "NoSQL",
  "aws": "AWS",
  "gcp": "GCP",
  "go": "Go",
  "golang": "Go",
  "js": "JavaScript",
  "ts": "TypeScript",
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "react": "React",
  "reactjs": "React",
  "react.js": "React",
  "node": "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "next": "Next.js",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "vue": "Vue.js",
  "vuejs": "Vue.js",
  "python": "Python",
  "java": "Java",
  "rust": "Rust",
  "solidity": "Solidity",
  "figma": "Figma",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "graphql": "GraphQL",
  "rest": "REST API",
  "api": "API",
  "devops": "DevOps",
  "system design": "System Design",
};

export function normalizeTag(tag: string): string {
  const trimmed = tag.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (ACRONYM_MAP[lower]) {
    return ACRONYM_MAP[lower];
  }

  return trimmed
    .split(" ")
    .map((word) => (word.length > 0 ? word[0]!.toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
}

// ══════════════════════════════════════════════════════════════
// VIBE MODE (ANONYMOUS CAMPUS MATCHING) CONSTANTS
// ══════════════════════════════════════════════════════════════

export interface AnonIdentity {
  alias: string;
  avatar: string;
}

export const ANON_IDENTITIES: readonly AnonIdentity[] = [
  { alias: "Cyber Falcon", avatar: "⚡" },
  { alias: "Neon Fox", avatar: "🦊" },
  { alias: "Night Owl", avatar: "🦉" },
  { alias: "Quantum Husky", avatar: "🚀" },
  { alias: "Shadow Wolf", avatar: "🐺" },
  { alias: "Storm Eagle", avatar: "🦅" },
  { alias: "Binary Dragon", avatar: "🐉" },
  { alias: "Pixel Shark", avatar: "🦈" },
  { alias: "Arctic Penguin", avatar: "🐧" },
  { alias: "Solar Lion", avatar: "🦁" },
  { alias: "Turbo Bee", avatar: "🐝" },
  { alias: "Polar Bear", avatar: "🐻" },
  { alias: "Glitch Butterfly", avatar: "🦋" },
  { alias: "Code Cobra", avatar: "🐍" },
  { alias: "Deep Whale", avatar: "🐳" },
  { alias: "Neon Gecko", avatar: "🦎" },
  { alias: "Ghost Otter", avatar: "🦦" },
  { alias: "Matrix Panther", avatar: "🐆" },
  { alias: "Cosmic Panda", avatar: "🐼" },
  { alias: "Rocket Cheetah", avatar: "🐆" },
  { alias: "Iron Badger", avatar: "🦡" },
  { alias: "Stealth Raven", avatar: "🐦‍⬛" },
  { alias: "Atomic Tiger", avatar: "🐯" },
  { alias: "Sonic Dolphin", avatar: "🐬" },
] as const;

export function getRandomAnonIdentity(): AnonIdentity {
  const idx = Math.floor(Math.random() * ANON_IDENTITIES.length);
  return ANON_IDENTITIES[idx]!;
}

export interface AnonTopic {
  key: string;
  label: string;
  emoji: string;
  desc: string;
}

export const ANON_TOPICS: readonly AnonTopic[] = [
  { key: "general", label: "Random Vibes", emoji: "🎲", desc: "Match with anyone across campus" },
  { key: "late_night", label: "Late Night", emoji: "🌙", desc: "For the 2 AM deep thinkers" },
  { key: "dsa_coding", label: "DSA & Code", emoji: "💻", desc: "LeetCode, projects & hackathons" },
  { key: "hostel_talk", label: "Hostel Life", emoji: "🏢", desc: "UW1, UW2 & canteen gossip" },
  { key: "chill", label: "Just Chill", emoji: "🎮", desc: "Gaming, music, anime & memes" },
] as const;

export const ANON_ICEBREAKERS = [
  "👋 Hey! Which batch are you from?",
  "🏢 Are you at Uniworld 1 or 2?",
  "📚 How are you surviving the latest DSA assignment?",
  "🍕 What's the best late-night food spot around campus?",
  "🎮 Valorant or BGMI tonight?",
  "🚀 Working on any cool side projects right now?",
  "🎵 What's on your heavy rotation on Spotify?",
  "☕ Canteen chai or Blinkit coffee?",
] as const;

