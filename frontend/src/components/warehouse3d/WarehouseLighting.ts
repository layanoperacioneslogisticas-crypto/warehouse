import * as THREE from "three";

export function addWarehouseLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight("#dce8f8", 0.42);
  const hemisphere = new THREE.HemisphereLight("#b9d7ff", "#0a1220", 0.42);

  const keyLight = new THREE.DirectionalLight("#ffffff", 2.7);
  keyLight.position.set(1180, 1780, 860);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 4096;
  keyLight.shadow.mapSize.height = 4096;
  keyLight.shadow.camera.near = 80;
  keyLight.shadow.camera.far = 5200;
  keyLight.shadow.camera.left = -2400;
  keyLight.shadow.camera.right = 2400;
  keyLight.shadow.camera.top = 2400;
  keyLight.shadow.camera.bottom = -2400;
  keyLight.shadow.bias = -0.00015;
  keyLight.shadow.normalBias = 0.02;

  const fillLight = new THREE.DirectionalLight("#74aaff", 0.45);
  fillLight.position.set(-980, 620, -780);

  const warmLight = new THREE.PointLight("#d9a75a", 0.75, 3200);
  warmLight.position.set(380, 420, 180);

  const rimLight = new THREE.PointLight("#b1d4ff", 0.32, 3600);
  rimLight.position.set(1180, 520, -720);

  scene.add(ambient, hemisphere, keyLight, fillLight, warmLight, rimLight);

  return { ambient, hemisphere, keyLight, fillLight, warmLight, rimLight };
}
