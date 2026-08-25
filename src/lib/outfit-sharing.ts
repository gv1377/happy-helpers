import type { Outfit } from "@/lib/closet";
import { createSignedUrl } from "@/lib/storage";
import { getOutfitSlot, type OutfitSlot } from "@/lib/outfit-layout";

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

function drawContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

export async function createOutfitCard(
  outfit: Outfit & { items: Array<{ image_url: string | null; category: string }> },
) {
  const sources = (
    await Promise.all(
      outfit.items.slice(0, 6).map(async (item) => ({
        item,
        url: item.image_url ? await createSignedUrl("clothing", item.image_url) : null,
      })),
    )
  ).filter((source): source is { item: (typeof outfit.items)[number]; url: string } =>
    Boolean(source.url),
  );
  const images = await Promise.all(
    sources.map(async (source) => ({ ...source, image: await loadImage(source.url) })),
  );
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
  const slots: Record<OutfitSlot, [number, number, number, number]> = {
    top: [270, 205, 540, 420],
    bottom: [270, 545, 540, 570],
    dress: [250, 215, 580, 880],
    outerwear: [225, 185, 630, 610],
    shoes: [330, 1060, 420, 165],
    accessory: [800, 310, 210, 230],
  };
  const order: OutfitSlot[] = ["dress", "bottom", "top", "outerwear", "shoes", "accessory"];
  const counts = new Map<OutfitSlot, number>();
  images
    .sort(
      (a, b) =>
        order.indexOf(getOutfitSlot(a.item.category)) -
        order.indexOf(getOutfitSlot(b.item.category)),
    )
    .forEach(({ image, item }) => {
      const slot = getOutfitSlot(item.category);
      const count = counts.get(slot) ?? 0;
      counts.set(slot, count + 1);
      const [x, y, width, height] = slots[slot];
      drawContain(
        ctx,
        image,
        slot === "accessory" && count % 2 ? 70 : x,
        y + Math.floor(count / 2) * 245,
        width,
        height,
      );
    });
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
