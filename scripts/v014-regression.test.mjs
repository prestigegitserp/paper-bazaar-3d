import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('render-on-activity bridge wakes demand rendering for desktop and mobile input', async () => {
  const app = await source('../src/App.tsx')
  const controller = await source('../src/components/PlayerController.tsx')
  const mobile = await source('../src/input/mobileInput.ts')
  const wakeup = await source('../src/engine/renderWakeup.ts')

  assert.match(app, /frameloop="demand"/)
  assert.match(controller, /registerRenderWakeup\(invalidate\)/)
  assert.match(controller, /velocity\.current\.lengthSq\(\) > 0\.0025/)
  assert.match(mobile, /requestRenderWakeup/)
  assert.match(wakeup, /registerRenderWakeup/)
})

test('GLTF loader code is isolated from the startup room renderer', async () => {
  const roomRenderer = await source('../src/components/RoomRenderer.tsx')
  const fileRenderer = await source('../src/components/FileBackedRoom.tsx')

  assert.match(roomRenderer, /lazy\(loadFileBackedRoom\)/)
  assert.match(roomRenderer, /fetch\(resolvedUrl, \{ cache: 'force-cache' \}\)/)
  assert.doesNotMatch(roomRenderer, /useGLTF/)
  assert.match(fileRenderer, /useGLTF/)
})

test('near cinematic material plan uses 2K color and 1K structural maps', async () => {
  const registry = await source('../src/scene/materials/pbrSurfaceRegistry.ts')
  const renderer = await source('../src/components/FileBackedRoom.tsx')

  assert.match(registry, /PBR_PLAN_NEAR_CINEMATIC/)
  assert.match(registry, /color: '2k'/)
  assert.match(registry, /normal: '1k'/)
  assert.match(registry, /arm: '1k'/)
  assert.match(renderer, /PBR_PLAN_NEAR_CINEMATIC/)
})

test('packed ARM gracefully falls back to roughness-only when unavailable', async () => {
  const cache = await source('../src/scene/materials/pbrTextureCache.ts')
  assert.match(cache, /loadArmOrRoughness/)
  assert.match(cache, /packed: true/)
  assert.match(cache, /packed: false/)
  assert.match(cache, /fallbackRoughness/)
})

test('authored GLB exports a second UV channel for AO compatibility', async () => {
  const generator = await source('./generate-authored-shop.mjs')
  assert.match(generator, /TEXCOORD_1/)
  assert.match(generator, /TEXCOORD_1: geometry\.TEXCOORD_1/)
})

test('v0.14 preserves modular boundaries rather than embedding commercial data in renderers', async () => {
  const renderer = await source('../src/components/FileBackedRoom.tsx')
  const roomRenderer = await source('../src/components/RoomRenderer.tsx')
  assert.doesNotMatch(renderer, /iranpapernet|kaghaz20|mellat-pub/)
  assert.doesNotMatch(roomRenderer, /iranpapernet|kaghaz20|mellat-pub/)
  assert.match(renderer, /resolveHotspotInteraction/)
})
