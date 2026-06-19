import * as THREE from "three";
import { InventoryLocation, Location, LocationStatus } from "../../types";
import { createLocationLabel } from "./LocationLabel";
import { createPallet } from "./Pallet";
import { createRackLevel } from "./RackLevel";
import {
  getGuardMaterial,
  getHighlightMaterial,
  getRackMetalMaterial,
  getRackPalette
} from "./WarehouseMaterials";

type RackOptions = {
  selected?: boolean;
  showLabels?: boolean;
  inventory?: InventoryLocation[];
};

export function createRack(location: Location, options: RackOptions = {}) {
  const selected = options.selected ?? false;
  const showLabels = options.showLabels ?? true;
  const inventory = options.inventory ?? location.inventory ?? [];
  const palette = getRackPalette(location.status, selected);
  const isStorageRack = location.locationType === "RACK" || location.locationType === "PICKING";

  const width = isStorageRack ? 126 : 114;
  const depth = isStorageRack ? 88 : 74;
  const height = isStorageRack ? 300 : 172;
  const levelCount = isStorageRack ? 4 : 2;
  const root = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width + 18, 4, depth + 18),
    new THREE.MeshStandardMaterial({
      color: "#394553",
      roughness: 0.88,
      metalness: 0.08
    })
  );
  base.position.y = 2;
  base.receiveShadow = true;
  root.add(base);

  const footPlateGeometry = new THREE.BoxGeometry(13, 3, 14);
  const footPositions = [
    [-(width / 2 - 10), 1.5, -(depth / 2 - 8)],
    [width / 2 - 10, 1.5, -(depth / 2 - 8)],
    [-(width / 2 - 10), 1.5, depth / 2 - 8],
    [width / 2 - 10, 1.5, depth / 2 - 8]
  ];
  footPositions.forEach(([x, y, z]) => {
    const foot = new THREE.Mesh(
      footPlateGeometry,
      new THREE.MeshStandardMaterial({ color: "#525d69", roughness: 0.78, metalness: 0.06 })
    );
    foot.position.set(x, y, z);
    foot.castShadow = true;
    root.add(foot);
  });

  const columnMaterial = getRackMetalMaterial(palette.frame);
  const columnGeometry = new THREE.BoxGeometry(9, height, 9);
  const columnOffsetX = width / 2 - 7;
  const columnOffsetZ = depth / 2 - 8;

  const columns = [
    [-columnOffsetX, height / 2, -columnOffsetZ],
    [columnOffsetX, height / 2, -columnOffsetZ],
    [-columnOffsetX, height / 2, columnOffsetZ],
    [columnOffsetX, height / 2, columnOffsetZ]
  ];

  columns.forEach(([x, y, z]) => {
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(x, y, z);
    column.castShadow = true;
    root.add(column);
  });

  const upperBeam = new THREE.Mesh(
    new THREE.BoxGeometry(width + 2, 6, 6),
    getRackMetalMaterial(palette.beam)
  );
  upperBeam.position.set(0, height - 6, depth / 2 - 8);
  upperBeam.castShadow = true;
  root.add(upperBeam.clone());
  upperBeam.position.z = -(depth / 2 - 8);
  root.add(upperBeam);

  const sideBeamGeometry = new THREE.BoxGeometry(6, 6, depth - 4);
  [-1, 1].forEach((side) => {
    const beam = new THREE.Mesh(sideBeamGeometry, getRackMetalMaterial(palette.beam));
    beam.position.set(side * (width / 2 - 6), height - 6, 0);
    beam.castShadow = true;
    root.add(beam);
  });

  for (let level = 0; level < levelCount; level += 1) {
    const levelY = 42 + level * ((height - 90) / Math.max(1, levelCount - 1));
    root.add(createRackLevel({ width, depth, y: levelY, selected }));
  }

  addRearBracing(root, width, depth, height, palette.frame);
  addColumnGuards(root, width, depth);
  addAnchorPlates(root, width, depth);

  const slotPositions = getPalletSlots(width, depth, location.status, inventory.length);
  const palletCount = inventory.length > 0 ? inventory.length : derivePalletCount(location.status);
  const palletItems = inventory.length > 0 ? inventory : new Array(palletCount).fill(null);

  palletItems.slice(0, slotPositions.length).forEach((item, index) => {
    const slot = slotPositions[index];
    const highlight = getInventoryHighlight(location.status, item, selected);
    const pallet = createPallet({
      selected,
      highlight,
      locationStatus: location.status,
      inventoryItem: item || undefined
    });
    pallet.position.set(slot.x, slot.y, slot.z);
    root.add(pallet);
  });

  if (selected) {
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 28, height + 12, depth + 24)),
      new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 })
    );
    outline.position.y = (height + 12) / 2;
    root.add(outline);

    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(width + 34, height + 18, depth + 30),
      getHighlightMaterial("#7ab6ff", 0.08)
    );
    glow.position.y = (height + 18) / 2;
    root.add(glow);
  }

  if (showLabels) {
    const frontLabel = createLocationLabel(location.locationCode, palette.label, "label");
    frontLabel.position.set(0, height + 18, depth / 2 + 24);
    root.add(frontLabel);

    if (location.zone?.code) {
      const sideLabel = createLocationLabel(location.zone.code, palette.label, "label");
      sideLabel.position.set(-width / 2 - 26, 92, 0);
      sideLabel.rotation.y = -Math.PI / 2;
      root.add(sideLabel);
    }
  }

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(width + 30, height + 8, depth + 24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  hitbox.position.y = (height + 8) / 2;
  hitbox.userData.locationId = location.id;
  root.add(hitbox);
  root.userData.hitbox = hitbox;

  if (location.status === "DANADO") {
    const damageMarker = new THREE.Mesh(
      new THREE.ConeGeometry(6, 18, 5),
      getGuardMaterial()
    );
    damageMarker.position.set(width / 2 - 10, height - 18, depth / 2 - 8);
    damageMarker.rotation.z = Math.PI;
    root.add(damageMarker);
  }

  return root;
}

function addRearBracing(root: THREE.Group, width: number, depth: number, height: number, color: string) {
  const braceMaterial = getRackMetalMaterial(color);
  const braceGeometry = new THREE.BoxGeometry(4.5, height - 34, 4.5);
  const points = [
    [-(width / 2 - 10), 24, -(depth / 2 - 8), 22],
    [width / 2 - 10, 24, -(depth / 2 - 8), -22],
    [-(width / 2 - 10), 64, -(depth / 2 - 8), 62],
    [width / 2 - 10, 64, -(depth / 2 - 8), 18]
  ];

  points.forEach(([x, y, z, angle]) => {
    const brace = new THREE.Mesh(braceGeometry, braceMaterial);
    brace.position.set(Number(x), Number(y), Number(z));
    brace.rotation.z = THREE.MathUtils.degToRad(Number(angle));
    root.add(brace);
  });
}

function addColumnGuards(root: THREE.Group, width: number, depth: number) {
  const guardGeometry = new THREE.BoxGeometry(12, 32, 12);
  const guardMaterial = getGuardMaterial();
  [
    [-(width / 2 - 15), 16, -(depth / 2 - 15)],
    [width / 2 - 15, 16, -(depth / 2 - 15)],
    [-(width / 2 - 15), 16, depth / 2 - 15],
    [width / 2 - 15, 16, depth / 2 - 15]
  ].forEach(([x, y, z]) => {
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(Number(x), Number(y), Number(z));
    guard.castShadow = true;
    root.add(guard);
  });
}

function addAnchorPlates(root: THREE.Group, width: number, depth: number) {
  const plateMaterial = new THREE.MeshStandardMaterial({
    color: "#212b36",
    roughness: 0.92,
    metalness: 0.08
  });
  const plateGeometry = new THREE.BoxGeometry(14, 1.8, 18);
  [
    [-(width / 2 - 10), 0.9, -(depth / 2 - 8)],
    [width / 2 - 10, 0.9, -(depth / 2 - 8)],
    [-(width / 2 - 10), 0.9, depth / 2 - 8],
    [width / 2 - 10, 0.9, depth / 2 - 8]
  ].forEach(([x, y, z]) => {
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.set(Number(x), Number(y), Number(z));
    plate.castShadow = true;
    root.add(plate);
  });
}

function getPalletSlots(width: number, depth: number, status: LocationStatus, itemCount: number) {
  const levelHeights = [30, 90, 150, 210];
  const positions: { x: number; y: number; z: number }[] = [];
  const plan = getPalletPlan(status);
  const targetCount = itemCount > 0 ? itemCount : plan.reduce((total, count) => total + count, 0);

  for (let level = 0; level < plan.length && positions.length < targetCount; level += 1) {
    const count = plan[level];
    const xSlots = count >= 3 ? [-width * 0.28, 0, width * 0.28] : count === 2 ? [-width * 0.2, width * 0.2] : [0];
    const zOffset = level % 2 === 0 ? -5 : 5;

    for (let index = 0; index < count && positions.length < targetCount; index += 1) {
      positions.push({
        x: xSlots[Math.min(index, xSlots.length - 1)],
        y: levelHeights[level],
        z: zOffset
      });
    }
  }

  return positions;
}

function derivePalletCount(status: LocationStatus) {
  return getPalletPlan(status).reduce((total, count) => total + count, 0);
}

function getPalletPlan(status: LocationStatus) {
  switch (status) {
    case "LIBRE":
      return [0, 0, 0, 0];
    case "OCUPADO":
      return [3, 3, 2, 2];
    case "RESERVADO":
      return [2, 2, 1, 0];
    case "CUARENTENA":
      return [2, 1, 1, 0];
    case "PAV":
      return [2, 1, 1, 0];
    case "NPI":
      return [2, 1, 1, 0];
    case "VALIDACION":
      return [1, 1, 0, 0];
    case "DANADO":
      return [1, 0, 0, 0];
    case "BLOQUEADO":
      return [0, 0, 0, 0];
    default:
      return [2, 1, 1, 0];
  }
}

function getInventoryHighlight(
  status: LocationStatus,
  inventoryItem: InventoryLocation | null,
  selected: boolean
): "none" | "selected" | "nearExpiry" | "counting" | "blocked" | "damaged" {
  if (selected) return "selected";
  if (status === "BLOQUEADO") return "blocked";
  if (status === "DANADO") return "damaged";
  if (status === "VALIDACION") return "counting";

  if (inventoryItem?.expirationDate) {
    const expiration = new Date(inventoryItem.expirationDate);
    const difference = expiration.getTime() - Date.now();
    if (!Number.isNaN(expiration.getTime()) && difference <= 1000 * 60 * 60 * 24 * 30) {
      return "nearExpiry";
    }
  }

  return "none";
}
