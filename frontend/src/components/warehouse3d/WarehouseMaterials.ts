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
    beam: "#f59e0b",
    brace: "#7a4a14",
    deck: "#465466",
    guard: "#f8b400",
    accent: selected ? "#ffffff" : "#a8c5ff",
    label: selected ? "#ffffff" : "#eff6ff"
  };
}

export function getRackMetalMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.36,
    metalness: 0.76
  });
}

export function getRackBeamMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#f39c19",
    roughness: 0.52,
    metalness: 0.32
  });
}

export function getRackDeckMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#3c4958",
    roughness: 0.84,
    metalness: 0.12
  });
}

export function getGuardMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#f6b819",
    roughness: 0.48,
    metalness: 0.1,
    emissive: "#3b2300",
    emissiveIntensity: 0.08
  });
}

export function getPalletMaterial() {
  return new THREE.MeshStandardMaterial({
    map: getWoodTexture(),
    color: "#b07a44",
    roughness: 0.88,
    metalness: 0.02
  });
}

export function getCartonMaterial() {
  return new THREE.MeshStandardMaterial({
    map: getCartonTexture(),
    color: "#d7b18a",
    roughness: 0.96,
    metalness: 0.01
  });
}

export function getConcreteMaterial() {
  return new THREE.MeshStandardMaterial({
    map: getConcreteTexture(),
    color: "#626b78",
    roughness: 0.98,
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

  ctx.fillStyle = "#666f7c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 1800; index += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 1 + Math.random() * 2;
    const tone = 90 + Math.random() * 45;
    ctx.fillStyle = `rgba(${tone}, ${tone + 4}, ${tone + 8}, ${0.04 + Math.random() * 0.04})`;
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 7; index += 1) {
    ctx.beginPath();
    ctx.moveTo(0, (canvas.height / 7) * index);
    ctx.lineTo(canvas.width, (canvas.height / 7) * index);
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

  ctx.fillStyle = "#b57a42";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 12; index += 1) {
    const y = index * 22 + 4;
    ctx.fillStyle = index % 2 === 0 ? "#a76e38" : "#c98c56";
    ctx.fillRect(0, y, canvas.width, 14);
  }

  ctx.strokeStyle = "rgba(75, 41, 18, 0.3)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 6; index += 1) {
    const x = index * 42 + 12;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
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

  ctx.fillStyle = "#d9b98f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(90, 58, 22, 0.35)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 10; index += 1) {
    const y = index * 26 + 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(90, 58, 22, 0.2)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 6; index += 1) {
    const x = index * 42 + 8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  cartonTexture = new THREE.CanvasTexture(canvas);
  cartonTexture.wrapS = THREE.RepeatWrapping;
  cartonTexture.wrapT = THREE.RepeatWrapping;
  cartonTexture.repeat.set(1.5, 1.5);
  return cartonTexture;
}
