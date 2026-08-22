export const BATCHES = ["2030", "2029", "2028", "2027"] as const;
export const COURSES = ["CS + AI", "AI + Bio"] as const;
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
  "AI/ML Club",
  "Web Dev Club",
  "Robotics",
  "Finance",
  "Design",
  "Sports",
  "Music",
  "Open Source",
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
  "Club President",
  "Vice President",
  "Core Member",
  "Tech Lead",
  "Organizer",
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
