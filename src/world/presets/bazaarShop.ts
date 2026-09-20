import type { RoomCollider, Vec2, Vec3 } from '../types'

export const bazaarShopFootprint: Vec2 = [5.6, 7.2]
export const bazaarShopEntryAnchor: Vec3 = [3.15, 1.68, 0]

export const bazaarShopColliders: RoomCollider[] = [
  { kind: 'box', center: [-2.74, 0], size: [0.34, 7.25] },
  { kind: 'box', center: [0, -3.48], size: [5.6, 0.32] },
  { kind: 'box', center: [0, 3.48], size: [5.6, 0.32] },
  { kind: 'box', center: [0.72, -1.45], size: [2.35, 1.0] },
  { kind: 'box', center: [-1.55, 0], size: [1.15, 3.3] },
  { kind: 'box', center: [1.75, 1.6], size: [0.9, 0.9] }
]
