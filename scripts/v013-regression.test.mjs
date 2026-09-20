import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('cinematic shadows are event-driven instead of regenerated every frame', async () => {
  const controller = await source('../src/components/StaticShadowController.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const renderer = await source('../src/components/RoomRenderer.tsx')

  assert.match(controller, /shadowMap\.autoUpdate = false/)
  assert.match(controller, /shadowMap\.needsUpdate = true/)
  assert.match(mall, /StaticShadowController/)
  assert.match(renderer, /shadowMap\.needsUpdate = true/)
})

test('authored GLB disables raycasts and matrix recompute for inert meshes', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  assert.match(renderer, /matrixAutoUpdate = false/)
  assert.match(renderer, /!object\.userData\.interaction/)
  assert.match(renderer, /object\.raycast = \(\) => undefined/)
  assert.match(renderer, /object\.name\.startsWith\('hotspot_'\)/)
})

test('streaming distance checks are throttled and use squared distance', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  assert.match(renderer, /streamFrame\.current/)
  assert.match(renderer, /% 10/)
  assert.match(renderer, /distanceSq/)
  assert.doesNotMatch(renderer, /Math\.hypot/)
})

test('ceiling keeps emissive fixtures while collapsing real point lights', async () => {
  const architecture = await source('../src/components/Architecture.tsx')
  assert.match(architecture, /emissiveIntensity=\{4\.1\}/)
  assert.match(architecture, /index % 3 === 0/)
  assert.match(architecture, /intensity=\{13\.5\}/)
})

test('PBR cache supports selective 2K with automatic 1K fallback', async () => {
  const registry = await source('../src/scene/materials/pbrSurfaceRegistry.ts')
  const cache = await source('../src/scene/materials/pbrTextureCache.ts')
  const renderer = await source('../src/components/RoomRenderer.tsx')

  assert.match(registry, /type PbrResolution = '1k' \| '2k'/)
  assert.match(registry, /getPbrSurfaceUrls/)
  assert.match(cache, /loadWithFallback/)
  assert.match(cache, /resolution = '1k'/)
  assert.match(renderer, /resolution: quality === 'cinematic' \? '2k' : '1k'/)
})

test('micro surface detail adds no network dependency and remains shared', async () => {
  const detail = await source('../src/scene/materials/microDetailTextures.ts')
  const material = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const renderer = await source('../src/components/RoomRenderer.tsx')

  assert.match(detail, /CanvasTexture/)
  assert.match(detail, /const cache = new Map/)
  assert.match(detail, /getMicroBumpVariant/)
  assert.match(material, /bumpMap=\{loadedPbr \? microBump : fallback\.bump\}/)
  assert.match(renderer, /getMicroBumpVariant/)
  assert.doesNotMatch(detail, /https?:\/\//)
})

test('v0.13 retains v0.12 progressive-loading and v0.11 authored contracts', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const world = await source('../src/world/demoWorld.ts')
  const generator = await source('./generate-authored-shop.mjs')

  assert.match(renderer, /FILE_PREFETCH_RADIUS = 24/)
  assert.match(renderer, /InstancedMesh/)
  assert.match(world, /iran-paper-authored-v3\.glb/)
  assert.match(generator, /TEXCOORD_0/)
  assert.match(generator, /RoundedBoxGeometry/)
})
