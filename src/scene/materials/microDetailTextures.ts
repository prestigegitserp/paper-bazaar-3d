import {
  CanvasTexture,
  RepeatWrapping,
  type Texture
} from 'three'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getSurfacePreset } from './proceduralSurfaces'

const cache = new Map<string, Texture>()

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function surfaceSeed(surface: SurfacePresetId) {
  let hash = 2166136261
  for (const char of surface) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function buildMicroBump(surface: SurfacePresetId) {
  const preset = getSurfacePreset(surface)
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas 2D unavailable')

  const random = seeded(surfaceSeed(surface))
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)

  const image = ctx.getImageData(0, 0, size, size)
  const data = image.data

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      const grain = random() - 0.5
      const directional = preset.kind === 'wood'
        ? Math.sin(y * 0.9 + Math.sin(x * 0.08) * 2) * 0.16
        : preset.kind === 'paper'
          ? Math.sin(x * 0.48 + y * 0.05) * 0.05
          : preset.kind === 'metal'
            ? Math.sin(y * 1.6) * 0.035
            : 0
      const broad = Math.sin(x * 0.17) * Math.sin(y * 0.13) * 0.05
      const value = Math.max(0, Math.min(255, Math.round(128 + (grain * 0.42 + directional + broad) * 54)))
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.needsUpdate = true
  return texture
}

export function getMicroBumpVariant(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number
) {
  const density = surface.includes('paper') ? 10 : surface.includes('wood') || surface === 'bazaar-plywood' ? 7 : 5
  const key = [surface, repeat[0], repeat[1], anisotropy].join('|')
  let texture = cache.get(key)

  if (!texture) {
    texture = buildMicroBump(surface)
    texture.repeat.set(repeat[0] * density, repeat[1] * density)
    texture.anisotropy = anisotropy
    texture.needsUpdate = true
    cache.set(key, texture)
  }

  return texture
}

export function getMicroBumpScale(surface: SurfacePresetId) {
  if (surface === 'mall-porcelain') return 0.0016
  if (surface === 'mall-plaster') return 0.006
  if (surface === 'bazaar-plywood' || surface.startsWith('wood-')) return 0.0048
  if (surface.startsWith('paper-')) return 0.0022
  if (surface.includes('metal') || surface === 'bazaar-shutter') return 0.0012
  if (surface.includes('brick')) return 0.008
  return 0.004
}
