import { Clone, Html, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect } from 'react'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { resolveAssetUrl } from '../assets/resolveAssetUrl'
import { useAppStore } from '../store'
import { resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'
import RoomAssetBoundary from './RoomAssetBoundary'

function PointHotspot({ position, interaction }: { position: readonly [number, number, number]; interaction: Interaction }) {
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)

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
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!document.pointerLockElement) setNearby(interaction)
      }}
      onPointerOut={() => {
        if (!document.pointerLockElement) setNearby(null)
      }}
    >
      <sphereGeometry args={[0.48, 12, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function GltfRoom({ room, vendor, url, scale = 1 }: { room: RoomDefinition; vendor: Vendor; url: string; scale?: number }) {
  const gltf = useGLTF(resolveAssetUrl(url))
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
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[3.2, 2.8, 3.2]} />
        <meshStandardMaterial color="#172235" wireframe emissive="#11375a" emissiveIntensity={0.25} />
      </mesh>
      <Html center position={[0, 3.25, 0]} distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="world-tag">Renderer pending · {room.asset.kind === 'scan' ? room.asset.format : room.asset.kind}</div>
      </Html>
    </group>
  )
}

function RoomRendererInner({ room, vendor }: { room: RoomDefinition; vendor: Vendor }) {
  if (room.asset.kind === 'procedural') return <Booth room={room} vendor={vendor} />
  if (room.asset.kind === 'gltf') return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }
  return <UnsupportedRoom room={room} />
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor: Vendor }) {
  const clearAssetError = useAppStore((state) => state.clearAssetError)

  useEffect(() => {
    clearAssetError(room.id)
  }, [clearAssetError, room.asset.version, room.id])

  return (
    <RoomAssetBoundary key={`${room.id}:${room.asset.version}`} room={room}>
      <RoomRendererInner room={room} vendor={vendor} />
    </RoomAssetBoundary>
  )
}
