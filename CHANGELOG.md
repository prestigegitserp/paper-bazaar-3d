# Changelog

## 0.4.0 — Immersive experience foundation

### Visual
- polished reflective central aisle with a balanced fallback mode
- denser architectural ceiling, wayfinding signs and light rails
- kinetic paper sculpture and lounge decor
- illuminated booth portal frames and improved physical materials
- cinematic/balanced quality toggle with adaptive DPR

### Interaction
- smoother accelerated/decelerated movement
- subtle head bob and sprint FOV response
- active-room detection and room toast
- clickable mini-map fast navigation
- interaction halo for the currently targeted hotspot
- keyboard shortcuts: R reset, Q quality, M map, F3 diagnostics

### Digital twin / scans
- room collision moved out of the renderer and into WorldDefinition
- asset metadata now has stable asset id, version and meters-per-unit
- GLB/scan URLs are base-path aware for static hosting
- room-level Error Boundary prevents one broken asset from crashing the world
- asset failures are exposed in runtime diagnostics
- point hotspots remain independent from GLB mesh names

### Operations
- GitHub Pages build/deploy workflow added
- static-demo mode avoids failed API requests on GitHub Pages
- version bumped to 0.4.0
- Docker remains intentionally out of scope

## 0.3.0 — Modular digital-twin foundation

- separated Catalog, World, Engine and crawler concerns
- added procedural/GLTF room rendering boundary
- added semantic hotspots and catalog fallback
- added crawler source-adapter registry and server tests
