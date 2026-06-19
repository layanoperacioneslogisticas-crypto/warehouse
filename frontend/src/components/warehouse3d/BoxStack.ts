import * as THREE from "three";
import { getCartonMaterial } from "./WarehouseMaterials";

type BoxStackOptions = {
  quantity: number;
  width?: number;
  depth?: number;
  height?: number;
  accentColor?: string;
  selected?: boolean;
};

export function createBoxStack({
  quantity,
  width = 18,
  depth = 14,
  height = 12,
  accentColor = "#f4be6b",
  selected = false
}: BoxStackOptions) {
  const group = new THREE.Group();
  const material = getCartonMaterial();
  const layerCount = Math.max(1, Math.min(4, Math.ceil(quantity / 8)));
  const columns = quantity > 20 ? 2 : 1;
  const rows = quantity > 14 ? 2 : 1;
  const stackHeight = Math.max(1, Math.min(3, Math.ceil(quantity / 10)));

  for (let layer = 0; layer < layerCount; layer += 1) {
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        box.castShadow = true;
        box.receiveShadow = true;
        box.position.set(
          (column - (columns - 1) / 2) * (width + 2),
          layer * (height + 0.8) + height / 2,
          (row - (rows - 1) / 2) * (depth + 1.2)
        );
        box.rotation.y = (layer + row) % 2 === 0 ? 0.03 : -0.03;
        group.add(box);
      }
    }
  }

  const strap = new THREE.Mesh(
    new THREE.BoxGeometry(width * Math.max(columns, rows) * 1.16, 1.6, depth * Math.max(columns, rows) * 1.16),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.46,
      metalness: 0.14,
      emissive: selected ? accentColor : "#000000",
      emissiveIntensity: selected ? 0.18 : 0
    })
  );
  strap.position.y = (layerCount * (height + 0.8)) / 2;
  group.add(strap);

  const summary = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.7, stackHeight * (height + 0.8) * 0.25, depth * 0.7),
    new THREE.MeshStandardMaterial({
      color: selected ? "#f3f7ff" : "#f0d2a4",
      roughness: 0.88,
      metalness: 0.02
    })
  );
  summary.position.y = layerCount * (height + 0.8) + summary.geometry.parameters.height / 2;
  summary.castShadow = true;
  group.add(summary);

  return group;
}
