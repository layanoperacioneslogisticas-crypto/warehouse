import * as THREE from "three";
import { getRackBeamMaterial, getRackDeckMaterial } from "./WarehouseMaterials";

type RackLevelOptions = {
  width: number;
  depth: number;
  y: number;
  selected?: boolean;
};

export function createRackLevel({ width, depth, y, selected = false }: RackLevelOptions) {
  const group = new THREE.Group();
  const beamMaterial = getRackBeamMaterial();
  const deckMaterial = getRackDeckMaterial();

  const frontBeam = new THREE.Mesh(new THREE.BoxGeometry(width, 5.5, 6), beamMaterial);
  frontBeam.castShadow = true;
  frontBeam.position.set(0, y, depth / 2 - 4);
  group.add(frontBeam);

  const rearBeam = new THREE.Mesh(new THREE.BoxGeometry(width, 5.5, 6), beamMaterial);
  rearBeam.castShadow = true;
  rearBeam.position.set(0, y, -(depth / 2 - 4));
  group.add(rearBeam);

  const leftBeam = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5.5, depth), beamMaterial);
  leftBeam.castShadow = true;
  leftBeam.position.set(-(width / 2 - 4), y, 0);
  group.add(leftBeam);

  const rightBeam = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5.5, depth), beamMaterial);
  rightBeam.castShadow = true;
  rightBeam.position.set(width / 2 - 4, y, 0);
  group.add(rightBeam);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(width - 10, 2.2, depth - 10), deckMaterial);
  deck.receiveShadow = true;
  deck.position.set(0, y - 2.6, 0);
  group.add(deck);

  if (selected) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(width - 2, 1, depth - 2),
      new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.045 })
    );
    line.position.set(0, y - 1.6, 0);
    group.add(line);
  }

  return group;
}
