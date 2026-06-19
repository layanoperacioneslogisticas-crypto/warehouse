import * as THREE from "three";

export function addWarehouseLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight("#dce8f8", 0.72);
  const hemisphere = new THREE.HemisphereLight("#b9d7ff", "#0a1220", 0.65);

  const keyLight = new THREE.DirectionalLight("#ffffff", 2.1);
  keyLight.position.set(1100, 1600, 900);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 4096;
  keyLight.shadow.mapSize.height = 4096;
  keyLight.shadow.camera.near = 100;
  keyLight.shadow.camera.far = 4200;
  keyLight.shadow.camera.left = -2000;
  keyLight.shadow.camera.right = 2000;
  keyLight.shadow.camera.top = 2000;
  keyLight.shadow.camera.bottom = -2000;

  const fillLight = new THREE.DirectionalLight("#74aaff", 0.7);
  fillLight.position.set(-900, 600, -700);

  const warmLight = new THREE.PointLight("#d9a75a", 0.45, 2600);
  warmLight.position.set(380, 360, 180);

  scene.add(ambient, hemisphere, keyLight, fillLight, warmLight);

  return { ambient, hemisphere, keyLight, fillLight, warmLight };
}
