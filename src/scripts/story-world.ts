import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ADVANTAGE_FIELDS, LEVERAGE_ORIGINS, LUCK_FORMS } from "../lib/outcome-model";

export interface StoryWorldController {
  destroy: () => void;
  setProgress: (progress: number) => void;
}

type WorldAnimation = (time: number, progress: number) => void;
type Materials = Record<string, THREE.Material>;

interface StairFlightOptions {
  rise: number;
  rotationY?: number;
  run: number;
  steps: number;
  width: number;
}

const COLORS = {
  blue: 0x3d72ff,
  blueBright: 0x82b7ff,
  brass: 0xc18a38,
  brassLight: 0xf2c573,
  glass: 0xcbeeff,
  ink: 0x07101c,
  mint: 0x69d5bf,
  stone: 0xd9d2c3,
  stoneDark: 0x8d8b84,
  white: 0xfffbef,
};

const cinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    grainStrength: { value: 0.012 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float grainStrength;
    varying vec2 vUv;

    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float grain = random(gl_FragCoord.xy + time * 61.0) - 0.5;
      vec2 q = vUv - 0.5;
      float vignette = smoothstep(0.78, 0.18, dot(q, q));
      color.rgb *= mix(0.82, 1.0, vignette);
      color.rgb += grain * grainStrength;
      gl_FragColor = color;
    }
  `,
};

const skyShader = {
  uniforms: {
    topColor: { value: new THREE.Color(0x5b93bd) },
    horizonColor: { value: new THREE.Color(0xc9e4ed) },
    lowerColor: { value: new THREE.Color(0x8faab5) },
  },
  vertexShader: /* glsl */ `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 topColor;
    uniform vec3 horizonColor;
    uniform vec3 lowerColor;
    varying vec3 vPosition;
    void main() {
      vec3 n = normalize(vPosition);
      float h = n.y * 0.5 + 0.5;
      vec3 color = mix(lowerColor, horizonColor, smoothstep(0.12, 0.48, h));
      color = mix(color, topColor, smoothstep(0.48, 0.92, h));
      float sun = pow(max(dot(n, normalize(vec3(-0.55, 0.58, -0.62))), 0.0), 420.0);
      color += vec3(1.0, 0.83, 0.55) * sun * 0.82;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const random = (() => {
  let seed = 0x1f3d5b79;
  return () => {
    seed = (seed * 16_807) % 2_147_483_647;
    return (seed - 1) / 2_147_483_646;
  };
})();

function configureMesh(mesh: THREE.Mesh, cast = false, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function stoneTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const course = y % 42 < 2 ? -22 : 0;
      const joint = (x + Math.floor(y / 42) * 31) % 73 < 2 ? -16 : 0;
      const noise = Math.floor((random() - 0.5) * 22);
      const value = THREE.MathUtils.clamp(214 + course + joint + noise, 130, 238);
      data[index] = value;
      data[index + 1] = value - 4;
      data[index + 2] = value - 11;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,.78)");
  gradient.addColorStop(0.55, "rgba(255,255,255,.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedBox(
  ...args: [number, number, number, number, THREE.Material]
) {
  const [width, height, depth, radius, material] = args;
  return configureMesh(
    new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 3, radius), material),
  );
}

function tube(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  segments = 96,
) {
  return configureMesh(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 8, false),
      material,
    ),
    false,
    false,
  );
}

function buildColumn(
  ...args: [THREE.Object3D, THREE.Vector3, number, THREE.Material, number?]
) {
  const [parent, position, height, material, scale = 1] = args;
  const group = new THREE.Group();
  group.position.copy(position);
  const shaft = configureMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.29 * scale, 0.36 * scale, height, 14), material),
  );
  shaft.position.y = height / 2;
  group.add(shaft);
  const base = roundedBox(0.92 * scale, 0.24 * scale, 0.92 * scale, 0.08, material);
  base.position.y = 0.12 * scale;
  group.add(base);
  const capital = roundedBox(1.02 * scale, 0.26 * scale, 1.02 * scale, 0.08, material);
  capital.position.y = height - 0.13 * scale;
  group.add(capital);
  parent.add(group);
  return group;
}

function buildArch(
  ...args: [THREE.Object3D, THREE.Vector3, number, number, THREE.Material, number?]
) {
  const [parent, position, width, height, material, rotationY = 0] = args;
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;
  const pillarHeight = height - width / 2;
  [-1, 1].forEach((side) => {
    const pillar = roundedBox(0.34, pillarHeight, 0.58, 0.08, material);
    pillar.position.set((width / 2) * side, pillarHeight / 2, 0);
    group.add(pillar);
  });
  const arch = configureMesh(
    new THREE.Mesh(new THREE.TorusGeometry(width / 2, 0.18, 10, 42, Math.PI), material),
  );
  arch.position.y = pillarHeight;
  group.add(arch);
  parent.add(group);
  return group;
}

function buildStairFlight(
  parent: THREE.Object3D,
  position: THREE.Vector3,
  material: THREE.Material,
  options: StairFlightOptions,
) {
  const { width, rise, run, steps, rotationY = 0 } = options;
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;
  for (let index = 0; index < steps; index += 1) {
    const progress = (index + 1) / steps;
    const step = roundedBox(width, rise / steps, run / steps + 0.08, 0.035, material);
    step.position.set(0, progress * rise - rise / steps / 2, -progress * run);
    group.add(step);
  }
  [-1, 1].forEach((side) => {
    group.add(tube([
      new THREE.Vector3(side * width * 0.47, 0.62, 0),
      new THREE.Vector3(side * width * 0.47, rise + 0.62, -run),
    ], 0.045, material, 24));
  });
  parent.add(group);
  return group;
}

function buildTruss(
  ...args: [THREE.Object3D, THREE.Vector3, number, number, THREE.Material, number?]
) {
  const [parent, position, width, height, material, rotationY = 0] = args;
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;
  const left = new THREE.Vector3(-width / 2, 0, 0);
  const right = new THREE.Vector3(width / 2, 0, 0);
  const peak = new THREE.Vector3(0, height, 0);
  group.add(tube([left, peak, right], 0.07, material, 36));
  group.add(tube([left, right], 0.055, material, 20));
  for (let index = 1; index < 6; index += 1) {
    const x = -width / 2 + (width * index) / 6;
    const roofY = height * (1 - Math.abs(x) / (width / 2));
    group.add(tube([
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(x, roofY, 0),
    ], 0.025, material, 12));
  }
  parent.add(group);
  return group;
}

function inscriptionTexture(label: string, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 384;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "rgba(7,16,28,.86)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = accent;
  context.lineWidth = 5;
  context.strokeRect(18, 18, 220, 348);
  context.strokeRect(31, 31, 194, 322);
  context.fillStyle = "rgba(255,251,239,.86)";
  context.font = "600 24px monospace";
  context.letterSpacing = "5px";
  context.fillText("WTW", 50, 76);
  context.fillStyle = accent;
  context.font = "700 126px sans-serif";
  context.fillText(label, 47, 239);
  context.fillStyle = "rgba(255,251,239,.62)";
  context.font = "500 16px monospace";
  context.fillText("OBSERVATORY", 50, 315);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function conceptLabelTexture(code: string, label: string, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 176;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "rgba(7,16,28,.9)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.strokeRect(8, 8, 496, 160);
  context.fillStyle = accent;
  context.font = "700 25px monospace";
  context.fillText(code.toUpperCase(), 28, 46);
  context.fillStyle = "rgba(255,251,239,.94)";
  context.font = "600 25px sans-serif";
  const words = label.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > 452 && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  });
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((text, index) => context.fillText(text, 28, 93 + index * 34));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function conceptLabel(
  code: string,
  label: string,
  accent: string,
  width = 3.8,
) {
  const texture = conceptLabelTexture(code, label, accent);
  if (!texture) return null;
  const material = new THREE.SpriteMaterial({
    depthTest: true,
    map: texture,
    transparent: true,
  });
  material.toneMapped = false;
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, width * 0.344, 1);
  return sprite;
}

function buildCampusDetail(
  world: THREE.Group,
  materials: Record<string, THREE.Material>,
  deckDefinitions: { z: number; y: number; w: number; d: number; h: number }[],
  lowQuality: boolean,
) {
  const accents = ["#82b7ff", "#69d5bf", "#f2c573", "#6f90ff", "#e8bd72"];
  deckDefinitions.forEach((deck, index) => {
    const centerX = index % 2 ? 2 : 0;
    const surfaceY = deck.y + deck.h / 2 + 0.22;

    // Fine survey inlays make each platform read as a fabricated instrument,
    // not an undecorated primitive slab.
    const inlayCount = lowQuality ? 4 : 8;
    for (let line = 0; line < inlayCount; line += 1) {
      const x = centerX - deck.w * 0.38 + (line / Math.max(1, inlayCount - 1)) * deck.w * 0.76;
      const inlay = roundedBox(0.035, 0.025, deck.d * 0.76, 0.01, line % 3 === 0 ? materials.cobalt : materials.brassDark);
      inlay.position.set(x, surfaceY, deck.z);
      world.add(inlay);
    }

    const railZ = deck.z + deck.d * 0.37;
    const railPoints: THREE.Vector3[] = [];
    const railCount = lowQuality ? 5 : 9;
    for (let postIndex = 0; postIndex < railCount; postIndex += 1) {
      const x = centerX - deck.w * 0.38 + (postIndex / (railCount - 1)) * deck.w * 0.76;
      const post = configureMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.45, 8), materials.brassDark),
      );
      post.position.set(x, surfaceY + 0.72, railZ);
      world.add(post);
      railPoints.push(new THREE.Vector3(x, surfaceY + 1.42, railZ));
    }
    world.add(tube(railPoints, 0.07, materials.brass, 64));

    const plaqueTexture = inscriptionTexture(String(index + 1).padStart(2, "0"), accents[index]);
    if (plaqueTexture) {
      const plaque = configureMesh(
        new THREE.Mesh(
          new THREE.PlaneGeometry(2.35, 3.5),
          new THREE.MeshBasicMaterial({ map: plaqueTexture, side: THREE.DoubleSide, transparent: true }),
        ),
        false,
        false,
      );
      plaque.position.set(centerX + deck.w * 0.36, surfaceY + 2.2, deck.z - deck.d * 0.28);
      plaque.rotation.y = index % 2 ? -0.28 : 0.28;
      world.add(plaque);
      const plaqueStem = roundedBox(0.16, 4.4, 0.16, 0.03, materials.brassDark);
      plaqueStem.position.set(plaque.position.x, surfaceY + 1.75, plaque.position.z + 0.08);
      world.add(plaqueStem);
    }

    if (index < deckDefinitions.length - 1) {
      const next = deckDefinitions[index + 1];
      const start = new THREE.Vector3(centerX - deck.w * 0.35, surfaceY - 0.3, deck.z - deck.d * 0.43);
      const end = new THREE.Vector3(
        (index + 1) % 2 ? 2 : 0,
        next.y + next.h / 2 - 0.1,
        next.z + next.d * 0.43,
      );
      [-0.55, 0.55].forEach((offset) => {
        world.add(tube([
          start.clone().add(new THREE.Vector3(offset, 0, 0)),
          start.clone().lerp(end, 0.5).add(new THREE.Vector3(offset, -2.2, 0)),
          end.clone().add(new THREE.Vector3(offset, 0, 0)),
        ], 0.055, materials.brassDark, 56));
      });
    }

    if (!lowQuality) {
      const ribCount = 10;
      for (let ribIndex = 0; ribIndex < ribCount; ribIndex += 1) {
        const x = centerX - deck.w * 0.42 + (ribIndex / (ribCount - 1)) * deck.w * 0.84;
        const rib = roundedBox(0.16, deck.h * 0.72, 0.22, 0.035, materials.brassDark);
        rib.position.set(x, deck.y, deck.z + deck.d / 2 + 0.26);
        world.add(rib);
      }
    }
  });
}

function buildSky(scene: THREE.Scene, lowQuality: boolean) {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(170, 48, 28),
    new THREE.ShaderMaterial({ ...skyShader, side: THREE.BackSide, depthWrite: false }),
  );
  scene.add(dome);

  const ridgeColors = [0x6f8997, 0x7895a3, 0x8ba9b4];
  ridgeColors.forEach((color, layer) => {
    const segments = lowQuality ? 32 : 56;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let index = 0; index <= segments; index += 1) {
      const x = -135 + (270 * index) / segments;
      const wave = Math.sin(index * 0.52 + layer) * 5 + Math.sin(index * 0.19 + layer * 2.1) * 8;
      const peak = 5 + layer * 2 + Math.max(0, wave) + random() * 4;
      positions.push(x, -9, -76 - layer * 24, x, peak, -76 - layer * 24);
      if (index < segments) {
        const base = index * 2;
        indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const ridge = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color, fog: true, side: THREE.DoubleSide }),
    );
    scene.add(ridge);
  });

  const cloudSea = new THREE.Mesh(
    new THREE.PlaneGeometry(280, 320),
    new THREE.MeshStandardMaterial({ color: 0xadc7d0, metalness: 0, roughness: 1 }),
  );
  cloudSea.rotation.x = -Math.PI / 2;
  cloudSea.position.set(0, -5.1, -72);
  cloudSea.receiveShadow = true;
  scene.add(cloudSea);
}

function buildSite(
  ...args: [THREE.Scene, Materials, WorldAnimation[], THREE.Texture | null, boolean]
) {
  const [scene, materials, animations, glow, lowQuality] = args;
  const world = new THREE.Group();
  world.position.x = 8;
  scene.add(world);

  const deckDefinitions = [
    { z: 2, y: -2.4, w: 42, d: 28, h: 4.8 },
    { z: -29, y: -1.6, w: 38, d: 28, h: 4.6 },
    { z: -59, y: -0.7, w: 44, d: 30, h: 5.8 },
    { z: -90, y: 0.2, w: 31, d: 30, h: 6.4 },
    { z: -122, y: 0.7, w: 43, d: 36, h: 7.4 },
  ];
  deckDefinitions.forEach((definition, index) => {
    const deck = roundedBox(definition.w, definition.h, definition.d, 0.7, materials.stone);
    deck.position.set(index % 2 ? 2 : 0, definition.y, definition.z);
    world.add(deck);
    const centerX = index % 2 ? 2 : 0;
    const edgeY = definition.y + definition.h / 2 + 0.15;
    [-1, 1].forEach((side) => {
      const longEdge = roundedBox(definition.w + 0.6, 0.3, 0.24, 0.08, materials.brassDark);
      longEdge.position.set(centerX, edgeY, definition.z + side * (definition.d / 2 + 0.12));
      world.add(longEdge);
      const shortEdge = roundedBox(0.24, 0.3, definition.d + 0.6, 0.08, materials.brassDark);
      shortEdge.position.set(centerX + side * (definition.w / 2 + 0.12), edgeY, definition.z);
      world.add(shortEdge);
    });
  });
  buildCampusDetail(world, materials, deckDefinitions, lowQuality);

  const bridgePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1, 0.4, 12),
    new THREE.Vector3(3, 1.3, -18),
    new THREE.Vector3(0, 2.2, -46),
    new THREE.Vector3(4, 3.0, -76),
    new THREE.Vector3(1, 3.9, -108),
    new THREE.Vector3(0, 4.4, -132),
  ]);
  world.add(
    configureMesh(
      new THREE.Mesh(new THREE.TubeGeometry(bridgePath, 320, 0.18, 10, false), materials.cobalt),
      false,
      false,
    ),
  );
  const bridgeRail = new THREE.Mesh(
    new THREE.TubeGeometry(bridgePath, 320, 1.05, 8, false),
    materials.glassLine,
  );
  bridgeRail.renderOrder = 3;
  world.add(bridgeRail);

  const travelerGeometry = new THREE.SphereGeometry(0.16, 16, 12);
  const travelers = new THREE.InstancedMesh(travelerGeometry, materials.light, lowQuality ? 12 : 28);
  const matrix = new THREE.Matrix4();
  world.add(travelers);
  animations.push((time) => {
    for (let index = 0; index < travelers.count; index += 1) {
      const rawPhase = (time * (0.025 + (index % 4) * 0.004) + index / travelers.count) % 1;
      const phase = Number.isFinite(rawPhase) ? THREE.MathUtils.clamp(rawPhase, 0, 0.999_999) : 0;
      const position = bridgePath.getPoint(phase);
      const size = index % 5 === 0 ? 1.35 : 0.72;
      matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(size, size, size));
      travelers.setMatrixAt(index, matrix);
    }
    travelers.instanceMatrix.needsUpdate = true;
  });

  buildSurvivor(world, materials, animations, lowQuality);
  buildTerraces(world, materials, animations, lowQuality);
  buildLeverage(world, materials, animations);
  buildSequence(world, materials, animations);
  buildBoundary(world, materials, animations, glow, lowQuality);
  buildAmbientRecords(world, materials, animations, lowQuality);
}

function buildSurvivorArchive(group: THREE.Group, materials: Materials) {
  for (let index = -3; index <= 3; index += 1) {
    buildColumn(group, new THREE.Vector3(index * 4.8, 0, -8), 8.5, materials.stone, 1.05);
  }
  const entablature = roundedBox(34, 0.75, 2.1, 0.16, materials.stone);
  entablature.position.set(0, 8.55, -8);
  group.add(entablature);

  // A literal archive wall gives the 64 origins a built home instead of
  // leaving them as an abstract particle grid.
  const archiveWall = new THREE.Group();
  archiveWall.position.set(-12.4, 4.1, -3.7);
  group.add(archiveWall);
  const archiveBack = roundedBox(6.1, 7.35, 0.18, 0.08, materials.glass);
  archiveBack.position.z = 0.16;
  archiveWall.add(archiveBack);
  for (let index = 0; index <= 8; index += 1) {
    const x = -2.72 + index * 0.68;
    const vertical = roundedBox(0.045, 6.1, 0.28, 0.015, materials.brassLight);
    vertical.position.set(x, 0, 0.38);
    archiveWall.add(vertical);
    const y = -2.72 + index * 0.68;
    const horizontal = roundedBox(5.5, 0.045, 0.28, 0.015, materials.brassLight);
    horizontal.position.set(0, y, 0.38);
    archiveWall.add(horizontal);
  }
  const survivorWindow = roundedBox(0.56, 0.56, 0.12, 0.06, materials.cobalt);
  survivorWindow.position.set(1.7, -0.68, 0.56);
  archiveWall.add(survivorWindow);
  const archiveLabel = conceptLabel("64 records", "plausible starts", "#82b7ff", 4.8);
  if (archiveLabel) {
    archiveLabel.position.set(0, 4.55, 0.52);
    archiveWall.add(archiveLabel);
  }
  const survivorLabel = conceptLabel("01 selected", "remembered finish", "#82b7ff", 4.4);
  if (survivorLabel) {
    survivorLabel.position.set(10.6, 7.7, -7.1);
    survivorLabel.rotation.y = -0.28;
    group.add(survivorLabel);
  }
  [-1, 1].forEach((side) => {
    const pylon = roundedBox(0.55, 13.4, 0.75, 0.14, materials.stone);
    pylon.position.set(side * 17.1, 6.7, -8);
    group.add(pylon);
    for (let band = 0; band < 5; band += 1) {
      const collar = roundedBox(0.92, 0.12, 1.05, 0.035, materials.brass);
      collar.position.set(side * 17.1, 1.8 + band * 2.25, -8);
      group.add(collar);
    }
  });

  const origins = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.15, 12, 8),
    materials.glass,
    64,
  );
  const matrix = new THREE.Matrix4();
  for (let index = 0; index < 64; index += 1) {
    const column = index % 8;
    const row = Math.floor(index / 8);
    matrix.makeTranslation(-12 + column * 0.62, 7 - row * 0.72, 3 + (random() - 0.5) * 0.8);
    origins.setMatrixAt(index, matrix);
  }
  origins.instanceMatrix.needsUpdate = true;
  group.add(origins);
  return survivorWindow;
}

function buildSurvivorOrrery(group: THREE.Group, materials: Materials, lowQuality: boolean) {
  const orrery = new THREE.Group();
  orrery.position.set(7.5, 4.1, -7.2);
  orrery.scale.setScalar(1.35);
  group.add(orrery);
  buildArch(group, new THREE.Vector3(7.5, 0, -7.8), 12.5, 14.2, materials.stone);
  for (let index = 0; index < 7; index += 1) {
    const orbit = configureMesh(
      new THREE.Mesh(new THREE.TorusGeometry(2.2 + index * 1.25, 0.035, 6, 96), materials.brass),
      false,
      false,
    );
    orbit.rotation.x = Math.PI / 2;
    orbit.position.set(7.5, 0.24 + index * 0.035, -7.2);
    group.add(orbit);
  }
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    group.add(tube([
      new THREE.Vector3(7.5, 0.28, -7.2),
      new THREE.Vector3(7.5 + Math.cos(angle) * 10, 0.32, -7.2 + Math.sin(angle) * 10),
    ], 0.025, index % 3 === 0 ? materials.cobalt : materials.glassLine, 12));
  }
  const globes = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.24, 16, 12),
    materials.glass,
    24,
  );
  const globeMatrix = new THREE.Matrix4();
  for (let index = 0; index < globes.count; index += 1) {
    const angle = (index / globes.count) * Math.PI * 2;
    const radius = 5.8 + (index % 3) * 1.5;
    globeMatrix.makeTranslation(
      7.5 + Math.cos(angle) * radius,
      0.72 + (index % 4) * 0.12,
      -7.2 + Math.sin(angle) * radius,
    );
    globes.setMatrixAt(index, globeMatrix);
  }
  globes.instanceMatrix.needsUpdate = true;
  group.add(globes);
  [2.1, 3.1, 4.15].forEach((radius, index) => {
    const ring = configureMesh(
      new THREE.Mesh(new THREE.TorusGeometry(radius, 0.075, 10, 96), materials.brass),
    );
    ring.rotation.set(index * 0.62, index * 0.48, index * 0.33);
    orrery.add(ring);
  });
  const core = configureMesh(new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 3), materials.light));
  orrery.add(core);

  const pathCount = lowQuality ? 14 : 28;
  for (let index = 0; index < pathCount; index += 1) {
    const row = index % 8;
    const column = Math.floor(index / 8);
    const start = new THREE.Vector3(-12 + column * 0.62, 7 - row * 0.72, 3);
    const end = orrery.position.clone();
    const path = tube(
      [
        start,
        new THREE.Vector3(-5.5, start.y + (random() - 0.5) * 2, -0.5),
        new THREE.Vector3(1.5, 4 + (random() - 0.5) * 2.8, -4),
        end,
      ],
      index === 13 ? 0.055 : 0.018,
      index === 13 ? materials.cobalt : materials.glassLine,
      64,
    );
    group.add(path);
  }
  const pointLight = new THREE.PointLight(COLORS.blue, 18, 22, 2);
  pointLight.position.copy(orrery.position);
  group.add(pointLight);
  return { core, orrery };
}

function buildSurvivor(
  world: THREE.Group,
  materials: Materials,
  animations: WorldAnimation[],
  lowQuality: boolean,
) {
  const group = new THREE.Group();
  group.position.z = 4;
  world.add(group);
  const survivorWindow = buildSurvivorArchive(group, materials);
  const { core, orrery } = buildSurvivorOrrery(group, materials, lowQuality);
  animations.push((time) => {
    orrery.rotation.y = time * 0.09;
    orrery.rotation.x = Math.sin(time * 0.21) * 0.08;
    core.rotation.x = time * 0.31;
    core.rotation.y = time * 0.4;
    survivorWindow.scale.setScalar(0.92 + Math.sin(time * 2.1) * 0.08);
  });
}

function buildTerraces(
  world: THREE.Group,
  materials: Record<string, THREE.Material>,
  animations: WorldAnimation[],
  lowQuality: boolean,
) {
  const group = new THREE.Group();
  group.position.set(2, 1.1, -29);
  world.add(group);

  const levels = ADVANTAGE_FIELDS.length;
  for (let index = 0; index < levels; index += 1) {
    const height = 0.55 + index * 0.48;
    const block = roundedBox(2.7, height, 12 - index * 0.42, 0.18, materials.stone);
    block.position.set(-14 + index * 2.65, height / 2, (index % 2) * 1.2 - 0.6);
    group.add(block);
    const beacon = configureMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, height + 1.1, 8), materials.mint),
      false,
      false,
    );
    beacon.position.set(block.position.x, (height + 1.1) / 2, 4.7 - index * 0.18);
    group.add(beacon);
    const field = ADVANTAGE_FIELDS[index];
    const label = conceptLabel(String(index + 1).padStart(2, "0"), field.label, "#69d5bf", lowQuality ? 2.05 : 2.35);
    if (label) {
      label.position.set(block.position.x, height + 0.9, 4.95 - (index % 3) * 0.48);
      label.rotation.x = -0.08;
      group.add(label);
    }
  }

  const lifts: THREE.Mesh[] = [];
  for (let index = 0; index < 6; index += 1) {
    const rail = roundedBox(0.13, 7.5, 0.13, 0.04, materials.brass);
    rail.position.set(-11 + index * 4.4, 3.75, -5);
    group.add(rail);
    const lift = roundedBox(1.15, 0.24, 1.15, 0.08, materials.glass);
    lift.position.set(-11 + index * 4.4, 0.7 + index * 0.55, -5);
    group.add(lift);
    lifts.push(lift);
  }
  for (let index = -4; index <= 4; index += 1) {
    buildColumn(group, new THREE.Vector3(index * 3.45, 0, 7), 6.4, materials.stone, 0.82);
  }
  const lintel = roundedBox(31, 0.55, 1.55, 0.12, materials.stone);
  lintel.position.set(0, 6.4, 7);
  group.add(lintel);

  buildStairFlight(group, new THREE.Vector3(-14, 0.12, 5.2), materials.stone, {
    rise: 5.1,
    rotationY: -Math.PI / 2,
    run: 10.5,
    steps: lowQuality ? 10 : 18,
    width: 3.1,
  });
  buildStairFlight(group, new THREE.Vector3(12.6, 0.12, 4.1), materials.stone, {
    rise: 3.9,
    rotationY: Math.PI / 2,
    run: 7.5,
    steps: lowQuality ? 8 : 14,
    width: 2.6,
  });

  const accessTower = new THREE.Group();
  accessTower.position.set(13.7, 0, -4.4);
  group.add(accessTower);
  [-1, 1].forEach((sideX) => {
    [-1, 1].forEach((sideZ) => {
      const mast = roundedBox(0.22, 13.8, 0.22, 0.05, materials.brassDark);
      mast.position.set(sideX * 1.5, 6.9, sideZ * 1.5);
      accessTower.add(mast);
    });
  });
  for (let level = 0; level < 5; level += 1) {
    const balcony = roundedBox(4.2, 0.18, 4.2, 0.07, level === 4 ? materials.glass : materials.stone);
    balcony.position.y = 1.2 + level * 2.7;
    accessTower.add(balcony);
    buildTruss(accessTower, new THREE.Vector3(0, 1.35 + level * 2.7, 2.1), 3.3, 1.2, materials.brass, 0);
  }
  const counterweight = roundedBox(1.15, 2.1, 1.15, 0.14, materials.brass);
  counterweight.position.set(0, 8.4, 0);
  accessTower.add(counterweight);

  for (let index = 0; index < 5; index += 1) {
    const bridge = roundedBox(4.3, 0.16, 1.25, 0.06, materials.glass);
    bridge.position.set(-8.6 + index * 4.35, 1.2 + index * 0.62, -1.7 + (index % 2) * 1.15);
    bridge.rotation.z = 0.08;
    group.add(bridge);
  }
  animations.push((time) => {
    lifts.forEach((lift, index) => {
      lift.position.y = 0.9 + index * 0.36 + (Math.sin(time * 0.42 + index * 1.2) * 0.5 + 0.5) * 3.8;
    });
    counterweight.position.y = 8.4 + Math.sin(time * 0.34) * 2.4;
  });
}

function buildLeverageOrigins(group: THREE.Group, materials: Materials) {
  const originMaterials = [materials.cobalt, materials.mint, materials.brassLight, materials.light, materials.glassLine];
  const originAccents = ["#82b7ff", "#69d5bf", "#f2c573", "#f7f4ec", "#9bb4c7"];
  LEVERAGE_ORIGINS.slice(0, 5).forEach((origin, index) => {
    const source = new THREE.Vector3(10.8 + index * 0.45, 1.4 + index * 1.5, -7.4 + index * 3.45);
    group.add(tube([
      source,
      new THREE.Vector3(7.1, 3 + index * 0.58, source.z * 0.42),
      new THREE.Vector3(2.8, 4.4, 0),
    ], index === 0 ? 0.1 : 0.065, originMaterials[index], 56));
    const label = conceptLabel(String(index + 1).padStart(2, "0"), origin.label, originAccents[index], 3.5);
    if (label) {
      label.position.copy(source).add(new THREE.Vector3(0, 0.9, 0));
      group.add(label);
    }
  });
  for (let index = 0; index < 9; index += 1) {
    const angle = (index / 9) * Math.PI * 2;
    group.add(tube([
      new THREE.Vector3(3.2, 4.4, 0),
      new THREE.Vector3(8.5, 4.4 + Math.sin(angle) * 2.2, Math.cos(angle) * 2.5),
      new THREE.Vector3(15, 4.8 + Math.sin(angle) * 4.3, Math.cos(angle) * 5.5),
    ], 0.045, index % 3 === 0 ? materials.light : materials.brassLight, 58));
  }
}

function buildLeverage(
  world: THREE.Group,
  materials: Materials,
  animations: WorldAnimation[],
) {
  const group = new THREE.Group();
  group.position.set(0, 2.4, -60);
  world.add(group);

  [-1, 1].forEach((side) => {
    for (let index = 0; index < 7; index += 1) {
      buildColumn(group, new THREE.Vector3(side * 12.8, 0, -9 + index * 3), 9.2, materials.stone, 0.9);
    }
  });
  const roof = roundedBox(28, 0.7, 21, 0.22, materials.stone);
  roof.position.set(0, 9.3, 0);
  group.add(roof);
  for (let index = -3; index <= 3; index += 1) {
    buildTruss(group, new THREE.Vector3(0, 9.62, index * 3), 25, 4.6, materials.brassDark, 0);
  }

  const instrument = new THREE.Group();
  instrument.position.set(2.8, 4.4, 0);
  group.add(instrument);
  const lens = configureMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.62, 64), materials.glass),
  );
  lens.rotation.z = Math.PI / 2;
  instrument.add(lens);
  [3.6, 4.8, 6.1].forEach((radius, index) => {
    const ring = configureMesh(
      new THREE.Mesh(new THREE.TorusGeometry(radius, 0.11, 10, 112), materials.brass),
    );
    ring.rotation.set(Math.PI / 2, index * 0.5, index * 0.44);
    instrument.add(ring);
  });

  const leverAssembly = new THREE.Group();
  leverAssembly.position.set(-4.5, 2.1, 5.2);
  group.add(leverAssembly);
  const fulcrum = configureMesh(
    new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.8, 4), materials.stone),
  );
  fulcrum.rotation.y = Math.PI / 4;
  leverAssembly.add(fulcrum);
  const beam = roundedBox(15.5, 0.34, 0.62, 0.11, materials.brass);
  beam.position.y = 1.7;
  beam.rotation.z = -0.13;
  leverAssembly.add(beam);
  const inputWeight = roundedBox(1.5, 2.6, 1.5, 0.16, materials.stone);
  inputWeight.position.set(-6.2, 0.35, 0);
  leverAssembly.add(inputWeight);
  const outputWeight = configureMesh(
    new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 1), materials.brass),
  );
  outputWeight.position.set(6.2, 3.15, 0);
  leverAssembly.add(outputWeight);

  const gauges: THREE.Group[] = [];
  for (let index = 0; index < 5; index += 1) {
    const gauge = new THREE.Group();
    gauge.position.set(-10 + index * 5, 2.2 + (index % 2) * 0.8, -8.2);
    group.add(gauge);
    const face = configureMesh(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.18, 48), materials.glass));
    face.rotation.x = Math.PI / 2;
    gauge.add(face);
    const bezel = configureMesh(new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.09, 8, 48), materials.brass));
    gauge.add(bezel);
    const needle = roundedBox(0.055, 0.82, 0.05, 0.015, materials.cobalt);
    needle.position.y = 0.38;
    gauge.add(needle);
    gauges.push(gauge);
  }

  buildLeverageOrigins(group, materials);
  const light = new THREE.PointLight(COLORS.brassLight, 20, 30, 2);
  light.position.set(3.6, 4.4, 1.5);
  group.add(light);
  animations.push((time) => {
    instrument.rotation.y = Math.sin(time * 0.16) * 0.2;
    instrument.children.forEach((child, index) => {
      if (index > 0) child.rotation.z += 0.0007 * (index % 2 ? 1 : -1);
    });
    leverAssembly.rotation.z = Math.sin(time * 0.28) * 0.055;
    gauges.forEach((gauge, index) => {
      const needle = gauge.children[2];
      needle.rotation.z = -0.8 + (Math.sin(time * 0.55 + index) * 0.5 + 0.5) * 1.6;
    });
  });
}

function buildSequenceCables(
  group: THREE.Group,
  materials: Materials,
  pathPoints: THREE.Vector3[],
) {
  const cableAnchors = [
    new THREE.Vector3(-15.5, 11.5, 8.5),
    new THREE.Vector3(0, 15.2, -1.8),
    new THREE.Vector3(14.8, 13.2, -10),
  ];
  cableAnchors.forEach((anchor, index) => {
    const mast = roundedBox(0.48, anchor.y, 0.48, 0.08, materials.stone);
    mast.position.set(anchor.x, anchor.y / 2 - 0.2, anchor.z);
    group.add(mast);
    if (index < cableAnchors.length - 1) {
      const next = cableAnchors[index + 1];
      [-0.8, 0.8].forEach((offset) => {
        group.add(tube([
          anchor.clone().add(new THREE.Vector3(0, 0, offset)),
          anchor.clone().lerp(next, 0.5).add(new THREE.Vector3(0, -5.5, offset)),
          next.clone().add(new THREE.Vector3(0, 0, offset)),
        ], 0.07, materials.brassDark, 64));
      });
    }
  });
  pathPoints.forEach((point, index) => {
    const nearestAnchor = cableAnchors[Math.min(cableAnchors.length - 1, Math.floor(index / 2))];
    group.add(tube([
      nearestAnchor,
      point.clone().add(new THREE.Vector3(0, 0.8, 0)),
    ], 0.022, materials.glassLine, 16));
  });
}

function buildSequence(
  world: THREE.Group,
  materials: Materials,
  animations: WorldAnimation[],
) {
  const group = new THREE.Group();
  group.position.set(2, 3.8, -90);
  world.add(group);
  const pathPoints = [
    new THREE.Vector3(-14, 0, 7),
    new THREE.Vector3(-5, 1.55, 2.2),
    new THREE.Vector3(4.5, 3.35, -3.4),
    new THREE.Vector3(13, 5.2, -8.5),
  ];
  const stageLabels = ["Starting position", "Built leverage", "Trajectory", "Observed standing"];
  const activeCurve = new THREE.CatmullRomCurve3(pathPoints);
  const walkway = configureMesh(
    new THREE.Mesh(new THREE.TubeGeometry(activeCurve, 160, 0.72, 10, false), materials.stone),
  );
  group.add(walkway);
  group.add(configureMesh(
    new THREE.Mesh(new THREE.TubeGeometry(activeCurve, 180, 0.085, 8, false), materials.cobalt),
    false,
    false,
  ));
  pathPoints.forEach((point, index) => {
    buildArch(group, point.clone().add(new THREE.Vector3(0, -0.15, 0)), 3.3, 6.5, materials.brass, -0.5);
    const plinth = roundedBox(4.2, 0.35, 3.1, 0.1, materials.stone);
    plinth.position.copy(point).add(new THREE.Vector3(0, -0.4, 0));
    group.add(plinth);
    if (index < pathPoints.length - 1) {
      const alternative = pathPoints.slice(index).map((p, subIndex) =>
        p.clone().add(new THREE.Vector3(0, subIndex * 0.5, (index % 2 ? 1 : -1) * subIndex * 1.7)),
      );
      group.add(tube(alternative, 0.018, materials.glassLine, 48));
    }

    const dial = configureMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.11, 32), materials.glass),
      false,
      false,
    );
    dial.rotation.z = Math.PI / 2;
    dial.position.copy(point).add(new THREE.Vector3(0, 3.9, 0));
    group.add(dial);

    const marker = configureMesh(
      new THREE.Mesh(new THREE.TorusGeometry(0.64 + index * 0.055, 0.045, 8, 48), materials.cobalt),
      false,
      false,
    );
    marker.position.copy(point).add(new THREE.Vector3(0, 3.9, 0));
    marker.rotation.y = -0.5;
    group.add(marker);

    const stageLabel = conceptLabel(String(index + 1).padStart(2, "0"), stageLabels[index], "#6f90ff", 3.55);
    if (stageLabel) {
      stageLabel.position.copy(point).add(new THREE.Vector3(0, 5.25, 0.35));
      stageLabel.rotation.y = -0.5;
      group.add(stageLabel);
    }
  });

  group.add(tube(
    pathPoints.map((point) => point.clone().add(new THREE.Vector3(0, 5.6, 0))),
    0.055,
    materials.brassLight,
    120,
  ));

  buildSequenceCables(group, materials, pathPoints);

  const clock = new THREE.Group();
  clock.position.set(13.2, 10.4, -8.6);
  group.add(clock);
  [1.7, 2.35, 3.05].forEach((radius, index) => {
    const ring = configureMesh(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.075, 8, 72), index === 1 ? materials.cobalt : materials.brass));
    ring.rotation.set(index * 0.35, -0.45, index * 0.27);
    clock.add(ring);
  });
  for (let tickIndex = 0; tickIndex < 24; tickIndex += 1) {
    const angle = (tickIndex / 24) * Math.PI * 2;
    const tick = roundedBox(0.05, tickIndex % 6 === 0 ? 0.5 : 0.25, 0.05, 0.01, materials.brassLight);
    tick.position.set(Math.cos(angle) * 2.65, Math.sin(angle) * 2.65, 0);
    tick.rotation.z = -angle;
    clock.add(tick);
  }
  const traveler = configureMesh(new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), materials.light), false, false);
  group.add(traveler);
  animations.push((time) => {
    const rawPhase = (time * 0.045) % 1;
    const phase = Number.isFinite(rawPhase) ? THREE.MathUtils.clamp(rawPhase, 0, 0.999_999) : 0;
    traveler.position.copy(activeCurve.getPoint(phase));
    clock.rotation.y = Math.sin(time * 0.18) * 0.15;
    clock.rotation.z = time * 0.045;
  });
}

function buildBoundaryDome(group: THREE.Group, materials: Materials, lowQuality: boolean) {
  const rotundaRing = configureMesh(
    new THREE.Mesh(new THREE.TorusGeometry(1, 0.18, 12, 128), materials.brass),
  );
  rotundaRing.rotation.x = Math.PI / 2;
  rotundaRing.scale.set(14, 11, 1);
  rotundaRing.position.set(3, -5, 0);
  group.add(rotundaRing);
  const rotundaDrum = configureMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(11.2, 13.8, 1.25, lowQuality ? 48 : 96), materials.stone),
  );
  rotundaDrum.position.set(3, -5.62, 0);
  group.add(rotundaDrum);
  const innerFloor = configureMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.6, 0.16, lowQuality ? 48 : 96), materials.glass),
    false,
    true,
  );
  innerFloor.position.set(3, -4.9, 0);
  group.add(innerFloor);

  const domeRibs = new THREE.Group();
  domeRibs.position.set(3, -4.85, 0);
  group.add(domeRibs);
  const ribCount = lowQuality ? 5 : 9;
  for (let index = 0; index < ribCount; index += 1) {
    const rib = configureMesh(
      new THREE.Mesh(new THREE.TorusGeometry(11, 0.075, 8, lowQuality ? 72 : 128, Math.PI), materials.brassDark),
    );
    rib.rotation.set(0, (index / ribCount) * Math.PI, 0);
    domeRibs.add(rib);
  }
  [3.8, 7.1, 9.5].forEach((radius, index) => {
    const latitude = configureMesh(
      new THREE.Mesh(new THREE.TorusGeometry(radius, 0.045, 8, 96), index === 1 ? materials.cobalt : materials.glassLine),
      false,
      false,
    );
    latitude.rotation.x = Math.PI / 2;
    latitude.position.y = Math.sqrt(Math.max(0, 121 - radius * radius));
    domeRibs.add(latitude);
  });

  const constellationCount = lowQuality ? 24 : 54;
  const constellation = new THREE.InstancedMesh(
    new THREE.OctahedronGeometry(0.11, 0),
    materials.light,
    constellationCount,
  );
  const constellationMatrix = new THREE.Matrix4();
  for (let index = 0; index < constellationCount; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = random() * Math.PI * 0.46;
    const radius = 10.65;
    constellationMatrix.makeTranslation(
      Math.cos(theta) * Math.sin(phi) * radius,
      Math.cos(phi) * radius,
      Math.sin(theta) * Math.sin(phi) * radius,
    );
    constellation.setMatrixAt(index, constellationMatrix);
  }
  constellation.instanceMatrix.needsUpdate = true;
  domeRibs.add(constellation);
  return { constellation, domeRibs };
}

function buildLuckForces(group: THREE.Group, materials: Materials) {
  const luckForces = new THREE.Group();
  luckForces.position.set(3, -0.4, 3.1);
  group.add(luckForces);
  const forcePositions = [
    new THREE.Vector3(-7.2, 0.2, 0),
    new THREE.Vector3(-2.6, 6.4, 0.5),
    new THREE.Vector3(3.2, 7.7, 0.2),
    new THREE.Vector3(8.2, 1.5, 0),
  ];
  const forceMarkers: THREE.Mesh[] = [];
  LUCK_FORMS.forEach((form, index) => {
    const marker = configureMesh(
      new THREE.Mesh(
        index % 2 === 0 ? new THREE.OctahedronGeometry(0.42, 1) : new THREE.DodecahedronGeometry(0.42, 1),
        index === 3 ? materials.cobalt : materials.brassLight,
      ),
      false,
      false,
    );
    marker.position.copy(forcePositions[index]);
    luckForces.add(marker);
    forceMarkers.push(marker);
    const label = conceptLabel(`unscored 0${index + 1}`, form.label, index === 3 ? "#82b7ff" : "#e8bd72", 3.65);
    if (label) {
      label.position.copy(forcePositions[index]).add(new THREE.Vector3(0, -1.05, 0));
      luckForces.add(label);
    }
  });
  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2;
    group.add(tube([
      new THREE.Vector3(3, -4.95, 0),
      new THREE.Vector3(3 + Math.cos(angle) * 13.8, -4.95, Math.sin(angle) * 10.8),
    ], 0.028, index % 4 === 0 ? materials.cobalt : materials.glassLine, 18));
  }
  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2;
    buildColumn(
      group,
      new THREE.Vector3(Math.cos(angle) * 14, -5.2, Math.sin(angle) * 11),
      10.5 + (index % 3) * 1.4,
      materials.stone,
      0.78,
    );
  }
  return { forceMarkers, forcePositions };
}

function buildBoundaryDust(
  observatory: THREE.Group,
  animations: WorldAnimation[],
  glow: THREE.Texture | null,
  lowQuality: boolean,
) {
  if (!glow) return;
  const dustGeometry = new THREE.BufferGeometry();
  const count = lowQuality ? 220 : 520;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 3 + random() * 10;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (random() - 0.5) * 15;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      alphaMap: glow,
      blending: THREE.AdditiveBlending,
      color: COLORS.brassLight,
      depthWrite: false,
      opacity: 0.42,
      size: 0.16,
      transparent: true,
    }),
  );
  observatory.add(dust);
  animations.push((time) => {
    dust.rotation.y = time * -0.018;
  });
}

function buildBoundary(
  ...args: [THREE.Group, Materials, WorldAnimation[], THREE.Texture | null, boolean]
) {
  const [world, materials, animations, glow, lowQuality] = args;
  const group = new THREE.Group();
  group.position.set(0, 5.2, -124);
  world.add(group);
  const observatory = new THREE.Group();
  observatory.position.x = 3;
  group.add(observatory);

  const core = configureMesh(new THREE.Mesh(new THREE.SphereGeometry(2.8, 48, 32), materials.glass));
  observatory.add(core);
  const star = configureMesh(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 3), materials.light),
    false,
    false,
  );
  observatory.add(star);
  [5.2, 6.8, 8.6, 10.4].forEach((radius, index) => {
    const arc = configureMesh(
      new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.095 - index * 0.01, 10, lowQuality ? 72 : 128, Math.PI * (1.5 - index * 0.09)),
        index === 3 ? materials.cobalt : materials.brass,
      ),
    );
    arc.rotation.set(0.4 + index * 0.43, index * 0.66, index * 0.28);
    observatory.add(arc);
  });

  const { constellation, domeRibs } = buildBoundaryDome(group, materials, lowQuality);

  buildStairFlight(group, new THREE.Vector3(3, -5.55, 14.8), materials.stone, {
    rise: 2.4,
    rotationY: Math.PI,
    run: 6.8,
    steps: lowQuality ? 9 : 16,
    width: 5.4,
  });

  const { forceMarkers, forcePositions } = buildLuckForces(group, materials);
  buildBoundaryDust(observatory, animations, glow, lowQuality);
  const light = new THREE.PointLight(COLORS.brassLight, 22, 34, 2);
  light.position.set(3, 2, 2);
  group.add(light);
  animations.push((time) => {
    observatory.rotation.y = time * 0.025;
    core.rotation.x = time * 0.09;
    core.rotation.y = time * 0.13;
    star.rotation.x = time * -0.2;
    star.rotation.y = time * 0.26;
    domeRibs.rotation.y = Math.sin(time * 0.08) * 0.035;
    constellation.rotation.y = time * -0.012;
    forceMarkers.forEach((marker, index) => {
      marker.rotation.x = time * (0.12 + index * 0.025);
      marker.rotation.y = time * (0.18 + index * 0.03);
      marker.position.y = forcePositions[index].y + Math.sin(time * 0.42 + index) * 0.22;
    });
  });
}

function buildAmbientRecords(
  world: THREE.Group,
  materials: Record<string, THREE.Material>,
  animations: WorldAnimation[],
  lowQuality: boolean,
) {
  const count = lowQuality ? 90 : 210;
  const records = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.18, 0.26, 0.018),
    materials.record,
    count,
  );
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  for (let index = 0; index < count; index += 1) {
    position.set(random() * 55 - 27, 2 + random() * 18, 18 - random() * 165);
    rotation.setFromEuler(new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI));
    scale.setScalar(0.7 + random() * 1.4);
    matrix.compose(position, rotation, scale);
    records.setMatrixAt(index, matrix);
  }
  records.instanceMatrix.needsUpdate = true;
  world.add(records);
  animations.push((time) => {
    records.position.y = Math.sin(time * 0.16) * 0.5;
    records.rotation.y = Math.sin(time * 0.035) * 0.025;
  });
}

function createMaterials(stoneMap: THREE.Texture): Materials {
  return {
    stone: new THREE.MeshStandardMaterial({
      color: COLORS.stone,
      map: stoneMap,
      metalness: 0.03,
      roughness: 0.78,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: COLORS.brass,
      emissive: 0x3a2108,
      emissiveIntensity: 0.12,
      metalness: 0.88,
      roughness: 0.24,
    }),
    brassDark: new THREE.MeshStandardMaterial({
      color: 0x7d5727,
      metalness: 0.9,
      roughness: 0.34,
    }),
    brassLight: new THREE.MeshBasicMaterial({
      color: new THREE.Color(COLORS.brassLight).multiplyScalar(1.8),
      toneMapped: false,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: COLORS.glass,
      depthWrite: false,
      metalness: 0,
      opacity: 0.42,
      roughness: 0.06,
      thickness: 1.1,
      transmission: 0.72,
      transparent: true,
    }),
    glassLine: new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0x8bc8e5,
      depthWrite: false,
      opacity: 0.24,
      transparent: true,
    }),
    cobalt: new THREE.MeshBasicMaterial({
      color: new THREE.Color(COLORS.blue).multiplyScalar(2.4),
      toneMapped: false,
    }),
    mint: new THREE.MeshBasicMaterial({
      color: new THREE.Color(COLORS.mint).multiplyScalar(1.7),
      toneMapped: false,
    }),
    light: new THREE.MeshBasicMaterial({
      color: new THREE.Color(COLORS.white).multiplyScalar(2.2),
      toneMapped: false,
    }),
    record: new THREE.MeshStandardMaterial({
      color: 0xe7f0f3,
      emissive: 0x345c78,
      emissiveIntensity: 0.18,
      metalness: 0.1,
      opacity: 0.38,
      roughness: 0.52,
      transparent: true,
    }),
  };
}

function disposeScene(scene: THREE.Scene) {
  const disposedMaterials = new Set<THREE.Material>();
  scene.traverse((object) => {
    if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) object.geometry.dispose();
    if (!("material" in object)) return;
    const source = object.material as THREE.Material | THREE.Material[];
    const materials = Array.isArray(source) ? source : [source];
    materials.forEach((material) => {
      if (disposedMaterials.has(material)) return;
      disposedMaterials.add(material);
      material.dispose();
    });
  });
}

interface WorldResources {
  animations: WorldAnimation[];
  camera: THREE.PerspectiveCamera;
  cameraCurve: THREE.CatmullRomCurve3;
  cinematicPass: ShaderPass;
  composer: EffectComposer;
  glow: THREE.Texture | null;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  stoneMap: THREE.Texture;
  targetCurve: THREE.CatmullRomCurve3;
}

function createWorldResources(
  canvas: HTMLCanvasElement,
  lowQuality: boolean,
  captureMode: boolean,
): WorldResources | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: !lowQuality,
      canvas,
      powerPreference: "high-performance",
      preserveDrawingBuffer: captureMode,
    });
  } catch {
    return null;
  }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x83acc5);
  scene.fog = new THREE.FogExp2(0xa9c4d1, lowQuality ? 0.0092 : 0.0068);
  const camera = new THREE.PerspectiveCamera(lowQuality ? 43 : 39, 1, 0.18, 230);
  const animations: WorldAnimation[] = [];
  const stoneMap = stoneTexture();
  const glow = glowTexture();
  const materials = createMaterials(stoneMap);
  buildSky(scene, lowQuality);
  buildSite(scene, materials, animations, glow, lowQuality);

  scene.add(new THREE.HemisphereLight(0xeef8ff, 0x667985, 2.25));
  const sun = new THREE.DirectionalLight(0xffe5b2, 3.35);
  sun.position.set(-38, 55, 24);
  sun.castShadow = !lowQuality;
  if (!lowQuality) {
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      bottom: -48,
      far: 170,
      left: -48,
      near: 1,
      right: 48,
      top: 48,
    });
    sun.shadow.bias = -0.0002;
  }
  scene.add(sun);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = !lowQuality;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), lowQuality ? 0.1 : 0.19, 0.42, 1.08));
  const cinematicPass = new ShaderPass(cinematicShader);
  composer.addPass(cinematicPass);
  composer.addPass(new OutputPass());
  const cameraCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10.5, 10.1, 25.5),
    new THREE.Vector3(27, 16.8, -13),
    new THREE.Vector3(-17, 11.8, -45),
    new THREE.Vector3(34, 16.8, -68),
    new THREE.Vector3(28, 15.2, -101),
  ], false, "catmullrom", 0.42);
  const targetCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(9, 3.8, -5),
    new THREE.Vector3(5, 2.8, -30),
    new THREE.Vector3(7, 5.1, -60),
    new THREE.Vector3(5, 6.8, -93),
    new THREE.Vector3(3.5, 5.6, -124),
  ], false, "catmullrom", 0.42);
  return { animations, camera, cameraCurve, cinematicPass, composer, glow, renderer, scene, stoneMap, targetCurve };
}

interface ResizeOptions {
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  cinematicPass: ShaderPass;
  composer: EffectComposer;
  lowQuality: boolean;
  renderer: THREE.WebGLRenderer;
}

function createResizeHandler(options: ResizeOptions) {
  const { camera, canvas, cinematicPass, composer, lowQuality, renderer } = options;
  return () => {
    const width = Math.max(1, document.documentElement.clientWidth || canvas.clientWidth);
    const height = Math.max(1, document.documentElement.clientHeight || canvas.clientHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, lowQuality ? 1.05 : 1.55);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    cinematicPass.uniforms.grainStrength.value = lowQuality ? 0.006 : 0.012;
  };
}

interface FrameRendererOptions extends WorldResources {
  canvas: HTMLCanvasElement;
  captureMode: boolean;
  getProgress: () => number;
  lowQuality: boolean;
  pointer: THREE.Vector2;
}

function createFrameRenderer(options: FrameRendererOptions) {
  const workingPosition = new THREE.Vector3();
  const workingTarget = new THREE.Vector3();
  let renderedFrames = 0;
  return (time: number) => {
    const safeProgress = Number.isFinite(options.getProgress())
      ? THREE.MathUtils.clamp(options.getProgress(), 0, 0.999_999)
      : 0;
    options.cameraCurve.getPoint(safeProgress, workingPosition);
    options.targetCurve.getPoint(safeProgress, workingTarget);
    options.camera.position.copy(workingPosition);
    options.camera.position.x += options.pointer.x * (options.lowQuality ? 0.18 : 0.48);
    options.camera.position.y += options.pointer.y * (options.lowQuality ? 0.12 : 0.28);
    options.camera.rotation.z = Math.sin(safeProgress * Math.PI * 6) * 0.006;
    options.camera.lookAt(workingTarget);
    options.animations.forEach((animation) => animation(time, safeProgress));
    options.cinematicPass.uniforms.time.value = time;
    if (options.captureMode) options.renderer.render(options.scene, options.camera);
    else options.composer.render();
    renderedFrames += 1;
    options.canvas.dataset.storyFrames = String(renderedFrames);
    options.canvas.dataset.storyCamera = `${options.camera.position.x.toFixed(2)},${options.camera.position.y.toFixed(2)},${options.camera.position.z.toFixed(2)}`;
  };
}

function mountCaptureStill(atmosphere: HTMLElement, canvas: HTMLCanvasElement) {
  const still = document.createElement("img");
  still.src = canvas.toDataURL("image/png");
  still.alt = "";
  still.style.cssText = "position:absolute;z-index:1;inset:0;width:100%;height:100%;object-fit:fill";
  atmosphere.append(still);
  canvas.style.visibility = "hidden";
}

export function mountStoryWorld(canvas: HTMLCanvasElement): StoryWorldController | null {
  const atmosphere = canvas.closest<HTMLElement>(".story-atmosphere");
  if (!atmosphere) return null;
  const lowQuality = canvas.clientWidth < 760;
  const captureMode = new URLSearchParams(window.location.search).has("capture");

  const resources = createWorldResources(canvas, lowQuality, captureMode);
  if (!resources) return null;
  const { camera, cinematicPass, composer, glow, renderer, scene, stoneMap } = resources;
  const pointer = new THREE.Vector2();
  const requestedShotValue = new URLSearchParams(window.location.search).get("shot");
  const requestedShot = requestedShotValue === null ? Number.NaN : Number(requestedShotValue);
  const initialProgress = Number.isFinite(requestedShot)
    ? THREE.MathUtils.clamp(requestedShot, 0, 1)
    : 0;
  let targetProgress = initialProgress;
  let currentProgress = initialProgress;
  let frame = 0;
  let destroyed = false;
  let visible = !document.hidden;
  let elapsed = 0;
  let lastTime = performance.now();

  const resize = createResizeHandler({ camera, canvas, cinematicPass, composer, lowQuality, renderer });
  const render = createFrameRenderer({
    ...resources,
    canvas,
    captureMode,
    getProgress: () => currentProgress,
    lowQuality,
    pointer,
  });

  const tick = (now: number) => {
    if (destroyed) return;
    const delta = Math.min(0.05, (now - lastTime) / 1_000);
    lastTime = now;
    elapsed += delta;
    currentProgress = THREE.MathUtils.damp(currentProgress, targetProgress, 4.6, delta);
    render(elapsed);
    if (visible) frame = window.requestAnimationFrame(tick);
  };

  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / Math.max(1, document.documentElement.clientWidth) - 0.5) * 2;
    pointer.y = (event.clientY / Math.max(1, document.documentElement.clientHeight) - 0.5) * -2;
  };
  const onVisibilityChange = () => {
    visible = !document.hidden;
    if (visible && !frame) {
      lastTime = performance.now();
      frame = window.requestAnimationFrame(tick);
    } else if (!visible && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    atmosphere.classList.remove("story-webgl-ready");
  };

  atmosphere.classList.add("story-webgl-ready");
  canvas.style.opacity = "1";
  resize();
  render(0);
  if (captureMode) mountCaptureStill(atmosphere, canvas);
  window.addEventListener("resize", resize, { passive: true });
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }
  document.addEventListener("visibilitychange", onVisibilityChange);
  canvas.addEventListener("webglcontextlost", onContextLost);
  frame = window.requestAnimationFrame(tick);

  return {
    setProgress(progress) {
      targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
    },
    destroy() {
      destroyed = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      atmosphere.classList.remove("story-webgl-ready");
      canvas.style.removeProperty("opacity");
      disposeScene(scene);
      stoneMap.dispose();
      glow?.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
