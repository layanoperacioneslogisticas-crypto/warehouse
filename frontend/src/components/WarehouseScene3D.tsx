import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Location, LocationStatus } from "../types";

const rackColors: Record<LocationStatus, string> = {
  LIBRE: "#3fd26a",
  OCUPADO: "#4b86ff",
  BLOQUEADO: "#e55353",
  DANADO: "#6b7280",
  CUARENTENA: "#f8b84f",
  PAV: "#ff9a3d",
  NPI: "#9f70ff",
  VALIDACION: "#46d6ff",
  RESERVADO: "#d1d5db"
};

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
    scene.background = new THREE.Color("#08121d");
    scene.fog = new THREE.Fog("#08121d", 1600, 4200);

    const aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
    const frustumHeight = 1100;
    const camera = new THREE.OrthographicCamera(
      (-frustumHeight * aspect) / 2,
      (frustumHeight * aspect) / 2,
      frustumHeight / 2,
      -frustumHeight / 2,
      10,
      10000
    );
    camera.position.set(980, 980, 1380);
    camera.zoom = 0.78;
    camera.updateProjectionMatrix();

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
    controls.target.set(550, 110, 320);
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.zoomSpeed = 0.85;
    controls.rotateSpeed = 0.55;
    controls.panSpeed = 0.7;
    controls.minZoom = 0.58;
    controls.maxZoom = 1.32;
    controls.minPolarAngle = Math.PI / 4.75;
    controls.maxPolarAngle = Math.PI / 2.22;

    const ambient = new THREE.AmbientLight("#d8e7ff", 0.86);
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.7);
    keyLight.position.set(980, 1350, 640);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.left = -1800;
    keyLight.shadow.camera.right = 1800;
    keyLight.shadow.camera.top = 1800;
    keyLight.shadow.camera.bottom = -1800;

    const fillLight = new THREE.PointLight("#5ea1ff", 0.72, 2600);
    fillLight.position.set(240, 360, 260);

    const rimLight = new THREE.PointLight("#b9d8ff", 0.4, 3200);
    rimLight.position.set(1250, 240, -840);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2800, 1900),
      new THREE.MeshStandardMaterial({ color: "#6e7784", roughness: 0.94, metalness: 0.08 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -8;
    floor.receiveShadow = true;

    const decorGroup = new THREE.Group();
    decorGroup.add(ambient, keyLight, fillLight, rimLight, floor);
    addWarehouseShell(decorGroup);
    addCeilingLights(decorGroup);
    addFloorZones(decorGroup);
    addAxisWidget(decorGroup);
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
      const nextAspect = width / height;
      const frustumHeight = 1100;
      cameraRef.current.left = (-frustumHeight * nextAspect) / 2;
      cameraRef.current.right = (frustumHeight * nextAspect) / 2;
      cameraRef.current.top = frustumHeight / 2;
      cameraRef.current.bottom = -frustumHeight / 2;
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
      group.remove(group.children[0]);
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

    if (sceneMode === "overview") {
      camera.position.copy(defaults.position);
      controls.target.copy(defaults.target);
      camera.zoom = defaults.zoom;
    } else if (sceneMode === "pan") {
      camera.position.copy(defaults.position);
      controls.target.copy(defaults.target);
      camera.zoom = defaults.zoom;
    } else if (targetLocation) {
      const target = new THREE.Vector3(targetLocation.coordinateX, 90, targetLocation.coordinateY);
      controls.target.copy(target);
      camera.position.set(target.x + 260, 820, target.z + 260);
      camera.zoom = sceneMode === "inspect" ? 1.1 : 0.95;
    }

    controls.enableRotate = sceneMode !== "pan";
    controls.enablePan = true;
    camera.updateProjectionMatrix();
    controls.update();
  }, [locationMap, sceneMode, selectedLocationId]);

  return <div ref={mountRef} style={{ width: "100%", height: "720px" }} />;
}

function createRack(location: Location, selected: boolean) {
  const root = new THREE.Group();
  const width = 122;
  const depth = 78;
  const levels = 4;
  const height = 286;
  const frameColor = "#215fcb";
  const beamColor = "#e78d21";
  const statusColor = rackColors[location.status] || "#94a3b8";

  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(width + 18, 4, depth + 18),
    new THREE.MeshStandardMaterial({ color: "#2d3748", roughness: 0.9 })
  );
  basePlate.receiveShadow = true;
  basePlate.position.y = 2;
  root.add(basePlate);

  const postGeometry = new THREE.BoxGeometry(7, height, 7);
  const postMaterial = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.42, roughness: 0.4 });
  const xOffset = width / 2 - 5;
  const zOffset = depth / 2 - 5;
  [
    [-xOffset, height / 2, -zOffset],
    [xOffset, height / 2, -zOffset],
    [-xOffset, height / 2, zOffset],
    [xOffset, height / 2, zOffset]
  ].forEach(([x, y, z]) => {
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.castShadow = true;
    post.position.set(x, y, z);
    root.add(post);
  });

  const beamMaterial = new THREE.MeshStandardMaterial({ color: beamColor, metalness: 0.25, roughness: 0.5 });
  const frontBeam = new THREE.BoxGeometry(width, 5, 5);
  const sideBeam = new THREE.BoxGeometry(5, 5, depth);

  for (let level = 0; level < levels; level += 1) {
    const beamY = 50 + level * 60;

    [-zOffset, zOffset].forEach((z) => {
      const beam = new THREE.Mesh(frontBeam, beamMaterial);
      beam.castShadow = true;
      beam.position.set(0, beamY, z);
      root.add(beam);
    });

    [-xOffset, xOffset].forEach((x) => {
      const beam = new THREE.Mesh(sideBeam, beamMaterial);
      beam.castShadow = true;
      beam.position.set(x, beamY, 0);
      root.add(beam);
    });
  }

  const braceMaterial = new THREE.MeshStandardMaterial({ color: "#87531b", roughness: 0.62, metalness: 0.18 });
  for (let side = -1; side <= 1; side += 2) {
    for (let level = 0; level < levels - 1; level += 1) {
      const points = [
        new THREE.Vector3(side * xOffset, 30 + level * 60, -zOffset),
        new THREE.Vector3(side * xOffset, 82 + level * 60, zOffset)
      ];
      root.add(createBrace(points[0], points[1], braceMaterial));
    }
  }

  const palletRows = derivePalletDensity(location.status);
  palletRows.forEach((fillCount, levelIndex) => {
    for (let slot = 0; slot < fillCount; slot += 1) {
      const pallet = createPallet(statusColor, selected, slot);
      pallet.position.set(-36 + slot * 24, 31 + levelIndex * 60, 0);
      root.add(pallet);
    }
  });

  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 26, 4, depth + 26)),
    new THREE.LineBasicMaterial({ color: selected ? "#ffffff" : "#facc15" })
  );
  outline.position.y = 4;
  root.add(outline);

  if (selected) {
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(width + 30, height + 8, depth + 30),
      new THREE.MeshBasicMaterial({
        color: "#86b8ff",
        transparent: true,
        opacity: 0.08
      })
    );
    glow.position.y = height / 2;
    root.add(glow);
  }

  const label = createLabel(location.locationCode, location.zone?.code || "-", selected);
  label.position.set(0, 18, depth / 2 + 24);
  root.add(label);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(width + 26, height, depth + 26),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  hitbox.position.y = height / 2;
  hitbox.userData.locationId = location.id;
  root.add(hitbox);
  root.userData.hitbox = hitbox;

  return root;
}

function createBrace(from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material) {
  const length = from.distanceTo(to);
  const geometry = new THREE.BoxGeometry(3, length, 3);
  const mesh = new THREE.Mesh(geometry, material);
  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  mesh.position.copy(midpoint);
  mesh.lookAt(to);
  mesh.rotateX(Math.PI / 2);
  return mesh;
}

function createPallet(color: string, selected: boolean, slot: number) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(24, 6, 30),
    new THREE.MeshStandardMaterial({ color: "#9a6d32", roughness: 0.76, metalness: 0.06 })
  );
  base.castShadow = true;
  group.add(base);

  const loadHeight = 18 + (slot % 2) * 10;
  const load = new THREE.Mesh(
    new THREE.BoxGeometry(22, loadHeight, 28),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: 0.08,
      emissive: selected ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
      emissiveIntensity: selected ? 0.12 : 0
    })
  );
  load.castShadow = true;
  load.position.y = 6 + loadHeight / 2;
  group.add(load);

  return group;
}

function derivePalletDensity(status: LocationStatus) {
  switch (status) {
    case "LIBRE":
      return [0, 0, 0, 0];
    case "OCUPADO":
      return [4, 4, 4, 3];
    case "RESERVADO":
      return [4, 3, 2, 1];
    case "CUARENTENA":
      return [3, 2, 1, 0];
    case "BLOQUEADO":
      return [0, 0, 0, 0];
    case "DANADO":
      return [1, 1, 0, 0];
    default:
      return [3, 2, 2, 1];
  }
}

function createLabel(locationCode: string, zoneCode: string, selected: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.Sprite();
  }

  ctx.fillStyle = selected ? "rgba(255,255,255,0.98)" : "rgba(241,245,249,0.95)";
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 16);
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  roundRect(ctx, 1.5, 1.5, canvas.width - 3, canvas.height - 3, 16);
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 44px Segoe UI";
  ctx.fillText(zoneCode, 18, 48);
  ctx.font = "24px Segoe UI";
  ctx.fillText(locationCode, 18, 88);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(90, 34, 1);
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

function addWarehouseShell(scene: THREE.Group | THREE.Scene) {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#717b88",
    roughness: 0.86,
    metalness: 0.12,
    transparent: true,
    opacity: 0.9
  });

  const walls = [
    { size: [2800, 340, 26], position: [0, 170, -950] },
    { size: [2800, 340, 26], position: [0, 170, 950] },
    { size: [26, 340, 1900], position: [-1400, 170, 0] },
    { size: [26, 340, 1900], position: [1400, 170, 0] }
  ];

  walls.forEach((wall) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]),
      wallMaterial
    );
    mesh.receiveShadow = true;
    mesh.position.set(wall.position[0], wall.position[1], wall.position[2]);
    scene.add(mesh);
  });
}

function addCeilingLights(scene: THREE.Group | THREE.Scene) {
  const lightPanelGeometry = new THREE.BoxGeometry(120, 8, 34);
  const lightPanelMaterial = new THREE.MeshStandardMaterial({
    color: "#d9e6f4",
    emissive: "#dde9ff",
    emissiveIntensity: 0.4,
    roughness: 0.25
  });

  for (let row = -2; row <= 2; row += 1) {
    for (let index = -4; index <= 4; index += 1) {
      const panel = new THREE.Mesh(lightPanelGeometry, lightPanelMaterial);
      panel.position.set(index * 280, 306, row * 290);
      scene.add(panel);
    }
  }
}

function addFloorZones(scene: THREE.Group | THREE.Scene) {
  const createZone = (x: number, z: number, width: number, depth: number, text: string) => {
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 2, depth)),
      new THREE.LineBasicMaterial({ color: "#facc15" })
    );
    outline.position.set(x, 1, z);
    scene.add(outline);

    const sprite = createFloorText(text);
    sprite.position.set(x, 10, z);
    scene.add(sprite);
  };

  createZone(-610, 650, 520, 280, "RECEPCIÓN");
  createZone(120, 610, 760, 300, "ZONA PICKING");
  createZone(1020, 650, 470, 280, "DESPACHO");
}

function createFloorText(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Sprite();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold italic 52px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, 64);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(280, 56, 1);
  sprite.material.rotation = -Math.PI / 2;
  return sprite;
}

function addAxisWidget(scene: THREE.Group | THREE.Scene) {
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
  scene.add(axis);
}
