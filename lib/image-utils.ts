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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

export async function compressImage(file: File | Blob, fileName: string): Promise<File> {
  const options = {
    maxSizeMB: 0.2, // Aim for ~200KB to stay well within 1GB limit
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  
  const compressedBlob = await imageCompression(file as File, options);
  return new File([compressedBlob], fileName, { type: 'image/jpeg' });
}

export function validateImageResolution(image: HTMLImageElement, minWidth = 600, minHeight = 600): boolean {
  return image.width >= minWidth && image.height >= minHeight;
}
