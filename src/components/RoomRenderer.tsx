import { Clone, Html, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { useAppStore } from '../store'
import { resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'

function PointHotspot({ position, interaction }: { position: readonly [number, number, number]; interaction: Interaction }) {
  const setSelected = useAppStore((state) => state.setSelected)
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (document.pointerLockElement) return
    setSelected(interaction)
  }

  return (
    <mesh
      position={position as [number, number, number]}
      userData={{ interaction }}
      onClick={onClick}
    >
      <sphereGeometry args={[0.42, 10, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function GltfRoom({ room, vendor, url, scale = 1 }: { room: RoomDefinition; vendor: Vendor; url: string; scale?: number }) {
  const gltf = useGLTF(url)
  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <Clone object={gltf.scene} scale={scale} castShadow receiveShadow />
      {room.hotspots.map((hotspot) => {
        if (hotspot.anchor.kind !== 'point') return null
        const interaction = resolveHotspotInteraction(hotspot, vendor)
        return interaction ? <PointHotspot key={hotspot.id} position={hotspot.anchor.position} interaction={interaction} /> : null
      })}
    </group>
  )
}

function UnsupportedRoom({ room }: { room: RoomDefinition }) {
  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <Html center position={[0, 2, 0]} distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className="world-tag">Asset format not enabled yet: {room.asset.kind}</div>
      </Html>
    </group>
  )
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor: Vendor }) {
  if (room.asset.kind === 'procedural') return <Booth room={room} vendor={vendor} />
  if (room.asset.kind === 'gltf') return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }
  return <UnsupportedRoom room={room} />
}
