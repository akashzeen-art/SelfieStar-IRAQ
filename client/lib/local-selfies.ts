export interface LocalSelfie {
  id: string;
  image: string;
  createdAt: string;
}

const STORAGE_KEY = "selfistar_local_selfies";

export function getLocalSelfies(): LocalSelfie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalSelfie[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSelfie(imageDataUrl: string): LocalSelfie {
  const selfie: LocalSelfie = {
    id: crypto.randomUUID(),
    image: imageDataUrl,
    createdAt: new Date().toISOString(),
  };
  const next = [selfie, ...getLocalSelfies()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return selfie;
}

export function deleteLocalSelfie(id: string): void {
  const next = getLocalSelfies().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function downloadImage(dataUrl: string, filename?: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename || `selfistar-${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
