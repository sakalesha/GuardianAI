export function imageWithWidth(url: string, width: number): string {
  if (!url) return url;
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const base = url.slice(0, idx);
  const rest = url.slice(idx + marker.length);
  return `${base}${marker}f_auto,q_auto,w_${width}/${rest}`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function compressDataUrl(
  dataUrl: string,
  maxDim: number,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas is not supported in this browser."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const out = canvas.toDataURL("image/jpeg", quality);
      resolve(out.length < dataUrl.length ? out : dataUrl);
    };
    img.onerror = () => reject(new Error("The selected file could not be decoded as an image."));
    img.src = dataUrl;
  });
}

export async function fileToCompressedDataUrl(
  file: File,
  maxDim = 1600,
  quality = 0.8,
): Promise<string> {
  const raw = await fileToDataUrl(file);
  try {
    return await compressDataUrl(raw, maxDim, quality);
  } catch {
    return raw;
  }
}