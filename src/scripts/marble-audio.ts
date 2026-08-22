// Optional sound for the marble run. Synthesised, never a downloaded asset.
//
// Three rules this respects, because audio on a page is easy to get wrong:
//
//   1. It is OFF until the reader asks for it. Sound that starts on its own is
//      hostile, and browsers block it anyway without a user gesture.
//   2. The AudioContext is not even created until the toggle is pressed, so a
//      reader who never turns it on pays nothing.
//   3. It is generated — filtered noise for the roll, a short tone for each hole
//      — so there are no files to load and nothing to go stale if the course
//      changes.
//
// The roll is noise through a band-pass whose frequency and gain follow scroll
// speed, which is the honest mapping: the marbles are only moving when the
// reader is scrolling.
export interface MarbleAudio {
  destroy: () => void;
  setEnabled: (enabled: boolean) => void;
  setSpeed: (speed: number) => void;
  strike: (index: number) => void;
}

const ROLL_SECONDS = 2.4;

/** A short buffer of white noise, looped as the rolling bed. */
function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const frames = Math.floor(context.sampleRate * ROLL_SECONDS);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  // Deterministic pseudo-noise: no Math.random, so the texture is identical for
  // every reader and every session.
  let seed = 12_345;
  for (let i = 0; i < frames; i += 1) {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    data[i] = (seed / 1_073_741_824 - 1) * 0.6;
  }
  return buffer;
}

export function createMarbleAudio(): MarbleAudio {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let rollGain: GainNode | null = null;
  let rollFilter: BiquadFilterNode | null = null;
  let source: AudioBufferSourceNode | null = null;
  let enabled = false;

  const start = () => {
    if (context) return;
    const Ctor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context = new Ctor();

    master = context.createGain();
    master.gain.value = 0.0001;
    master.connect(context.destination);

    rollFilter = context.createBiquadFilter();
    rollFilter.type = "bandpass";
    rollFilter.frequency.value = 260;
    rollFilter.Q.value = 1.1;
    rollFilter.connect(master);

    rollGain = context.createGain();
    rollGain.gain.value = 0.0001;
    rollGain.connect(rollFilter);

    source = context.createBufferSource();
    source.buffer = createNoiseBuffer(context);
    source.loop = true;
    source.connect(rollGain);
    source.start();
  };

  return {
    setEnabled(next) {
      enabled = next;
      if (next) start();
      if (!(context && master)) return;
      if (next && context.state === "suspended") {
        context.resume().catch(() => {
          // A blocked resume just means no sound; nothing else to do.
        });
      }
      // Ramp rather than switch, so toggling is not a click.
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(next ? 0.5 : 0.0001, context.currentTime, 0.08);
    },

    setSpeed(speed) {
      if (!(enabled && context && rollGain && rollFilter)) return;
      const clamped = Math.min(Math.max(speed, 0), 1);
      const now = context.currentTime;
      // Silent when still: the marbles only move while the reader scrolls.
      rollGain.gain.setTargetAtTime(0.0001 + clamped * 0.32, now, 0.09);
      rollFilter.frequency.setTargetAtTime(180 + clamped * 900, now, 0.12);
    },

    strike(index) {
      if (!(enabled && context && master)) return;
      const now = context.currentTime;
      const tone = context.createOscillator();
      const shape = context.createGain();
      tone.type = "triangle";
      // Each hole a step lower, so passing through them reads as descent.
      tone.frequency.value = 460 - index * 42;
      shape.gain.setValueAtTime(0.0001, now);
      shape.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
      shape.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      tone.connect(shape);
      shape.connect(master);
      tone.start(now);
      tone.stop(now + 0.32);
    },

    destroy() {
      enabled = false;
      source?.stop();
      context?.close().catch(() => {
        // Closing a context that is already gone is not an error worth raising.
      });
      context = null;
      master = null;
      rollGain = null;
      rollFilter = null;
      source = null;
    },
  };
}
