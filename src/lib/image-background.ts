export type Rgb = { r: number; g: number; b: number };

export function colorDistance(a: Rgb, b: Rgb) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function isLightBackground(color: Rgb) {
  return color.r * 0.299 + color.g * 0.587 + color.b * 0.114 >= 165;
}

function fileName(name: string) {
  return `${name.replace(/\.[^.]+$/, "") || "peca"}-sem-fundo.png`;
}

/** Removes only light pixels connected to the image edges, preserving light details inside the garment. */
export async function removeLightBackground(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Não foi possível processar esta foto.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const image = context.getImageData(0, 0, width, height);
  const data = image.data;
  const samples: Rgb[] = [];
  const sample = (x: number, y: number) => {
    const offset = (y * width + x) * 4;
    samples.push({ r: data[offset] ?? 0, g: data[offset + 1] ?? 0, b: data[offset + 2] ?? 0 });
  };
  const step = Math.max(1, Math.floor(Math.min(width, height) / 30));
  for (let x = 0; x < width; x += step) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    sample(0, y);
    sample(width - 1, y);
  }
  const lightSamples = samples.filter(isLightBackground);
  if (lightSamples.length < samples.length * 0.55)
    throw new Error(
      "O fundo não parece claro e uniforme. Desative ‘Remover fundo’ para salvar a foto original.",
    );
  const background = lightSamples.reduce(
    (sum, value) => ({ r: sum.r + value.r, g: sum.g + value.g, b: sum.b + value.b }),
    { r: 0, g: 0, b: 0 },
  );
  background.r /= lightSamples.length;
  background.g /= lightSamples.length;
  background.b /= lightSamples.length;

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const enqueue = (index: number) => {
    if (!visited[index]) {
      visited[index] = 1;
      queue[tail++] = index;
    }
  };
  for (let x = 0; x < width; x++) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }
  while (head < tail) {
    const index = queue[head++] ?? 0;
    const offset = index * 4;
    const pixel = { r: data[offset] ?? 0, g: data[offset + 1] ?? 0, b: data[offset + 2] ?? 0 };
    const distance = colorDistance(pixel, background);
    if (!isLightBackground(pixel) || distance > 92) continue;
    data[offset + 3] = distance < 36 ? 0 : Math.round(((distance - 36) / 56) * 255);
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }
  context.putImageData(image, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Não foi possível criar o PNG."))),
      "image/png",
    ),
  );
  return new File([blob], fileName(file.name), { type: "image/png" });
}
