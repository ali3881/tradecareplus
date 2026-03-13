export function slugifyProjectTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripProjectHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function projectExcerpt(description: string, maxLength = 180) {
  const normalized = stripProjectHtml(description);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function sanitizeProjectHtml(input: string) {
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

export function parseProjectImages(imagesJson?: string | null) {
  if (!imagesJson) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(imagesJson);
    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [] as string[];
  }
}

export function normalizeProjectImages(images: string[], fallbackImageUrl?: string) {
  const uniqueImages = Array.from(
    new Set(images.map((item) => item.trim()).filter(Boolean))
  );

  if (fallbackImageUrl?.trim() && !uniqueImages.includes(fallbackImageUrl.trim())) {
    uniqueImages.unshift(fallbackImageUrl.trim());
  }

  return uniqueImages;
}
