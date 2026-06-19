import * as THREE from "three";

export function createLocationLabel(text: string, accent = "#eef6ff", layer = "label") {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const sprite = new THREE.Sprite();
    sprite.userData.layer = layer;
    return sprite;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 20);
  ctx.fillStyle = "rgba(8, 16, 26, 0.9)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = accent;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "bold 40px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, 75);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(92, 32, 1);
  sprite.userData.layer = layer;
  return sprite;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
