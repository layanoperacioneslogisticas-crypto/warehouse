import * as THREE from "three";
import { LocationStatus } from "../../types";

let concreteTexture: THREE.CanvasTexture | null = null;
let woodTexture: THREE.CanvasTexture | null = null;
let cartonTexture: THREE.CanvasTexture | null = null;

export function getRackPalette(status: LocationStatus, selected: boolean) {
  const base = status === "BLOQUEADO"
    ? "#d14a4a"
    : status === "CUARENTENA"
      ? "#d99b26"
      : status === "DANADO"
        ? "#9ca3af"
        : status === "PAV"
          ? "#d28b2d"
          : status === "NPI"
            ? "#7c5cf2"
            : status === "VALIDACION"
              ? "#46a6ff"
              : "#2b6fda";

  return {
    frame: base,
    beam: "#ee8a17",
    brace: "#6d3f10",
    deck: "#364252",
    guard: "#f0b400",
    accent: selected ? "#ffffff" : "#a8c5ff",
    label: selected ? "#ffffff" : "#eff6ff"
  };
}

export function getRackMetalMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.82
  });
}

export function getRackBeamMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#ee8a17",
    roughness: 0.46,
    metalness: 0.34
  });
}

export function getRackDeckMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#314050",
    roughness: 0.9,
    metalness: 0.08
  });
}

export function getGuardMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#f0b400",
    roughness: 0.42,
    metalness: 0.1,
    emissive: "#3d2500",
    emissiveIntensity: 0.12
  });
}

export function getPalletMaterial() {
  return new THREE.MeshStandardMaterial({
    map: getWoodTexture(),
    color: "#9f6a38",
    roughness: 0.9,
    metalness: 0.02
  });
}

export function getCartonMaterial() {
  return new THREE.MeshStandardMaterial({
    map: getCartonTexture(),
    color: "#cda67b",
    roughness: 0.98,
    metalness: 0.01
  });
}

export function getConcreteMaterial() {
  return new THREE.MeshStandardMaterial({
    map: getConcreteTexture(),
    color: "#5a6270",
    roughness: 1,
    metalness: 0.02
  });
}

export function getHighlightMaterial(color: string, opacity = 0.18) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity
  });
}

export function getLineMaterial(color: string) {
  return new THREE.LineBasicMaterial({ color });
}

function getConcreteTexture() {
  if (concreteTexture) return concreteTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    concreteTexture = new THREE.CanvasTexture(canvas);
    return concreteTexture;
  }

  ctx.fillStyle = "#596270";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 2200; index += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 1 + Math.random() * 2;
    const tone = 78 + Math.random() * 42;
    ctx.fillStyle = `rgba(${tone}, ${tone + 4}, ${tone + 9}, ${0.05 + Math.random() * 0.05})`;
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 9; index += 1) {
    ctx.beginPath();
    ctx.moveTo(0, (canvas.height / 9) * index);
    ctx.lineTo(canvas.width, (canvas.height / 9) * index);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 208, 76, 0.12)";
  ctx.lineWidth = 6;
  for (let index = 0; index < 4; index += 1) {
    const x = index * 128 + 32;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  concreteTexture = new THREE.CanvasTexture(canvas);
  concreteTexture.wrapS = THREE.RepeatWrapping;
  concreteTexture.wrapT = THREE.RepeatWrapping;
  concreteTexture.repeat.set(6, 4);
  return concreteTexture;
}

function getWoodTexture() {
  if (woodTexture) return woodTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    woodTexture = new THREE.CanvasTexture(canvas);
    return woodTexture;
  }

  ctx.fillStyle = "#a76f3d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 14; index += 1) {
    const y = index * 18 + 4;
    ctx.fillStyle = index % 2 === 0 ? "#8f5d2d" : "#c17f46";
    ctx.fillRect(0, y, canvas.width, 11);
  }

  ctx.strokeStyle = "rgba(75, 41, 18, 0.38)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 7; index += 1) {
    const x = index * 36 + 10;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let index = 0; index < 14; index += 1) {
    ctx.fillRect(12 + (index % 3) * 64, 14 + index * 16, 18, 4);
  }

  woodTexture = new THREE.CanvasTexture(canvas);
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(1.2, 1.2);
  return woodTexture;
}

function getCartonTexture() {
  if (cartonTexture) return cartonTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    cartonTexture = new THREE.CanvasTexture(canvas);
    return cartonTexture;
  }

  ctx.fillStyle = "#c89f72";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(90, 58, 22, 0.45)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 12; index += 1) {
    const y = index * 20 + 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(90, 58, 22, 0.24)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 8; index += 1) {
    const x = index * 30 + 8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let index = 0; index < 18; index += 1) {
    ctx.fillRect((index * 13) % canvas.width, 18 + (index % 4) * 50, 10, 3);
  }

  cartonTexture = new THREE.CanvasTexture(canvas);
  cartonTexture.wrapS = THREE.RepeatWrapping;
  cartonTexture.wrapT = THREE.RepeatWrapping;
  cartonTexture.repeat.set(1.5, 1.5);
  return cartonTexture;
}
