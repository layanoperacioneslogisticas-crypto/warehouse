import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Location, LocationStatus } from "../types";

const statusColors: Record<LocationStatus, string> = {
  LIBRE: "#16a34a",
  OCUPADO: "#2563eb",
  BLOQUEADO: "#dc2626",
  DANADO: "#334155",
  CUARENTENA: "#facc15",
  PAV: "#f97316",
  NPI: "#7c3aed",
  VALIDACION: "#06b6d4",
  RESERVADO: "#a855f7"
};

type WarehouseScene3DProps = {
  locations: Location[];
  selectedLocationId?: string;
  onSelectLocation: (location: Location) => void;
};

export function WarehouseScene3D({
  locations,
  selectedLocationId,
  onSelectLocation
}: WarehouseScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const locationGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  const locationMap = useMemo(() => {
    return new Map(locations.map((location) => [location.id, location]));
  }, [locations]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc");
    scene.fog = new THREE.Fog("#f8fafc", 900, 2400);

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      5000
    );
    camera.position.set(520, 520, 920);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(420, 0, 240);

    const ambientLight = new THREE.AmbientLight("#ffffff", 1.8);
    const directionalLight = new THREE.DirectionalLight("#ffffff", 1.6);
    directionalLight.position.set(500, 800, 300);
    directionalLight.castShadow = true;

    const floorGeometry = new THREE.PlaneGeometry(2200, 1800, 20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: "#dbe4ee",
      metalness: 0.05,
      roughness: 0.9
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -45;
    floor.receiveShadow = true;

    const grid = new THREE.GridHelper(2200, 40, "#94a3b8", "#cbd5e1");
    grid.position.y = -44;

    scene.add(ambientLight, directionalLight, floor, grid);

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
      pointerRef.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);

      const intersects = raycasterRef.current.intersectObjects(
        Array.from(meshMapRef.current.values()),
        false
      );

      if (!intersects.length) return;

      const hit = intersects[0].object as THREE.Mesh;
      const locationId = hit.userData.locationId as string;
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
      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material: THREE.Material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      meshMapRef.current.clear();
    };
  }, [locationMap, onSelectLocation]);

  useEffect(() => {
    if (!sceneRef.current) return;
    if (!locationGroupRef.current) return;

    while (locationGroupRef.current.children.length > 0) {
      const child = locationGroupRef.current.children[0];
      locationGroupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
      if (child instanceof THREE.Sprite) {
        child.material.dispose();
      }
    }
    meshMapRef.current.clear();

    const locationGroup = locationGroupRef.current;

    locations.forEach((location) => {
      const width = Math.max(location.width || 160, 80);
      const depth = 80;
      const height = Math.max(location.height || 64, 40);
      const boxGeometry = new THREE.BoxGeometry(width, height, depth);
      const isSelected = location.id === selectedLocationId;
      const material = new THREE.MeshStandardMaterial({
        color: statusColors[location.status] || "#64748b",
        emissive: isSelected ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
        emissiveIntensity: isSelected ? 0.22 : 0
      });

      const mesh = new THREE.Mesh(boxGeometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(location.coordinateX, height / 2, location.coordinateY);
      mesh.userData.locationId = location.id;
      locationGroup.add(mesh);
      meshMapRef.current.set(location.id, mesh);

      const label = createSpriteLabel(location.locationCode, location.status);
      label.position.set(location.coordinateX, height + 36, location.coordinateY);
      locationGroup.add(label);
    });
  }, [locations, selectedLocationId]);

  return <div ref={mountRef} style={{ width: "100%", height: "680px", borderRadius: 18, overflow: "hidden" }} />;
}

function createSpriteLabel(locationCode: string, status: LocationStatus) {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 96;
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Sprite();
  }

  context.fillStyle = "rgba(15, 23, 42, 0.86)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = "bold 28px Segoe UI";
  context.fillText(locationCode, 20, 38);
  context.fillStyle = statusColors[status] || "#cbd5e1";
  context.font = "22px Segoe UI";
  context.fillText(status, 20, 72);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(220, 52, 1);
  return sprite;
}
