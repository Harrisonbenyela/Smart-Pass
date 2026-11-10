// Crop to a square and shrink to a small JPEG data URL (keeps the database light).
export function shrinkImage(file, size = 160) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(c.toDataURL('image/jpeg', 0.72));
    };
    img.src = URL.createObjectURL(file);
  });
}
