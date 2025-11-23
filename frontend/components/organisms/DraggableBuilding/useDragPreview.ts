import { useEffect } from 'react';

export default function useDragPreview(preview: any, building: any, imageForBuilding: (b: any) => string) {
  useEffect(() => {
    if (!preview) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageForBuilding(building);
    const handleLoad = () => {
      try {
        preview(img, { offsetX: img.width / 2, offsetY: img.height / 2 });
      } catch {}
    };

    img.addEventListener('load', handleLoad);
    return () => img.removeEventListener('load', handleLoad);
  }, [preview, building, imageForBuilding]);
}
