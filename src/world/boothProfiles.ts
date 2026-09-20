import type { Vec3 } from './types'

export type SurfacePresetId =
  | 'plaster-ivory'
  | 'plaster-cool'
  | 'brick-aged'
  | 'wood-walnut'
  | 'wood-oak'
  | 'metal-charcoal'
  | 'metal-brass'
  | 'terrazzo-warm'
  | 'terrazzo-cool'
  | 'paper-cream'
  | 'paper-white'
  | 'fabric-canvas'

export type BoothTemplateId =
  | 'modern-gallery'
  | 'warehouse'
  | 'editorial-library'
  | 'bright-retail'
  | 'heritage-warehouse'
  | 'scan-lab'

export type BoothProfile = {
  id: string
  template: BoothTemplateId
  surfaces: {
    floor: SurfacePresetId
    wall: SurfacePresetId
    wood: SurfacePresetId
    counter: SurfacePresetId
    metal: SurfacePresetId
  }
  lighting: {
    color: string
    intensity: number
    warmth: 'warm' | 'neutral' | 'cool'
  }
  layout: {
    desk: Vec3
    board: Vec3
    catalog: Vec3
    products: [Vec3, Vec3]
  }
  features: {
    sampleWall?: boolean
    rollRack?: boolean
    palletStack?: boolean
    bookWall?: boolean
    pegboard?: boolean
    acrylicDisplay?: boolean
    swatchFan?: boolean
    printFrames?: boolean
  }
}

const profiles: Record<string, BoothProfile> = {
  'iran-paper-modern': {
    id: 'iran-paper-modern',
    template: 'modern-gallery',
    surfaces: { floor: 'terrazzo-cool', wall: 'plaster-cool', wood: 'wood-oak', counter: 'wood-oak', metal: 'metal-charcoal' },
    lighting: { color: '#b9e4ff', intensity: 13, warmth: 'cool' },
    layout: { desk: [0.7, 0, -1.45], board: [-2.5, 2.15, 0], catalog: [0.55, 1.16, -1.28], products: [[-0.45, 0, 1.7], [1.75, 0, 1.55]] },
    features: { sampleWall: true, acrylicDisplay: true, swatchFan: true, printFrames: true }
  },
  'kaghazforoush-stockroom': {
    id: 'kaghazforoush-stockroom',
    template: 'warehouse',
    surfaces: { floor: 'terrazzo-warm', wall: 'plaster-ivory', wood: 'wood-walnut', counter: 'wood-walnut', metal: 'metal-charcoal' },
    lighting: { color: '#ffd6a0', intensity: 10, warmth: 'warm' },
    layout: { desk: [1.05, 0, -1.65], board: [-2.5, 2.05, 1.05], catalog: [0.95, 1.16, -1.48], products: [[-0.25, 0, 1.75], [1.45, 0, 1.65]] },
    features: { palletStack: true, rollRack: true, swatchFan: true }
  },
  'mellat-editorial': {
    id: 'mellat-editorial',
    template: 'editorial-library',
    surfaces: { floor: 'wood-walnut', wall: 'plaster-ivory', wood: 'wood-walnut', counter: 'wood-walnut', metal: 'metal-brass' },
    lighting: { color: '#ffd5b0', intensity: 11, warmth: 'warm' },
    layout: { desk: [0.35, 0, -0.95], board: [-2.5, 2.1, -1.15], catalog: [0.2, 1.17, -0.75], products: [[-0.65, 0, 1.8], [1.5, 0, 1.75]] },
    features: { bookWall: true, printFrames: true, swatchFan: true }
  },
  'kaghaz20-retail': {
    id: 'kaghaz20-retail',
    template: 'bright-retail',
    surfaces: { floor: 'terrazzo-cool', wall: 'plaster-cool', wood: 'wood-oak', counter: 'paper-white', metal: 'metal-charcoal' },
    lighting: { color: '#dff5ff', intensity: 14, warmth: 'neutral' },
    layout: { desk: [0.85, 0, -1.25], board: [-2.5, 2.15, 0.8], catalog: [0.72, 1.17, -1.05], products: [[-0.55, 0, 1.65], [1.55, 0, 1.75]] },
    features: { pegboard: true, acrylicDisplay: true, sampleWall: true, swatchFan: true }
  },
  'seraj-heritage': {
    id: 'seraj-heritage',
    template: 'heritage-warehouse',
    surfaces: { floor: 'brick-aged', wall: 'plaster-ivory', wood: 'wood-walnut', counter: 'wood-walnut', metal: 'metal-brass' },
    lighting: { color: '#ffc47c', intensity: 9, warmth: 'warm' },
    layout: { desk: [0.75, 0, -1.55], board: [-2.5, 2.05, 0.65], catalog: [0.62, 1.16, -1.36], products: [[-0.35, 0, 1.7], [1.55, 0, 1.65]] },
    features: { rollRack: true, palletStack: true, printFrames: true, swatchFan: true }
  },
  'scan-lab': {
    id: 'scan-lab',
    template: 'scan-lab',
    surfaces: { floor: 'terrazzo-cool', wall: 'plaster-cool', wood: 'wood-oak', counter: 'metal-charcoal', metal: 'metal-charcoal' },
    lighting: { color: '#8ce8ff', intensity: 12, warmth: 'cool' },
    layout: { desk: [0.8, 0, -1.45], board: [-2.5, 2.1, 0], catalog: [0.65, 1.16, -1.25], products: [[-0.4, 0, 1.6], [1.55, 0, 1.6]] },
    features: { acrylicDisplay: true }
  }
}

export function getBoothProfile(profileId?: string) {
  return profiles[profileId ?? ''] ?? profiles['iran-paper-modern']
}

export function hasBoothProfile(profileId: string) {
  return Boolean(profiles[profileId])
}

export const boothProfiles = profiles
