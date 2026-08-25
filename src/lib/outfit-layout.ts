export type OutfitSlot = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "accessory";

export function getOutfitSlot(category: string): OutfitSlot {
  if (category === "Parte de cima") return "top";
  if (category === "Parte de baixo") return "bottom";
  if (category === "Vestidos") return "dress";
  if (category === "Casacos") return "outerwear";
  if (category === "Calçados") return "shoes";
  return "accessory";
}
