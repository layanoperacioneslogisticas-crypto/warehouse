import * as THREE from "three";
import { getConcreteMaterial, getLineMaterial } from "./WarehouseMaterials";
import { createLocationLabel } from "./LocationLabel";

type ZoneFloorOptions = {
  width: number;
  depth: number;
};

export function createZoneFloor({ width, depth }: ZoneFloorOptions) {
  const group = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), getConcreteMaterial());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.position.y = -8;
  group.add(floor);

  const safety = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width - 90, 2, depth - 110)),
    getLineMaterial("#f4c542")
  );
  safety.position.y = 0.2;
  group.add(safety);

  const stagingArea = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.26, 0.8, depth * 0.16),
    new THREE.MeshStandardMaterial({
      color: "#1a2a3e",
      roughness: 0.98,
      metalness: 0.02,
      transparent: true,
      opacity: 0.95
    })
  );
  stagingArea.position.set(-width * 0.31, -7.4, depth * 0.24);
  stagingArea.receiveShadow = true;
  group.add(stagingArea);

  const pickingStrip = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.34, 0.8, depth * 0.12),
    new THREE.MeshStandardMaterial({
      color: "#132238",
      roughness: 0.96,
      metalness: 0.02,
      transparent: true,
      opacity: 0.95
    })
  );
  pickingStrip.position.set(width * 0.04, -7.4, depth * 0.16);
  pickingStrip.receiveShadow = true;
  group.add(pickingStrip);

  const receptionLabel = createLocationLabel("RECEPCION", "#f4f5f8", "decor");
  receptionLabel.position.set(-width * 0.32, 8, depth * 0.28);
  receptionLabel.rotation.x = -Math.PI / 2;
  group.add(receptionLabel);

  const pickingLabel = createLocationLabel("PICKING", "#f4f5f8", "decor");
  pickingLabel.position.set(width * 0.08, 8, depth * 0.18);
  pickingLabel.rotation.x = -Math.PI / 2;
  group.add(pickingLabel);

  const dispatchLabel = createLocationLabel("DESPACHO", "#f4f5f8", "decor");
  dispatchLabel.position.set(width * 0.33, 8, depth * 0.27);
  dispatchLabel.rotation.x = -Math.PI / 2;
  group.add(dispatchLabel);

  return group;
}
