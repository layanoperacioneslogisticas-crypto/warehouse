import * as THREE from "three";
import { InventoryLocation, LocationStatus } from "../../types";
import { createBoxStack } from "./BoxStack";
import { getGuardMaterial, getHighlightMaterial, getPalletMaterial, getRackPalette } from "./WarehouseMaterials";

type PalletOptions = {
  selected?: boolean;
  highlight?: "none" | "selected" | "nearExpiry" | "counting" | "blocked" | "damaged";
  locationStatus: LocationStatus;
  inventoryItem?: InventoryLocation;
};

export function createPallet({
  selected = false,
  highlight = "none",
  locationStatus,
  inventoryItem
}: PalletOptions) {
  const group = new THREE.Group();
  const palletBase = new THREE.Mesh(new THREE.BoxGeometry(22, 4, 28), getPalletMaterial());
  palletBase.castShadow = true;
  palletBase.receiveShadow = true;
  group.add(palletBase);

  const slatMaterial = getPalletMaterial();
  const slatPositions = [-8, 0, 8];
  slatPositions.forEach((offset) => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.5, 26), slatMaterial);
    slat.position.set(offset, 1.75, 0);
    slat.castShadow = true;
    group.add(slat);
  });

  const quantity = inventoryItem ? Math.max(1, Math.ceil(inventoryItem.quantity / 5)) : 5;
  const accent = getRackPalette(locationStatus, selected).accent;
  const stack = createBoxStack({
    quantity,
    accentColor: highlight === "nearExpiry" ? "#f59e0b" : accent,
    selected
  });
  stack.position.y = 4.2;
  group.add(stack);

  if (highlight !== "none") {
    const glowColor = highlight === "blocked" || highlight === "damaged" ? "#ef4444" : highlight === "counting" ? "#46a6ff" : "#f59e0b";
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(28, 15, 34),
      getHighlightMaterial(glowColor, 0.18)
    );
    glow.position.y = 7;
    group.add(glow);
  }

  if (highlight === "damaged") {
    const warning = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 8, 4),
      getGuardMaterial()
    );
    warning.position.set(0, 13, 0);
    warning.rotation.y = Math.PI / 4;
    group.add(warning);
  }

  return group;
}
