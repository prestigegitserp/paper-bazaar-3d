import WorldTextPanel from '../../../components/WorldTextPanel'
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
      <WorldTextPanel
        position={[0.059, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={2.04}
        height={1.12}
        background="#f3efe5"
        borderColor="rgba(78,64,45,.22)"
        lines={[
          { text: vendor?.shortName ?? room.label, size: 86, color: '#2f3334', weight: 900 },
          { text: vendor ? `${vendor.products.length} قلم · قیمت ثبت‌شده` : 'فضای تست مدل واقعی', size: 45, color: '#657074', weight: 800 },
          { text: vendor ? 'برای جزئیات روی برد تعامل کنید' : 'GLB · LiDAR · Photogrammetry', size: 33, color: room.theme.accent, weight: 800 }
        ]}
      />

      {[
        [-0.84, 0.52],
        [0.84, 0.52],
        [-0.84, -0.52],
        [0.84, -0.52]
      ].map(([z, y], index) => (
        <mesh key={index} position={[0.075, y, z]}>
          <boxGeometry args={[0.014, 0.09, 0.22]} />
          <meshStandardMaterial color="#c9b78f" roughness={0.74} />
        </mesh>
      ))}
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
          {index % 2 === 0 && (
            <mesh position={[0, 0.051, 0]}>
              <boxGeometry args={[0.08, 0.012, 0.74]} />
              <meshStandardMaterial color="#bda774" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}

      <WorldTextPanel
        position={[0.515, 0.86, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={0.68}
        height={0.2}
        background={room.theme.primary}
        borderColor="rgba(255,255,255,.14)"
        lines={[{ text: label, size: 58, color: '#f7f3e8', weight: 900 }]}
      />
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
