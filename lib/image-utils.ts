import imageCompression from 'browser-image-compression';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the crop
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // translate canvas context to a central point on canvas to allow flipping and rotating
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  const isPng = imageSrc.startsWith('data:image/png');

  // draw white background for transparency handling ONLY if it's a JPEG
  if (!isPng) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // draw rotated image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const mimeType = isPng ? 'image/png' : 'image/jpeg';

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, mimeType, 0.95);
  });
}

export async function compressImage(file: File | Blob, fileName: string): Promise<File> {
  const options = {
    maxSizeMB: 1, // Aumentado ligeiramente para evitar loops de compressão infinitos
    maxWidthOrHeight: 1200, // Reduzido de 2000 para 1200 (suficiente para zoom HD no catálogo web)
    useWebWorker: true,
    initialQuality: 0.8, // Força a compressão inicial a 80%, acelerando drasticamente o processo
    fileType: file.type as any, // preserve the original type
  };
  
  const compressedBlob = await imageCompression(file as File, options);
  return new File([compressedBlob], fileName, { type: file.type || 'image/jpeg' });
}

export function validateImageResolution(image: HTMLImageElement, minWidth = 600, minHeight = 600): boolean {
  return image.width >= minWidth && image.height >= minHeight;
}
