// The marble run: three marbles, one open channel, and the branches none took.
//
// WHY THREE. Sixty-four marbles read as a competition — the frame the essay this
// project is named after spends its length dismantling — and a crowd nobody can
// follow. One compared nothing, and comparison is what the reader arrived
// holding. Two on separate boards never met. Three on a shared channel touch,
// jostle, and trade the lead, and the lead trading is the argument: whoever is
// ahead is ahead because of where the course currently is.
//
// Each marble's speed profile comes from the three condition factors the person
// profiles publish — inherited sets starting momentum, endowment sets rolling
// retention, ecosystem sets how much of a slope converts to speed at all.
//
// THREE THINGS THIS FILE GOT WRONG BEFORE, all fixed here, all worth stating so
// they are not reintroduced:
//
//   1. The track was a TubeGeometry with side: BackSide — the inside far wall of
//      a pipe. It rendered as soft grey sausages, and no amount of lighting was
//      ever going to fix that. It is now an open channel swept from a U profile,
//      so the surface the marbles run on is actually visible.
//   2. Marble colour washed out three separate times: clearcoat reflecting the
//      environment, then emissive saturating under ACES, then a pastel palette.
//      The real fix is `toneMapped = false` on the marble materials, which takes
//      them out of tone mapping entirely. Their colour is now exactly specified.
//   3. It stuttered. Eight point lights (each a full per-fragment pass), a 2048
//      shadow map regenerated every frame because the casters move, and a render
//      loop that ran forever whether anything had changed or not. Lights are now
//      directional, shadows are faked with a contact disc, and the loop renders
//      on demand.
//
// MOTION MODEL — deliberately not a physics engine. Scroll runs backwards, and a
// rigid-body simulation cannot be scrubbed: reversing it needs the whole history.
// Each profile is integrated once into an arc-length/time table, inverted at
// render time. Even contact between marbles is a pure function of the current
// frame's positions, so the scene is reversible and identical every run.
import * as THREE from "three";

export interface MarbleWorldController {
  destroy: () => void;
  setProgress: (progress: number) => void;
}

interface RunnerSpec {
  colour: number;
  /** Slope-to-speed conversion. High dives well and fades on the flat. */
  ecosystem: number;
  /** Rolling retention. High holds pace where the course stops helping. */
  endowment: number;
  /** Starting momentum, handed over before the run began. */
  inherited: number;
  /** Resting lane across the channel. */
  lane: number;
}

/**
 * Three runners, tuned so the lead changes hands.
 *
 * The first dives hardest and bleeds most; the third is the opposite. On a
 * channel that alternates steep and shallow that guarantees crossings rather
 * than one winner pulling away — the only version that does not read as a rank.
 */
const RUNNERS: RunnerSpec[] = [
  { colour: 0xff7a1a, ecosystem: 3, endowment: 0, inherited: 3, lane: -1 },
  { colour: 0x3d9bff, ecosystem: 1, endowment: 2, inherited: 1, lane: 0 },
  { colour: 0x30d158, ecosystem: 0, endowment: 3, inherited: 0, lane: 1 },
];

const COLORS = {
  channel: 0x3c4a68,
  channelLip: 0x8fa3c8,
  fog: 0x141c30,
  frame: 0x222c42,
  ghost: 0x7089b8,
  hole: 0x5fd3bc,
  sky: 0x0e1524,
};

const MARBLE_RADIUS = 1.5;
/** Half-width of the channel floor. Three marbles abreast, and no more. */
const CHANNEL_HALF = 2.7;
const CHANNEL_LIP = 1.7;
const LANE_SPACING = 1.45;
const SAMPLES = 560;
const TRAIL = 5;
const UP = new THREE.Vector3(0, 1, 0);

/** Deterministic hash-based jitter. No Math.random: the world must be stable. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43_758.545_3;
  return x - Math.floor(x);
}

/** Holes along the channel. The run starts inside the first one. */
const HOLES = [0, 0.16, 0.35, 0.55, 0.74, 0.9];

/**
 * The channel, obstacle by obstacle. It deliberately alternates steep and
 * shallow: that is what makes the lead change hands.
 */
function buildBoardPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const push = (x: number, y: number, z: number) => points.push(new THREE.Vector3(x, y, z));

  // 01 FIRST HOLE — the run opens here, at the drop, not before it.
  push(3, 50, 22);
  push(1, 43, 15);
  // 02 RUN-OUT — shallow. The steady marbles claw back what the divers took.
  push(-1, 40.5, 6);
  push(-3, 39, -4);
  // 03 HELIX — a descending spiral, and steep.
  for (let i = 1; i <= 18; i += 1) {
    const t = i / 18;
    const angle = t * Math.PI * 2 * 1.4;
    push(-3 + Math.sin(angle) * 10, 39 - t * 19, -9 - t * 24 + (Math.cos(angle) - 1) * 3.5);
  }
  // 04 LONG FLAT — barely any gradient. Rolling retention decides here.
  let y = 20;
  for (let i = 1; i <= 4; i += 1) {
    y -= 0.5;
    push(-3 + Math.sin((i / 4) * Math.PI) * 6, y, -34 - i * 9);
  }
  // 05 LEVERAGE DROP — steep again, and banked.
  for (let i = 1; i <= 4; i += 1) {
    y -= 2.8;
    push(-3 + Math.cos((i / 4) * Math.PI) * 5, y, -70 - i * 8);
  }
  // 06 THE GAP — a shallow arc over a break. Momentum alone carries it.
  push(0, y - 1, -102);
  push(3, y - 1.9, -109);
  y -= 3.2;
  push(5, y, -116);
  // 07 ZIGZAG — switchbacks cost the fast marbles more than the steady ones.
  for (let i = 1; i <= 6; i += 1) {
    y -= 1.6;
    push(5 - i * 0.8 + (i % 2 === 0 ? 6.5 : -6.5), y, -116 - i * 7);
  }
  // 08 GATES — a straight run through gates hanging lower as it goes.
  for (let i = 1; i <= 4; i += 1) {
    y -= 2;
    push(0, y, -158 - i * 8);
  }
  // 09 PEG FIELD — deflection with nothing behind it. Hash-derived, never
  // score-derived: luck must not look like a reward.
  for (let i = 1; i <= 6; i += 1) {
    y -= 1.6;
    push((jitter(i * 9.7) - 0.5) * 11, y, -190 - i * 7);
  }
  // 10 FINISH — one remembered end, reached at three different moments.
  push(0, y - 3, -236);
  push(0, y - 5, -246);
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
 * Integrate one marble's speed profile over the shared channel.
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

function boardRightAt(at: number, target: THREE.Vector3): THREE.Vector3 {
  return target.crossVectors(BOARD.getTangentAt(Math.min(0.999, at)), UP).normalize();
}

/**
 * The channel: a U profile swept along the curve.
 *
 * This replaces a TubeGeometry rendered with side: BackSide, which showed the
 * inside far wall of a pipe and read as a grey sausage. An open channel puts the
 * running surface in view, which is the thing a marble run is actually about.
 */
function buildChannelGeometry(): THREE.BufferGeometry {
  // Local (right, up) profile: lip, wall, floor, wall, lip.
  const profile: [number, number][] = [
    [-CHANNEL_HALF - 0.35, CHANNEL_LIP],
    [-CHANNEL_HALF, 0],
    [0, -0.4],
    [CHANNEL_HALF, 0],
    [CHANNEL_HALF + 0.35, CHANNEL_LIP],
  ];
  const rings = 280;
  const positions: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const right = new THREE.Vector3();

  for (let ring = 0; ring <= rings; ring += 1) {
    const at = ring / rings;
    point.copy(BOARD.getPointAt(at));
    boardRightAt(at, right);
    for (const [across, lift] of profile) {
      positions.push(
        point.x + right.x * across,
        point.y + lift,
        point.z + right.z * across,
      );
    }
  }
  const stride = profile.length;
  for (let ring = 0; ring < rings; ring += 1) {
    for (let edge = 0; edge < stride - 1; edge += 1) {
      const a = ring * stride + edge;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildChannel(group: THREE.Group) {
  group.add(new THREE.Mesh(
    buildChannelGeometry(),
    new THREE.MeshStandardMaterial({
      color: COLORS.channel,
      metalness: 0.18,
      roughness: 0.58,
      side: THREE.DoubleSide,
    }),
  ));

  // A bright lip along both edges gives the channel a readable silhouette
  // against the background, which the old dark tube never had.
  const right = new THREE.Vector3();
  for (const side of [-1, 1]) {
    const lip: THREE.Vector3[] = [];
    for (let i = 0; i <= 130; i += 1) {
      const at = i / 130;
      const point = BOARD.getPointAt(at);
      boardRightAt(at, right);
      lip.push(point.clone().addScaledVector(right, side * (CHANNEL_HALF + 0.35)).setY(point.y + CHANNEL_LIP));
    }
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lip), 300, 0.16, 5, false),
      new THREE.MeshStandardMaterial({
        color: COLORS.channelLip,
        metalness: 0.4,
        roughness: 0.34,
      }),
    );
    group.add(rail);
  }
}

function buildHoles(group: THREE.Group) {
  const material = new THREE.MeshBasicMaterial({ color: COLORS.hole, toneMapped: false });
  for (const at of HOLES) {
    const point = BOARD.getPointAt(Math.min(0.999, at));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(CHANNEL_HALF + 0.9, 0.14, 6, 30), material);
    ring.position.copy(point);
    ring.lookAt(BOARD.getPointAt(Math.min(0.999, at + 0.015)));
    group.add(ring);
  }
}

/** Ghost branches: paths that were available and did not happen. */
function buildGhostBranches(group: THREE.Group) {
  const material = new THREE.MeshBasicMaterial({
    color: COLORS.ghost, opacity: 0.2, transparent: true,
  });
  const right = new THREE.Vector3();
  for (const [index, at] of [0.1, 0.26, 0.42, 0.6, 0.79].entries()) {
    const origin = BOARD.getPointAt(at);
    const tangent = BOARD.getTangentAt(at);
    boardRightAt(at, right);
    const away = jitter(index * 3.1) > 0.5 ? 1 : -1;
    const points = [origin.clone()];
    for (let step = 1; step <= 4; step += 1) {
      points.push(
        origin.clone()
          .addScaledVector(tangent, step * 7)
          .addScaledVector(right, away * step * step * 1.7)
          .setY(origin.y - step * (2.4 + jitter(index + step) * 2.2)),
      );
    }
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, CHANNEL_HALF * 0.55, 5, false),
      material,
    ));
  }
}

/** Gates through the straight run, each hanging lower than the last. */
function buildGates(group: THREE.Group) {
  const post = new THREE.MeshStandardMaterial({
    color: COLORS.frame, metalness: 0.45, roughness: 0.5,
  });
  const bar = new THREE.MeshBasicMaterial({ color: 0xf0a36b, toneMapped: false });
  const right = new THREE.Vector3();
  for (let i = 0; i < 4; i += 1) {
    const at = 0.72 + i * 0.024;
    const point = BOARD.getPointAt(at);
    boardRightAt(at, right);
    for (const side of [-1, 1]) {
      const column = new THREE.Mesh(new THREE.BoxGeometry(0.22, 6, 0.22), post);
      column.position.copy(point).addScaledVector(right, side * (CHANNEL_HALF + 1.2));
      column.position.y += 2.8;
      group.add(column);
    }
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry((CHANNEL_HALF + 1.2) * 2, 0.16, 0.16), bar,
    );
    lintel.position.set(point.x, point.y + 5.3 - i * 0.4, point.z);
    group.add(lintel);
  }
}

/** Deflector pegs. Hash-derived placement, never score-derived. */
function buildPegField(group: THREE.Group) {
  const PEGS = 26;
  const pegs = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.15, 0.15, 2.4, 6),
    new THREE.MeshStandardMaterial({ color: 0x93a3c4, metalness: 0.4, roughness: 0.44 }),
    PEGS,
  );
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < PEGS; i += 1) {
    const point = BOARD.getPointAt(0.84 + (i / PEGS) * 0.15);
    matrix.makeTranslation(
      point.x + (jitter(i * 2.7) - 0.5) * 12,
      point.y + 1.3,
      point.z + (jitter(i * 4.1) - 0.5) * 5,
    );
    pegs.setMatrixAt(i, matrix);
  }
  pegs.instanceMatrix.needsUpdate = true;
  group.add(pegs);
}

function buildFinish(group: THREE.Group) {
  const at = BOARD.getPointAt(0.993);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(6.4, 0.2, 8, 36, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false }),
  );
  arch.position.set(at.x, at.y - 1.2, at.z);
  group.add(arch);
}

interface MarbleParts {
  contact: THREE.Mesh;
  mesh: THREE.Mesh;
  trail: THREE.Mesh[];
}

/**
 * A marble, its contact patch, and its motion trail.
 *
 * `toneMapped: false` is the important line. ACES tone mapping desaturated these
 * to near-white three separate times, whatever I did to the palette or the
 * emissive. Taking the marbles out of tone mapping makes their colour exactly
 * what is specified here, and nothing downstream can wash it out again.
 */
function buildMarble(colour: number, group: THREE.Group): MarbleParts {
  const geometry = new THREE.SphereGeometry(MARBLE_RADIUS, 32, 24);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color: colour,
    emissive: colour,
    emissiveIntensity: 0.18,
    metalness: 0.1,
    roughness: 0.34,
    // The important line. ACES desaturated these to near-white three times over,
    // whatever the palette or emissive did. Excluding the marbles from tone
    // mapping means their colour is exactly what is written above, and they
    // still shade like spheres because the material is lit.
    toneMapped: false,
  }));
  group.add(mesh);

  // Contact patch instead of a real shadow. A moving caster forced the whole
  // 2048 shadow map to regenerate every frame, which was most of the stutter.
  const contact = new THREE.Mesh(
    new THREE.CircleGeometry(MARBLE_RADIUS * 1.15, 18),
    new THREE.MeshBasicMaterial({
      color: 0x000000, depthWrite: false, opacity: 0.42, transparent: true,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  group.add(contact);

  // Receding ghosts read as motion blur and cost nothing to move.
  const trail: THREE.Mesh[] = [];
  for (let i = 0; i < TRAIL; i += 1) {
    const ghost = new THREE.Mesh(
      new THREE.SphereGeometry(MARBLE_RADIUS * (1 - (i + 1) * 0.16), 14, 10),
      new THREE.MeshBasicMaterial({
        color: colour,
        depthWrite: false,
        opacity: 0.16 * (1 - i / TRAIL),
        toneMapped: false,
        transparent: true,
      }),
    );
    group.add(ghost);
    trail.push(ghost);
  }
  return { contact, mesh, trail };
}

/**
 * Lighting. Directional and hemisphere only.
 *
 * There were eight point lights here. In a forward renderer each one costs a
 * full per-fragment pass over the whole scene, and together with a per-frame
 * shadow map they were the stutter. Directional lights are near-free, and the
 * marbles supply their own colour because they are unlit.
 */
function buildEnvironment(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xcfe4ff, 0x1a2338, 2.1));

  const key = new THREE.DirectionalLight(0xfff4e2, 2.6);
  key.position.set(-40, 70, 40);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x7fa4ff, 1.5);
  fill.position.set(40, 20, -60);
  scene.add(fill);
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

interface Runner extends MarbleParts {
  profile: Profile;
}

interface WorldResources {
  camera: THREE.PerspectiveCamera;
  runners: Runner[];
  scene: THREE.Scene;
}

function createWorld(lowQuality: boolean): WorldResources {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.0072);
  const camera = new THREE.PerspectiveCamera(lowQuality ? 62 : 55, 1, 0.2, 400);

  const world = new THREE.Group();
  scene.add(world);
  buildChannel(world);
  buildGhostBranches(world);
  buildHoles(world);
  buildGates(world);
  buildPegField(world);
  buildFinish(world);
  const runners = PROFILES.map((profile) => ({
    ...buildMarble(profile.colour, world),
    profile,
  }));
  buildEnvironment(scene);
  return { camera, runners, scene };
}

interface FrameOptions extends WorldResources {
  canvas: HTMLCanvasElement;
  getProgress: () => number;
  onHole?: (index: number) => void;
  renderer: THREE.WebGLRenderer;
}

const CONTACT = 0.02;
const SHOVE = 1.1;
/** Half-width of the window the camera averages board geometry over. */
const CAMERA_SMOOTHING = 0.03;

/**
 * A camera anchor that does not shake: board position averaged over a window of
 * arc length. Chasing the marbles directly threw the frame around on every turn,
 * worst through the helix where the tangent sweeps a full circle.
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
    const clock = (1 - (1 - scroll) * (1 - scroll)) * SLOWEST;

    for (const [index, runner] of runners.entries()) {
      arcs[index] = sampleIndexAtTime(runner.profile, clock) / SAMPLES;
    }

    let pace = 0;
    for (const [index, runner] of runners.entries()) {
      const at = arcs[index];
      samplePointAt(at * SAMPLES, working);
      boardRightAt(at, right);

      // Contact, stateless: a marble's sideways offset is a pure function of
      // where everything is this frame, so the scene still scrubs exactly.
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
        .setY(working.y + MARBLE_RADIUS * 0.55);
      const rolled = at * 260;
      runner.mesh.rotation.set(rolled * 0.3, rolled * 0.1, -rolled);

      // Contact patch sits on the channel floor under the marble.
      runner.contact.position.copy(runner.mesh.position);
      runner.contact.position.y -= MARBLE_RADIUS * 0.92;

      // Trail ghosts trace back along the channel.
      for (const [step, ghost] of runner.trail.entries()) {
        const back = Math.max(0, at - (step + 1) * 0.0085);
        samplePointAt(back * SAMPLES, working);
        boardRightAt(back, right);
        ghost.position.copy(working)
          .addScaledVector(right, lateral)
          .setY(working.y + MARBLE_RADIUS * 0.55);
      }
      pace += at;
    }
    pace /= runners.length;

    const hole = HOLES.filter((at) => at <= pace).length - 1;
    if (hole !== lastHole) {
      if (hole > lastHole) options.onHole?.(hole);
      lastHole = hole;
    }

    smoothedAnchor(pace, anchor, working);
    samplePointAt(Math.min(1, pace + CAMERA_SMOOTHING) * SAMPLES, ahead);
    samplePointAt(Math.max(0, pace - CAMERA_SMOOTHING) * SAMPLES, behind);
    tangent.subVectors(ahead, behind).normalize();
    right.crossVectors(tangent, UP).normalize();

    // Low and close, alongside the channel, the way this footage is actually
    // shot. The old aerial vantage put the marbles at 5% of frame height, which
    // is why nobody could tell what was happening.
    camera.position.copy(anchor)
      .addScaledVector(tangent, -33)
      .addScaledVector(right, 12)
      .addScaledVector(UP, 10);
    // Aimed past the pack on the -right side, which places it in the right half
    // of the frame clear of the copy column; verified against data-story-ndc.
    aim.copy(anchor).addScaledVector(tangent, 22).addScaledVector(right, -26);
    aim.y -= 2;
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
    canvas.dataset.storyOrder = arcs.map((arc, i) => `${i}@${arc.toFixed(3)}`).join(" ");
  };
}

/** Construct and configure the renderer, or give up if WebGL is unavailable. */
function createRenderer(canvas: HTMLCanvasElement, lowQuality: boolean): THREE.WebGLRenderer | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !lowQuality,
      canvas,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  // Shadows stay off. A moving caster regenerated the whole shadow map every
  // frame; the marbles use a contact patch instead.
  renderer.shadowMap.enabled = false;
  return renderer;
}

function createResizeHandler(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  lowQuality: boolean,
) {
  return () => {
    const width = Math.max(1, document.documentElement.clientWidth || canvas.clientWidth);
    const height = Math.max(1, document.documentElement.clientHeight || canvas.clientHeight);
    // Capped hard. Above ~1.25 this scene gains nothing a reader can see and
    // costs proportionally more fragments.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowQuality ? 1 : 1.25));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
}

export function mountMarbleWorld(canvas: HTMLCanvasElement): MarbleWorldController | null {
  const atmosphere = canvas.closest<HTMLElement>(".story-atmosphere");
  if (!atmosphere) return null;
  const lowQuality = canvas.clientWidth < 760;

  const renderer = createRenderer(canvas, lowQuality);
  if (!renderer) return null;

  const world = createWorld(lowQuality);
  const { camera, scene } = world;

  let targetProgress = 0;
  let currentProgress = 0;
  let frame = 0;
  let destroyed = false;
  let visible = !document.hidden;
  let lastTime = performance.now();
  /** Frames still owed after motion stops, so the settle is not cut short. */
  let owed = 2;

  const render = createFrameRenderer({
    ...world,
    canvas,
    getProgress: () => currentProgress,
    onHole: (index) => {
      canvas.dispatchEvent(new CustomEvent("marble-hole", { detail: { index } }));
    },
    renderer,
  });

  const applyResize = createResizeHandler(canvas, camera, renderer, lowQuality);
  const resize = () => {
    applyResize();
    owed = 2;
  };

  const tick = (now: number) => {
    if (destroyed) return;
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const before = currentProgress;
    currentProgress = THREE.MathUtils.damp(currentProgress, targetProgress, 5.4, delta);

    // Render on demand. The loop used to draw forever whether or not anything
    // had changed, competing with the reader's own scrolling for the main
    // thread. Once the damped progress settles there is nothing new to draw.
    if (Math.abs(currentProgress - before) > 0.000_02 || owed > 0) {
      if (Math.abs(currentProgress - before) <= 0.000_02) owed -= 1;
      else owed = 2;
      render();
    }
    if (visible) frame = window.requestAnimationFrame(tick);
  };

  const onVisibilityChange = () => {
    visible = !document.hidden;
    if (visible && !frame) {
      lastTime = performance.now();
      owed = 2;
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
      owed = 2;
    },
    destroy() {
      destroyed = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      atmosphere.classList.remove("story-webgl-ready");
      canvas.style.removeProperty("opacity");
      disposeScene(scene);
      renderer.dispose();
    },
  };
}
