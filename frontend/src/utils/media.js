// Resize an image in the browser before upload (keeps uploads small). Videos pass through untouched.
export function resizeImage(file, maxW = 1280) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file),
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// Backend returns relative /uploads/... paths. Set VITE_ASSET_URL if the API lives on another origin.
export function assetUrl(url) {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  return (import.meta.env.VITE_ASSET_URL || '') + url;
}
