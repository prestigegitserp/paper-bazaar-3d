import { Html } from '@react-three/drei'
import RoomScopedHtml from '../../../components/RoomScopedHtml'\nimport type { Vendor } from '../../../domain/catalog'
import { findHotspot, resolveHotspotInteraction } from '../../../world/hotspots'
import type { BoothProfile } from '../../../world/boothProfiles'
import type { RoomDefinition } from '../../../world/types'
import SurfaceMaterial from '../../materials/SurfaceMaterial'
import InteractiveNode from '../InteractiveNode'

function Calculator({ accent }: { accent: string }) {
  return (
    <group position={[0.05, 1.15, 0.6]} rotation={[0, 0.08, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.07, 0.48]} />
        <meshStandardMaterial color="#343631" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.045, -0.13]}>
        <boxGeometry args={[0.24, 0.012, 0.1]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const row = Math.floor(index / 4)
        const col = index % 4
        return (
          <mesh key={index} position={[-0.105 + col * 0.07, 0.048, 0.02 + row * 0.09]}>
            <boxGeometry args={[0.045, 0.012, 0.055]} />
            <meshStandardMaterial color={index > 8 ? '#b08c50' : '#777a73'} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

function CounterGoods({ room }: { room: RoomDefinition }) {
  return (
    <group>
      {[-0.72, -0.22, 0.28, 0.78].map((z, index) => (
        <mesh key={z} position={[0, 0.71, z]} rotation={[0, 0, (index - 1.5) * 0.015]}>
          <boxGeometry args={[0.46, 0.09, 0.34]} />
          <meshStandardMaterial
            color={index === 2 ? room.theme.accent : index % 2 ? '#efe5d2' : '#d8c3a2'}
            roughness={0.86}
          />
        </mesh>
      ))}
      {[-0.58, 0, 0.58].map((z, index) => (
        <mesh key={z} position={[0.03, 0.52, z]}>
          <boxGeometry args={[0.34, 0.16, 0.34]} />
          <meshStandardMaterial color={index === 1 ? '#c7aa74' : '#e9e2d3'} roughness={0.88} />
        </mesh>
      ))}
    </group>
  )
}

export function SalesCounter({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'management-desk') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.desk as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 1.65, 0]}
      haloRadius={0.72}
    >
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.78, 0.68, 2.55]} />
        <SurfaceMaterial surface={profile.surfaces.counter} repeat={[1, 3]} />
      </mesh>

      <CounterGoods room={room} />

      <mesh position={[0.02, 0.79, 0]} castShadow>
        <boxGeometry args={[0.72, 0.58, 2.46]} />
        <meshPhysicalMaterial
          color="#e8f1ed"
          transparent
          opacity={0.2}
          transmission={0.68}
          roughness={0.08}
          metalness={0}
          thickness={0.09}
          depthWrite={false}
        />
      </mesh>

      {[-1.18, 1.18].map((z) => (
        <mesh key={z} position={[0.39, 0.79, z]}>
          <boxGeometry args={[0.035, 0.62, 0.055]} />
          <meshStandardMaterial color="#4e514d" metalness={0.72} roughness={0.4} />
        </mesh>
      ))}

      <mesh position={[0.4, 1.06, 0]} castShadow>
        <boxGeometry args={[0.82, 0.075, 2.62]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 3]} />
      </mesh>

      {profile.features.calculator && <Calculator accent={room.theme.accent} />}

      {vendor && (
        <RoomScopedHtml roomId={room.id} position={[0.15, 1.55, 0]} distanceFactor={8.6} style={{ pointerEvents: 'none' }}>
          <div className="world-tag market-counter-tag">پیشخوان فروش · کلیک / E</div>
        </RoomScopedHtml>
      )}
    </InteractiveNode>
  )
}

export function CatalogProp({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  if (!vendor) return null
  const hotspot = findHotspot(room.hotspots, 'catalog-desk')
  const interaction = hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.catalog as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 0.28, 0]}
      haloRadius={0.42}
    >
      <group rotation={[0.035, -0.12, 0.02]}>
        <mesh castShadow position={[0, 0.018, 0]}>
          <boxGeometry args={[0.72, 0.055, 0.52]} />
          <meshStandardMaterial color={room.theme.primary} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.054, 0]}>
          <boxGeometry args={[0.66, 0.018, 0.46]} />
          <SurfaceMaterial surface="paper-cream" repeat={[1, 1]} />
        </mesh>
        <mesh position={[0.02, 0.07, -0.225]}>
          <boxGeometry args={[0.62, 0.018, 0.02]} />
          <meshStandardMaterial color={room.theme.accent} roughness={0.58} />
        </mesh>
      </group>
      <RoomScopedHtml roomId={room.id} position={[0, 0.42, 0]} distanceFactor={8.8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag catalog-world-tag">کاتالوگ نمونه‌ها</div>
      </RoomScopedHtml>
    </InteractiveNode>
  )
}
