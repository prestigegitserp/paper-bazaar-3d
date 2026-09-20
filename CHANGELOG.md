# Changelog

## 0.6.0 — Modular retail experience + interactive catalogs

### Retail realism
- six distinct booth profiles instead of one shared shop layout
- procedural surface registry for plaster, wood, aged brick, terrazzo, paper, fabric and brushed metal
- configurable fixture sets: sample walls, roll racks, pallet stacks, book walls, pegboards, acrylic cases, print frames and swatch fans
- vendor-specific layout coordinates and lighting profiles

### Interaction
- physical catalog prop on each vendor desk
- new semantic `document` interaction independent from renderer meshes
- responsive two-page catalog reader with keyboard navigation and mobile single-page mode
- generated product pages, paper swatches, store story and source/contact pages

### Architecture
- Runtime repository contracts for Catalog, World and Documents
- runtime bundle loader with API-first catalog + seed fallback
- World and Documents promoted to app state; HUD and scene no longer import demoWorld directly
- booth instance config now references stable profile IDs so server data can select renderer behavior without embedding React logic

### Digital Twin path
- scan/GLB renderer boundary remains intact
- procedural surface IDs can later map to CDN-hosted PBR/KTX2 assets without changing booth templates
- point hotspots and semantic actions remain suitable for scanned rooms

## 0.5.0 — Tehran paper alley + mobile controls

### Environment
- expands the world from 4 rooms to 6 shops/spaces
- replaces the glossy exhibition-hall mood with a narrower Tehran paper-market alley
- adds warm plaster/brick materials, arch ribs, Persian shop signs, awnings and dense paper shelves
- adds Seraj Cellulose as an additional sourced vendor
- keeps one dedicated scan-ready room for the first real GLB/LiDAR experiment

### Camera / interaction
- mouse wheel zoom now changes camera FOV inside the 3D world instead of relying on browser zoom
- two-finger pinch and mobile +/- buttons control the same camera zoom
- key 0 resets camera zoom
- mobile virtual joystick, touch-look zone, interact and reset controls
- mobile movement remains collision-aware and uses the same world/navigation contracts as desktop

### Performance
- mobile/coarse-pointer devices start in Balanced mode automatically
- lower mobile DPR and shadows disabled in Balanced mode
- repeated shelves, paper bundles, arch ribs and floor marks use instancing
- removes the expensive mirrored aisle from the default market skin
- fewer real-time lights while preserving emissive fixtures and warm visual contrast

### Versioning / deployment
- release/v0.3.0 and release/v0.4.0 snapshot branches preserve previous milestones
- main remains the latest stable release line
- every push/merge to main builds and deploys the latest version once GitHub Pages is enabled once in repository Settings

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
