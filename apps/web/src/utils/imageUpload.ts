/** Client-side helper for ORTOMED demo. Accepts images up to 2 MiB and stores a resized WebP data URL. */
export const MAX_UPLOAD_IMAGE_BYTES = 2 * 1024 * 1024;
export async function prepareDemoImage(file: File, maxSide = 1100): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Sunt acceptate numai imagini JPG, PNG sau WebP.');
  }
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error('Fotografia depășește limita de 2 MB.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      if (image.complete && image.naturalWidth > 0) { resolve(); return; }
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Imaginea nu poate fi citită.'));
    });
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browserul nu poate procesa imaginea.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const webp = canvas.toDataURL('image/webp', 0.78);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}
