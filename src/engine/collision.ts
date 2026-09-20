import type { RoomDefinition, WorldDefinition } from '../world/types'

export type AabbCollider = { minX: number; maxX: number; minZ: number; maxZ: number }

function rotateLocalXZ(x: number, z: number, rotationY: number) {
  const sin = Math.sin(rotationY)
  const cos = Math.cos(rotationY)
  return { x: x * cos + z * sin, z: -x * sin + z * cos }
}

function localPoint(room: RoomDefinition, x: number, z: number) {
  const rotated = rotateLocalXZ(x, z, room.rotationY)
  return { x: room.position[0] + rotated.x, z: room.position[2] + rotated.z }
}

function aabbFromLocalRect(room: RoomDefinition, centerX: number, centerZ: number, width: number, depth: number): AabbCollider {
  const corners = [
    localPoint(room, centerX - width / 2, centerZ - depth / 2),
    localPoint(room, centerX + width / 2, centerZ - depth / 2),
    localPoint(room, centerX - width / 2, centerZ + depth / 2),
    localPoint(room, centerX + width / 2, centerZ + depth / 2)
  ]
  return {
    minX: Math.min(...corners.map((point) => point.x)),
    maxX: Math.max(...corners.map((point) => point.x)),
    minZ: Math.min(...corners.map((point) => point.z)),
    maxZ: Math.max(...corners.map((point) => point.z))
  }
}

function proceduralBoothColliders(room: RoomDefinition): AabbCollider[] {
  return [
    aabbFromLocalRect(room, -3.58, 0, 0.4, 9.6),
    aabbFromLocalRect(room, 0, -4.68, 7.2, 0.4),
    aabbFromLocalRect(room, 0, 4.68, 7.2, 0.4),
    aabbFromLocalRect(room, 0.75, 0, 2.9, 1.9),
    aabbFromLocalRect(room, -1.2, -2.65, 1.9, 1.6),
    aabbFromLocalRect(room, -1.2, 2.65, 1.9, 1.6),
    aabbFromLocalRect(room, 2.1, -1.55, 1.24, 1.24),
    aabbFromLocalRect(room, 2.1, 1.55, 1.24, 1.24)
  ]
}

export function buildWorldAabbColliders(world: WorldDefinition) {
  return world.rooms.flatMap((room) => {
    if (room.asset.kind === 'procedural' && room.asset.renderer === 'paper-booth-v1') {
      return proceduralBoothColliders(room)
    }
    return []
  })
}

export function isPositionBlocked(world: WorldDefinition, aabbs: AabbCollider[], x: number, z: number, radius: number) {
  const { bounds } = world
  if (x < bounds.minX + radius || x > bounds.maxX - radius || z < bounds.minZ + radius || z > bounds.maxZ - radius) return true

  if (aabbs.some((box) => x > box.minX - radius && x < box.maxX + radius && z > box.minZ - radius && z < box.maxZ + radius)) {
    return true
  }

  return world.staticColliders.some((collider) => Math.hypot(x - collider.x, z - collider.z) < collider.radius + radius)
}
