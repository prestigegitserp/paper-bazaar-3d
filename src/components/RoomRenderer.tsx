import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Mesh, MeshPhysicalMaterial, MeshStandardMaterial, type Material, type Object3D } from 'three'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { interactionFromObject } from '../engine/interactions'
import { resolveAssetUrl } from '../assets/resolveAssetUrl'
import { useAppStore, type RenderQuality } from '../store'
import { resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'
import RoomAssetBoundary from './RoomAssetBoundary'
import WorldTextPanel from './WorldTextPanel'

function PointHotspot({ position, interaction }: { position: readonly [number, number, number]; interaction: Interaction }) {
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)
  const quality = useAppStore((state) => state.quality)

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

function upgradeAuthoredMaterial(material: Material, quality: RenderQuality) {
  if (!(material instanceof MeshStandardMaterial)) return material.clone()

  const base = {
    name: material.name,
    color: material.color.clone(),
    emissive: material.emissive.clone(),
    emissiveIntensity: material.emissiveIntensity,
    roughness: material.roughness,
    metalness: material.metalness,
    side: material.side
  }

  const physical = new MeshPhysicalMaterial(base)
  physical.envMapIntensity = quality === 'cinematic' ? 1.05 : 0.72

  switch (material.name) {
    case 'glass':
      physical.color.set('#d9eaec')
      physical.roughness = 0.07
      physical.metalness = 0
      physical.transmission = quality === 'cinematic' ? 0.86 : 0.58
      physical.thickness = 0.08
      physical.ior = 1.45
      physical.clearcoat = 0.18
      physical.clearcoatRoughness = 0.12
      physical.transparent = true
      physical.opacity = quality === 'cinematic' ? 0.98 : 0.72
      physical.depthWrite = false
      break
    case 'floor':
      physical.roughness = 0.34
      physical.metalness = 0.015
      physical.clearcoat = quality === 'cinematic' ? 0.28 : 0.12
      physical.clearcoatRoughness = 0.24
      physical.envMapIntensity = 1.25
      break
    case 'metal':
    case 'silver':
      physical.roughness = material.name === 'silver' ? 0.24 : 0.32
      physical.metalness = 0.82
      physical.clearcoat = 0.12
      physical.clearcoatRoughness = 0.26
      physical.anisotropy = quality === 'cinematic' ? 0.38 : 0.16
      physical.envMapIntensity = 1.5
      break
    case 'wood':
      physical.roughness = 0.5
      physical.clearcoat = 0.08
      physical.clearcoatRoughness = 0.5
      physical.envMapIntensity = 0.82
      break
    case 'paper':
      physical.roughness = 0.91
      physical.metalness = 0
      physical.envMapIntensity = 0.36
      break
    case 'plaster':
      physical.roughness = 0.72
      physical.envMapIntensity = 0.52
      break
    case 'cardboard':
      physical.roughness = 0.9
      physical.envMapIntensity = 0.38
      break
    default:
      physical.roughness = Math.max(0.42, physical.roughness)
      physical.clearcoat = quality === 'cinematic' ? 0.05 : 0
  }

  material.dispose()
  return physical
}

function attachNodeInteractions(scene: Object3D, room: RoomDefinition, quality: RenderQuality, vendor?: Vendor) {
  scene.traverse((object) => {
    object.userData = { ...object.userData }
    delete object.userData.interaction
    if (object instanceof Mesh) {
      object.castShadow = true
      object.receiveShadow = true
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => upgradeAuthoredMaterial(material, quality))
        : upgradeAuthoredMaterial(object.material, quality)
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
    attachNodeInteractions(clone, room, quality, vendor)
    return clone
  }, [gltf.scene, quality, room, vendor])

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
