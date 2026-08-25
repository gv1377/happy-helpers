import test from "node:test";
import assert from "node:assert/strict";
import { colorDistance, isLightBackground } from "../src/lib/image-background.ts";

test("reconhece fundos claros e rejeita cores escuras", () => {
  assert.equal(isLightBackground({ r: 245, g: 245, b: 240 }), true);
  assert.equal(isLightBackground({ r: 40, g: 45, b: 50 }), false);
});

test("calcula distância de cor para tolerar sombras suaves", () => {
  assert.equal(colorDistance({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 }), 0);
  assert.ok(colorDistance({ r: 245, g: 245, b: 245 }, { r: 225, g: 225, b: 225 }) < 36);
  assert.ok(colorDistance({ r: 250, g: 250, b: 250 }, { r: 80, g: 40, b: 20 }) > 92);
});
