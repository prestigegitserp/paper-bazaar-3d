import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Mesh, type Object3D } from 'three'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { interactionFromObject } from '../engine/interactions'
import { resolveAssetUrl } from '../assets/resolveAssetUrl'
import { useAppStore } from '../store'
import { resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'
import RoomAssetBoundary from './RoomAssetBoundary'
import WorldTextPanel from './WorldTextPanel'

function PointHotspot({ position, interaction }: { position: readonly [number, number, number]; interaction: Interaction }) {
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)

  return (
    <mesh
      position={position as [number, number, number]}
      userData={{ interaction }}
      onClick={(event) => {
        event.stopPropagation()
        if (!document.pointerLockElement) setSelected(interaction)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!document.pointerLockElement) setNearby(interaction)
      }}
      onPointerOut={() => {
        if (!document.pointerLockElement) setNearby(null)
      }}
    >
      <sphereGeometry args={[0.42, 10, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}

function attachNodeInteractions(scene: Object3D, room: RoomDefinition, vendor?: Vendor) {
  scene.traverse((object) => {
    object.userData = { ...object.userData }
    delete object.userData.interaction
    if (object instanceof Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })

  if (!vendor) return

  for (const hotspot of room.hotspots) {
    if (hotspot.anchor.kind !== 'node') continue
    const object = scene.getObjectByName(hotspot.anchor.nodeName)
    if (!object) {
      console.warn(`[room-hotspot] ${room.id} is missing GLB node "${hotspot.anchor.nodeName}"`)
      continue
    }
    const interaction = resolveHotspotInteraction(hotspot, vendor)
    if (interaction) object.userData.interaction = interaction
  }
}

function GltfRoom({ room, vendor, url, scale = 1 }: { room: RoomDefinition; vendor?: Vendor; url: string; scale?: number }) {
  const gltf = useGLTF(resolveAssetUrl(url))
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    attachNodeInteractions(clone, room, vendor)
    return clone
  }, [gltf.scene, room, vendor])

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <primitive
        object={scene}
        scale={scale}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          const interaction = interactionFromObject(event.object)
          if (!interaction || document.pointerLockElement) return
          event.stopPropagation()
          setSelected(interaction)
        }}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          const interaction = interactionFromObject(event.object)
          if (!interaction || document.pointerLockElement) return
          event.stopPropagation()
          setNearby(interaction)
        }}
        onPointerOut={() => {
          if (!document.pointerLockElement) setNearby(null)
        }}
      />

      {vendor && room.asset.kind === 'gltf' && room.asset.source === 'authored' && (
        <WorldTextPanel
          position={[2.805, 3.54, 0]}
          rotation={[0, Math.PI / 2, 0]}
          width={4.82}
          height={0.54}
          background="#31504c"
          borderColor="rgba(255,255,255,.12)"
          lines={[
            { text: vendor.name, size: 68, color: '#f6f3eb', weight: 900 },
            { text: `${vendor.shortName} · AUTHORED GLB`, size: 28, color: room.theme.accent, weight: 800, direction: 'ltr' }
          ]}
        />
      )}

      {vendor && room.hotspots.map((hotspot) => {
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
        <meshStandardMaterial color="#d7dcdd" wireframe emissive="#789096" emissiveIntensity={0.12} />
      </mesh>
      <WorldTextPanel
        position={[0, 2.8, 1.62]}
        width={2.6}
        height={0.42}
        background="#39474b"
        lines={[{ text: `Renderer pending · ${room.asset.kind === 'scan' ? room.asset.format : room.asset.kind}`, size: 44, color: '#eef6f7', weight: 800, direction: 'ltr' }]}
      />
    </group>
  )
}

function RoomRendererInner({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  if (room.asset.kind === 'procedural') return <Booth room={room} vendor={vendor} />
  if (room.asset.kind === 'gltf') return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }
  return <UnsupportedRoom room={room} />
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
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
