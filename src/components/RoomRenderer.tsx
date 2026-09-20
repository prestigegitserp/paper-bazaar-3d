import { useGLTF } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  StaticDrawUsage,
  type Material,
  type Object3D
} from 'three'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { interactionFromObject } from '../engine/interactions'
import { resolveAssetUrl } from '../assets/resolveAssetUrl'
import {
  acquirePbrTextureSet,
  releasePbrTextureSet,
  type PbrTextureLease,
  type PbrTextureSet
} from '../scene/materials/pbrTextureCache'
import type { SurfacePresetId } from '../world/boothProfiles'
import { useAppStore, type RenderQuality } from '../store'
import { resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import AuthoredSurfaceDetails from './AuthoredSurfaceDetails'
import Booth from './Booth'
import RoomAssetBoundary from './RoomAssetBoundary'
import WorldTextPanel from './WorldTextPanel'

const FILE_PREFETCH_RADIUS = 24
const FILE_REVEAL_RADIUS = 18

const authoredTextureBindings: Partial<Record<string, {
  surface: SurfacePresetId
  repeat: [number, number]
  normalScale: number
}>> = {
  floor: { surface: 'mall-porcelain', repeat: [2.6, 4.2], normalScale: 0.24 },
  plaster: { surface: 'mall-plaster', repeat: [3.2, 4.2], normalScale: 0.2 },
  wood: { surface: 'bazaar-plywood', repeat: [2.2, 2.2], normalScale: 0.22 }
}

function fileAssetUrl(room: RoomDefinition) {
  if (room.asset.kind === 'gltf') return room.asset.url
  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') return room.asset.url
  return null
}

function useProgressiveFileAsset(room: RoomDefinition) {
  const started = useAppStore((state) => state.started)
  const url = fileAssetUrl(room)
  const [ready, setReady] = useState(() => !url)
  const prefetchStarted = useRef(false)

  useEffect(() => {
    prefetchStarted.current = false
    setReady(!url)
  }, [room.asset.assetId, room.asset.version, url])

  useFrame(() => {
    if (!url || !started || ready) return

    const state = useAppStore.getState()
    const dx = state.player.x - room.position[0]
    const dz = state.player.z - room.position[2]
    const distance = Math.hypot(dx, dz)
    const resolvedUrl = resolveAssetUrl(url)

    if (!prefetchStarted.current && distance <= FILE_PREFETCH_RADIUS) {
      prefetchStarted.current = true
      useGLTF.preload(resolvedUrl)
    }

    if (distance <= FILE_REVEAL_RADIUS || state.activeRoomId === room.id) {
      if (!prefetchStarted.current) {
        prefetchStarted.current = true
        useGLTF.preload(resolvedUrl)
      }
      setReady(true)
    }
  })

  return ready
}

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

function upgradeAuthoredMaterial(material: Material, quality: RenderQuality) {
  if (!(material instanceof MeshStandardMaterial)) return material.clone()

  const physical = new MeshPhysicalMaterial({
    name: material.name,
    color: material.color.clone(),
    emissive: material.emissive.clone(),
    emissiveIntensity: material.emissiveIntensity,
    roughness: material.roughness,
    metalness: material.metalness,
    side: material.side,
    transparent: material.transparent,
    opacity: material.opacity,
    alphaTest: material.alphaTest
  })
  physical.envMapIntensity = quality === 'cinematic' ? 1.05 : 0.72

  switch (material.name) {
    case 'glass':
      physical.color.set('#dcebed')
      physical.roughness = 0.065
      physical.metalness = 0
      physical.transmission = quality === 'cinematic' ? 0.88 : 0.55
      physical.thickness = 0.085
      physical.ior = 1.46
      physical.clearcoat = 0.2
      physical.clearcoatRoughness = 0.1
      physical.transparent = true
      physical.opacity = quality === 'cinematic' ? 0.98 : 0.76
      physical.depthWrite = false
      physical.envMapIntensity = 1.35
      break
    case 'floor':
      physical.roughness = 0.32
      physical.metalness = 0.015
      physical.clearcoat = quality === 'cinematic' ? 0.3 : 0.12
      physical.clearcoatRoughness = 0.22
      physical.envMapIntensity = 1.25
      break
    case 'metal':
    case 'silver':
      physical.roughness = material.name === 'silver' ? 0.22 : 0.31
      physical.metalness = 0.84
      physical.clearcoat = 0.1
      physical.clearcoatRoughness = 0.24
      physical.anisotropy = quality === 'cinematic' ? 0.42 : 0.17
      physical.envMapIntensity = 1.5
      break
    case 'wood':
      physical.roughness = 0.5
      physical.clearcoat = 0.09
      physical.clearcoatRoughness = 0.48
      physical.envMapIntensity = 0.86
      break
    case 'paper':
      physical.roughness = 0.91
      physical.metalness = 0
      physical.envMapIntensity = 0.36
      break
    case 'plaster':
      physical.roughness = 0.7
      physical.envMapIntensity = 0.54
      break
    case 'cardboard':
      physical.roughness = 0.9
      physical.envMapIntensity = 0.36
      break
    default:
      physical.roughness = Math.max(0.42, physical.roughness)
      physical.clearcoat = quality === 'cinematic' ? 0.045 : 0
  }

  return physical
}

function attachNodeInteractions(scene: Object3D, room: RoomDefinition, quality: RenderQuality, vendor?: Vendor) {
  const materialCache = new Map<Material, Material>()
  const upgraded = (material: Material) => {
    const cached = materialCache.get(material)
    if (cached) return cached
    const next = upgradeAuthoredMaterial(material, quality)
    materialCache.set(material, next)
    return next
  }

  scene.traverse((object) => {
    object.userData = { ...object.userData }
    delete object.userData.interaction

    if (object instanceof Mesh) {
      object.castShadow = true
      object.receiveShadow = true
      object.material = Array.isArray(object.material)
        ? object.material.map(upgraded)
        : upgraded(object.material)
    }
  })

  if (vendor) {
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

  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.updateMatrix()
    object.matrixAutoUpdate = false
    if (!object.userData.interaction) {
      object.raycast = () => undefined
    }
  })
}

function batchStaticAuthoredMeshes(scene: Object3D) {
  scene.updateMatrixWorld(true)
  const rootInverse = new Matrix4().copy(scene.matrixWorld).invert()
  const groups = new Map<string, Mesh[]>()

  scene.traverse((object) => {
    if (!(object instanceof Mesh) || object instanceof InstancedMesh) return
    if (object.children.length || object.userData.interaction || object.name.startsWith('hotspot_')) return
    if (Array.isArray(object.material) || object.material.transparent) return

    const key = [
      object.geometry.uuid,
      object.material.uuid,
      object.castShadow ? 'cast' : 'no-cast',
      object.receiveShadow ? 'receive' : 'no-receive'
    ].join('|')

    const group = groups.get(key)
    if (group) group.push(object)
    else groups.set(key, [object])
  })

  for (const meshes of groups.values()) {
    if (meshes.length < 3) continue
    const first = meshes[0]
    if (Array.isArray(first.material)) continue

    const instanced = new InstancedMesh(first.geometry, first.material, meshes.length)
    instanced.name = `batch:${first.geometry.type}:${first.material.name || 'material'}`
    instanced.castShadow = first.castShadow
    instanced.receiveShadow = first.receiveShadow
    instanced.instanceMatrix.setUsage(StaticDrawUsage)

    meshes.forEach((mesh, index) => {
      mesh.updateMatrixWorld(true)
      const relative = new Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld)
      instanced.setMatrixAt(index, relative)
    })

    instanced.instanceMatrix.needsUpdate = true
    instanced.userData.batchCount = meshes.length
    scene.add(instanced)

    for (const mesh of meshes) mesh.parent?.remove(mesh)
  }

  scene.updateMatrixWorld(true)
}

function applyAuthoredTextureSets(scene: Object3D, sets: Map<string, PbrTextureSet>) {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue
      const binding = authoredTextureBindings[material.name]
      const set = sets.get(material.name)
      if (!binding || !set) continue

      material.map = set.map
      material.normalMap = set.normalMap ?? null
      material.roughnessMap = set.roughnessMap ?? null
      if (set.normalMap) material.normalScale.set(binding.normalScale, binding.normalScale)
      material.needsUpdate = true
    }
  })
}

function disposeSceneMaterials(scene: Object3D) {
  const disposed = new Set<Material>()
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (disposed.has(material)) continue
      disposed.add(material)
      material.dispose()
    }
  })
}

function GltfRoom({ room, vendor, url, scale = 1 }: { room: RoomDefinition; vendor?: Vendor; url: string; scale?: number }) {
  const gltf = useGLTF(resolveAssetUrl(url))
  const gl = useThree((state) => state.gl)
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)
  const quality = useAppStore((state) => state.quality)

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    attachNodeInteractions(clone, room, quality, vendor)
    if (room.asset.kind === 'gltf' && room.asset.source === 'authored') {
      batchStaticAuthoredMeshes(clone)
    }
    return clone
  }, [gltf.scene, quality, room, vendor])

  useEffect(() => {
    const authored = room.asset.kind === 'gltf' && room.asset.source === 'authored'
    if (!authored) return

    let active = true
    const leases: PbrTextureLease[] = []
    const sets = new Map<string, PbrTextureSet>()
    const anisotropy = quality === 'cinematic'
      ? Math.min(8, gl.capabilities.getMaxAnisotropy())
      : Math.min(4, gl.capabilities.getMaxAnisotropy())

    const tasks = Object.entries(authoredTextureBindings).map(async ([materialName, binding]) => {
      if (!binding) return
      const lease = await acquirePbrTextureSet(binding.surface, {
        repeat: binding.repeat,
        anisotropy,
        full: quality === 'cinematic',
        priority: 'normal',
        resolution: quality === 'cinematic' ? '2k' : '1k'
      })
      if (!lease) return

      if (!active) {
        releasePbrTextureSet(lease)
        return
      }

      leases.push(lease)
      sets.set(materialName, lease.set)
    })

    void Promise.all(tasks)
      .then(() => {
        if (active) applyAuthoredTextureSets(scene, sets)
      })
      .catch(() => {
        // Procedural/glTF material colors remain as a safe fallback.
      })

    return () => {
      active = false
      for (const lease of leases.splice(0)) releasePbrTextureSet(lease)
      sets.clear()
    }
  }, [gl, quality, room.asset, scene])

  useEffect(() => {
    if (quality !== 'cinematic') return
    gl.shadowMap.needsUpdate = true
  }, [gl, quality, scene])

  useEffect(() => () => {
    disposeSceneMaterials(scene)
  }, [scene])

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

      <group scale={scale}>
        {room.asset.kind === 'gltf' && room.asset.source === 'authored' && (
          <AuthoredSurfaceDetails room={room} />
        )}

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

function RoomRendererInner({
  room,
  vendor,
  fileReady
}: {
  room: RoomDefinition
  vendor?: Vendor
  fileReady: boolean
}) {
  if (room.asset.kind === 'procedural') return <Booth room={room} vendor={vendor} />

  if (room.asset.kind === 'gltf') {
    if (!fileReady) return <Booth room={room} vendor={vendor} />
    return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    if (!fileReady) return <Booth room={room} vendor={vendor} />
    return <GltfRoom room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  return <UnsupportedRoom room={room} />
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const clearAssetError = useAppStore((state) => state.clearAssetError)
  const fileReady = useProgressiveFileAsset(room)

  useEffect(() => {
    clearAssetError(room.id)
  }, [clearAssetError, room.asset.version, room.id])

  return (
    <RoomAssetBoundary key={`${room.id}:${room.asset.version}`} room={room}>
      <Suspense fallback={<Booth room={room} vendor={vendor} />}>
        <RoomRendererInner room={room} vendor={vendor} fileReady={fileReady} />
      </Suspense>
    </RoomAssetBoundary>
  )
}
