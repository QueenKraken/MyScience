// Gamification: Level progression and badge definitions

export interface LevelInfo {
  level: number;
  symbol: string;
  label: string;
  tagline: string;
  xpRequired: number; // Total XP needed to reach this level
}

// XP formula: XP_required(n) = 100 × n^1.7
export function calculateXpForLevel(level: number): number {
  if (level === 0) return 0;
  return Math.floor(100 * Math.pow(level, 1.7));
}

// Calculate which level a user is at based on total XP
export function calculateLevel(totalXp: number): number {
  let level = 0;
  while (calculateXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

// Get XP needed to reach next level
export function getXpForNextLevel(currentLevel: number): number {
  return calculateXpForLevel(currentLevel + 1);
}

// Get XP progress toward next level (0-1)
export function getLevelProgress(totalXp: number, currentLevel: number): {
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  const currentLevelXp = calculateXpForLevel(currentLevel);
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  
  return {
    currentLevelXp,
    nextLevelXp,
    progress: xpNeededForLevel > 0 ? xpInCurrentLevel / xpNeededForLevel : 1,
  };
}

// Level progression data (0-30)
export const LEVEL_DATA: LevelInfo[] = [
  { level: 0, symbol: "🧫", label: "Curious Newcomer", tagline: "Welcome to the lab.", xpRequired: 0 },
  { level: 1, symbol: "🔬", label: "Observer", tagline: "Zoom in — discovery starts here.", xpRequired: 100 },
  { level: 2, symbol: "💧", label: "Experimenter", tagline: "You're testing the waters.", xpRequired: 324 },
  { level: 3, symbol: "🧪", label: "Tinkerer", tagline: "Mixing ideas and insights.", xpRequired: 627 },
  { level: 4, symbol: "🔥", label: "Initiator", tagline: "You've sparked your curiosity.", xpRequired: 1025 },
  { level: 5, symbol: "⚙️", label: "Active Researcher", tagline: "Getting results.", xpRequired: 1531 },
  { level: 6, symbol: "🥼", label: "Recognised Researcher", tagline: "Your presence is known.", xpRequired: 2158 },
  { level: 7, symbol: "🧭", label: "Explorer", tagline: "New fields, new ideas.", xpRequired: 2916 },
  { level: 8, symbol: "💡", label: "Thinker", tagline: "Illuminating new directions.", xpRequired: 3816 },
  { level: 9, symbol: "📊", label: "Analyst", tagline: "Your insights are growing.", xpRequired: 4867 },
  { level: 10, symbol: "🧠", label: "Collaborator", tagline: "Connecting through knowledge.", xpRequired: 6079 },
  { level: 11, symbol: "🧰", label: "Innovator", tagline: "Building tools for others.", xpRequired: 7463 },
  { level: 12, symbol: "🧬", label: "Contributor", tagline: "Adding your piece to the puzzle.", xpRequired: 9027 },
  { level: 13, symbol: "📡", label: "Connector", tagline: "Others are tuning in.", xpRequired: 10782 },
  { level: 14, symbol: "🌌", label: "Visionary", tagline: "Your impact reaches farther.", xpRequired: 12737 },
  { level: 15, symbol: "🪐", label: "Influencer", tagline: "You orbit ideas that matter.", xpRequired: 14901 },
  { level: 16, symbol: "🌍", label: "Community Builder", tagline: "Science without borders.", xpRequired: 17284 },
  { level: 17, symbol: "🕸️", label: "Integrator", tagline: "Bringing research together.", xpRequired: 19896 },
  { level: 18, symbol: "🔭", label: "Observatory", tagline: "Guiding others through data.", xpRequired: 22745 },
  { level: 19, symbol: "💫", label: "Supernova", tagline: "Lighting up the field.", xpRequired: 25841 },
  { level: 20, symbol: "🧬", label: "Mentor", tagline: "Helping others grow.", xpRequired: 29194 },
  { level: 21, symbol: "🧱", label: "Founder", tagline: "Creating spaces for science.", xpRequired: 32813 },
  { level: 22, symbol: "⚛️", label: "Influencer", tagline: "At the core of discovery.", xpRequired: 36707 },
  { level: 23, symbol: "💥", label: "Pioneer", tagline: "Setting off new ideas.", xpRequired: 40886 },
  { level: 24, symbol: "🧿", label: "Expert", tagline: "Bringing clarity.", xpRequired: 45359 },
  { level: 25, symbol: "🌠", label: "Luminary", tagline: "Recognised for your brilliance.", xpRequired: 50137 },
  { level: 26, symbol: "🪞", label: "Visionary Mentor", tagline: "Reflecting knowledge.", xpRequired: 55229 },
  { level: 27, symbol: "🌊", label: "Trendsetter", tagline: "Shaping the current.", xpRequired: 60645 },
  { level: 28, symbol: "🧙", label: "Sage", tagline: "Wisdom through discovery.", xpRequired: 66395 },
  { level: 29, symbol: "🕊️", label: "Eternal Scholar", tagline: "Your research lives on.", xpRequired: 72488 },
  { level: 30, symbol: "♾️", label: "Timeless Innovator", tagline: "Endless curiosity, endless impact.", xpRequired: 78935 },
];

// Get level info by level number
export function getLevelInfo(level: number): LevelInfo {
  return LEVEL_DATA[level] || LEVEL_DATA[0];
}

// Badge tier type
export type BadgeTier = "Common" | "Rare" | "Epic" | "Legendary";

// Badge trigger type
export type BadgeTrigger = 
  | "create_account"
  | "connect_orcid"
  | "complete_profile"
  | "first_save"
  | "first_like"
  | "create_discussion"
  | "follow_5_users"
  | "create_reading_list"
  | "paper_cited"
  | "tagged_mentor"
  | "reach_1000_followers"
  | "spotlight_feature"
  | "contribute_open_science"
  | "reach_level_30";

// Badge definition interface
export interface BadgeDefinition {
  name: string;
  trigger: BadgeTrigger;
  points: number;
  message: string;
  tier: BadgeTier;
}

// All badge definitions
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    name: "First Steps",
    trigger: "create_account",
    points: 50,
    message: "Welcome to MyScience!",
    tier: "Common",
  },
  {
    name: "Identity Verified",
    trigger: "connect_orcid",
    points: 100,
    message: "Your research identity is live.",
    tier: "Rare",
  },
  {
    name: "Profile Complete",
    trigger: "complete_profile",
    points: 70,
    message: "You're ready to be discovered.",
    tier: "Common",
  },
  {
    name: "First Save",
    trigger: "first_save",
    points: 30,
    message: "You've captured your first discovery.",
    tier: "Common",
  },
  {
    name: "First Like",
    trigger: "first_like",
    points: 10,
    message: "Science deserves appreciation.",
    tier: "Common",
  },
  {
    name: "Community Starter",
    trigger: "create_discussion",
    points: 25,
    message: "You've sparked conversation.",
    tier: "Rare",
  },
  {
    name: "Connector",
    trigger: "follow_5_users",
    points: 20,
    message: "Connections create discovery.",
    tier: "Common",
  },
  {
    name: "Curator",
    trigger: "create_reading_list",
    points: 15,
    message: "Sharing your taste in science.",
    tier: "Rare",
  },
  {
    name: "Cited!",
    trigger: "paper_cited",
    points: 50,
    message: "Others are building on your ideas.",
    tier: "Epic",
  },
  {
    name: "Mentor",
    trigger: "tagged_mentor",
    points: 150,
    message: "Helping others grow in science.",
    tier: "Epic",
  },
  {
    name: "Influencer",
    trigger: "reach_1000_followers",
    points: 200,
    message: "Your impact echoes.",
    tier: "Legendary",
  },
  {
    name: "Luminary",
    trigger: "spotlight_feature",
    points: 100,
    message: "Shining in your field.",
    tier: "Legendary",
  },
  {
    name: "Open Scientist",
    trigger: "contribute_open_science",
    points: 250,
    message: "Advancing open science.",
    tier: "Epic",
  },
  {
    name: "Immortal",
    trigger: "reach_level_30",
    points: 0,
    message: "Endless curiosity, timeless science.",
    tier: "Legendary",
  },
];
