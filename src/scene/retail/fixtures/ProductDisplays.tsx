import RoomScopedHtml from '../../../components/RoomScopedHtml'
import type { Vendor } from '../../../domain/catalog'
import type { Interaction } from '../../../domain/interaction'
import { findHotspot, resolveHotspotInteraction } from '../../../world/hotspots'
import type { BoothProfile } from '../../../world/boothProfiles'
import type { RoomDefinition } from '../../../world/types'
import SurfaceMaterial from '../../materials/SurfaceMaterial'
import InteractiveNode from '../InteractiveNode'

export function PriceBoard({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'price-board') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.board as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0.18, 0.26, 0]}
      haloRadius={0.62}
    >
      <mesh castShadow>
        <boxGeometry args={[0.095, 1.34, 2.28]} />
        <SurfaceMaterial surface="bazaar-plywood" repeat={[1, 2]} />
      </mesh>
      <mesh position={[0.058, 0, 0]}>
        <boxGeometry args={[0.018, 1.16, 2.08]} />
        <SurfaceMaterial surface="paper-cream" repeat={[1.6, 1]} />
      </mesh>

      {[
        [-0.58, 0.48],
        [0.58, 0.48],
        [-0.58, -0.48],
        [0.58, -0.48]
      ].map(([z, y], index) => (
        <mesh key={index} position={[0.076, y, z]} rotation={[0, 0, index % 2 ? 0.12 : -0.12]}>
          <boxGeometry args={[0.015, 0.1, 0.28]} />
          <meshStandardMaterial color="#d7c19b" roughness={0.82} />
        </mesh>
      ))}

      <RoomScopedHtml roomId={room.id} position={[0.11, 0, 0]} distanceFactor={8.2} style={{ pointerEvents: 'none' }}>
        <div className="bazaar-price-board bazaar-price-board--paper">
          <strong>{vendor?.shortName ?? room.label}</strong>
          <span>{vendor ? `${vendor.products.length} قلم · آخرین قیمت ثبت‌شده` : 'فضای تست مدل واقعی'}</span>
          <small>{vendor ? 'برای دیدن لیست کلیک / E' : 'GLB · LiDAR · Photogrammetry'}</small>
        </div>
      </RoomScopedHtml>
    </InteractiveNode>
  )
}

export function ProductPaperStack({
  position,
  room,
  profile,
  interaction,
  label
}: {
  position: [number, number, number]
  room: RoomDefinition
  profile: BoothProfile
  interaction: Interaction | null
  label: string
}) {
  return (
    <InteractiveNode
      position={position}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 1.2, 0]}
      haloRadius={0.58}
    >
      <mesh position={[0, 0.33, 0]} castShadow>
        <boxGeometry args={[1.02, 0.64, 0.94]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 1]} />
      </mesh>

      {[0, 0.12, 0.24, 0.36].map((y, index) => (
        <group key={y} position={[0, 0.72 + y, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.92 - index * 0.018, 0.095, 0.72 - index * 0.01]} />
            <SurfaceMaterial surface="paper-white" repeat={[1, 1]} />
          </mesh>
          <mesh position={[0.468 - index * 0.009, 0, 0]}>
            <boxGeometry args={[0.012, 0.07, 0.66]} />
            <meshStandardMaterial color={index === 3 ? room.theme.accent : '#cab17e'} roughness={0.78} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 1.12, -0.01]}>
        <boxGeometry args={[0.8, 0.03, 0.42]} />
        <meshStandardMaterial color={room.theme.primary} roughness={0.62} />
      </mesh>

      <RoomScopedHtml roomId={room.id} position={[0, 1.55, 0]} distanceFactor={8.8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag product-tag market-product-tag">{label}</div>
      </RoomScopedHtml>
    </InteractiveNode>
  )
}

export function resolveProductInteractions(room: RoomDefinition, vendor?: Vendor) {
  if (!vendor) return { first: null, second: null }

  const productA = vendor.products[0]
  const productB = vendor.products[1]
  const hotspotA = findHotspot(room.hotspots, 'product-pedestal', 0)
  const hotspotB = findHotspot(room.hotspots, 'product-pedestal', 1)

  return {
    first: productA && hotspotA ? resolveHotspotInteraction(hotspotA, vendor) : null,
    second: productB && hotspotB ? resolveHotspotInteraction(hotspotB, vendor) : null
  }
}
