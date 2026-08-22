// The marble run: one marble, one course, and the branches it did not take.
//
// This started as a race — sixty-four marbles down twelve lanes. A race is the
// wrong picture. It reads as a competition, which is the frame the essay this
// project is named after spends its whole length dismantling, and a crowd of
// marbles is impossible to follow. Biography hides the branches; it does not
// line up rivals.
//
// So there is one marble, on a real obstacle course: a release drop through a
// funnel, a descending helix, a leverage hall that multiplies whatever speed it
// arrives carrying, a gap it has to cross on momentum alone, gates that hang
// lower as it goes, and a peg field that deflects it for no reason at all. At
// each junction a ghost branch peels away and fades — the path that was
// available and did not happen. Those are the "many" the headline means.
//
// The course is bound to the same three condition factors the profiles publish:
//
//   inherited  -> the height of the opening drop. Altitude nobody earned.
//   endowment  -> rolling efficiency. How little speed bleeds per metre.
//   ecosystem  -> whether the middle helps or fights: a bank or a counter-slope.
//
// MOTION MODEL — deliberately not a physics engine. Scroll runs backwards, and a
// rigid-body simulation cannot be scrubbed: reversing it needs the whole history.
// The course is integrated once at construction into an arc-length/time table,
// inverted at render time. Marble position is a pure function of scroll
// progress: reversible, frame-rate independent, identical every run. Steeper
// sections still genuinely run faster.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface MarbleWorldController {
  destroy: () => void;
  setProgress: (progress: number) => void;
}

/** The marble's generating triple, on the published -1..3 condition scale. */
const CONDITION = { ecosystem: 1, endowment: 2, inherited: 2 };

const COLORS = {
  bed: 0x2a3550,
  boost: 0x5fd3bc,
  drag: 0xf0a36b,
  finish: 0xffd9a0,
  fog: 0x0b1020,
  frame: 0x161d2b,
  ghost: 0x6478a0,
  marble: 0xff8f3f,
  rail: 0x3b4763,
  sky: 0x080a10,
};

const MARBLE_RADIUS = 1.15;
const TRACK_RADIUS = 1.55;
const SAMPLES = 620;
const UP = new THREE.Vector3(0, 1, 0);

/** Deterministic hash-based jitter. No Math.random: the world must be stable. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43_758.545_3;
  return x - Math.floor(x);
}

/**
 * The course, obstacle by obstacle. Each section is something the marble goes
 * through rather than a length of slope — the reader should be able to name what
 * is happening, not just watch a descent.
 */
function buildCoursePoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const push = (x: number, y: number, z: number) => points.push(new THREE.Vector3(x, y, z));

  // 01 RELEASE — a steep drop through a funnel ring. Its height is the
  // inheritance: speed handed over before the marble has done anything.
  const top = 46 + CONDITION.inherited * 5;
  push(3, top, 36);
  push(1.5, top - 7, 27);
  push(0, top - 14, 19);

  // 02 STARTING FIELD — a fast chute, banking gently away.
  push(-2, top - 20, 10);
  push(-4, top - 25, 0);
  push(-4, top - 29, -11);

  // 03 HELIX — a descending spiral. Pure marble-run, and it shows the marble
  // from every side inside one continuous camera move.
  const helixTop = top - 29;
  const helixSteps = 24;
  for (let i = 1; i <= helixSteps; i += 1) {
    const t = i / helixSteps;
    const angle = t * Math.PI * 2 * 1.75;
    push(
      -4 + Math.sin(angle) * 11,
      helixTop - t * 21,
      -15 - t * 27 + (Math.cos(angle) - 1) * 5,
    );
  }

  // 04 LEVERAGE HALL — an accelerating bank. Ecosystem decides whether this
  // multiplies the speed already carried or takes some of it back.
  let y = helixTop - 21;
  const hallDrop = CONDITION.ecosystem < 0 ? -3 : 5 + CONDITION.ecosystem * 2.6;
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 5;
    y -= hallDrop / 5;
    push(-4 + Math.sin(t * Math.PI) * 9, y, -47 - t * 35);
  }

  // 05 THE GAP — a shallow arc across a break in the structure. Whatever
  // momentum arrives is what carries it: the leverage argument as geometry.
  push(1, y - 1.4, -86);
  push(5, y - 2.4, -94);
  push(7.5, y - 4.2, -102);

  // 06 SEQUENCE — a straight run through gates, each lower than the last.
  y -= 4.2;
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 5;
    y -= 2.5;
    push(7.5 - t * 5.5, y, -102 - t * 44);
  }

  // 07 PEG FIELD — lateral deflection with nothing behind it. The amplitude is
  // hash-derived, never score-derived: luck must not look like a reward.
  for (let i = 1; i <= 8; i += 1) {
    const t = i / 8;
    y -= 2;
    push(2 + (jitter(i * 9.7) - 0.5) * 16, y, -146 - t * 54);
  }

  // 08 FINISH — one remembered end.
  push(0, y - 4, -206);
  push(0, y - 6.5, -218);
  return points;
}

const COURSE = new THREE.CatmullRomCurve3(buildCoursePoints(), false, "catmullrom", 0.5);

/**
 * Integrate the course into an arc-length -> arrival-time table.
 *
 * Speed accumulates from drop, bleeds to rolling loss (worse for a low
 * endowment), and never reaches zero: a stalled marble would divide by zero and
 * freeze the scrub. An uphill span reads as a crawl instead, which is also the
 * honest picture — every path in this dataset did reach its milestone.
 */
function integrateCourse() {
  const positions: THREE.Vector3[] = [];
  const times: number[] = [0];
  const efficiency = 0.978 + CONDITION.endowment * 0.004;
  let speed = 3;
  let elapsed = 0;

  for (let i = 0; i <= SAMPLES; i += 1) positions.push(COURSE.getPointAt(i / SAMPLES));
  for (let i = 1; i <= SAMPLES; i += 1) {
    const previous = positions[i - 1];
    const current = positions[i];
    const distance = previous.distanceTo(current);
    const gradient = (previous.y - current.y) / Math.max(0.0001, distance);
    speed = Math.max(1.1, speed * efficiency + gradient * 3.4);
    elapsed += distance / speed;
    times.push(elapsed);
  }
  return { positions, times, total: elapsed };
}

const TRACK = integrateCourse();

/** Which arc sample has the marble reached at time `t`? */
function sampleIndexAtTime(t: number): number {
  const clamped = Math.min(Math.max(t, 0), TRACK.total);
  let low = 0;
  let high = TRACK.times.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (TRACK.times[mid] <= clamped) low = mid;
    else high = mid;
  }
  const span = TRACK.times[high] - TRACK.times[low] || 1;
  return low + (clamped - TRACK.times[low]) / span;
}

function samplePositionAtIndex(index: number, target: THREE.Vector3) {
  const last = TRACK.positions.length - 1;
  const clamped = Math.min(Math.max(index, 0), last);
  const low = Math.floor(clamped);
  const high = Math.min(last, low + 1);
  target.lerpVectors(TRACK.positions[low], TRACK.positions[high], clamped - low);
}

/** Sideways vector at a point on the course, for placing things beside it. */
function courseRightAt(at: number, target: THREE.Vector3): THREE.Vector3 {
  return target.crossVectors(COURSE.getTangentAt(Math.min(0.999, at)), UP).normalize();
}

function buildTrackBed(group: THREE.Group) {
  const bed = new THREE.Mesh(
    new THREE.TubeGeometry(COURSE, 720, TRACK_RADIUS, 12, false),
    new THREE.MeshStandardMaterial({
      color: COLORS.bed,
      emissive: 0x121a2b,
      emissiveIntensity: 0.55,
      metalness: 0.24,
      roughness: 0.64,
      side: THREE.BackSide,
    }),
  );
  bed.receiveShadow = true;
  group.add(bed);

  // Rails along the top edges, so the channel reads as a channel from any angle
  // rather than as a dark ribbon.
  const right = new THREE.Vector3();
  for (const side of [-1, 1]) {
    const railPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 110; i += 1) {
      const at = i / 110;
      const point = COURSE.getPointAt(at);
      courseRightAt(at, right);
      railPoints.push(
        point.clone().addScaledVector(right, side * TRACK_RADIUS * 0.94).setY(point.y + 1.15),
      );
    }
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints), 460, 0.12, 6, false),
      new THREE.MeshStandardMaterial({
        color: COLORS.boost,
        emissive: COLORS.boost,
        emissiveIntensity: 0.55,
        metalness: 0.5,
        roughness: 0.34,
      }),
    );
    group.add(rail);
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
    opacity: 0.13,
    transparent: true,
  });
  const right = new THREE.Vector3();

  for (const [index, at] of [0.06, 0.17, 0.33, 0.49, 0.63, 0.77, 0.89].entries()) {
    const origin = COURSE.getPointAt(at);
    const tangent = COURSE.getTangentAt(at);
    courseRightAt(at, right);
    const away = (jitter(index * 3.1) > 0.5 ? 1 : -1) * (1 + jitter(index * 5.3));
    const points = [origin.clone()];
    for (let step = 1; step <= 5; step += 1) {
      points.push(
        origin.clone()
          .addScaledVector(tangent, step * 7)
          .addScaledVector(right, away * step * step * 1.4)
          .setY(origin.y - step * (2 + jitter(index + step) * 2.4)),
      );
    }
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 44, TRACK_RADIUS * 0.5, 7, false),
      material,
    ));
  }
}

/** The funnel ring the marble drops through to start. */
function buildReleaseRing(group: THREE.Group) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.22, 8, 40),
    new THREE.MeshStandardMaterial({
      color: COLORS.boost,
      emissive: COLORS.boost,
      emissiveIntensity: 0.6,
      metalness: 0.6,
      roughness: 0.3,
    }),
  );
  ring.position.copy(COURSE.getPointAt(0.014));
  ring.rotation.x = Math.PI / 2.5;
  group.add(ring);
}

/** Truss hoops over the leverage hall, so the section reads as built. */
function buildTrusses(group: THREE.Group) {
  const material = new THREE.MeshStandardMaterial({
    color: COLORS.rail,
    metalness: 0.6,
    roughness: 0.42,
  });
  for (let i = 0; i < 7; i += 1) {
    const point = COURSE.getPointAt(0.5 + i * 0.021);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.18, 6, 26, Math.PI), material);
    hoop.position.set(point.x, point.y - 1.5, point.z);
    group.add(hoop);
  }
}

/** Gates through the sequence run, each hanging lower than the last. */
function buildSequenceGates(group: THREE.Group) {
  const post = new THREE.MeshStandardMaterial({
    color: COLORS.frame,
    metalness: 0.5,
    roughness: 0.48,
  });
  const bar = new THREE.MeshStandardMaterial({
    color: COLORS.drag,
    emissive: COLORS.drag,
    emissiveIntensity: 0.6,
    metalness: 0.42,
    roughness: 0.4,
  });
  const right = new THREE.Vector3();
  for (let i = 0; i < 5; i += 1) {
    const at = 0.655 + i * 0.027;
    const point = COURSE.getPointAt(at);
    courseRightAt(at, right);
    for (const side of [-1, 1]) {
      const column = new THREE.Mesh(new THREE.BoxGeometry(0.22, 5.6, 0.22), post);
      column.position.copy(point).addScaledVector(right, side * 4.6);
      column.position.y += 2.5;
      group.add(column);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.18, 0.18), bar);
    lintel.position.set(point.x, point.y + 5 - i * 0.45, point.z);
    lintel.rotation.z = i * 0.03;
    group.add(lintel);
  }
}

/** Deflector pegs. Placement is hash-derived, never score-derived. */
function buildPegField(group: THREE.Group) {
  const PEGS = 34;
  const pegs = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.14, 2.6, 7),
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
    const point = COURSE.getPointAt(0.795 + (i / PEGS) * 0.19);
    matrix.makeTranslation(
      point.x + (jitter(i * 2.7) - 0.5) * 15,
      point.y + 1.5,
      point.z + (jitter(i * 4.1) - 0.5) * 6,
    );
    pegs.setMatrixAt(i, matrix);
  }
  pegs.instanceMatrix.needsUpdate = true;
  group.add(pegs);
}

/** Finish arch: the one remembered end. */
function buildFinish(group: THREE.Group) {
  const at = COURSE.getPointAt(0.994);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(7.2, 0.24, 8, 40, Math.PI),
    new THREE.MeshStandardMaterial({
      color: COLORS.finish,
      emissive: COLORS.finish,
      emissiveIntensity: 0.5,
      metalness: 0.55,
      roughness: 0.32,
    }),
  );
  arch.position.set(at.x, at.y - 1, at.z);
  group.add(arch);
}

function buildMarble(group: THREE.Group): THREE.Mesh {
  const marble = new THREE.Mesh(
    new THREE.SphereGeometry(MARBLE_RADIUS, 40, 28),
    new THREE.MeshPhysicalMaterial({
      clearcoat: 0.35,
      clearcoatRoughness: 0.24,
      color: COLORS.marble,
      emissive: COLORS.marble,
      emissiveIntensity: 0.24,
      envMapIntensity: 0.16,
      metalness: 0,
      roughness: 0.2,
    }),
  );
  marble.castShadow = true;
  group.add(marble);
  return marble;
}

function buildEnvironment(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x0a0e16, 1.2));

  const key = new THREE.DirectionalLight(0xfff2dc, 2.4);
  key.position.set(-30, 60, 30);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    bottom: -70, far: 320, left: -60, near: 1, right: 60, top: 70,
  });
  // Without a bias the marble self-shadows into speckle at this map resolution.
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.06;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6f8dff, 1.35);
  rim.position.set(34, 14, -90);
  scene.add(rim);

  // One accent per chapter, following the course, so the chapter change is felt
  // in the light and not only in the copy.
  const accents: [number, number, number][] = [
    [0x9fc4ff, 1.4, 0.04],
    [0xbfe0ff, 1.3, 0.24],
    [0x5fd3bc, 2.1, 0.52],
    [0xf0a36b, 1.9, 0.72],
    [0xffd9a0, 1.7, 0.93],
  ];
  for (const [color, intensity, at] of accents) {
    const point = COURSE.getPointAt(at);
    const light = new THREE.PointLight(color, intensity * 320, 170, 2);
    light.position.set(point.x + 4, point.y + 12, point.z);
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
  marble: THREE.Mesh;
  scene: THREE.Scene;
}

function createWorld(renderer: THREE.WebGLRenderer, lowQuality: boolean): WorldResources {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.0066);
  const camera = new THREE.PerspectiveCamera(lowQuality ? 58 : 50, 1, 0.2, 460);

  const world = new THREE.Group();
  scene.add(world);
  buildTrackBed(world);
  buildGhostBranches(world);
  buildReleaseRing(world);
  buildTrusses(world);
  buildSequenceGates(world);
  buildPegField(world);
  buildFinish(world);
  const marble = buildMarble(world);
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
  return { camera, environmentTexture, marble, scene };
}

interface FrameOptions extends WorldResources {
  canvas: HTMLCanvasElement;
  getProgress: () => number;
  renderer: THREE.WebGLRenderer;
}

/**
 * How far in the marble already is at scroll progress 0.
 *
 * It used to sit still until the reader scrolled, so the first thing anyone saw
 * was a static frame — the least interesting moment in the sequence. A head
 * start means the opening view is already mid-drop.
 */
const HEAD_START = 0.09;

function createFrameRenderer(options: FrameOptions) {
  const { camera, canvas, marble, renderer, scene } = options;
  const position = new THREE.Vector3();
  const aim = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const right = new THREE.Vector3();
  const ndc = new THREE.Vector3();
  let renderedFrames = 0;

  return () => {
    const scroll = Math.min(Math.max(options.getProgress(), 0), 1);
    // Ease so the run accelerates into the course rather than jump-cutting.
    const eased = scroll * scroll * (3 - 2 * scroll);
    const travelled = Math.min(1, HEAD_START + eased * (1 - HEAD_START));
    const index = sampleIndexAtTime(travelled * TRACK.total);
    const at = Math.min(0.999, index / SAMPLES);

    samplePositionAtIndex(index, position);
    marble.position.copy(position);
    marble.position.y += MARBLE_RADIUS * 0.5;

    // Rolling follows distance covered, so it stays in step under scrub.
    const rolled = at * 250;
    marble.rotation.set(rolled * 0.35, rolled * 0.12, -rolled);

    // Chase camera in the course's own frame: behind, above, and off to one
    // side, so the marble is seen against the track it is running rather than
    // from a fixed vantage. The aim point is pushed to the -right side, which is
    // what places the marble in the right half of the frame clear of the copy
    // column; verified by projecting to NDC rather than by eye (data-story-ndc).
    tangent.copy(COURSE.getTangentAt(at)).normalize();
    courseRightAt(at, right);
    camera.position.copy(position)
      .addScaledVector(tangent, -27)
      .addScaledVector(right, 11)
      .addScaledVector(UP, 12.5);
    aim.copy(position).addScaledVector(tangent, 24).addScaledVector(right, -15);
    aim.y -= 2.5;
    camera.lookAt(aim);

    renderer.render(scene, camera);
    renderedFrames += 1;
    ndc.copy(position).project(camera);
    canvas.dataset.storyFrames = String(renderedFrames);
    canvas.dataset.storyMarble = `${position.x.toFixed(1)},${position.y.toFixed(1)},${position.z.toFixed(1)}`;
    canvas.dataset.storyNdc = `${ndc.x.toFixed(2)},${ndc.y.toFixed(2)},${ndc.z.toFixed(2)}`;
    canvas.dataset.storyTravel = travelled.toFixed(3);
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
