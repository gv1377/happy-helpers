import type { Outfit } from "@/lib/closet";
import { createSignedUrl } from "@/lib/storage";

export function safeLookFilename(name: string) {
  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `fiorella-${clean || "look"}.png`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  ctx.drawImage(
    image,
    (image.width - sourceWidth) / 2,
    (image.height - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

export async function createOutfitCard(
  outfit: Outfit & { items: Array<{ image_url: string | null }> },
) {
  const urls = (
    await Promise.all(
      outfit.items
        .slice(0, 6)
        .map((item) => (item.image_url ? createSignedUrl("clothing", item.image_url) : null)),
    )
  ).filter((url): url is string => Boolean(url));
  const images = await Promise.all(urls.map(loadImage));
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não permite criar a imagem.");
  ctx.fillStyle = "#f8f5ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2f2d29";
  ctx.textAlign = "center";
  ctx.font = "42px Georgia";
  ctx.fillText("FIORELLA", 540, 78);
  ctx.font = "62px Georgia";
  ctx.fillText(outfit.name, 540, 155);
  const columns = 2;
  const gap = 22;
  const margin = 70;
  const top = 205;
  const cellWidth = (canvas.width - margin * 2 - gap) / columns;
  const rows = Math.max(1, Math.ceil(images.length / columns));
  const cellHeight = Math.min(330, (1050 - gap * (rows - 1)) / rows);
  images.forEach((image, index) =>
    drawCover(
      ctx,
      image,
      margin + (index % columns) * (cellWidth + gap),
      top + Math.floor(index / columns) * (cellHeight + gap),
      cellWidth,
      cellHeight,
    ),
  );
  ctx.font = "26px system-ui";
  ctx.fillStyle = "#777066";
  ctx.fillText("Criado no Fiorella Closet AI", 540, 1310);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível gerar a imagem."))),
      "image/png",
      0.95,
    ),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
