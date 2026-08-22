# Homepage atmosphere

There are no raster plates here any more.

The homepage's non-WebGL fallback — what a visitor sees under
`prefers-reduced-motion`, on a low-capability device, or with no WebGL — used to
be five exported `.webp` renders of the scene. When the scene changed from a
stone observatory to a marble run, the fallback kept showing the observatory and
nothing in the build could notice: they were just images.

The fallback is now an inline SVG generated in `src/pages/index.astro` from the
same lane shape the 3D world uses, so it cannot drift out of step with the scene
it stands in for. It also costs a few hundred bytes rather than 1.3 MB.

If the marble run's lane structure changes, update `FALLBACK_LANES` in
`src/pages/index.astro`.
