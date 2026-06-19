import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Location } from "../types";
import { createRack } from "./warehouse3d/Rack";
import { createLocationLabel } from "./warehouse3d/LocationLabel";
import { createZoneFloor } from "./warehouse3d/ZoneFloor";
import { addWarehouseLighting } from "./warehouse3d/WarehouseLighting";

const sceneWidth = 2800;
const sceneDepth = 1900;

type Props = {
  locations: Location[];
  selectedLocationId?: string;
  sceneMode?: "overview" | "focus" | "inspect" | "pan";
  showLabels?: boolean;
  showDecorations?: boolean;
  onSelectLocation: (location: Location) => void;
};

export function WarehouseScene3D({
  locations,
  selectedLocationId,
  sceneMode = "overview",
  showLabels = true,
  showDecorations = true,
  onSelectLocation
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number | null>(null);
  const interactionRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const locationGroupRef = useRef<THREE.Group | null>(null);
  const decorGroupRef = useRef<THREE.Group | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const defaultsRef = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
  } | null>(null);

  const locationMap = useMemo(() => new Map(locations.map((item) => [item.id, item])), [locations]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07111c");
    scene.fog = new THREE.Fog("#07111c", 1500, 5000);

    const aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
    const frustumHeight = 1320;
    const camera = new THREE.OrthographicCamera(
      (-frustumHeight * aspect) / 2,
      (frustumHeight * aspect) / 2,
      frustumHeight / 2,
      -frustumHeight / 2,
      10,
      12000
    );
    camera.position.set(1320, 1680, 1320);
    camera.zoom = 0.72;
    camera.lookAt(520, 110, 280);
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.target.set(520, 110, 280);
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.zoomSpeed = 0.75;
    controls.rotateSpeed = 0.35;
    controls.panSpeed = 0.55;
    controls.minZoom = 0.5;
    controls.maxZoom = 1.05;
    controls.minPolarAngle = Math.PI / 4.85;
    controls.maxPolarAngle = Math.PI / 2.16;

    addWarehouseLighting(scene);

    const decorGroup = new THREE.Group();
    decorGroup.add(createWarehouseShell());
    decorGroup.add(createZoneFloor({ width: sceneWidth, depth: sceneDepth }));
    decorGroup.add(createContextProps());
    decorGroup.add(createAxisWidget());
    scene.add(decorGroup);

    const locationGroup = new THREE.Group();
    scene.add(locationGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    locationGroupRef.current = locationGroup;
    decorGroupRef.current = decorGroup;
    defaultsRef.current = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      zoom: camera.zoom
    };

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = Math.max(mountRef.current.clientHeight, 1);
      const aspect = width / height;
      const frustumHeight = 1320;
      cameraRef.current.left = (-frustumHeight * aspect) / 2;
      cameraRef.current.right = (frustumHeight * aspect) / 2;
      cameraRef.current.top = frustumHeight / 2;
      cameraRef.current.bottom = -frustumHeight / 2;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const handleClick = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const bounds = rendererRef.current.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, cameraRef.current);
      const hits = raycaster.current.intersectObjects(Array.from(interactionRef.current.values()), false);
      if (!hits.length) return;
      const locationId = String(hits[0].object.userData.locationId);
      const location = locationMap.get(locationId);
      if (location) onSelectLocation(location);
    };

    renderer.domElement.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [locationMap, onSelectLocation]);

  useEffect(() => {
    const group = locationGroupRef.current;
    if (!group) return;

    while (group.children.length) {
      group.remove(group.children[0]);
    }
    interactionRef.current.clear();

    locations.forEach((location) => {
      const rack = createRack(location, {
        selected: location.id === selectedLocationId,
        showLabels,
        inventory: location.inventory
      });
      rack.position.set(location.coordinateX, 0, location.coordinateY);
      group.add(rack);

      const hitbox = rack.userData.hitbox as THREE.Mesh | undefined;
      if (hitbox) {
        interactionRef.current.set(location.id, hitbox);
      }
    });

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls && locations.length > 0) {
      const frame = calculateLayoutFrame(locations);
      const radius = Math.max(frame.radius, 420);
      const overviewPosition = new THREE.Vector3(
        frame.center.x + radius * 1.08,
        frame.center.y + radius * 1.42,
        frame.center.z + radius * 1.08
      );

      defaultsRef.current = {
        position: overviewPosition.clone(),
        target: frame.center.clone(),
        zoom: 0.72
      };

      if (sceneMode === "overview" || !selectedLocationId) {
        camera.position.copy(overviewPosition);
        camera.zoom = 0.72;
        controls.target.copy(frame.center);
        camera.updateProjectionMatrix();
        controls.update();
      }
    }
  }, [locations, sceneMode, selectedLocationId, showLabels]);

  useEffect(() => {
    const decorGroup = decorGroupRef.current;
    if (decorGroup) {
      decorGroup.visible = showDecorations;
    }
  }, [showDecorations]);

  useEffect(() => {
    const group = locationGroupRef.current;
    if (!group) return;

    group.traverse((object) => {
      if (object.type === "Sprite") {
        object.visible = showLabels;
      }
    });
  }, [showLabels, locations]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const defaults = defaultsRef.current;
    if (!defaults) return;

    const targetLocation = selectedLocationId ? locationMap.get(selectedLocationId) : undefined;

    if (sceneMode === "overview" || sceneMode === "pan") {
      camera.position.copy(defaults.position);
      controls.target.copy(defaults.target);
      camera.zoom = defaults.zoom;
    } else if (targetLocation) {
      const target = new THREE.Vector3(targetLocation.coordinateX, 90, targetLocation.coordinateY);
      controls.target.copy(target);
      camera.position.set(target.x + 680, target.y + 980, target.z + 680);
      camera.zoom = 0.84;
    }

    controls.enableRotate = sceneMode !== "pan";
    controls.enablePan = true;
    camera.updateProjectionMatrix();
    controls.update();
  }, [locationMap, sceneMode, selectedLocationId]);

  return <div ref={mountRef} style={{ width: "100%", height: "760px" }} />;
}

function calculateLayoutFrame(locations: Location[]) {
  const xs = locations.map((location) => location.coordinateX);
  const zs = locations.map((location) => location.coordinateY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const center = new THREE.Vector3((minX + maxX) / 2, 110, (minZ + maxZ) / 2);
  const radius = Math.max(maxX - minX, maxZ - minZ);
  return { center, radius };
}

function createWarehouseShell() {
  const shell = new THREE.Group();

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#5d6774",
    roughness: 0.9,
    metalness: 0.08,
    transparent: true,
    opacity: 0.84
  });

  const wallSpecs = [
    { size: [sceneWidth, 360, 28], position: [0, 180, -950] },
    { size: [sceneWidth, 360, 28], position: [0, 180, 950] },
    { size: [28, 360, sceneDepth], position: [-1400, 180, 0] },
    { size: [28, 360, sceneDepth], position: [1400, 180, 0] }
  ];

  wallSpecs.forEach((spec) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2]), wallMaterial);
    wall.receiveShadow = true;
    wall.position.set(spec.position[0], spec.position[1], spec.position[2]);
    shell.add(wall);
  });

  const beamMaterial = new THREE.MeshStandardMaterial({
    color: "#2f3946",
    roughness: 0.92,
    metalness: 0.1
  });

  const trussMaterial = new THREE.MeshStandardMaterial({
    color: "#202833",
    roughness: 0.95,
    metalness: 0.08
  });

  for (let row = -2; row <= 2; row += 1) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(sceneWidth - 120, 10, 18), beamMaterial);
    beam.position.set(0, 332, row * 290);
    beam.castShadow = true;
    shell.add(beam);
  }

  for (let index = -4; index <= 4; index += 1) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(16, 18, sceneDepth - 80), beamMaterial);
    rail.position.set(index * 280, 326, 0);
    rail.castShadow = true;
    shell.add(rail);
  }

  for (let index = -4; index <= 4; index += 1) {
    const trussTop = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 420), trussMaterial);
    trussTop.position.set(index * 280, 346, 0);
    trussTop.castShadow = true;
    shell.add(trussTop);

    const trussDiagonal = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 560), trussMaterial);
    trussDiagonal.position.set(index * 280, 300, 0);
    trussDiagonal.rotation.y = index % 2 === 0 ? 0.42 : -0.42;
    shell.add(trussDiagonal);
  }

  for (let row = -2; row <= 2; row += 1) {
    for (let index = -3; index <= 3; index += 1) {
      const light = new THREE.Mesh(
        new THREE.BoxGeometry(110, 8, 30),
        new THREE.MeshStandardMaterial({
          color: "#d7e6f7",
          emissive: "#d8e6ff",
          emissiveIntensity: 0.5,
          roughness: 0.2
        })
      );
      light.position.set(index * 300, 320, row * 300);
      shell.add(light);
    }
  }

  const wallRibsMaterial = new THREE.MeshStandardMaterial({
    color: "#474f5b",
    roughness: 0.95,
    metalness: 0.04
  });

  for (let index = -5; index <= 5; index += 1) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(10, 320, 14), wallRibsMaterial);
    rib.position.set(index * 220, 160, -930);
    shell.add(rib.clone());
    rib.position.z = 930;
    shell.add(rib);
  }

  const signPanel = new THREE.Mesh(
    new THREE.BoxGeometry(220, 92, 8),
    new THREE.MeshStandardMaterial({
      color: "#155f38",
      roughness: 0.55,
      metalness: 0.08,
      emissive: "#0d331f",
      emissiveIntensity: 0.16
    })
  );
  signPanel.position.set(540, 230, -900);
  shell.add(signPanel);

  const signLabel = createLocationLabel("ZONA A\nPICKING", "#f6fff7", "decor");
  signLabel.scale.set(1.7, 1.1, 1);
  signLabel.position.set(540, 230, -880);
  shell.add(signLabel);

  return shell;
}

function createAxisWidget() {
  const axis = new THREE.Group();
  const colors = { x: "#ef4444", y: "#22c55e", z: "#3b82f6" };
  const makeLine = (to: THREE.Vector3, color: string) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), to]);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
  };

  axis.add(makeLine(new THREE.Vector3(60, 0, 0), colors.x));
  axis.add(makeLine(new THREE.Vector3(0, 60, 0), colors.y));
  axis.add(makeLine(new THREE.Vector3(0, 0, 60), colors.z));
  axis.position.set(1160, 280, -760);
  return axis;
}

function createContextProps() {
  const props = new THREE.Group();
  props.add(createForklift(-960, 650, 0.08, "#f0b400"));
  props.add(createForklift(940, 690, -0.18, "#f0b400"));
  props.add(createPalletStack(-1280, 860, 0.08));
  props.add(createPalletStack(1180, 830, -0.2));
  props.add(createWarningCone(1260, 760));
  props.add(createWarningCone(-760, 480));
  props.add(createFloorPallet(200, 870, 0.12));
  props.add(createFloorPallet(760, 760, -0.08));
  return props;
}

function createForklift(x: number, z: number, rotationY: number, color: string) {
  const forklift = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    metalness: 0.18
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(110, 60, 70), bodyMaterial);
  body.position.y = 30;
  body.castShadow = true;
  forklift.add(body);

  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(55, 78, 58),
    new THREE.MeshStandardMaterial({
      color: "#1d2430",
      roughness: 0.25,
      metalness: 0.08,
      transparent: true,
      opacity: 0.9
    })
  );
  cab.position.set(12, 72, 0);
  cab.castShadow = true;
  forklift.add(cab);

  const mast = new THREE.Mesh(
    new THREE.BoxGeometry(12, 110, 10),
    new THREE.MeshStandardMaterial({
      color: "#101820",
      roughness: 0.55,
      metalness: 0.12
    })
  );
  mast.position.set(56, 82, 0);
  mast.castShadow = true;
  forklift.add(mast);

  const forks = new THREE.Mesh(
    new THREE.BoxGeometry(84, 6, 26),
    new THREE.MeshStandardMaterial({
      color: "#2b313a",
      roughness: 0.66,
      metalness: 0.18
    })
  );
  forks.position.set(112, 11, 8);
  forks.castShadow = true;
  forklift.add(forks);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: "#12161d",
    roughness: 0.95,
    metalness: 0.02
  });
  const wheelPositions = [
    [-34, 12, -34],
    [-34, 12, 34],
    [42, 12, -34],
    [42, 12, 34]
  ];
  wheelPositions.forEach(([px, py, pz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 18, 16), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(px, py, pz);
    wheel.castShadow = true;
    forklift.add(wheel);
  });

  forklift.position.set(x, -4, z);
  forklift.rotation.y = rotationY;
  return forklift;
}

function createPalletStack(x: number, z: number, rotationY: number) {
  const stack = new THREE.Group();
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: "#9d6a36",
    roughness: 0.92,
    metalness: 0.02
  });
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: "#c9a377",
    roughness: 0.96,
    metalness: 0.01
  });

  const pallet = new THREE.Mesh(new THREE.BoxGeometry(56, 6, 54), baseMaterial);
  pallet.position.y = 3;
  pallet.castShadow = true;
  stack.add(pallet);

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(24, 22, 20), boxMaterial);
      box.position.set((col - 0.5) * 26, 14, (row - 0.5) * 22);
      box.castShadow = true;
      stack.add(box);
    }
  }

  const secondLayer = new THREE.Mesh(new THREE.BoxGeometry(42, 18, 38), boxMaterial);
  secondLayer.position.y = 34;
  secondLayer.castShadow = true;
  stack.add(secondLayer);

  stack.position.set(x, -5, z);
  stack.rotation.y = rotationY;
  return stack;
}

function createWarningCone(x: number, z: number) {
  const cone = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(20, 60, 4),
    new THREE.MeshStandardMaterial({
      color: "#f97316",
      roughness: 0.72,
      metalness: 0.02
    })
  );
  body.position.y = 30;
  body.castShadow = true;
  cone.add(body);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 18, 6, 12),
    new THREE.MeshStandardMaterial({
      color: "#202833",
      roughness: 0.96,
      metalness: 0.04
    })
  );
  base.position.y = 3;
  base.castShadow = true;
  cone.add(base);

  cone.position.set(x, -5, z);
  return cone;
}

function createFloorPallet(x: number, z: number, rotationY: number) {
  const pallet = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(52, 6, 44),
    new THREE.MeshStandardMaterial({
      color: "#8f5f32",
      roughness: 0.94,
      metalness: 0.02
    })
  );
  base.position.y = 3;
  base.castShadow = true;
  pallet.add(base);

  const boxes = [
    [-14, 15, -10],
    [14, 15, -10],
    [-14, 15, 10],
    [14, 15, 10]
  ];
  boxes.forEach(([bx, by, bz]) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(18, 18, 16),
      new THREE.MeshStandardMaterial({
        color: "#b78b5e",
        roughness: 0.96,
        metalness: 0.01
      })
    );
    box.position.set(bx, by, bz);
    box.castShadow = true;
    pallet.add(box);
  });

  pallet.position.set(x, -5, z);
  pallet.rotation.y = rotationY;
  return pallet;
}
