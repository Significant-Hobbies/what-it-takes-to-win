## Why

The research currently explains its model through dense overview and evidence
surfaces, but it lacks a guided entry point for readers who need the core idea
to unfold as a sequence. A story mode can make survivor selection, starting
conditions, leverage, compounding, and luck easier to understand without
turning the project into a prediction or motivational product.

## What Changes

- Make the five scroll-linked chapters the canonical `/` landing experience;
  retain `/story/` only as a compatibility redirect.
- Give readers persistent chapter wayfinding, working anchor navigation, and a
  clear path into the existing evidence and person-specific comparison tools.
- Use the owner-selected “Impossible Observatory” world: a continuous
  procedural Three.js environment of stone, brass, glass trajectories, and
  scientific instruments. Original scene plates load only as reduced-motion,
  narrow-device, or WebGL-failure fallbacks.
- Preserve the complete reading experience on small screens, without
  JavaScript, and when reduced motion is requested.
- Move the former evidence-dense homepage to `/overview/` and update human and
  machine-readable discovery surfaces around the canonical landing journey.
- Add Three.js as the single new production dependency. Do not add remote
  assets, analytics, or external runtime services.

## Capabilities

### New Capabilities

- `story-mode`: A guided, chaptered reading experience for the project's core
  explanatory model, with accessible scroll-linked wayfinding and fallbacks.

### Modified Capabilities

- `public-discovery-readiness`: The new public route must be linked and included
  in the project's generated discovery surfaces.

## Impact

- Reorganizes the homepage and overview routes, retains route-scoped styles,
  and uses a client-side Three.js scene module as progressive enhancement.
- Updates shared navigation and discovery generation/audit inputs.
- Reuses the published dataset and existing outcome-model utilities; data
  schema, APIs, and deployment infrastructure remain unchanged.
