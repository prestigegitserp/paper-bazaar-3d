import { Html, RoundedBox } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { interactionKey } from '../engine/interactions'
import { useAppStore } from '../store'
import { findHotspot, resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import InteractionHalo from './InteractionHalo'

function InteractiveGroup({
  interaction,
  accent,
  haloPosition,
  haloRadius,
  children,
  position = [0, 0, 0]
}: {
  interaction: Interaction | null
  accent: string
  haloPosition: [number, number, number]
  haloRadius?: number
  children: ReactNode
  position?: [number, number, number]
}) {
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)
  const nearby = useAppStore((state) => state.nearby)
  const active = Boolean(interaction && interactionKey(nearby) === interactionKey(interaction))

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!interaction || document.pointerLockElement) return
    setSelected(interaction)
  }

  return (
    <group
      position={position}
      userData={interaction ? { interaction } : undefined}
      onClick={onClick}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (interaction && !document.pointerLockElement) setNearby(interaction)
      }}
      onPointerOut={() => {
        if (!document.pointerLockElement) setNearby(null)
      }}
    >
      {children}
      <InteractionHalo active={active} color={accent} position={haloPosition} radius={haloRadius} />
    </group>
  )
}

function PaperStack({
  position,
  color,
  interaction,
  label
}: {
  position: [number, number, number]
  color: string
  interaction: Interaction | null
  label: string
}) {
  return (
    <InteractiveGroup
      position={position}
      interaction={interaction}
      accent={color}
      haloPosition={[0, 1.02, 0]}
      haloRadius={0.72}
    >
      <RoundedBox args={[1.5, 0.22, 1.05]} radius={0.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f4ea" roughness={0.8} />
      </RoundedBox>
      {[0.16, 0.32, 0.48, 0.64].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.38 - i * 0.03, 0.1, 0.95 - i * 0.02]} />
          <meshStandardMaterial
            color={i === 3 ? color : '#fffdf7'}
            roughness={0.72}
            emissive={i === 3 ? color : '#000000'}
            emissiveIntensity={i === 3 ? 0.08 : 0}
          />
        </mesh>
      ))}
      <Html center position={[0, 1.05, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag product-tag">{label}</div>
      </Html>
    </InteractiveGroup>
  )
}

function Chair({ position, accent }: { position: [number, number, number]; accent: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.95, 0.13, 0.95]} />
        <meshStandardMaterial color={accent} roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0, 1.15, 0.4]}>
        <boxGeometry args={[0.95, 1.1, 0.12]} />
        <meshStandardMaterial color={accent} roughness={0.42} metalness={0.08} />
      </mesh>
      {[[-0.38, 0.24, -0.35], [0.38, 0.24, -0.35], [-0.38, 0.24, 0.35], [0.38, 0.24, 0.35]].map(
        (point, i) => (
          <mesh key={i} castShadow position={point as [number, number, number]}>
            <cylinderGeometry args={[0.045, 0.045, 0.48, 8]} />
            <meshStandardMaterial color="#2b2f36" metalness={0.55} roughness={0.28} />
          </mesh>
        )
      )}
    </group>
  )
}

function Desk({ room, vendor }: { room: RoomDefinition; vendor: Vendor }) {
  const hotspot = findHotspot(room.hotspots, 'management-desk')
  const interaction = hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveGroup
      position={[0.75, 0, 0]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 2.25, 0]}
      haloRadius={1}
    >
      <RoundedBox args={[2.4, 0.22, 1.25]} position={[0, 1.18, 0]} radius={0.08} smoothness={4} castShadow>
        <meshPhysicalMaterial color="#d8c7a5" roughness={0.46} clearcoat={0.25} clearcoatRoughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[2.05, 1.08, 0.86]} />
        <meshStandardMaterial color={room.theme.primary} roughness={0.38} metalness={0.14} />
      </mesh>
      <mesh position={[0.15, 1.72, 0]} castShadow>
        <boxGeometry args={[0.95, 0.62, 0.06]} />
        <meshStandardMaterial color="#0b1320" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 1.72, -0.04]}>
        <planeGeometry args={[0.82, 0.49]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      <Html center position={[0.15, 2.2, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag">میز مدیریت · کلیک / E</div>
      </Html>
    </InteractiveGroup>
  )
}

function ProductBoard({ room, vendor }: { room: RoomDefinition; vendor: Vendor }) {
  const hotspot = findHotspot(room.hotspots, 'price-board')
  const interaction = hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveGroup
      position={[-3.36, 2.65, 0]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0.34, 1.75, 0]}
      haloRadius={1.15}
    >
      <mesh castShadow>
        <boxGeometry args={[0.16, 3.15, 5.9]} />
        <meshStandardMaterial
          color="#08101c"
          metalness={0.32}
          roughness={0.22}
          emissive={room.theme.primary}
          emissiveIntensity={0.48}
        />
      </mesh>
      <mesh position={[0.09, 0, 0]}>
        <boxGeometry args={[0.025, 2.55, 5.25]} />
        <meshBasicMaterial color={room.theme.primary} toneMapped={false} />
      </mesh>
      <mesh position={[0.115, -1.37, 0]}>
        <boxGeometry args={[0.025, 0.028, 5.25]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      <Html center position={[0.14, 0.45, 0]} distanceFactor={7.4} style={{ pointerEvents: 'none' }}>
        <div className="booth-screen">
          <div className="booth-screen__eyebrow">LIVE PRICE WALL</div>
          <strong>{vendor.name}</strong>
          <span>{vendor.products.length} محصول نمونه</span>
          <small>برای مشاهده قیمت‌ها کلیک / E</small>
        </div>
      </Html>
    </InteractiveGroup>
  )
}

function SlatWall({ room }: { room: RoomDefinition }) {
  return (
    <group position={[-3.22, 2.3, 3.55]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0, (i - 3.5) * 0.25]} castShadow>
          <boxGeometry args={[0.16, 3.7, 0.1]} />
          <meshStandardMaterial color={i % 2 ? room.theme.secondary : room.theme.accent} roughness={0.58} />
        </mesh>
      ))}
    </group>
  )
}

function PortalFrame({ room }: { room: RoomDefinition }) {
  return (
    <group>
      {[-4.15, 4.15].map((z) => (
        <mesh key={z} position={[3.38, 2.42, z]}>
          <boxGeometry args={[0.11, 4.84, 0.11]} />
          <meshStandardMaterial color={room.theme.accent} emissive={room.theme.accent} emissiveIntensity={1.25} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[3.38, 4.8, 0]}>
        <boxGeometry args={[0.11, 0.11, 8.4]} />
        <meshStandardMaterial color={room.theme.accent} emissive={room.theme.accent} emissiveIntensity={1.25} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function Booth({ room, vendor }: { room: RoomDefinition; vendor: Vendor }) {
  const productA = vendor.products[0]
  const productB = vendor.products[1] ?? null
  const hotspotA = findHotspot(room.hotspots, 'product-pedestal', 0)
  const hotspotB = findHotspot(room.hotspots, 'product-pedestal', 1)
  const productAInteraction = productA && hotspotA ? resolveHotspotInteraction(hotspotA, vendor) : null
  const productBInteraction = productB && hotspotB ? resolveHotspotInteraction(hotspotB, vendor) : null

  if (room.asset.kind !== 'procedural' || room.asset.renderer !== 'paper-booth-v1') return null

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.12, 9.5]} />
        <meshPhysicalMaterial color={room.theme.floor} roughness={0.58} metalness={0.18} clearcoat={0.15} />
      </mesh>

      <mesh position={[-3.58, 2.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.18, 5.2, 9.5]} />
        <meshStandardMaterial color={room.theme.secondary} roughness={0.68} />
      </mesh>
      <mesh position={[0, 2.6, -4.68]} receiveShadow castShadow>
        <boxGeometry args={[7.2, 5.2, 0.18]} />
        <meshStandardMaterial color={room.theme.secondary} roughness={0.68} />
      </mesh>
      <mesh position={[0, 2.6, 4.68]} receiveShadow castShadow>
        <boxGeometry args={[7.2, 5.2, 0.18]} />
        <meshStandardMaterial color={room.theme.secondary} roughness={0.68} />
      </mesh>

      <mesh position={[-2.9, 4.95, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, 8.65]} />
        <meshStandardMaterial color={room.theme.accent} emissive={room.theme.accent} emissiveIntensity={0.58} toneMapped={false} />
      </mesh>

      <PortalFrame room={room} />
      <ProductBoard room={room} vendor={vendor} />
      <SlatWall room={room} />
      <Desk room={room} vendor={vendor} />
      <Chair position={[2.1, 0, -1.55]} accent={room.theme.accent} />
      <Chair position={[2.1, 0, 1.55]} accent={room.theme.primary} />

      {productA && (
        <group position={[-1.2, 0, -2.65]}>
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.72, 0.82, 1.04, 12]} />
            <meshStandardMaterial color={room.theme.primary} roughness={0.42} metalness={0.18} />
          </mesh>
          <PaperStack position={[0, 1.08, 0]} color={room.theme.accent} interaction={productAInteraction} label={productA.name} />
        </group>
      )}

      {productB && (
        <group position={[-1.2, 0, 2.65]}>
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.72, 0.82, 1.04, 12]} />
            <meshStandardMaterial color={room.theme.primary} roughness={0.42} metalness={0.18} />
          </mesh>
          <PaperStack position={[0, 1.08, 0]} color={room.theme.accent} interaction={productBInteraction} label={productB.name} />
        </group>
      )}

      <Html center position={[2.7, 4.22, 0]} distanceFactor={7.5} style={{ pointerEvents: 'none' }}>
        <div className="booth-nameplate">
          <b>{vendor.name}</b>
          <span>{vendor.shortName}</span>
        </div>
      </Html>

      <pointLight position={[1.5, 4.4, 0]} intensity={24} distance={9} color={room.theme.accent} />
    </group>
  )
}
