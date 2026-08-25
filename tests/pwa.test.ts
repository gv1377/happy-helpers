import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const publicUrl = (src: string) => new URL(`../public/${src.replace(/^\//, "")}`, import.meta.url);

test("manifesto possui requisitos de instalação Android e iOS", async () => {
  const manifest = JSON.parse(await readFile(publicUrl("manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.ok(
    manifest.icons.some(
      (icon: { sizes: string; purpose: string }) =>
        icon.sizes === "192x192" && icon.purpose === "any",
    ),
  );
  assert.ok(
    manifest.icons.some(
      (icon: { sizes: string; purpose: string }) =>
        icon.sizes === "512x512" && icon.purpose === "maskable",
    ),
  );
});

test("todos os ícones PNG existem e têm dimensões corretas", async () => {
  for (const [file, expected] of [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["icon-maskable-512.png", 512],
    ["apple-touch-icon.png", 180],
  ] as const) {
    const bytes = await readFile(publicUrl(file));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(bytes.readUInt32BE(16), expected);
    assert.equal(bytes.readUInt32BE(20), expected);
  }
});

test("service worker oferece página offline", async () => {
  const worker = await readFile(publicUrl("sw.js"), "utf8");
  assert.match(worker, /offline\.html/);
  assert.ok((await readFile(publicUrl("offline.html"), "utf8")).includes("Você está offline"));
});
