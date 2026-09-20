import type { Interaction } from '../domain/interaction'

export type Vec3 = readonly [number, number, number]

export type BoothTheme = {
  primary: string
  secondary: string
  accent: string
  floor: string
}

export type ProceduralAsset = {
  kind: 'procedural'
  renderer: 'paper-booth-v1'
}

export type GltfAsset = {
  kind: 'gltf'
  url: string
  scale?: number
}

export type ScanAsset = {
  kind: 'scan'
  url: string
  format: 'gltf' | 'gaussian-splat'
  scale?: number
}

export type WorldAsset = ProceduralAsset | GltfAsset | ScanAsset

export type HotspotAnchor =
  | { kind: 'slot'; slot: 'management-desk' | 'price-board' | 'product-pedestal'; index?: number }
  | { kind: 'point'; position: Vec3 }

export type HotspotAction = Interaction | { kind: 'product-slot'; vendorId: string; productIndex: number; label: string }

export type HotspotDefinition = {
  id: string
  anchor: HotspotAnchor
  action: HotspotAction
}

export type RoomDefinition = {
  id: string
  label: string
  kind: 'booth'
  vendorId: string
  position: Vec3
  rotationY: number
  theme: BoothTheme
  asset: WorldAsset
  hotspots: HotspotDefinition[]
}

export type WorldBounds = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type CircleCollider = {
  kind: 'circle'
  x: number
  z: number
  radius: number
}

export type WorldDefinition = {
  id: string
  name: string
  version: number
  spawn: Vec3
  bounds: WorldBounds
  rooms: RoomDefinition[]
  staticColliders: CircleCollider[]
}
