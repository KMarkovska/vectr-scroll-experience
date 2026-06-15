import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const BG = 0xdbeaf4;
const WHITE = 0xf1f7fb;
const EDGE = 0xb9cfdf;
const CYAN = 0x54dfff;
const PURPLE = 0x3317d8;

function shadowMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addBuilding(group, material, x, z, width, depth, height) {
  const building = shadowMesh(
    new RoundedBoxGeometry(width, height, depth, 3, 0.12),
    material,
  );
  building.position.set(x, height / 2, z);
  group.add(building);

  const roof = shadowMesh(
    new RoundedBoxGeometry(width * 0.52, 0.22, depth * 0.52, 2, 0.08),
    material,
  );
  roof.position.set(x, height + 0.1, z);
  group.add(roof);
}

function addWarehouse(group, material, x, z, scale = 1) {
  const base = shadowMesh(
    new RoundedBoxGeometry(3.6 * scale, 1.35 * scale, 2.6 * scale, 3, 0.15),
    material,
  );
  base.position.set(x, 0.68 * scale, z);
  group.add(base);

  const roof = shadowMesh(
    new THREE.CylinderGeometry(
      1.45 * scale,
      1.45 * scale,
      3.55 * scale,
      4,
    ),
    material,
  );
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.72;
  roof.position.set(x, 1.48 * scale, z);
  group.add(roof);
}

function addCoolingTower(group, material, x, z, scale = 1) {
  const points = [
    new THREE.Vector2(0.92, 0),
    new THREE.Vector2(0.72, 0.35),
    new THREE.Vector2(0.55, 1.25),
    new THREE.Vector2(0.68, 2.25),
  ].map((point) => point.multiplyScalar(scale));
  const tower = shadowMesh(
    new THREE.LatheGeometry(points, 32),
    material,
  );
  tower.position.set(x, 0, z);
  group.add(tower);
}

function addPerson(group, material, x, z, rotation = 0) {
  const person = new THREE.Group();
  const body = shadowMesh(
    new THREE.CapsuleGeometry(0.12, 0.46, 3, 8),
    material,
  );
  body.position.y = 0.48;
  const head = shadowMesh(new THREE.SphereGeometry(0.13, 12, 12), material);
  head.position.y = 0.96;
  person.add(body, head);
  person.position.set(x, 0, z);
  person.rotation.y = rotation;
  group.add(person);
}

function addTruck(group, material, x, z, rotation = 0) {
  const truck = new THREE.Group();
  const body = shadowMesh(
    new RoundedBoxGeometry(2.3, 0.75, 1.1, 2, 0.12),
    material,
  );
  body.position.set(0.45, 0.62, 0);
  const cab = shadowMesh(
    new RoundedBoxGeometry(0.8, 0.95, 1.05, 2, 0.12),
    material,
  );
  cab.position.set(-1, 0.67, 0);
  truck.add(body, cab);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0xa7bdcd,
    roughness: 0.9,
  });
  [-0.72, 0.75].forEach((wheelX) => {
    [-0.58, 0.58].forEach((wheelZ) => {
      const wheel = shadowMesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16),
        wheelMaterial,
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wheelX, 0.25, wheelZ);
      truck.add(wheel);
    });
  });

  truck.position.set(x, 0, z);
  truck.rotation.y = rotation;
  group.add(truck);
}

function addTurbine(group, material, x, z, scale = 1) {
  const turbine = new THREE.Group();
  const mast = shadowMesh(
    new THREE.CylinderGeometry(0.07, 0.16, 1.75, 14),
    material,
  );
  mast.position.y = 0.88;
  turbine.add(mast);

  const hub = shadowMesh(new THREE.SphereGeometry(0.13, 12, 12), material);
  hub.position.set(0, 1.76, 0.02);
  turbine.add(hub);

  for (let index = 0; index < 3; index += 1) {
    const blade = shadowMesh(
      new RoundedBoxGeometry(0.08, 0.78, 0.05, 2, 0.03),
      material,
    );
    blade.position.y = 2.12;
    blade.rotation.z = (Math.PI * 2 * index) / 3;
    blade.translateY(0.28);
    turbine.add(blade);
  }
  turbine.scale.setScalar(scale);
  turbine.position.set(x, 0, z);
  group.add(turbine);
}

function addPallet(group, material, x, z, scale = 1) {
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const box = shadowMesh(
        new RoundedBoxGeometry(0.38, 0.33, 0.38, 2, 0.04),
        material,
      );
      box.position.set(
        x + (col - 1.5) * 0.42 * scale,
        0.18,
        z + (row - 1) * 0.42 * scale,
      );
      box.scale.setScalar(scale);
      group.add(box);
    }
  }
}

function makeArrow(material) {
  const shape = new THREE.Shape();
  shape.moveTo(-2.2, -0.48);
  shape.lineTo(0.28, -0.48);
  shape.lineTo(-0.65, -1.42);
  shape.lineTo(0.03, -2.1);
  shape.lineTo(2.12, 0);
  shape.lineTo(0.03, 2.1);
  shape.lineTo(-0.65, 1.42);
  shape.lineTo(0.28, 0.48);
  shape.lineTo(-2.2, 0.48);
  shape.closePath();
  const arrow = shadowMesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSize: 0.09,
      bevelThickness: 0.08,
      bevelSegments: 3,
    }),
    material,
  );
  arrow.rotation.x = -Math.PI / 2;
  arrow.position.y = 0.18;
  return arrow;
}

function addArrivalMarker(group, material, x, z) {
  const marker = new THREE.Group();
  marker.add(makeArrow(material));

  const positions = [
    [0.2, 2.7],
    [1.65, 1.85],
    [2.45, 0.2],
    [1.65, -1.6],
    [0.2, -2.45],
  ];
  positions.forEach(([px, pz], index) => {
    const cube = shadowMesh(
      new RoundedBoxGeometry(0.55, 0.55, 0.55, 2, 0.04),
      material,
    );
    cube.position.set(px, 0.32, pz);
    cube.rotation.y = index % 2 ? Math.PI / 4 : 0;
    marker.add(cube);
  });
  marker.position.set(x, 0.1, z);
  marker.rotation.y = -0.08;
  group.add(marker);
  return marker;
}

function makeDottedField(group) {
  const dotGeometry = new THREE.CircleGeometry(0.075, 12);
  dotGeometry.rotateX(-Math.PI / 2);
  const dotMaterial = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const countX = 54;
  const countZ = 32;
  const dots = new THREE.InstancedMesh(
    dotGeometry,
    dotMaterial,
    countX * countZ,
  );
  const matrix = new THREE.Matrix4();
  let index = 0;
  for (let z = 0; z < countZ; z += 1) {
    for (let x = 0; x < countX; x += 1) {
      const px = (x - countX / 2) * 0.62;
      const pz = (z - countZ / 2) * 0.62;
      const distance = Math.hypot(px * 0.75, pz);
      const scale = THREE.MathUtils.clamp(1.2 - distance / 23, 0.22, 1);
      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(px, 0.018, pz);
      dots.setMatrixAt(index, matrix);
      index += 1;
    }
  }
  group.add(dots);
}

function buildWorld(scene) {
  const world = new THREE.Group();
  scene.add(world);

  const objectMaterial = new THREE.MeshStandardMaterial({
    color: WHITE,
    roughness: 0.82,
    metalness: 0.02,
  });
  const purpleMaterial = new THREE.MeshStandardMaterial({
    color: PURPLE,
    roughness: 0.35,
    metalness: 0.08,
    emissive: 0x120078,
    emissiveIntensity: 0.42,
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 52),
    new THREE.MeshStandardMaterial({
      color: BG,
      roughness: 1,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  world.add(ground);
  makeDottedField(world);

  addBuilding(world, objectMaterial, -8.8, 7.4, 2.4, 2.2, 3.3);
  addBuilding(world, objectMaterial, -5.8, 7.8, 1.9, 1.8, 4.4);
  addBuilding(world, objectMaterial, -3.4, 7.1, 2.5, 2.1, 3.8);
  addWarehouse(world, objectMaterial, 6.3, 7.3, 1.2);
  addPallet(world, objectMaterial, 1.8, 7.2, 1.1);
  addCoolingTower(world, objectMaterial, -0.8, 3.5, 1.15);
  addCoolingTower(world, objectMaterial, 1.8, 3.5, 1);
  addTruck(world, objectMaterial, 5.8, 1, 0.2);

  addWarehouse(world, objectMaterial, 9.8, 2.8, 0.95);
  addWarehouse(world, objectMaterial, 11.4, 5.4, 0.7);
  addWarehouse(world, objectMaterial, 9.2, 6.1, 0.62);
  addPallet(world, objectMaterial, 3.4, 0, 0.8);

  addBuilding(world, objectMaterial, -7.2, -0.7, 2.3, 2, 3);
  addBuilding(world, objectMaterial, -4.5, -1.6, 2.1, 1.8, 2.4);
  addWarehouse(world, objectMaterial, -1.5, -4.2, 0.72);
  addWarehouse(world, objectMaterial, 1.1, -4.8, 0.72);
  addWarehouse(world, objectMaterial, 3.8, -4.4, 0.72);

  for (let index = 0; index < 6; index += 1) {
    addTurbine(
      world,
      objectMaterial,
      -10.5 + (index % 3) * 2.1,
      -6.5 - Math.floor(index / 3) * 2.1,
      0.82,
    );
  }

  for (let index = 0; index < 11; index += 1) {
    addPerson(
      world,
      objectMaterial,
      -11 + ((index * 3.1) % 21),
      5 - ((index * 2.7) % 12),
      index,
    );
  }

  const tileGeometry = new RoundedBoxGeometry(0.7, 0.16, 0.7, 2, 0.08);
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const tile = shadowMesh(tileGeometry, objectMaterial);
      tile.position.set(7.4 + col * 0.82, 0.05, -6.2 + row * 0.82);
      world.add(tile);
    }
  }

  const arrival = addArrivalMarker(world, purpleMaterial, 14.5, -6.5);
  return { world, arrival };
}

function buildRoute(scene) {
  const routePoints = [
    new THREE.Vector3(-12.5, 0.3, -4.8),
    new THREE.Vector3(-10.6, 0.3, -3.5),
    new THREE.Vector3(-7.8, 0.3, -2.2),
    new THREE.Vector3(-3.5, 0.3, -1.4),
    new THREE.Vector3(0.4, 0.3, -2.1),
    new THREE.Vector3(4.4, 0.3, -3.8),
    new THREE.Vector3(9.1, 0.3, -5.9),
    new THREE.Vector3(14.2, 0.3, -6.5),
  ];
  const curve = new THREE.CatmullRomCurve3(routePoints, false, "catmullrom", 0.25);
  const segments = 360;
  const innerGeometry = new THREE.TubeGeometry(curve, segments, 0.038, 10, false);
  const glowGeometry = new THREE.TubeGeometry(curve, segments, 0.16, 10, false);
  const route = new THREE.Mesh(
    innerGeometry,
    new THREE.MeshBasicMaterial({
      color: 0x86edff,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  const glow = new THREE.Mesh(
    glowGeometry,
    new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.22,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  route.renderOrder = 4;
  glow.renderOrder = 3;
  scene.add(glow, route);

  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  scene.add(pulse);

  return { curve, route, glow, pulse };
}

function interpolateCamera(progress) {
  const keys = [
    {
      p: 0,
      position: new THREE.Vector3(0, 27, 31),
      target: new THREE.Vector3(-0.5, 0, 1.8),
    },
    {
      p: 0.18,
      position: new THREE.Vector3(-7.5, 23, 25),
      target: new THREE.Vector3(-8.5, 0, 4),
    },
    {
      p: 0.39,
      position: new THREE.Vector3(-1.2, 22, 22),
      target: new THREE.Vector3(-3, 0, 0.8),
    },
    {
      p: 0.61,
      position: new THREE.Vector3(4.7, 20, 20),
      target: new THREE.Vector3(4, 0, -3.1),
    },
    {
      p: 0.82,
      position: new THREE.Vector3(10.8, 18, 18),
      target: new THREE.Vector3(10.3, 0, -5.8),
    },
    {
      p: 1,
      position: new THREE.Vector3(14.4, 14.5, 14.5),
      target: new THREE.Vector3(14.3, 0, -6.4),
    },
  ];
  let left = keys[0];
  let right = keys[keys.length - 1];
  for (let index = 0; index < keys.length - 1; index += 1) {
    if (progress >= keys[index].p && progress <= keys[index + 1].p) {
      left = keys[index];
      right = keys[index + 1];
      break;
    }
  }
  const span = Math.max(0.001, right.p - left.p);
  const t = THREE.MathUtils.smoothstep((progress - left.p) / span, 0, 1);
  return {
    position: left.position.clone().lerp(right.position, t),
    target: left.target.clone().lerp(right.target, t),
  };
}

export const VectrScene = forwardRef(function VectrScene(_, ref) {
  const canvasRef = useRef(null);
  const apiRef = useRef({ setProgress: () => {} });

  useImperativeHandle(
    ref,
    () => ({
      setProgress(value) {
        apiRef.current.setProgress(value);
      },
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.FogExp2(BG, 0.018);

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 120);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0xb9d0df, 2.7);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xffffff, 4.5);
    key.position.set(-14, 26, 15);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -30;
    key.shadow.camera.right = 30;
    key.shadow.camera.top = 30;
    key.shadow.camera.bottom = -30;
    key.shadow.bias = -0.00025;
    scene.add(key);

    const { world, arrival } = buildWorld(scene);
    const { curve, route, glow, pulse } = buildRoute(scene);
    const maxRouteCount = route.geometry.index.count;
    const maxGlowCount = glow.geometry.index.count;
    const pointer = new THREE.Vector2();
    let progress = 0;
    let animationFrame = 0;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.7;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.45;
    };

    const setProgress = (value) => {
      progress = THREE.MathUtils.clamp(value, 0, 1);
      const routeProgress = THREE.MathUtils.clamp(
        (progress - 0.07) / 0.79,
        0,
        1,
      );
      route.geometry.setDrawRange(0, Math.floor(maxRouteCount * routeProgress));
      glow.geometry.setDrawRange(0, Math.floor(maxGlowCount * routeProgress));
      pulse.position.copy(curve.getPointAt(routeProgress));
      pulse.visible = routeProgress > 0.002 && routeProgress < 0.998;
      arrival.visible = progress > 0.72;
      const arrivalScale = THREE.MathUtils.smoothstep(progress, 0.72, 0.9);
      arrival.scale.setScalar(arrivalScale * 0.66);
      arrival.rotation.y = -0.08 + Math.max(0, progress - 0.78) * 0.5;
      arrival.position.y = 0.1 + Math.sin(Math.max(0, progress - 0.8) * Math.PI) * 0.35;
    };
    apiRef.current = { setProgress };
    setProgress(0);

    const render = () => {
      const cameraFrame = interpolateCamera(progress);
      camera.position.lerp(
        cameraFrame.position.clone().add(
          new THREE.Vector3(pointer.x, -pointer.y * 0.35, pointer.y),
        ),
        0.065,
      );
      camera.lookAt(
        cameraFrame.target.x + pointer.x * 0.35,
        cameraFrame.target.y,
        cameraFrame.target.z + pointer.y * 0.25,
      );
      world.position.y = Math.sin(Date.now() * 0.00035) * 0.025;
      pulse.scale.setScalar(1 + Math.sin(Date.now() * 0.009) * 0.35);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas className="scene-canvas" ref={canvasRef} aria-hidden="true" />;
});
