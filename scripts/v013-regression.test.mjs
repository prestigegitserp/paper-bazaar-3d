import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('cinematic shadows remain event-driven instead of regenerated every frame', async () => {
  const controller = await source('../src/components/StaticShadowController.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const renderer = await source('../src/components/FileBackedRoom.tsx')

  assert.match(controller, /shadowMap\.autoUpdate = false/)
  assert.match(controller, /shadowMap\.needsUpdate = true/)
  assert.match(mall, /StaticShadowController/)
  assert.match(renderer, /shadowMap\.needsUpdate = true/)
})

test('authored GLB still freezes inert mesh transforms and keeps hotspot semantics', async () => {
  const renderer = await source('../src/components/FileBackedRoom.tsx')
  assert.match(renderer, /matrixAutoUpdate = false/)
  assert.match(renderer, /!object\.userData\.interaction/)
  assert.match(renderer, /object\.raycast = \(\) => undefined/)
  assert.match(renderer, /object\.name\.startsWith\('hotspot_'\)/)
})

test('streaming keeps squared distance logic but is now event driven', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  assert.match(renderer, /distanceSq/)
  assert.match(renderer, /player\.x/)
  assert.match(renderer, /activeRoomId/)
  assert.doesNotMatch(renderer, /Math\.hypot/)
})

test('ceiling keeps emissive fixtures while collapsing real point lights', async () => {
  const architecture = await source('../src/components/Architecture.tsx')
  assert.match(architecture, /emissiveIntensity=\{4\.1\}/)
  assert.match(architecture, /index % 3 === 0/)
  assert.match(architecture, /intensity=\{13\.5\}/)
})

test('PBR keeps selective 2K color while normal and packed surface data stay lighter', async () => {
  const registry = await source('../src/scene/materials/pbrSurfaceRegistry.ts')
  const cache = await source('../src/scene/materials/pbrTextureCache.ts')
  const renderer = await source('../src/components/FileBackedRoom.tsx')

  assert.match(registry, /type PbrResolution = '1k' \| '2k'/)
  assert.match(registry, /PBR_PLAN_NEAR_CINEMATIC/)
  assert.match(registry, /color: '2k'/)
  assert.match(registry, /normal: '1k'/)
  assert.match(registry, /arm: '1k'/)
  assert.match(cache, /loadWithFallback/)
  assert.match(renderer, /PBR_PLAN_NEAR_CINEMATIC/)
})

test('the ineffective normalMap plus bumpMap combination is no longer emitted', async () => {
  const material = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const renderer = await source('../src/components/FileBackedRoom.tsx')

  assert.match(material, /bumpMap=\{loadedPbr \? undefined : fallback\.bump\}/)
  assert.doesNotMatch(material, /getMicroBumpVariant/)
  assert.match(renderer, /material\.bumpMap = null/)
  assert.doesNotMatch(renderer, /getMicroBumpVariant/)
})

test('v0.14 retains progressive loading, instancing and authored geometry contracts', async () => {
  const roomRenderer = await source('../src/components/RoomRenderer.tsx')
  const fileRenderer = await source('../src/components/FileBackedRoom.tsx')
  const world = await source('../src/world/demoWorld.ts')
  const generator = await source('./generate-authored-shop.mjs')

  assert.match(roomRenderer, /FILE_PREFETCH_RADIUS = 24/)
  assert.match(fileRenderer, /InstancedMesh/)
  assert.match(world, /iran-paper-authored-v3\.glb/)
  assert.match(generator, /TEXCOORD_0/)
  assert.match(generator, /RoundedBoxGeometry/)
})
