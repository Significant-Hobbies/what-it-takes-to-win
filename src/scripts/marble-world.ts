// The marble run: three marbles, one board, and the branches none of them took.
//
// The history of this file is the argument working itself out. Sixty-four
// marbles in twelve lanes read as a competition — the exact frame the essay this
// project is named after spends its length dismantling — and a crowd nobody can
// follow. One marble is followable but makes no comparison at all, and
// comparison is what the reader arrived holding. Two marbles on two separate
// boards compared nothing either: they never met.
//
// So: one board, three marbles, one clock. They share the same structure, they
// touch, they jostle, and the lead changes hands more than once. Each carries a
// different speed profile, so one is quicker down the steep sections and another
// holds its pace across the flats. Whoever is ahead at any moment is ahead
// because of where the course currently is, not because of what it is.
//
// That is the whole point. A reader who watches the lead trade three times
// cannot come away thinking the finishing order measured the marbles.
//
// Each profile is generated from one condition-factor triple, the same three the
// profiles publish:
//
//   inherited  -> starting speed. Momentum handed over before anything happened.
//   endowment  -> rolling efficiency. How little speed bleeds per metre.
//   ecosystem  -> how much of a slope converts into speed at all.
//
// Ghost branches peel away at each junction and fade: paths that were available
// and did not happen. Biography hides the branches.
//
// MOTION MODEL — deliberately not a physics engine. Scroll runs backwards, and a
// rigid-body simulation cannot be scrubbed: reversing it needs the whole history.
// Each marble's speed profile is integrated once at construction into an
// arc-length/time table, inverted at render time. Even the contact between
// marbles is a pure function of the current frame's arc positions, with no
// accumulated state, so the entire scene is reversible and identical every run.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface MarbleWorldController {
  destroy: () => void;
  setProgress: (progress: number) => void;
}

interface RunnerSpec {
  colour: number;
  /** Slope-to-speed conversion. High means it dives well and fades on the flat. */
  ecosystem: number;
  /** Rolling retention. High means it holds pace where the course stops helping. */
  endowment: number;
  /** Starting momentum, handed over before the run began. */
  inherited: number;
  /** Resting lane across the board's width. */
  lane: number;
}

/**
 * Three runners, tuned so the lead actually changes hands.
 *
 * The first dives hardest and bleeds most; the third is the opposite; the second
 * sits between them. On a course that alternates steep and shallow, that
 * guarantees crossings rather than a single winner pulling away — which is the
 * only version of this scene that does not read as a ranking.
 */
const RUNNERS: RunnerSpec[] = [
  { colour: 0xff8f3f, ecosystem: 3, endowment: 0, inherited: 3, lane: -1 },
  { colour: 0x5ea9ff, ecosystem: 1, endowment: 2, inherited: 1, lane: 0 },
  { colour: 0x4ade80, ecosystem: 0, endowment: 3, inherited: 0, lane: 1 },
];

const COLORS = {
  bed: 0x2a3550,
  boost: 0x5fd3bc,
  drag: 0xf0a36b,
  finish: 0xffd9a0,
  fog: 0x0b1020,
  frame: 0x161d2b,
  ghost: 0x6478a0,
  rail: 0x3b4763,
  sky: 0x080a10,
};

const MARBLE_RADIUS = 1.15;
/** Wide enough for three marbles abreast, so contact has somewhere to go. */
const TRACK_RADIUS = 2.7;
const LANE_SPACING = 1.3;
const SAMPLES = 640;
const UP = new THREE.Vector3(0, 1, 0);

/** Deterministic hash-based jitter. No Math.random: the world must be stable. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43_758.545_3;
  return x - Math.floor(x);
}

/**
 * Where the holes are, as fractions along the board.
 *
 * The marbles start *in* the first one. Anything before it is dead air the
 * reader has to scroll past before the run begins.
 */
const HOLES = [0, 0.16, 0.35, 0.55, 0.74, 0.9];

/**
 * The board, obstacle by obstacle.
 *
 * It deliberately alternates steep and shallow. That is what makes the lead
 * change hands: a diver gains on the drops and gives it back on the run-outs.
 */
function buildBoardPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const push = (x: number, y: number, z: number) => points.push(new THREE.Vector3(x, y, z));

  // 01 THE FIRST HOLE — the run opens here, at the drop, not before it.
  push(3, 52, 24);
  push(1, 44, 16);

  // 02 RUN-OUT — shallow. The steady marbles claw back what the divers took.
  push(-1, 41.5, 6);
  push(-3, 40, -5);

  // 03 HELIX — a descending spiral, and steep. Pure marble-run.
  for (let i = 1; i <= 20; i += 1) {
    const t = i / 20;
    const angle = t * Math.PI * 2 * 1.5;
    push(-3 + Math.sin(angle) * 11, 40 - t * 20, -10 - t * 26 + (Math.cos(angle) - 1) * 4);
  }

  // 04 THE LONG FLAT — barely any gradient. Rolling efficiency decides here.
  let y = 20;
  for (let i = 1; i <= 4; i += 1) {
    y -= 0.55;
    push(-3 + Math.sin((i / 4) * Math.PI) * 7, y, -36 - i * 9);
  }

  // 05 LEVERAGE DROP — steep again, and banked.
  for (let i = 1; i <= 4; i += 1) {
    y -= 2.9;
    push(-3 + Math.cos((i / 4) * Math.PI) * 6, y, -72 - i * 8);
  }

  // 06 THE GAP — a shallow arc across a break in the structure. Whatever
  // momentum arrives is what carries it: the leverage argument as geometry.
  push(0, y - 1.1, -106);
  push(3, y - 2, -113);
  y -= 3.4;
  push(5, y, -120);

  // 07 ZIGZAG — switchbacks. Corners cost the fast marbles more than the steady
  // ones, so this is another place the order turns over.
  for (let i = 1; i <= 6; i += 1) {
    y -= 1.7;
    push(5 - i * 0.8 + (i % 2 === 0 ? 7 : -7), y, -120 - i * 7);
  }

  // 08 GATES — a straight run through gates hanging lower as it goes.
  for (let i = 1; i <= 4; i += 1) {
    y -= 2.1;
    push(0, y, -162 - i * 8);
  }

  // 09 PEG FIELD — lateral deflection with nothing behind it. Amplitude is
  // hash-derived, never score-derived: luck must not look like a reward.
  for (let i = 1; i <= 6; i += 1) {
    y -= 1.7;
    push((jitter(i * 9.7) - 0.5) * 12, y, -194 - i * 7);
  }

  // 10 FINISH — one remembered end, reached at three different moments.
  push(0, y - 3, -240);
  push(0, y - 5, -250);
  return points;
}

const BOARD = new THREE.CatmullRomCurve3(buildBoardPoints(), false, "catmullrom", 0.5);
const BOARD_POINTS: THREE.Vector3[] = [];
for (let i = 0; i <= SAMPLES; i += 1) BOARD_POINTS.push(BOARD.getPointAt(i / SAMPLES));

interface Profile {
  colour: number;
  lane: number;
  times: number[];
  total: number;
}

/**
 * Integrate one marble's speed profile over the shared board.
 *
 * Speed converts from slope at a rate the ecosystem sets, bleeds to rolling loss
 * the endowment resists, and never reaches zero: a stalled marble would divide by
 * zero and freeze the scrub. A climb reads as a crawl instead, which is also the
 * honest picture — every path in this dataset did reach its milestone.
 */
function buildProfile(spec: RunnerSpec): Profile {
  const times: number[] = [0];
  const efficiency = 0.972 + spec.endowment * 0.007;
  const gravity = 2.4 + spec.ecosystem * 1.5;
  let speed = 2.2 + spec.inherited * 0.9;
  let elapsed = 0;

  for (let i = 1; i <= SAMPLES; i += 1) {
    const previous = BOARD_POINTS[i - 1];
    const current = BOARD_POINTS[i];
    const distance = previous.distanceTo(current);
    const gradient = (previous.y - current.y) / Math.max(0.0001, distance);
    speed = Math.max(1, speed * efficiency + gradient * gravity);
    elapsed += distance / speed;
    times.push(elapsed);
  }
  return { colour: spec.colour, lane: spec.lane, times, total: elapsed };
}

const PROFILES = RUNNERS.map(buildProfile);
/** One clock for all three, so they genuinely finish at different moments. */
const SLOWEST = Math.max(...PROFILES.map((profile) => profile.total));

function sampleIndexAtTime(profile: Profile, t: number): number {
  const clamped = Math.min(Math.max(t, 0), profile.total);
  let low = 0;
  let high = profile.times.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (profile.times[mid] <= clamped) low = mid;
    else high = mid;
  }
  const span = profile.times[high] - profile.times[low] || 1;
  return low + (clamped - profile.times[low]) / span;
}

function samplePointAt(index: number, target: THREE.Vector3) {
  const clamped = Math.min(Math.max(index, 0), SAMPLES);
  const low = Math.floor(clamped);
  const high = Math.min(SAMPLES, low + 1);
  target.lerpVectors(BOARD_POINTS[low], BOARD_POINTS[high], clamped - low);
}

/** Sideways vector at a point on the board, for placing things across it. */
function boardRightAt(at: number, target: THREE.Vector3): THREE.Vector3 {
  return target.crossVectors(BOARD.getTangentAt(Math.min(0.999, at)), UP).normalize();
}

function buildBoardBed(group: THREE.Group) {
  const bed = new THREE.Mesh(
    new THREE.TubeGeometry(BOARD, 780, TRACK_RADIUS, 14, false),
    new THREE.MeshStandardMaterial({
      color: COLORS.bed,
      emissive: 0x121a2b,
      emissiveIntensity: 0.5,
      metalness: 0.24,
      roughness: 0.66,
      side: THREE.BackSide,
    }),
  );
  bed.receiveShadow = true;
  group.add(bed);

  const right = new THREE.Vector3();
  for (const side of [-1, 1]) {
    const railPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i += 1) {
      const at = i / 120;
      const point = BOARD.getPointAt(at);
      boardRightAt(at, right);
      railPoints.push(
        point.clone().addScaledVector(right, side * TRACK_RADIUS * 0.9).setY(point.y + 2.4),
      );
    }
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints), 480, 0.13, 6, false),
      new THREE.MeshStandardMaterial({
        color: COLORS.boost,
        emissive: COLORS.boost,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.34,
      }),
    ));
  }
}

/** The holes the marbles drop through, starting at the very beginning. */
function buildHoles(group: THREE.Group) {
  const material = new THREE.MeshStandardMaterial({
    color: COLORS.boost,
    emissive: COLORS.boost,
    emissiveIntensity: 0.55,
    metalness: 0.6,
    roughness: 0.3,
  });
  for (const at of HOLES) {
    const point = BOARD.getPointAt(Math.min(0.999, at));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(TRACK_RADIUS + 0.5, 0.18, 8, 36), material);
    ring.position.copy(point);
    ring.lookAt(BOARD.getPointAt(Math.min(0.999, at + 0.015)));
    group.add(ring);
  }
}

/**
 * Ghost branches: at each junction, a path that was available and did not
 * happen. This is what "one of many" means here — an alternative that fades out,
 * not a rival in the next lane.
 */
function buildGhostBranches(group: THREE.Group) {
  const material = new THREE.MeshBasicMaterial({
    color: COLORS.ghost,
    opacity: 0.16,
    transparent: true,
  });
  const right = new THREE.Vector3();
  for (const [index, at] of [0.1, 0.26, 0.42, 0.6, 0.79].entries()) {
    const origin = BOARD.getPointAt(at);
    const tangent = BOARD.getTangentAt(at);
    boardRightAt(at, right);
    const away = jitter(index * 3.1) > 0.5 ? 1 : -1;
    const points = [origin.clone()];
    for (let step = 1; step <= 5; step += 1) {
      points.push(
        origin.clone()
          .addScaledVector(tangent, step * 7)
          .addScaledVector(right, away * step * step * 1.6)
          .setY(origin.y - step * (2.2 + jitter(index + step) * 2.4)),
      );
    }
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 42, TRACK_RADIUS * 0.4, 6, false),
      material,
    ));
  }
}

/** Truss hoops over the leverage drop, so the section reads as built. */
function buildTrusses(group: THREE.Group) {
  const material = new THREE.MeshStandardMaterial({
    color: COLORS.rail, metalness: 0.6, roughness: 0.42,
  });
  for (let i = 0; i < 5; i += 1) {
    const point = BOARD.getPointAt(0.42 + i * 0.022);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(7, 0.16, 6, 24, Math.PI), material);
    hoop.position.set(point.x, point.y - 1.6, point.z);
    group.add(hoop);
  }
}

/** Gates through the straight run, each hanging lower than the last. */
function buildGates(group: THREE.Group) {
  const post = new THREE.MeshStandardMaterial({
    color: COLORS.frame, metalness: 0.5, roughness: 0.48,
  });
  const bar = new THREE.MeshStandardMaterial({
    color: COLORS.drag,
    emissive: COLORS.drag,
    emissiveIntensity: 0.6,
    metalness: 0.42,
    roughness: 0.4,
  });
  const right = new THREE.Vector3();
  for (let i = 0; i < 4; i += 1) {
    const at = 0.72 + i * 0.024;
    const point = BOARD.getPointAt(at);
    boardRightAt(at, right);
    for (const side of [-1, 1]) {
      const column = new THREE.Mesh(new THREE.BoxGeometry(0.22, 6, 0.22), post);
      column.position.copy(point).addScaledVector(right, side * (TRACK_RADIUS + 1.4));
      column.position.y += 2.8;
      group.add(column);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry((TRACK_RADIUS + 1.4) * 2, 0.16, 0.16), bar);
    lintel.position.set(point.x, point.y + 5.4 - i * 0.4, point.z);
    lintel.rotation.z = i * 0.03;
    group.add(lintel);
  }
}

/** Deflector pegs. Placement is hash-derived, never score-derived. */
function buildPegField(group: THREE.Group) {
  const PEGS = 30;
  const pegs = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.14, 2.6, 6),
    new THREE.MeshStandardMaterial({
      color: 0x7c8aa8,
      emissive: 0x33405c,
      emissiveIntensity: 0.42,
      metalness: 0.45,
      roughness: 0.42,
    }),
    PEGS,
  );
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < PEGS; i += 1) {
    const point = BOARD.getPointAt(0.84 + (i / PEGS) * 0.15);
    matrix.makeTranslation(
      point.x + (jitter(i * 2.7) - 0.5) * 14,
      point.y + 1.4,
      point.z + (jitter(i * 4.1) - 0.5) * 5,
    );
    pegs.setMatrixAt(i, matrix);
  }
  pegs.instanceMatrix.needsUpdate = true;
  group.add(pegs);
}

/** Finish arch: one remembered end, reached at three different moments. */
function buildFinish(group: THREE.Group) {
  const at = BOARD.getPointAt(0.993);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.22, 8, 40, Math.PI),
    new THREE.MeshStandardMaterial({
      color: COLORS.finish,
      emissive: COLORS.finish,
      emissiveIntensity: 0.5,
      metalness: 0.55,
      roughness: 0.32,
    }),
  );
  arch.position.set(at.x, at.y - 1.4, at.z);
  group.add(arch);
}

interface MarbleParts {
  glow: THREE.PointLight;
  mesh: THREE.Mesh;
}

function buildMarble(colour: number, group: THREE.Group): MarbleParts {
  const marble = new THREE.Mesh(
    new THREE.SphereGeometry(MARBLE_RADIUS, 36, 26),
    new THREE.MeshPhysicalMaterial({
      clearcoat: 0.4,
      clearcoatRoughness: 0.22,
      color: colour,
      emissive: colour,
      emissiveIntensity: 0.38,
      envMapIntensity: 0.14,
      metalness: 0,
      roughness: 0.16,
    }),
  );
  marble.castShadow = true;
  group.add(marble);

  const glow = new THREE.PointLight(colour, 420, 40, 2);
  group.add(glow);
  return { glow, mesh: marble };
}

function buildEnvironment(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x0a0e16, 1.25));

  const key = new THREE.DirectionalLight(0xfff2dc, 2.4);
  key.position.set(-30, 60, 30);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    bottom: -70, far: 340, left: -60, near: 1, right: 60, top: 70,
  });
  // Without a bias the marbles self-shadow into speckle at this map resolution.
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.06;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6f8dff, 1.35);
  rim.position.set(34, 14, -100);
  scene.add(rim);

  const accents: [number, number, number][] = [
    [0x9fc4ff, 1.4, 0.04],
    [0xbfe0ff, 1.3, 0.22],
    [0x5fd3bc, 2.1, 0.46],
    [0xf0a36b, 1.9, 0.72],
    [0xffd9a0, 1.7, 0.93],
  ];
  for (const [colour, intensity, at] of accents) {
    const point = BOARD.getPointAt(at);
    const light = new THREE.PointLight(colour, intensity * 210, 170, 2);
    light.position.set(point.x + 6, point.y + 13, point.z);
    scene.add(light);
  }
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
    else material?.dispose();
  });
  scene.clear();
}

interface Runner {
  glow: THREE.PointLight;
  mesh: THREE.Mesh;
  profile: Profile;
}

interface WorldResources {
  camera: THREE.PerspectiveCamera;
  environmentTexture: THREE.Texture;
  runners: Runner[];
  scene: THREE.Scene;
}

function createWorld(renderer: THREE.WebGLRenderer, lowQuality: boolean): WorldResources {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.0062);
  const camera = new THREE.PerspectiveCamera(lowQuality ? 58 : 50, 1, 0.2, 480);

  const world = new THREE.Group();
  scene.add(world);
  buildBoardBed(world);
  buildHoles(world);
  buildGhostBranches(world);
  buildTrusses(world);
  buildGates(world);
  buildPegField(world);
  buildFinish(world);
  const runners = PROFILES.map((profile) => ({
    ...buildMarble(profile.colour, world),
    profile,
  }));
  buildEnvironment(scene);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environmentTexture = pmrem.fromScene(room, 0.04).texture;
  scene.environment = environmentTexture;
  room.traverse((object) => {
    (object as THREE.Mesh).geometry?.dispose();
  });
  pmrem.dispose();

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = !lowQuality;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return { camera, environmentTexture, runners, scene };
}

interface FrameOptions extends WorldResources {
  canvas: HTMLCanvasElement;
  getProgress: () => number;
  onHole?: (index: number, pace: number) => void;
  renderer: THREE.WebGLRenderer;
}

/** Arc distance within which two marbles are touching. */
const CONTACT = 0.02;
/** How far contact shoves a marble sideways, in lane widths. */
const SHOVE = 1.15;
/** Half-width of the window the camera averages over, in arc fraction. */
const CAMERA_SMOOTHING = 0.035;

/**
 * A camera anchor that does not shake.
 *
 * Chasing the marbles directly threw the camera around every time the board
 * turned — worst through the helix, where the tangent sweeps a full circle. This
 * averages board position over a window of arc length instead, which low-passes
 * the geometry without introducing any per-frame state, so scrubbing stays exact.
 */
function smoothedAnchor(at: number, target: THREE.Vector3, into: THREE.Vector3) {
  target.set(0, 0, 0);
  const steps = 7;
  for (let i = 0; i < steps; i += 1) {
    const offset = (i / (steps - 1) - 0.5) * 2 * CAMERA_SMOOTHING;
    samplePointAt(Math.min(1, Math.max(0, at + offset)) * SAMPLES, into);
    target.add(into);
  }
  target.multiplyScalar(1 / steps);
}

function createFrameRenderer(options: FrameOptions) {
  const { camera, canvas, renderer, runners, scene } = options;
  const anchor = new THREE.Vector3();
  const working = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const behind = new THREE.Vector3();
  const aim = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const right = new THREE.Vector3();
  const ndc = new THREE.Vector3();
  const arcs: number[] = runners.map(() => 0);
  let renderedFrames = 0;
  let lastHole = -1;

  return () => {
    const scroll = Math.min(Math.max(options.getProgress(), 0), 1);
    // Ease-out only. No ease-in and no head start: the run begins inside the
    // first hole at scroll zero.
    const clock = (1 - (1 - scroll) * (1 - scroll)) * SLOWEST;

    for (const [index, runner] of runners.entries()) {
      arcs[index] = sampleIndexAtTime(runner.profile, clock) / SAMPLES;
    }

    let pace = 0;
    for (const [index, runner] of runners.entries()) {
      const at = arcs[index];
      samplePointAt(at * SAMPLES, working);
      boardRightAt(at, right);

      // Contact. Deterministic and stateless: a marble's sideways offset is a
      // pure function of where everything is on this frame, so the whole scene
      // still scrubs exactly. Close marbles shove each other toward their own
      // side of the board, which reads as jostling without any solver.
      let lateral = runner.profile.lane * LANE_SPACING;
      for (const [otherIndex, other] of runners.entries()) {
        if (otherIndex === index) continue;
        const separation = at - arcs[otherIndex];
        if (Math.abs(separation) >= CONTACT) continue;
        const closeness = 1 - Math.abs(separation) / CONTACT;
        const side = runner.profile.lane === other.profile.lane
          ? Math.sign(index - otherIndex)
          : Math.sign(runner.profile.lane - other.profile.lane);
        lateral += side * closeness * SHOVE * LANE_SPACING;
      }

      runner.mesh.position.copy(working)
        .addScaledVector(right, lateral)
        .setY(working.y + MARBLE_RADIUS * 0.5);
      const rolled = at * 260;
      runner.mesh.rotation.set(rolled * 0.3, rolled * 0.1, -rolled);
      runner.glow.position.copy(runner.mesh.position).setY(runner.mesh.position.y + 2.2);
      pace += at;
    }
    pace /= runners.length;

    // Report a hole crossing once, for the optional audio layer. Derived from
    // pace rather than accumulated, so scrubbing backwards re-arms it.
    const hole = HOLES.filter((at) => at <= pace).length - 1;
    if (hole !== lastHole) {
      if (hole > lastHole) options.onHole?.(hole, pace);
      lastHole = hole;
    }

    // Follow the pack's average position along the board, not any one marble.
    // All three are on the same structure, so this always frames them together.
    smoothedAnchor(pace, anchor, working);
    samplePointAt(Math.min(1, pace + CAMERA_SMOOTHING) * SAMPLES, ahead);
    samplePointAt(Math.max(0, pace - CAMERA_SMOOTHING) * SAMPLES, behind);
    tangent.subVectors(ahead, behind).normalize();
    right.crossVectors(tangent, UP).normalize();

    camera.position.copy(anchor)
      .addScaledVector(tangent, -44)
      .addScaledVector(right, 17)
      .addScaledVector(UP, 21);
    // Aimed to the -right of the pack, which places it in the right half of the
    // frame clear of the copy column; verified by projecting to NDC, not by eye.
    aim.copy(anchor).addScaledVector(tangent, 30).addScaledVector(right, -22);
    aim.y -= 5;
    camera.lookAt(aim);

    renderer.render(scene, camera);
    renderedFrames += 1;
    canvas.dataset.storyFrames = String(renderedFrames);
    canvas.dataset.storyRunners = runners
      .map((runner) => {
        ndc.copy(runner.mesh.position).project(camera);
        const on = Math.abs(ndc.x) < 1 && Math.abs(ndc.y) < 1 && ndc.z < 1;
        return `${ndc.x.toFixed(2)}:${ndc.y.toFixed(2)}${on ? "" : "!OFF"}`;
      })
      .join(" ");
    canvas.dataset.storyOrder = arcs
      .map((arc, index) => `${index}@${arc.toFixed(3)}`)
      .join(" ");
  };
}

export function mountMarbleWorld(canvas: HTMLCanvasElement): MarbleWorldController | null {
  const atmosphere = canvas.closest<HTMLElement>(".story-atmosphere");
  if (!atmosphere) return null;
  const lowQuality = canvas.clientWidth < 760;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lowQuality, canvas });
  } catch {
    return null;
  }

  const world = createWorld(renderer, lowQuality);
  const { camera, environmentTexture, scene } = world;

  let targetProgress = 0;
  let currentProgress = 0;
  let frame = 0;
  let destroyed = false;
  let visible = !document.hidden;
  let lastTime = performance.now();

  const render = createFrameRenderer({
    ...world,
    canvas,
    getProgress: () => currentProgress,
    onHole: (index, pace) => {
      canvas.dispatchEvent(new CustomEvent("marble-hole", { detail: { index, pace } }));
    },
    renderer,
  });

  const resize = () => {
    const width = Math.max(1, document.documentElement.clientWidth || canvas.clientWidth);
    const height = Math.max(1, document.documentElement.clientHeight || canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowQuality ? 1.1 : 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const tick = (now: number) => {
    if (destroyed) return;
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    currentProgress = THREE.MathUtils.damp(currentProgress, targetProgress, 5.4, delta);
    render();
    if (visible) frame = window.requestAnimationFrame(tick);
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
  render();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  canvas.addEventListener("webglcontextlost", onContextLost);
  frame = window.requestAnimationFrame(tick);

  return {
    setProgress(progress) {
      targetProgress = Math.min(Math.max(progress, 0), 1);
    },
    destroy() {
      destroyed = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      atmosphere.classList.remove("story-webgl-ready");
      canvas.style.removeProperty("opacity");
      environmentTexture.dispose();
      disposeScene(scene);
      renderer.dispose();
    },
  };
}
