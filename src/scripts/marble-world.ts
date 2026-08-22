// The marble run: the homepage's scroll-driven world.
//
// Sixty-four marbles are released together and race down twelve lanes to a
// single finish. The lanes are not fair, and that is the entire point — the
// essay this project is named after asks the reader to picture exactly this and
// then notice that comparing two marbles' positions tells you almost nothing
// about the marbles.
//
// Every lane is generated from one person-shaped triple, the same three
// condition factors the profiles publish:
//
//   inherited  -> release height. A high drop converts to speed for free.
//   endowment  -> rolling efficiency. How little momentum is lost per metre.
//   ecosystem  -> what the track does. Boosters and clean banks, or gravel,
//                 counter-slopes, and dead flats.
//
// A -1 on any factor is a headwind, not a blank: it becomes a real uphill
// section the marble has to climb with whatever speed it arrived carrying.
//
// MOTION MODEL — deliberately not a physics engine. Scroll can go backwards,
// and a rigid-body simulation cannot be scrubbed: reversing it needs the whole
// history. Instead each lane integrates a speed profile once at construction
// into an arc-length/time table, which is then inverted at render time. That
// makes marble position a pure function of scroll progress: identical every
// time, reversible, and independent of frame rate.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface MarbleWorldController {
  destroy: () => void;
  setProgress: (progress: number) => void;
}

/** One lane's generating triple, on the published -1..3 condition scale. */
interface LaneSeed {
  endowment: number;
  inherited: number;
  ecosystem: number;
  marbles: number;
}

const COLORS = {
  bed: 0x27324a,
  rail: 0x2f3a52,
  frame: 0x141a26,
  boost: 0x5fd3bc,
  drag: 0xf0a36b,
  finish: 0xffd9a0,
  sky: 0x0b0d12,
  fog: 0x0d1220,
};

// Marble liveries. Readable apart at distance and in motion, which matters more
// here than palette elegance: the reader needs to track one marble.
const MARBLE_COLORS = [
  0x2f5fe0, 0x0f9d8a, 0xd2691e, 0xc2255c, 0xd4a017, 0x2f9e44,
  0x6741d9, 0x1c7ed6, 0xc92a2a, 0x74b816, 0xe8590c, 0x4263eb,
];

const LANE_COUNT = 12;
const TOTAL_MARBLES = 64;
const COURSE_LENGTH = 240;
const LANE_SPACING = 3.4;
const COURSE_HALF_WIDTH = ((LANE_COUNT - 1) / 2) * LANE_SPACING;

/** Deterministic hash-based jitter. No Math.random: the world must be stable. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43_758.545_3;
  return x - Math.floor(x);
}

/**
 * Build the twelve lane seeds.
 *
 * Spread across the real distribution rather than a flattering sample: most
 * paths sit mid-scale, a few carry a genuine headwind, and one lane gets the
 * full stack of tailwinds. Lane 0 is the one the story follows to the finish.
 */
function buildLaneSeeds(): LaneSeed[] {
  const seeds: LaneSeed[] = [
    { endowment: 2, inherited: 3, ecosystem: 3, marbles: 4 },
    { endowment: 2, inherited: 2, ecosystem: 2, marbles: 5 },
    { endowment: 3, inherited: 1, ecosystem: 2, marbles: 5 },
    { endowment: 1, inherited: 2, ecosystem: 3, marbles: 6 },
    { endowment: 2, inherited: 0, ecosystem: 2, marbles: 6 },
    { endowment: 1, inherited: 1, ecosystem: 1, marbles: 7 },
    { endowment: 2, inherited: -1, ecosystem: 1, marbles: 6 },
    { endowment: 3, inherited: -1, ecosystem: 0, marbles: 5 },
    { endowment: 1, inherited: 0, ecosystem: -1, marbles: 5 },
    { endowment: 0, inherited: 1, ecosystem: 0, marbles: 5 },
    { endowment: 1, inherited: -1, ecosystem: -1, marbles: 5 },
    { endowment: 0, inherited: 0, ecosystem: -1, marbles: 5 },
  ];
  const assigned = seeds.reduce((sum, seed) => sum + seed.marbles, 0);
  seeds[0].marbles += TOTAL_MARBLES - assigned;
  return seeds;
}

/**
 * The five sections, matching the five scroll chapters. Each does a different
 * job to the marble, so the terrain under the reader changes as the copy does.
 *
 *   release   64 marbles leave one hopper together.
 *   start     lanes separate to the heights their inheritance bought.
 *   leverage  gain proportional to the speed already carried.
 *   sequence  ordered gates: arriving early is what opens the next one.
 *   boundary  arbitrary deflection, then the single remembered finish.
 */
const SECTIONS = [
  { id: "release", from: 12, to: -18 },
  { id: "start", from: -18, to: -72 },
  { id: "leverage", from: -72, to: -128 },
  { id: "sequence", from: -128, to: -184 },
  { id: "boundary", from: -184, to: -COURSE_LENGTH },
] as const;

/** Height lost across one section for a given lane. Negative means a climb. */
function sectionDrop(sectionId: string, seed: LaneSeed): number {
  if (sectionId === "release") return 7;
  if (sectionId === "start") {
    // The starting field only sorts; it does not yet reward or punish.
    return 5.5;
  }
  if (sectionId === "leverage") {
    // Leverage multiplies what is already there. A lane arriving with a good
    // gradient gets a steeper hall; a lane with an ecosystem headwind gets a
    // counter-slope it has to climb on borrowed momentum.
    return seed.ecosystem < 0 ? -3.2 : 4 + seed.ecosystem * 3.1;
  }
  if (sectionId === "sequence") {
    // Compounding is order-dependent: a flat run for anyone who arrived slow.
    return seed.ecosystem <= 0 ? 0.6 : 3.4 + seed.ecosystem * 1.2;
  }
  // The boundary is the same gentle fall for everyone. Luck is not scored.
  return 4.2;
}

/**
 * A lane's centreline, assembled section by section.
 *
 * `inherited` lifts the release point, so a high-inheritance lane starts with
 * altitude it never had to earn. Everything after that is decided by which
 * section the marble is in and what that section does to it.
 */
function buildLaneCurve(seed: LaneSeed, index: number): THREE.CatmullRomCurve3 {
  const x = (index - (LANE_COUNT - 1) / 2) * LANE_SPACING;
  const wobble = (jitter(index * 3.3) - 0.5) * 1.6;
  const points: THREE.Vector3[] = [];

  // Every lane leaves the same hopper mouth, then fans to its own line. The
  // shared origin matters: the reader has to see one release, not twelve.
  let height = 34 + seed.inherited * 5.5;
  points.push(new THREE.Vector3(x * 0.18, height + 4, 16));

  for (const section of SECTIONS) {
    const drop = sectionDrop(section.id, seed);
    const steps = section.id === "boundary" ? 4 : 3;
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      const z = section.from + (section.to - section.from) * t;
      height -= drop / steps;
      // Lanes converge slightly toward the finish: many starts, one end.
      const converge = 1 - 0.28 * ((16 - z) / (16 + COURSE_LENGTH));
      let lateral = x * converge + Math.sin(step * 1.1 + index) * (0.5 + wobble * 0.3);
      if (section.id === "boundary") {
        // Arbitrary deflection, hash-derived rather than score-derived: this
        // section must not look like it is rewarding anything.
        lateral += (jitter(index * 13.7 + step * 5.1) - 0.5) * 3.4;
      }
      points.push(new THREE.Vector3(lateral, height, z));
    }
  }

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

/**
 * Integrate the lane into an arc-length -> arrival-time table.
 *
 * Speed comes from accumulated drop (gravity), is bled off by rolling loss
 * (worse for a low-endowment marble), and cannot fall to zero — a stalled
 * marble would divide by zero and freeze the scrub. An uphill span therefore
 * reads as a crawl rather than a stop, which is also the honest picture: the
 * paths in this dataset all did reach their milestone.
 */
function integrateLane(curve: THREE.CatmullRomCurve3, seed: LaneSeed) {
  const samples = 240;
  const efficiency = 0.955 + seed.endowment * 0.008;
  const times: number[] = [0];
  const positions: THREE.Vector3[] = [];
  let speed = 2.4;
  let elapsed = 0;

  for (let i = 0; i <= samples; i += 1) {
    positions.push(curve.getPointAt(i / samples));
  }
  for (let i = 1; i <= samples; i += 1) {
    const previous = positions[i - 1];
    const current = positions[i];
    const distance = previous.distanceTo(current);
    const gradient = (previous.y - current.y) / Math.max(0.0001, distance);
    // Downhill adds speed, uphill removes it, and rolling loss always applies.
    speed = Math.max(0.55, speed * efficiency + gradient * 5.6);
    elapsed += distance / speed;
    times.push(elapsed);
  }

  const total = times[times.length - 1];
  return { positions, times, total };
}

interface Lane {
  seed: LaneSeed;
  curve: THREE.CatmullRomCurve3;
  positions: THREE.Vector3[];
  times: number[];
  total: number;
}

/** Arc samples between consecutive marbles in a lane: ~3 units, over a diameter. */
const MARBLE_GAP_SAMPLES = 3;

/** Invert the time table: which arc sample has this lane reached at time `t`? */
function sampleIndexAtTime(lane: Lane, t: number): number {
  const { times } = lane;
  const clamped = Math.min(Math.max(t, 0), lane.total);
  let low = 0;
  let high = times.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (times[mid] <= clamped) low = mid;
    else high = mid;
  }
  const span = times[high] - times[low] || 1;
  return low + (clamped - times[low]) / span;
}

/** Position at a fractional arc sample. */
function samplePositionAtIndex(lane: Lane, index: number, target: THREE.Vector3) {
  const last = lane.positions.length - 1;
  const clamped = Math.min(Math.max(index, 0), last);
  const low = Math.floor(clamped);
  const high = Math.min(last, low + 1);
  target.lerpVectors(lane.positions[low], lane.positions[high], clamped - low);
}

/**
 * Convenience wrapper: position at time `t`, returning normalised arc progress.
 * Shares the one binary search rather than repeating it.
 */
function samplePosition(lane: Lane, t: number, target: THREE.Vector3): number {
  const index = sampleIndexAtTime(lane, t);
  samplePositionAtIndex(lane, index, target);
  return index / (lane.times.length - 1);
}

function buildTrack(lane: Lane, group: THREE.Group) {
  const bed = new THREE.Mesh(
    new THREE.TubeGeometry(lane.curve, 190, 1.15, 10, false),
    new THREE.MeshStandardMaterial({
      color: COLORS.bed,
      emissive: 0x0d1424,
      emissiveIntensity: 0.6,
      metalness: 0.22,
      roughness: 0.68,
      side: THREE.BackSide,
    }),
  );
  bed.receiveShadow = true;
  group.add(bed);

  // Rails read the lane's ecosystem: mint where the track helps, amber where it
  // fights. This is the only place the world colours a value judgement, and it
  // describes the track, never the marble.
  const railColor = lane.seed.ecosystem < 0
    ? COLORS.drag
    : lane.seed.ecosystem > 1
    ? COLORS.boost
    : COLORS.rail;
  for (const side of [-1, 1]) {
    const railPoints = lane.positions.filter((_unused, i) => i % 4 === 0).map((point) =>
      new THREE.Vector3(point.x + side * 1.2, point.y + 0.5, point.z)
    );
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints), 140, 0.075, 5, false),
      new THREE.MeshStandardMaterial({
        color: railColor,
        emissive: railColor,
        emissiveIntensity: lane.seed.ecosystem === 0 ? 0.12 : 0.5,
        metalness: 0.5,
        roughness: 0.4,
      }),
    );
    group.add(rail);
  }

  // Release gate, so the reader can see that all twelve start at once from
  // visibly different altitudes.
  const gate = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.35, 0.5),
    new THREE.MeshStandardMaterial({ color: COLORS.frame, metalness: 0.4, roughness: 0.5 }),
  );
  gate.position.copy(lane.positions[0]).add(new THREE.Vector3(0, 1.4, 1.2));
  group.add(gate);
}

interface MarbleUnit {
  mesh: THREE.Mesh;
  lane: Lane;
  offset: number;
  spin: THREE.Vector3;
}

function buildMarbles(lanes: Lane[], group: THREE.Group): MarbleUnit[] {
  const units: MarbleUnit[] = [];
  const geometry = new THREE.SphereGeometry(0.62, 32, 24);
  let created = 0;

  for (const lane of lanes) {
    for (let n = 0; n < lane.seed.marbles; n += 1) {
      const color = MARBLE_COLORS[created % MARBLE_COLORS.length];
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.18,
          envMapIntensity: 0.35,
          metalness: 0.05,
          roughness: 0.28,
        }),
      );
      mesh.castShadow = true;
      group.add(mesh);
      units.push({
        lane,
        mesh,
        // Marbles in one lane are staggered so the pack reads as a pack.
        offset: n,
        spin: new THREE.Vector3(
          jitter(created + 1.1) * 0.4,
          jitter(created + 2.2) * 0.4,
          1,
        ).normalize(),
      });
      created += 1;
    }
  }
  return units;
}

/**
 * Approximate track height at a given z, taken from a mid-range reference lane.
 * Props place themselves against this rather than against hardcoded numbers,
 * which is how the trusses and gates first ended up far below the track.
 */
const referenceLane: LaneSeed = { ecosystem: 1, endowment: 2, inherited: 1, marbles: 0 };

function trackHeightAt(z: number): number {
  let height = 34 + referenceLane.inherited * 5.5 + 4;
  for (const section of SECTIONS) {
    const drop = sectionDrop(section.id, referenceLane);
    if (z <= section.to) {
      height -= drop;
      continue;
    }
    if (z < section.from) {
      const t = (section.from - z) / (section.from - section.to);
      height -= drop * t;
    }
    break;
  }
  return height;
}

/** The hopper every marble leaves from: one release, not twelve. */
function buildHopper(group: THREE.Group) {
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 2.2, 9, 26, 1, true),
    new THREE.MeshStandardMaterial({
      color: COLORS.frame,
      metalness: 0.55,
      roughness: 0.44,
      side: THREE.DoubleSide,
    }),
  );
  shell.position.set(0, trackHeightAt(16) + 6, 18);
  group.add(shell);

  const lip = new THREE.Mesh(
    new THREE.TorusGeometry(7.5, 0.18, 8, 34),
    new THREE.MeshStandardMaterial({
      color: COLORS.boost,
      emissive: COLORS.boost,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.34,
    }),
  );
  lip.position.set(0, trackHeightAt(16) + 10.5, 18);
  lip.rotation.x = Math.PI / 2;
  group.add(lip);
}

/** Truss frames over the leverage hall, so the section reads as built. */
function buildTrusses(group: THREE.Group) {
  const material = new THREE.MeshStandardMaterial({
    color: COLORS.rail,
    metalness: 0.62,
    roughness: 0.42,
  });
  const radius = COURSE_HALF_WIDTH + 4;
  for (let i = 0; i < 6; i += 1) {
    const z = -76 - i * 9.5;
    const frame = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.26, 6, 26, Math.PI), material);
    // Arch over the lanes, springing from just below the track on either side.
    frame.position.set(0, trackHeightAt(z) - 2, z);
    group.add(frame);
  }
}

/** Ordered gates: passing one early is what leaves the next one open. */
function buildSequenceGates(group: THREE.Group) {
  const post = new THREE.MeshStandardMaterial({
    color: COLORS.frame,
    metalness: 0.5,
    roughness: 0.5,
  });
  const arm = new THREE.MeshStandardMaterial({
    color: COLORS.drag,
    emissive: COLORS.drag,
    emissiveIntensity: 0.45,
    metalness: 0.4,
    roughness: 0.4,
  });
  for (let i = 0; i < 4; i += 1) {
    const z = -134 - i * 13;
    const y = trackHeightAt(z) - 2;
    for (const side of [-1, 1]) {
      const column = new THREE.Mesh(new THREE.BoxGeometry(0.26, 9, 0.26), post);
      column.position.set(side * (COURSE_HALF_WIDTH + 3), y + 4, z);
      group.add(column);
    }
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(COURSE_HALF_WIDTH * 2 + 6, 0.22, 0.22),
      arm,
    );
    // Later gates hang lower and tilt further: the window is closing.
    bar.position.set(0, y + 7.2 - i * 0.6, z);
    bar.rotation.z = i * 0.045;
    group.add(bar);
  }
}

/** Deflector pegs. Placement is hash-derived, never score-derived. */
function buildLuckPegs(group: THREE.Group) {
  const geometry = new THREE.CylinderGeometry(0.11, 0.11, 1.3, 6);
  const material = new THREE.MeshStandardMaterial({
    color: 0x64748f,
    emissive: 0x2b3550,
    emissiveIntensity: 0.28,
    metalness: 0.4,
    roughness: 0.5,
  });
  const PEG_COUNT = 46;
  const pegs = new THREE.InstancedMesh(geometry, material, PEG_COUNT);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < PEG_COUNT; i += 1) {
    const x = (jitter(i * 2.3) - 0.5) * (COURSE_HALF_WIDTH * 2 + 6);
    const z = -188 - jitter(i * 4.7) * 46;
    const y = trackHeightAt(z) + 0.5 + jitter(i * 6.1) * 1.4;
    matrix.makeTranslation(x, y, z);
    pegs.setMatrixAt(i, matrix);
  }
  pegs.instanceMatrix.needsUpdate = true;
  group.add(pegs);
}

/** Finish arch: the single remembered end of sixty-four starts. */
function buildFinish(group: THREE.Group) {
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(COURSE_HALF_WIDTH + 4, 0.22, 8, 40, Math.PI),
    new THREE.MeshStandardMaterial({
      color: COLORS.finish,
      emissive: COLORS.finish,
      emissiveIntensity: 0.3,
      metalness: 0.55,
      roughness: 0.35,
    }),
  );
  arch.position.set(0, trackHeightAt(-COURSE_LENGTH) - 1.5, -COURSE_LENGTH - 2);
  group.add(arch);
}

function buildEnvironment(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x0a0e16, 1.15));

  const key = new THREE.DirectionalLight(0xfff0d8, 2.1);
  key.position.set(-34, 58, 26);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  // Without a bias the marbles self-shadow: the shadow map covers ~100x120
  // units, so a 1.2-unit marble spans a dozen texels and speckles into
  // multicoloured noise. normalBias offsets along the surface normal, which is
  // the correct fix for spheres; a depth bias alone leaves peppering at grazing
  // angles. This was the actual cause of the marbles reading as grey grit.
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.08;
  Object.assign(key.shadow.camera, {
    bottom: -60,
    far: 260,
    left: -50,
    near: 1,
    right: 50,
    top: 60,
  });
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6f8dff, 1.5);
  rim.position.set(30, 12, -80);
  scene.add(rim);

  // Raking light along the course so marbles pick up a travelling highlight.
  const rake = new THREE.DirectionalLight(0xffd9a0, 1.1);
  rake.position.set(46, 6, 20);
  scene.add(rake);

  // One accent per section. The reader should feel the chapter change in the
  // light, not only in the copy: cool at the release, warm through the leverage
  // hall, amber at the closing gates, pale and thin at the boundary.
  const accents: [number, number, number][] = [
    [0x9fc4ff, 1.5, 0],
    [0xbfe0ff, 1.3, -46],
    [0x5fd3bc, 2.2, -100],
    [0xf0a36b, 2.0, -156],
    [0xffd9a0, 1.7, -212],
  ];
  for (const [color, intensity, z] of accents) {
    const light = new THREE.PointLight(color, intensity * 300, 150, 2);
    light.position.set(6, trackHeightAt(z) + 13, z);
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

interface WorldResources {
  camera: THREE.PerspectiveCamera;
  environmentTexture: THREE.Texture;
  lanes: Lane[];
  marbles: MarbleUnit[];
  scene: THREE.Scene;
  slowest: number;
}

function createWorld(renderer: THREE.WebGLRenderer, lowQuality: boolean): WorldResources {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.0075);
  const camera = new THREE.PerspectiveCamera(lowQuality ? 52 : 46, 1, 0.2, 420);

  const trackGroup = new THREE.Group();
  const marbleGroup = new THREE.Group();
  scene.add(trackGroup, marbleGroup);

  const lanes: Lane[] = buildLaneSeeds().map((seed, index) => {
    const curve = buildLaneCurve(seed, index);
    return { curve, seed, ...integrateLane(curve, seed) };
  });
  for (const lane of lanes) buildTrack(lane, trackGroup);
  buildHopper(trackGroup);
  buildTrusses(trackGroup);
  buildSequenceGates(trackGroup);
  buildLuckPegs(trackGroup);
  buildFinish(trackGroup);
  const marbles = buildMarbles(lanes, marbleGroup);
  buildEnvironment(scene);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentRoom = new RoomEnvironment();
  const environmentTexture = pmrem.fromScene(environmentRoom, 0.04).texture;
  scene.environment = environmentTexture;
  environmentRoom.traverse((object) => {
    (object as THREE.Mesh).geometry?.dispose();
  });
  pmrem.dispose();

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = !lowQuality;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // The slowest lane sets the clock, so scroll progress 1 means every marble
  // has finished rather than only the leaders.
  const slowest = lanes.reduce((max, lane) => Math.max(max, lane.total), 0);
  return { camera, environmentTexture, lanes, marbles, scene, slowest };
}

interface FrameOptions extends WorldResources {
  canvas: HTMLCanvasElement;
  getProgress: () => number;
  renderer: THREE.WebGLRenderer;
}

function createFrameRenderer(options: FrameOptions) {
  const { camera, canvas, lanes, marbles, renderer, scene, slowest } = options;
  const workingPosition = new THREE.Vector3();
  const fieldCentre = new THREE.Vector3();
  let renderedFrames = 0;

  return () => {
    const progress = Math.min(Math.max(options.getProgress(), 0), 1);
    // Ease the clock so the release reads as a release rather than a jump cut.
    const clock = progress * progress * (3 - 2 * progress) * slowest * 1.04;

    let framedCount = 0;
    fieldCentre.set(0, 0, 0);
    for (const unit of marbles) {
      const leadIndex = sampleIndexAtTime(unit.lane, clock);
      // Constant arc-length spacing behind the lane's leader, so marbles never
      // interpenetrate no matter how slow the section is. Time-based spacing
      // stacked them on uphill spans and z-fought into colour noise.
      const index = leadIndex - unit.offset * MARBLE_GAP_SAMPLES;
      const last = unit.lane.positions.length - 1;
      samplePositionAtIndex(unit.lane, index, workingPosition);
      if (index < 0) {
        // Still in the hopper: queue up the entry chute rather than sharing the
        // release point with every other waiting marble.
        workingPosition.z += -index * 1.05;
        workingPosition.y += -index * 0.52;
      }
      unit.mesh.position.copy(workingPosition);
      unit.mesh.position.y += 0.62;
      unit.mesh.visible = index < last;
      const rolled = Math.max(0, index) * 2.1;
      unit.mesh.rotation.set(unit.spin.x * rolled, unit.spin.y * rolled, -rolled);
      if (unit.mesh.visible && index > 0) {
        fieldCentre.add(unit.mesh.position);
        framedCount += 1;
      }
    }
    if (framedCount > 0) fieldCentre.multiplyScalar(1 / framedCount);
    else samplePosition(lanes[0], clock, fieldCentre);

    // Behind and above the field, looking down the course so the lanes converge
    // and the queues read in depth. The aim point sits left of the course
    // centreline, pushing the run into the right half, clear of the copy column.
    // Lateral position is absolute, not centroid-relative: the lane bundle spans
    // +/-COURSE_HALF_WIDTH, and anchoring x to the field put the camera inside
    // the tubes whenever the pack was still compact. Only height and depth
    // follow the field.
    camera.position.set(
      COURSE_HALF_WIDTH + 7 + progress * 4,
      fieldCentre.y + 8,
      fieldCentre.z + 27,
    );
    camera.lookAt(-8, fieldCentre.y - 2.5, fieldCentre.z - 26);

    renderer.render(scene, camera);
    renderedFrames += 1;
    canvas.dataset.storyFrames = String(renderedFrames);
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
    currentProgress = THREE.MathUtils.damp(currentProgress, targetProgress, 5.2, delta);
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
