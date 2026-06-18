import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Location, LocationStatus } from "../types";

const rackColors: Record<LocationStatus, string> = {
  LIBRE: "#3fd26a",
  OCUPADO: "#4b86ff",
  BLOQUEADO: "#e55353",
  DANADO: "#64748b",
  CUARENTENA: "#f8b84f",
  PAV: "#ff9a3d",
  NPI: "#9f70ff",
  VALIDACION: "#46d6ff",
  RESERVADO: "#d1d5db"
};

type Props = {
  locations: Location[];
  selectedLocationId?: string;
  onSelectLocation: (location: Location) => void;
};

export function WarehouseScene3D({ locations, selectedLocationId, onSelectLocation }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number | null>(null);
  const interactionRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const locationGroupRef = useRef<THREE.Group | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());

  const locationMap = useMemo(() => new Map(locations.map((item) => [item.id, item])), [locations]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a1420");
    scene.fog = new THREE.Fog("#0a1420", 1400, 3800);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / Math.max(mount.clientHeight, 1), 1, 6000);
    camera.position.set(980, 820, 1360);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(560, 80, 320);
    controls.maxPolarAngle = Math.PI / 2.15;

    const ambient = new THREE.AmbientLight("#cfe3ff", 0.92);
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.55);
    keyLight.position.set(900, 1200, 500);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;

    const fillLight = new THREE.PointLight("#5ea1ff", 0.6, 2200);
    fillLight.position.set(250, 280, 200);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2600, 1800),
      new THREE.MeshStandardMaterial({ color: "#6e7784", roughness: 0.9, metalness: 0.08 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -8;
    floor.receiveShadow = true;

    scene.add(ambient, keyLight, fillLight, floor);
    addWarehouseShell(scene);
    addFloorZones(scene);
    addAxisWidget(scene);

    const locationGroup = new THREE.Group();
    scene.add(locationGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    locationGroupRef.current = locationGroup;

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / Math.max(mountRef.current.clientHeight, 1);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
      const child = group.children[0];
      group.remove(child);
    }
    interactionRef.current.clear();

    locations.forEach((location) => {
      const rack = createRack(location, location.id === selectedLocationId);
      rack.position.set(location.coordinateX, 0, location.coordinateY);
      group.add(rack);

      const hitbox = rack.userData.hitbox as THREE.Mesh | undefined;
      if (hitbox) {
        interactionRef.current.set(location.id, hitbox);
      }
    });
  }, [locations, selectedLocationId]);

  return <div ref={mountRef} style={{ width: "100%", height: "680px" }} />;
}

function createRack(location: Location, selected: boolean) {
  const root = new THREE.Group();
  const width = 120;
  const depth = 74;
  const levels = 4;
  const height = 270;
  const frameColor = "#1d4ed8";
  const beamColor = "#f59e0b";
  const palletColor = rackColors[location.status] || "#94a3b8";

  const postGeometry = new THREE.BoxGeometry(6, height, 6);
  const postMaterial = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.38, roughness: 0.42 });
  const xOffset = width / 2 - 4;
  const zOffset = depth / 2 - 4;
  const postPositions = [
    [-xOffset, height / 2, -zOffset],
    [xOffset, height / 2, -zOffset],
    [-xOffset, height / 2, zOffset],
    [xOffset, height / 2, zOffset]
  ];

  postPositions.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.castShadow = true;
    post.position.set(x, y, z);
    root.add(post);
  });

  const beamGeometry = new THREE.BoxGeometry(width, 4, 4);
  const sideBeamGeometry = new THREE.BoxGeometry(4, 4, depth);
  const beamMaterial = new THREE.MeshStandardMaterial({ color: beamColor, metalness: 0.24, roughness: 0.55 });

  for (let index = 0; index < levels; index += 1) {
    const beamY = 46 + index * 58;
    [-zOffset, zOffset].forEach((z) => {
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.castShadow = true;
      beam.position.set(0, beamY, z);
      root.add(beam);
    });

    [-xOffset, xOffset].forEach((x) => {
      const beam = new THREE.Mesh(sideBeamGeometry, beamMaterial);
      beam.castShadow = true;
      beam.position.set(x, beamY, 0);
      root.add(beam);
    });
  }

  const palletRows = derivePalletDensity(location.status);
  palletRows.forEach((fillCount, levelIndex) => {
    for (let slot = 0; slot < fillCount; slot += 1) {
      const pallet = new THREE.Mesh(
        new THREE.BoxGeometry(24, 26, 28),
        new THREE.MeshStandardMaterial({
          color: palletColor,
          metalness: 0.05,
          roughness: 0.72,
          emissive: selected ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
          emissiveIntensity: selected ? 0.14 : 0
        })
      );
      pallet.castShadow = true;
      pallet.position.set(-34 + slot * 23, 32 + levelIndex * 58, 0);
      root.add(pallet);
    }
  });

  const baseOutline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 24, 4, depth + 24)),
    new THREE.LineBasicMaterial({ color: selected ? "#f8fafc" : "#facc15" })
  );
  baseOutline.position.y = 2;
  root.add(baseOutline);

  const label = createLabel(location.locationCode, location.zone?.code || "-", selected);
  label.position.set(0, 12, depth / 2 + 18);
  root.add(label);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(width + 24, height, depth + 24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  hitbox.position.y = height / 2;
  hitbox.userData.locationId = location.id;
  root.add(hitbox);
  root.userData.hitbox = hitbox;

  return root;
}

function derivePalletDensity(status: LocationStatus) {
  switch (status) {
    case "LIBRE":
      return [0, 0, 0, 0];
    case "OCUPADO":
      return [4, 4, 4, 3];
    case "RESERVADO":
      return [3, 4, 2, 0];
    case "CUARENTENA":
      return [2, 2, 1, 0];
    case "BLOQUEADO":
      return [0, 0, 0, 0];
    case "DANADO":
      return [1, 0, 0, 0];
    default:
      return [2, 2, 2, 1];
  }
}

function createLabel(locationCode: string, zoneCode: string, selected: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 280;
  canvas.height = 110;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.Sprite();
  }

  ctx.fillStyle = selected ? "rgba(255,255,255,0.95)" : "rgba(230,237,247,0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#0f172a";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 42px Segoe UI";
  ctx.fillText(zoneCode, 20, 48);
  ctx.font = "22px Segoe UI";
  ctx.fillText(locationCode, 20, 86);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(82, 32, 1);
  return sprite;
}

function addWarehouseShell(scene: THREE.Scene) {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#77808d",
    roughness: 0.86,
    metalness: 0.1,
    transparent: true,
    opacity: 0.84
  });

  const walls = [
    { size: [2600, 320, 24], position: [0, 160, -900] },
    { size: [2600, 320, 24], position: [0, 160, 900] },
    { size: [24, 320, 1800], position: [-1300, 160, 0] },
    { size: [24, 320, 1800], position: [1300, 160, 0] }
  ];

  walls.forEach((wall) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]),
      wallMaterial
    );
    mesh.position.set(wall.position[0], wall.position[1], wall.position[2]);
    scene.add(mesh);
  });
}

function addFloorZones(scene: THREE.Scene) {
  const createZone = (x: number, z: number, width: number, depth: number, text: string) => {
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 2, depth)),
      new THREE.LineBasicMaterial({ color: "#facc15" })
    );
    outline.position.set(x, 1, z);
    scene.add(outline);

    const sprite = createFloorText(text);
    sprite.position.set(x, 10, z);
    sprite.rotation.x = -Math.PI / 2;
    scene.add(sprite);
  };

  createZone(-560, 620, 520, 280, "RECEPCIÓN");
  createZone(140, 600, 720, 280, "ZONA PICKING");
  createZone(960, 640, 460, 280, "DESPACHO");
}

function createFloorText(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Sprite();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "bold italic 48px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, 58);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(260, 52, 1);
  return sprite;
}

function addAxisWidget(scene: THREE.Scene) {
  const axis = new THREE.Group();
  const colors = { x: "#ef4444", y: "#22c55e", z: "#3b82f6" };
  const makeLine = (to: THREE.Vector3, color: string) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), to]);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
  };
  axis.add(makeLine(new THREE.Vector3(50, 0, 0), colors.x));
  axis.add(makeLine(new THREE.Vector3(0, 50, 0), colors.y));
  axis.add(makeLine(new THREE.Vector3(0, 0, 50), colors.z));
  axis.position.set(1080, 280, -720);
  scene.add(axis);
}
