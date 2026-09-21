import { useFrame } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { Vendor } from '../domain/catalog'
import { useAppStore } from '../store'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'
import ProceduralRoomProxy from './ProceduralRoomProxy'
import RoomAssetBoundary from './RoomAssetBoundary'
import WorldTextPanel from './WorldTextPanel'

const FILE_PREFETCH_RADIUS = 24
const FILE_REVEAL_RADIUS = 18
const FILE_PREFETCH_RADIUS_SQ = FILE_PREFETCH_RADIUS * FILE_PREFETCH_RADIUS
const FILE_REVEAL_RADIUS_SQ = FILE_REVEAL_RADIUS * FILE_REVEAL_RADIUS

const PROCEDURAL_WAKE_RADIUS = 11.5
const PROCEDURAL_SLEEP_RADIUS = 15.5
const PROCEDURAL_WAKE_RADIUS_SQ = PROCEDURAL_WAKE_RADIUS * PROCEDURAL_WAKE_RADIUS
const PROCEDURAL_SLEEP_RADIUS_SQ = PROCEDURAL_SLEEP_RADIUS * PROCEDURAL_SLEEP_RADIUS

let fileRoomModulePromise: Promise<typeof import('./FileRoomRenderer')> | null = null

function loadFileRoomModule() {
  if (!fileRoomModulePromise) fileRoomModulePromise = import('./FileRoomRenderer')
  return fileRoomModulePromise
}

const FileRoomRenderer = lazy(loadFileRoomModule)

function fileAssetUrl(room: RoomDefinition) {
  if (room.asset.kind === 'gltf') return room.asset.url
  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') return room.asset.url
  return null
}

function useProceduralDetail(room: RoomDefinition) {
  const started = useAppStore((state) => state.started)
  const [detailed, setDetailed] = useState(false)
  const frame = useRef(0)

  useEffect(() => {
    setDetailed(false)
    frame.current = 0
  }, [room.asset.assetId, room.asset.version])

  useFrame(() => {
    if (room.asset.kind !== 'procedural') return

    if (!started) {
      if (detailed) setDetailed(false)
      return
    }

    frame.current = (frame.current + 1) % 12
    if (frame.current !== 0) return

    const state = useAppStore.getState()
    if (state.activeRoomId === room.id) {
      if (!detailed) setDetailed(true)
      return
    }

    const dx = state.player.x - room.position[0]
    const dz = state.player.z - room.position[2]
    const distanceSq = dx * dx + dz * dz

    if (!detailed && distanceSq <= PROCEDURAL_WAKE_RADIUS_SQ) {
      setDetailed(true)
      return
    }

    if (detailed && distanceSq >= PROCEDURAL_SLEEP_RADIUS_SQ) {
      setDetailed(false)
    }
  })

  return detailed
}

function useProgressiveFileAsset(room: RoomDefinition) {
  const started = useAppStore((state) => state.started)
  const url = fileAssetUrl(room)
  const [ready, setReady] = useState(() => !url)
  const prefetchStarted = useRef(false)
  const streamFrame = useRef(0)

  useEffect(() => {
    prefetchStarted.current = false
    streamFrame.current = 0
    setReady(!url)
  }, [room.asset.assetId, room.asset.version, url])

  useFrame(() => {
    if (!url || !started || ready) return

    streamFrame.current = (streamFrame.current + 1) % 10
    if (streamFrame.current !== 0) return

    const state = useAppStore.getState()
    const dx = state.player.x - room.position[0]
    const dz = state.player.z - room.position[2]
    const distanceSq = dx * dx + dz * dz

    const preload = () => {
      if (prefetchStarted.current) return
      prefetchStarted.current = true
      void loadFileRoomModule().then((module) => module.preloadFileRoom(url))
    }

    if (distanceSq <= FILE_PREFETCH_RADIUS_SQ) preload()

    if (distanceSq <= FILE_REVEAL_RADIUS_SQ || state.activeRoomId === room.id) {
      preload()
      setReady(true)
    }
  })

  return ready
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
  fileReady,
  proceduralDetailed
}: {
  room: RoomDefinition
  vendor?: Vendor
  fileReady: boolean
  proceduralDetailed: boolean
}) {
  if (room.asset.kind === 'procedural') {
    return proceduralDetailed
      ? <Booth room={room} vendor={vendor} />
      : <ProceduralRoomProxy room={room} vendor={vendor} />
  }

  if (room.asset.kind === 'gltf') {
    if (!fileReady) return <ProceduralRoomProxy room={room} vendor={vendor} />
    return <FileRoomRenderer room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    if (!fileReady) return <ProceduralRoomProxy room={room} vendor={vendor} />
    return <FileRoomRenderer room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  return <UnsupportedRoom room={room} />
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const clearAssetError = useAppStore((state) => state.clearAssetError)
  const fileReady = useProgressiveFileAsset(room)
  const proceduralDetailed = useProceduralDetail(room)

  useEffect(() => {
    clearAssetError(room.id)
  }, [clearAssetError, room.asset.version, room.id])

  return (
    <RoomAssetBoundary key={`${room.id}:${room.asset.version}`} room={room}>
      <Suspense fallback={<ProceduralRoomProxy room={room} vendor={vendor} />}>
        <RoomRendererInner
          room={room}
          vendor={vendor}
          fileReady={fileReady}
          proceduralDetailed={proceduralDetailed}
        />
      </Suspense>
    </RoomAssetBoundary>
  )
}
