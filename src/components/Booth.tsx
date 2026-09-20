import { Html, Instance, Instances, RoundedBox } from '@react-three/drei'
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

function PaperBundles({ accent }: { accent: string }) {
  const positions = [
    [-2.12, 0.55, -2.55], [-2.12, 0.55, -1.7], [-2.12, 0.55, -0.85], [-2.12, 0.55, 0],
    [-2.12, 0.55, 0.85], [-2.12, 0.55, 1.7], [-2.12, 0.55, 2.55],
    [-2.12, 1.38, -2.55], [-2.12, 1.38, -1.7], [-2.12, 1.38, -0.85], [-2.12, 1.38, 0],
    [-2.12, 1.38, 0.85], [-2.12, 1.38, 1.7], [-2.12, 1.38, 2.55],
    [-2.12, 2.2, -2.55], [-2.12, 2.2, -1.7], [-2.12, 2.2, -0.85], [-2.12, 2.2, 0],
    [-2.12, 2.2, 0.85], [-2.12, 2.2, 1.7], [-2.12, 2.2, 2.55]
  ] as const

  return (
    <Instances limit={positions.length} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[0.72, 0.34, 0.68]} />
      <meshStandardMaterial roughness={0.82} vertexColors />
      {positions.map((position, index) => (
        <Instance
          key={index}
          position={position}
          color={index % 5 === 0 ? accent : index % 3 === 0 ? '#d7c6a8' : '#f0eadc'}
        />
      ))}
    </Instances>
  )
}

function ShelfSystem({ room }: { room: RoomDefinition }) {
  return (
    <group>
      {[0.35, 1.18, 2.02, 2.86].map((y) => (
        <mesh key={y} position={[-2.22, y, 0]} castShadow={false}>
          <boxGeometry args={[0.38, 0.08, 6.25]} />
          <meshStandardMaterial color="#6d4e36" roughness={0.72} />
        </mesh>
      ))}
      {[-3, -1.5, 0, 1.5, 3].map((z) => (
        <mesh key={z} position={[-2.38, 1.62, z]} castShadow={false}>
          <boxGeometry args={[0.18, 3.2, 0.12]} />
          <meshStandardMaterial color="#4b382a" roughness={0.74} />
        </mesh>
      ))}
      <PaperBundles accent={room.theme.accent} />
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
      haloPosition={[0, 0.95, 0]}
      haloRadius={0.62}
    >
      {[0, 0.13, 0.26, 0.39, 0.52].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.15 - index * 0.025, 0.095, 0.78 - index * 0.015]} />
          <meshStandardMaterial color={index === 4 ? color : '#f5efe3'} roughness={0.76} />
        </mesh>
      ))}
      <Html center position={[0, 0.95, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag product-tag">{label}</div>
      </Html>
    </InteractiveGroup>
  )
}

function Desk({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'management-desk') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveGroup
      position={[0.7, 0, -1.45]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 1.9, 0]}
      haloRadius={0.78}
    >
      <RoundedBox args={[2.15, 0.16, 0.92]} position={[0, 1.05, 0]} radius={0.05} smoothness={3} castShadow>
        <meshStandardMaterial color="#8a6645" roughness={0.58} />
      </RoundedBox>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.9, 0.95, 0.72]} />
        <meshStandardMaterial color={room.theme.primary} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 1.45, 0]} castShadow>
        <boxGeometry args={[0.78, 0.48, 0.055]} />
        <meshStandardMaterial color="#161719" roughness={0.26} />
      </mesh>
      <mesh position={[0.2, 1.45, -0.04]}>
        <planeGeometry args={[0.66, 0.36]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      {vendor && (
        <Html center position={[0.1, 1.92, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="world-tag">میز فروش · کلیک / E</div>
        </Html>
      )}
    </InteractiveGroup>
  )
}

function PriceBoard({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'price-board') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveGroup
      position={[-2.54, 2.2, 0]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0.28, 0.45, 0]}
      haloRadius={0.82}
    >
      <mesh castShadow>
        <boxGeometry args={[0.12, 1.75, 3.6]} />
        <meshStandardMaterial color="#2b241e" roughness={0.52} />
      </mesh>
      <mesh position={[0.07, 0, 0]}>
        <boxGeometry args={[0.02, 1.45, 3.25]} />
        <meshStandardMaterial color="#efe5d2" roughness={0.78} />
      </mesh>
      <Html center position={[0.11, 0.1, 0]} distanceFactor={7.8} style={{ pointerEvents: 'none' }}>
        <div className="bazaar-price-board">
          <strong>{vendor?.name ?? room.label}</strong>
          <span>{vendor ? `${vendor.products.length} قلم نمونه · قیمت/استعلام` : 'فضای آماده برای اسکن واقعی'}</span>
          <small>{vendor ? 'برای مشاهده کلیک / E' : 'GLB · LiDAR · Photogrammetry'}</small>
        </div>
      </Html>
    </InteractiveGroup>
  )
}

function ShopSign({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  return (
    <group position={[2.68, 3.55, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.78, 5.18]} />
        <meshStandardMaterial color={room.theme.primary} roughness={0.5} metalness={0.06} />
      </mesh>
      <mesh position={[0.09, -0.34, 0]}>
        <boxGeometry args={[0.025, 0.055, 5.02]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      <Html center position={[0.12, 0, 0]} distanceFactor={7.2} style={{ pointerEvents: 'none' }}>
        <div className="bazaar-shop-sign">
          <b>{vendor?.name ?? room.label}</b>
          <span>{vendor?.shortName ?? 'SCAN-READY SPACE'}</span>
        </div>
      </Html>
    </group>
  )
}

function Awning({ room }: { room: RoomDefinition }) {
  return (
    <group position={[2.57, 3.02, 0]}>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} position={[0.22, 0, (index - 4) * 0.56]} rotation={[0, 0, -0.32]}>
          <boxGeometry args={[0.72, 0.035, 0.5]} />
          <meshStandardMaterial color={index % 2 === 0 ? room.theme.secondary : room.theme.primary} roughness={0.78} />
        </mesh>
      ))}
    </group>
  )
}

function ConceptScanDisplay({ room }: { room: RoomDefinition }) {
  return (
    <group position={[-0.1, 0, 0.8]}>
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[2.6, 2.7, 2.6]} />
        <meshStandardMaterial color={room.theme.primary} wireframe emissive={room.theme.accent} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.65, 40]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      <Html center position={[0, 3, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag">اتاق رزرو شده برای اولین اسکن واقعی</div>
      </Html>
    </group>
  )
}

export default function Booth({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const productA = vendor?.products[0]
  const productB = vendor?.products[1]
  const hotspotA = vendor ? findHotspot(room.hotspots, 'product-pedestal', 0) : null
  const hotspotB = vendor ? findHotspot(room.hotspots, 'product-pedestal', 1) : null
  const productAInteraction = vendor && productA && hotspotA ? resolveHotspotInteraction(hotspotA, vendor) : null
  const productBInteraction = vendor && productB && hotspotB ? resolveHotspotInteraction(hotspotB, vendor) : null

  if (room.asset.kind !== 'procedural') return null

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.09, 7.2]} />
        <meshStandardMaterial color={room.theme.floor} roughness={0.82} />
      </mesh>

      <mesh position={[-2.74, 2.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4.3, 7.2]} />
        <meshStandardMaterial color="#9a7655" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.15, -3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <meshStandardMaterial color="#b69671" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.15, 3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <meshStandardMaterial color="#b69671" roughness={0.92} />
      </mesh>

      <mesh position={[-0.1, 4.18, 0]} receiveShadow>
        <boxGeometry args={[5.45, 0.15, 7.05]} />
        <meshStandardMaterial color="#4b3b2d" roughness={0.86} />
      </mesh>

      <ShelfSystem room={room} />
      <Desk room={room} vendor={vendor} />
      <PriceBoard room={room} vendor={vendor} />
      <ShopSign room={room} vendor={vendor} />
      <Awning room={room} />

      {productA && (
        <group position={[-0.45, 0, 1.7]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[1.35, 0.82, 1.1]} />
            <meshStandardMaterial color="#705238" roughness={0.7} />
          </mesh>
          <PaperStack position={[0, 0.86, 0]} color={room.theme.accent} interaction={productAInteraction} label={productA.name} />
        </group>
      )}

      {productB && (
        <group position={[1.75, 0, 1.6]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[1.1, 0.82, 1.05]} />
            <meshStandardMaterial color="#644b36" roughness={0.72} />
          </mesh>
          <PaperStack position={[0, 0.86, 0]} color={room.theme.accent} interaction={productBInteraction} label={productB.name} />
        </group>
      )}

      {!vendor && <ConceptScanDisplay room={room} />}

      <pointLight position={[1.45, 3.25, 0]} intensity={8} distance={6.5} color="#ffd99a" />
    </group>
  )
}
