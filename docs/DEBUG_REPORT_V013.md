# v0.13 Photoreal Texture + Static-Scene Performance Debug Report

## Goal

v0.13 must improve both perceived realism and runtime cost without deleting any v0.12/v0.11 capability.

Preserved:
- authored GLB v3 + UV
- real bevel/cylinder geometry
- physical decals and labels
- progressive GLB streaming
- instanced repeated authored meshes
- ref-counted PBR residency
- staged PBR loading
- AgX tone mapping
- local PMREM environment
- semantic hotspots / catalog / collision / mobile controls
- World / Catalog / Documents / Scan boundaries

## Performance root causes found

### 1. Shadow map was still per-frame
The environment is nearly static, but WebGL shadow maps were allowed to refresh continuously in Cinematic mode.

v0.13 sets:
- `shadowMap.autoUpdate = false`
- `shadowMap.needsUpdate = true` only when needed

Refresh triggers:
- experience start
- quality change
- file-backed room mount

Camera/player movement no longer forces a new shadow pass.

### 2. Dense authored meshes still participated in raycasting
R3F pointer events on the authored primitive caused inert stock, shelves, walls and floor to participate in hit tests.

v0.13:
- keeps semantic hotspot nodes raycastable
- disables `raycast` on inert authored meshes
- point-hotspot proxy meshes remain interactive
- static local transforms set `matrixAutoUpdate = false`

### 3. File streaming distance checks ran every frame
The streaming probe now:
- runs every 10 frames
- uses squared-distance comparisons
- preserves the same 24m preload and 18m reveal thresholds

### 4. Too many real ceiling point lights
All 13 visible emissive light fixtures remain.
Only every third fixture now emits a real point light, with increased range/intensity to maintain coverage.

This reduces forward-light shader pressure without removing visible fixtures.

## Texture realism

### Selective near-field 2K
Global passage/startup PBR stays at 1K.
Authored file-backed shop requests 2K in Cinematic mode because it is already distance-gated and only mounts near the visitor.

Resolution is part of the PBR cache key.

If a 2K Poly Haven JPG fails:
```text
2K request
  ↓ fail
1K source fallback
  ↓
same material pipeline
```

Balanced remains 1K.

### Zero-network micro detail
Real 1K/2K PBR maps can still look too smooth in extreme closeups.

`microDetailTextures.ts` creates deterministic 128px grayscale micro-bump textures:
- plaster: fine mineral variation
- porcelain: very restrained micro relief
- wood/plywood: directional fiber
- paper: fine paper grain
- metal: very subtle brushed variation

Properties:
- no network request
- shared cache by surface/repeat/anisotropy
- works together with PBR normal maps
- applied to procedural surfaces and authored GLB materials
- intentionally tiny bump scale to avoid game-like exaggeration

## Why not make everything 2K/4K
That would improve a static screenshot but conflict with startup/network goals.

v0.13 uses a distance/fidelity split:
- global/far: 1K
- near authored Cinematic: 2K
- close micro detail: procedural 128px repeating bump

This increases perceived texel density where the user can inspect it while keeping initial traffic controlled.

## Regression gates

CI now checks:
- event-driven shadow configuration
- shadow refresh on GLB mount
- inert authored raycast disable
- static matrix freeze
- throttled squared-distance stream probes
- collapsed real point-light count policy
- 2K PBR URL support
- 2K → 1K fallback
- zero-network micro detail
- authored + procedural micro-detail integration
- all v0.12 performance gates
- all material/geometry/world/catalog/crawler/visual tests
- TypeScript + production Vite build
