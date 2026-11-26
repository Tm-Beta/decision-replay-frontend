export type ThemeMode = "dark" | "light";
export type CharacterId = "sprout" | "lumi" | "pebble" | "spark" | "mochi" | "nova";
export type CharacterAccessory = "none" | "leaf" | "halo" | "glasses" | "bowtie" | "crown";
export type CharacterEnergy = "calm" | "lively" | "minimal";
export type CharacterTone = "warm" | "direct" | "socratic" | "playful";
export type CharacterChattiness = "concise" | "balanced" | "detailed";
export type CharacterShape = "classic" | "tall" | "chubby" | "drop";
export type CharacterEyes = "dots" | "starry" | "calm";
export type UserRole =
  | "student"
  | "professional"
  | "founder"
  | "creator"
  | "parent"
  | "researcher"
  | "explorer"
  | "mindful"
  | "other";
export type AgeGroup = "under_20" | "20_26" | "27_35" | "36_45" | "46_plus";
export type UserGoal =
  | "life_career"
  | "ideas_projects"
  | "daily_habits"
  | "tough_calls"
  | "studies_skills"
  | "money_investing"
  | "relationships"
  | "creative_growth"
  | "other";

export interface UserPersona {
  role?: UserRole;
  customRole?: string;
  ageGroup?: AgeGroup;
  goal?: UserGoal;
  customGoal?: string;
}

export interface CharacterPreferences {
  id: CharacterId;
  name: string;
  color: "auto" | string;
  shape?: CharacterShape;
  eyes?: CharacterEyes;
  accessory: CharacterAccessory;
  energy: CharacterEnergy;
  tone: CharacterTone;
  chattiness: CharacterChattiness;
}

export interface UserPreferences {
  onboardingCompleted?: boolean;
  themeMode: ThemeMode;
  presetId: string;
  primaryColor: string;
  accentColor: string;
  vortexIntensity: number;
  defaultLanding: "/" | "/decisions" | "/dna";
  defaultReviewDays?: number;
  showFloatingArt: boolean;
  persona?: UserPersona;
  character: CharacterPreferences;
}

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  themeMode: ThemeMode;
  primaryColor: string;
  accentColor: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight-velvet",
    name: "Midnight Velvet",
    tagline: "Plum & Electric Spring",
    themeMode: "dark",
    primaryColor: "#D88CD4",
    accentColor: "#00E58A",
  },
  {
    id: "butter-plum",
    name: "Butter Cream",
    tagline: "Warm Ivory & Royal Plum",
    themeMode: "light",
    primaryColor: "#5D225A",
    accentColor: "#00C476",
  },
  {
    id: "forest-sage",
    name: "Forest Sage",
    tagline: "Deep Pine & Mint Glow",
    themeMode: "dark",
    primaryColor: "#6EE7B7",
    accentColor: "#34D399",
  },
  {
    id: "ocean-aurora",
    name: "Ocean Aurora",
    tagline: "Cobalt Sky & Cyan Spark",
    themeMode: "dark",
    primaryColor: "#7DD3FC",
    accentColor: "#22D3EE",
  },
  {
    id: "amber-dusk",
    name: "Amber Dusk",
    tagline: "Sunset Gold & Rose Coral",
    themeMode: "dark",
    primaryColor: "#FBBF24",
    accentColor: "#FB7185",
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    tagline: "Electric Violet & Sky",
    themeMode: "dark",
    primaryColor: "#A5B4FC",
    accentColor: "#38BDF8",
  },
];

export const CHARACTER_CATALOG: Record<
  CharacterId,
  {
    id: CharacterId;
    defaultName: string;
    title: string;
    description: string;
    defaultColor: string;
    defaultAccessory: CharacterAccessory;
  }
> = {
  sprout: {
    id: "sprout",
    defaultName: "Sprout",
    title: "The Curious Sprout",
    description: "Gentle and growing — celebrates small wins and patient reflection.",
    defaultColor: "#34D399",
    defaultAccessory: "leaf",
  },
  lumi: {
    id: "lumi",
    defaultName: "Lumi",
    title: "The Star Lantern",
    description: "Calm and luminous — brings quiet clarity before big choices.",
    defaultColor: "#A78BFA",
    defaultAccessory: "halo",
  },
  pebble: {
    id: "pebble",
    defaultName: "Pebble",
    title: "The Wise Owl",
    description: "Analytical and grounded — spots assumptions and hidden patterns.",
    defaultColor: "#38BDF8",
    defaultAccessory: "glasses",
  },
  spark: {
    id: "spark",
    defaultName: "Spark",
    title: "Comet Spirit",
    description: "Bold & action-focused",
    defaultColor: "#FB923C",
    defaultAccessory: "none",
  },
  mochi: {
    id: "mochi",
    defaultName: "Mochi",
    title: "Sakura Bunny",
    description: "Sweet, hopeful & gentle",
    defaultColor: "#F472B6",
    defaultAccessory: "bowtie",
  },
  nova: {
    id: "nova",
    defaultName: "Nova",
    title: "Prism Bot",
    description: "Clear, crisp & logical",
    defaultColor: "#2DD4BF",
    defaultAccessory: "glasses",
  },
};

export function createRandomStyle(): Partial<UserPreferences> {
  const charIds: CharacterId[] = ["sprout", "lumi", "pebble", "spark", "mochi", "nova"];
  const shapes: CharacterShape[] = ["classic", "tall", "chubby", "drop"];
  const eyes: CharacterEyes[] = ["dots", "starry", "calm"];
  const accessories: CharacterAccessory[] = ["none", "leaf", "halo", "glasses", "bowtie", "crown"];
  const tones: CharacterTone[] = ["warm", "direct", "socratic", "playful"];
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const preset = pick(THEME_PRESETS);
  const cid = pick(charIds);
  const meta = CHARACTER_CATALOG[cid];

  return {
    themeMode: preset.themeMode,
    presetId: preset.id,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    character: {
      id: cid,
      name: meta.defaultName,
      color: "auto",
      shape: pick(shapes),
      eyes: pick(eyes),
      accessory: pick(accessories),
      energy: "lively",
      tone: pick(tones),
      chattiness: "balanced",
    },
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  onboardingCompleted: false,
  themeMode: "dark",
  presetId: "midnight-velvet",
  primaryColor: "#D88CD4",
  accentColor: "#00E58A",
  vortexIntensity: 70,
  defaultLanding: "/",
  defaultReviewDays: 7,
  showFloatingArt: true,
  character: {
    id: "sprout",
    name: "Sprout",
    color: "auto",
    shape: "classic",
    eyes: "dots",
    accessory: "leaf",
    energy: "lively",
    tone: "warm",
    chattiness: "balanced",
  },
};

export function recommendPreferencesFromPersona(
  role: UserRole,
  ageGroup: AgeGroup,
  goal: UserGoal,
): UserPreferences {
  let presetId = "midnight-velvet";
  let charId: CharacterId = "sprout";
  let accessory: CharacterAccessory = "leaf";
  let tone: CharacterTone = "warm";
  let chattiness: CharacterChattiness = "balanced";
  let energy: CharacterEnergy = "lively";

  if (role === "founder" || goal === "ideas_projects") {
    presetId = "amber-dusk";
    charId = "spark";
    accessory = ageGroup === "under_20" || ageGroup === "20_26" ? "none" : "crown";
    tone = "direct";
    chattiness = "concise";
    energy = "lively";
  } else if (role === "researcher") {
    presetId = "royal-indigo";
    charId = "nova";
    accessory = "glasses";
    tone = "socratic";
    chattiness = "detailed";
    energy = "calm";
  } else if (role === "professional" || goal === "tough_calls" || ageGroup === "36_45" || ageGroup === "46_plus") {
    presetId = "ocean-aurora";
    charId = "pebble";
    accessory = "glasses";
    tone = "socratic";
    chattiness = "detailed";
    energy = "calm";
  } else if (role === "creator") {
    presetId = "midnight-velvet";
    charId = "mochi";
    accessory = "bowtie";
    tone = "playful";
    chattiness = "balanced";
    energy = "lively";
  } else if (role === "parent") {
    presetId = "butter-plum";
    charId = "sprout";
    accessory = "leaf";
    tone = "warm";
    chattiness = "concise";
    energy = "calm";
  } else if (role === "mindful" || role === "student" || goal === "daily_habits") {
    presetId = role === "mindful" ? "forest-sage" : "butter-plum";
    charId = role === "mindful" ? "mochi" : "sprout";
    accessory = role === "mindful" ? "halo" : "leaf";
    tone = "warm";
    chattiness = "balanced";
    energy = role === "mindful" ? "calm" : "lively";
  } else {
    presetId = "midnight-velvet";
    charId = "lumi";
    accessory = "halo";
    tone = "warm";
    chattiness = "balanced";
    energy = "calm";
  }

  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0];
  const charMeta = CHARACTER_CATALOG[charId];

  return {
    onboardingCompleted: true,
    themeMode: preset.themeMode,
    presetId: preset.id,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    vortexIntensity: energy === "calm" ? 55 : 75,
    defaultLanding: "/",
    showFloatingArt: true,
    persona: { role, ageGroup, goal },
    character: {
      id: charId,
      name: charMeta.defaultName,
      color: "auto",
      accessory,
      energy,
      tone,
      chattiness,
    },
  };
}

export function mergePreferences(
  incoming?: Partial<UserPreferences> | null,
): UserPreferences {
  if (!incoming || typeof incoming !== "object") return DEFAULT_PREFERENCES;
  return {
    ...DEFAULT_PREFERENCES,
    ...incoming,
    character: {
      ...DEFAULT_PREFERENCES.character,
      ...(incoming.character || {}),
    },
  };
}

function parseHex(hex: string): [number, number, number] {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#00E58A";
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return [r, g, b];
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [rRaw, gRaw, bRaw] = parseHex(hex);
  const r = rRaw / 255;
  const g = gRaw / 255;
  const b = bRaw / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getRelativeLuminance(hex: string): number {
  const rgb = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Ensures any user-chosen color stays safely legible against the active dark/light surface
 * and always pairs with a high-contrast foreground color.
 */
function safeColorPair(hex: string, mode: ThemeMode) {
  const hsl = hexToHsl(hex);
  // Clamp lightness so colors never vanish into dark or light backgrounds
  const safeL =
    mode === "dark"
      ? Math.max(48, Math.min(78, hsl.l))
      : Math.max(24, Math.min(54, hsl.l));
  const lum = getRelativeLuminance(hex);
  // Estimate effective luminance from clamped lightness if extreme
  const useDarkText = mode === "dark" ? safeL > 56 || lum > 0.36 : lum > 0.55;
  return {
    hsl: `${hsl.h} ${hsl.s}% ${safeL}%`,
    fgHsl: useDarkText ? "260 35% 9%" : "44 60% 97%",
    hue: hsl.h,
    sat: hsl.s,
  };
}

export function applyPreferencesToDom(prefs: UserPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = prefs.themeMode === "dark";

  root.classList.toggle("dark", isDark);

  const primary = safeColorPair(prefs.primaryColor, prefs.themeMode);
  const accent = safeColorPair(prefs.accentColor, prefs.themeMode);

  root.style.setProperty("--primary", primary.hsl);
  root.style.setProperty("--primary-foreground", primary.fgHsl);
  root.style.setProperty("--accent", accent.hsl);
  root.style.setProperty("--accent-foreground", accent.fgHsl);
  root.style.setProperty("--ring", accent.hsl);

  // Subtle adaptive surface tint derived cleanly from primary hue (capped saturation so text stays crisp)
  const tintS = Math.min(26, Math.round(primary.sat * 0.45));
  if (isDark) {
    root.style.setProperty("--background", `${primary.hue} ${tintS}% 7%`);
    root.style.setProperty("--card", `${primary.hue} ${Math.max(8, tintS - 2)}% 11%`);
    root.style.setProperty("--secondary", `${primary.hue} ${tintS}% 17%`);
    root.style.setProperty("--muted", `${primary.hue} ${Math.max(8, tintS - 4)}% 15%`);
    root.style.setProperty("--border", `${primary.hue} ${Math.max(8, tintS - 3)}% 20%`);
  } else {
    root.style.setProperty("--background", `${primary.hue} ${Math.min(35, tintS + 10)}% 97%`);
    root.style.setProperty("--card", `${primary.hue} 30% 99%`);
    root.style.setProperty("--secondary", `${primary.hue} ${Math.min(30, tintS + 6)}% 93%`);
    root.style.setProperty("--muted", `${primary.hue} ${Math.min(24, tintS)}% 92%`);
    root.style.setProperty("--border", `${primary.hue} 18% 86%`);
  }

  root.style.setProperty("--vortex-opacity", String((prefs.vortexIntensity ?? 70) / 100));
  root.dataset.energy = prefs.character.energy;
}

