import { icons as LucideIcons, Wrench, type LucideIcon } from "lucide-react";

export const defaultServiceIconKey = "Wrench";

const legacyIconKeyMap: Record<string, string> = {
  wrench: "Wrench",
  home: "Home",
  hammer: "Hammer",
  drill: "Drill",
  "hard-hat": "HardHat",
  lightbulb: "Lightbulb",
  droplets: "Droplets",
  paintbrush: "Paintbrush",
  flame: "Flame",
  shield: "Shield",
  truck: "Truck",
};

function formatIconLabel(iconName: string) {
  return iconName.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

const generatedServiceIconOptions = Object.entries(LucideIcons)
  .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === "object")
  .map(([name, value]) => ({
    key: name,
    label: formatIconLabel(name),
    icon: value as LucideIcon,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const serviceIconOptions =
  generatedServiceIconOptions.length > 0
    ? generatedServiceIconOptions
    : [{ key: defaultServiceIconKey, label: "Wrench", icon: Wrench }];

const serviceIconMap = new Map<string, LucideIcon>(serviceIconOptions.map((option) => [option.key, option.icon]));

export function normalizeServiceIconKey(iconKey: string) {
  if (serviceIconMap.has(iconKey)) {
    return iconKey;
  }

  return legacyIconKeyMap[iconKey] || defaultServiceIconKey;
}

export function getServiceIcon(iconKey: string) {
  return serviceIconMap.get(normalizeServiceIconKey(iconKey)) || Wrench;
}

export function slugifyServiceTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripServiceHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function serviceExcerpt(description: string, maxLength = 180) {
  const normalized = stripServiceHtml(description);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function sanitizeServiceHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sstyle='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}
