# v0.14 Demand Render + Packed Photoreal PBR Debug Report

## Objective

v0.14 has two hard constraints:

1. do not remove any v0.13 visual/authored capability;
2. make the runtime measurably less wasteful while improving material realism.

The release branches through v0.13 remain immutable.

## Deep-debug findings

### Finding 1 — continuous post-entry rendering

v0.13 used:

```tsx
frameloop={started ? 'always' : 'demand'}
```

After entering, the world rendered continuously even when the player was motionless. Most of this scene is static.

v0.14 uses demand rendering for the entire lifecycle.

A frame is explicitly requested when:
- keyboard movement starts/stops
- mouse look changes
- wheel/pinch changes FOV
- navigation moves the player
- mobile move/look/zoom/interact changes
- velocity inertia still needs settling
- FOV easing still needs settling
- async GLB/PBR/environment work completes

This preserves motion quality while allowing a truly idle scene to stop generating frames.

## Render wakeup bridge

`src/engine/renderWakeup.ts` is intentionally engine-level and tiny.

Mobile input is an imperative module rather than React state. It calls `requestRenderWakeup()`; PlayerController registers R3F's `invalidate` function once.

This avoids coupling the mobile input state machine to Canvas internals.

## Streaming correctness under demand rendering

A frame-throttled room distance probe is unsafe when teleport/navigation can produce only one frame.

v0.14 replaces that with state-driven checks:

```text
player state / activeRoom change
        ↓
distanceSq
        ↓
24m: prewarm JS chunk + GLB bytes
18m: mount lazy file renderer
```

Player state is already throttled by PlayerController during walking, so there is no per-room per-frame polling.

## File-backed renderer code splitting

v0.13 imported `useGLTF` and all authored file-renderer logic from the always-loaded RoomRenderer module.

v0.14 splits:

```text
RoomRenderer (startup)
  ├─ procedural Booth
  ├─ streaming policy
  └─ lazy FileBackedRoom
         ├─ useGLTF / GLTFLoader
         ├─ authored material upgrade
         ├─ instancing
         └─ semantic node interactions
```

At 24m:
- `import('./FileBackedRoom')` warms the chunk
- `fetch(url, { cache: 'force-cache' })` warms HTTP bytes

At 18m:
- Suspense mounts FileBackedRoom
- GLTF parsing happens close to when it is actually needed

The Booth proxy remains visible if parsing takes longer.

## Texture bug found in v0.13

The v0.13 PBR path bound both a normal map and a procedural micro bump.

Three.js ignores bumpMap when normalMap is defined. Therefore the micro-bump path did not provide the intended extra close-up detail on full PBR materials.

v0.14 removes this misleading path instead of paying maintenance cost for a no-op.

## Packed ARM material model

Poly Haven exposes ARM maps for the selected floor/plaster materials.

ARM channel convention used:
- R = ambient occlusion
- G = roughness
- B = metalness

The runtime uses one packed texture for roughness + AO when available.

Fallback:
- try requested ARM
- fall back to 1K ARM
- if unavailable, fall back to 1K roughness-only
- AO is disabled for that set rather than faked from roughness

## Channel-aware resolution

v0.13 near authored Cinematic:
- color 2K
- normal 2K
- roughness 2K

v0.14 near authored Cinematic:
- color 2K
- normal 1K
- ARM 1K

Rationale:
- color sharpness dominates visible close-range identity
- 1K normal/roughness/AO is sufficient for the current room UV density
- structural maps consume bandwidth and decoded GPU memory disproportionately
- ARM adds a missing realism cue while avoiding a fourth request

The public passage remains the progressive 1K path for fast startup.

## AO UV compatibility

The generated authored GLB now exports both `TEXCOORD_0` and `TEXCOORD_1` from the same UV accessor.

There is no duplicate binary UV buffer; the accessor is referenced twice.

This makes the asset contract compatible with AO/light-map conventions without increasing geometry bytes materially.

## Floor overdraw cleanup

The passage previously had:
- real PBR porcelain floor
- plus a large transparent white gloss plane above it

With physical clearcoat and roughness, the second plane:
- washed out texture contrast
- added blended overdraw
- duplicated the gloss responsibility

v0.14 removes it.

## Preserved contracts

No change to:
- Catalog repository contract
- WorldDefinition
- Document repository
- semantic Interaction types
- scan asset metadata
- collision definitions
- room transforms
- authored assetId/version
- node/point hotspots
- GLB v3 semantic names
- mobile control semantics
- crawler/server boundary

## CI gates

v0.14 adds checks for:
- demand-only Canvas
- renderer wakeup bridge
- motion/inertia frame continuation
- event-driven file streaming
- file renderer dynamic import
- GLB byte prefetch
- GLTFLoader absent from startup RoomRenderer
- 2K color + 1K normal + 1K ARM plan
- ARM roughness/AO fallback behavior
- no normalMap + micro-bump regression
- TEXCOORD_1 authored export
- all earlier world/catalog/crawler/geometry/material tests
- TypeScript and production Vite build

## Baseline

v0.13 CI:
- transformed modules: 655
- main JS: 1,249.78 kB
- main JS gzip: 354.08 kB
- CatalogReader: 4.75 kB / 1.69 kB gzip
- authored GLB: 97,412 bytes
- build time in that CI run: 4.44s

The v0.14 PR build is used as the authoritative comparison before merge.
