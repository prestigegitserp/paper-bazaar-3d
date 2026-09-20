import type { SurfacePresetId } from '../../world/boothProfiles'

export type PbrSurfaceAsset = {
  id: SurfacePresetId
  sourceLabel: string
  sourceUrl: string
  color: string
  normal: string
  roughness: string
  normalScale?: number
}

const ph = (slug: string, suffix: string) =>
  `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/${slug}/${slug}_${suffix}_1k.jpg`

export const pbrSurfaceRegistry: Partial<Record<SurfacePresetId, PbrSurfaceAsset>> = {
  'mall-porcelain': {
    id: 'mall-porcelain',
    sourceLabel: 'Poly Haven · Floor Tiles 04 · CC0',
    sourceUrl: 'https://polyhaven.com/a/floor_tiles_04',
    color: ph('floor_tiles_04', 'diff'),
    normal: ph('floor_tiles_04', 'nor_gl'),
    roughness: ph('floor_tiles_04', 'rough'),
    normalScale: 0.34
  },
  'mall-plaster': {
    id: 'mall-plaster',
    sourceLabel: 'Poly Haven · White Plaster 02 · CC0',
    sourceUrl: 'https://polyhaven.com/a/white_plaster_02',
    color: ph('white_plaster_02', 'diff'),
    normal: ph('white_plaster_02', 'nor_gl'),
    roughness: ph('white_plaster_02', 'rough'),
    normalScale: 0.28
  },
  'bazaar-brick': {
    id: 'bazaar-brick',
    sourceLabel: 'Poly Haven · Worn Brick Wall · CC0',
    sourceUrl: 'https://polyhaven.com/a/worn_brick_wall',
    color: ph('worn_brick_wall', 'diff'),
    normal: ph('worn_brick_wall', 'nor_gl'),
    roughness: ph('worn_brick_wall', 'rough'),
    normalScale: 0.72
  },
  'bazaar-plaster': {
    id: 'bazaar-plaster',
    sourceLabel: 'Poly Haven · Worn Plaster Wall · CC0',
    sourceUrl: 'https://polyhaven.com/a/worn_plaster_wall',
    color: ph('worn_plaster_wall', 'diff'),
    normal: ph('worn_plaster_wall', 'nor_gl'),
    roughness: ph('worn_plaster_wall', 'rough'),
    normalScale: 0.52
  },
  'bazaar-floor': {
    id: 'bazaar-floor',
    sourceLabel: 'Poly Haven · Worn Tile Floor · CC0',
    sourceUrl: 'https://polyhaven.com/a/worn_tile_floor',
    color: ph('worn_tile_floor', 'diff'),
    normal: ph('worn_tile_floor', 'nor_gl'),
    roughness: ph('worn_tile_floor', 'rough'),
    normalScale: 0.46
  },
  'bazaar-shutter': {
    id: 'bazaar-shutter',
    sourceLabel: 'Poly Haven · Painted Metal Shutter · CC0',
    sourceUrl: 'https://polyhaven.com/a/painted_metal_shutter',
    color: ph('painted_metal_shutter', 'diff'),
    normal: ph('painted_metal_shutter', 'nor_gl'),
    roughness: ph('painted_metal_shutter', 'rough'),
    normalScale: 0.5
  },
  'bazaar-plywood': {
    id: 'bazaar-plywood',
    sourceLabel: 'Poly Haven · Plywood · CC0',
    sourceUrl: 'https://polyhaven.com/a/plywood',
    color: ph('plywood', 'diff'),
    normal: ph('plywood', 'nor_gl'),
    roughness: ph('plywood', 'rough'),
    normalScale: 0.3
  }
}

export function getPbrSurfaceAsset(id: SurfacePresetId) {
  return pbrSurfaceRegistry[id]
}
