import { Html, RoundedBox } from '@react-three/drei'
import type { Vendor } from '../../domain/catalog'
import type { Interaction } from '../../domain/interaction'
import type { BoothProfile } from '../../world/boothProfiles'
import { findHotspot, resolveHotspotInteraction } from '../../world/hotspots'
import type { RoomDefinition } from '../../world/types'
import SurfaceMaterial from '../materials/SurfaceMaterial'
import InteractiveNode from './InteractiveNode'

export function StockShelves({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  const compact = profile.template === 'modern-gallery' || profile.template === 'bright-retail'
  const zPositions = compact ? [-2.7, -1.35, 0, 1.35, 2.7] : [-3, -1.5, 0, 1.5, 3]
  const levels = compact ? [0.45, 1.35, 2.25, 3.05] : [0.35, 1.18, 2.02, 2.86]

  return (
    <group>
      {levels.map((y) => (
        <mesh key={y} position={[-2.2, y, 0]} castShadow={false}>
          <boxGeometry args={[0.38, 0.08, 6.25]} />
          <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 5]} />
        </mesh>
      ))}
      {zPositions.map((z) => (
        <mesh key={z} position={[-2.38, 1.62, z]} castShadow={false}>
          <boxGeometry args={[0.18, 3.2, 0.12]} />
          <SurfaceMaterial surface={profile.surfaces.metal} repeat={[1, 3]} />
        </mesh>
      ))}
      {Array.from({ length: compact ? 15 : 22 }, (_, index) => {
        const row = Math.floor(index / (compact ? 5 : 7))
        const col = index % (compact ? 5 : 7)
        const z = compact ? -2.55 + col * 1.28 : -2.55 + col * 0.85
        const y = 0.66 + row * 0.83
        return (
          <mesh key={index} position={[-2.08, y, z]} castShadow={false}>
            <boxGeometry args={[0.68, 0.31, compact ? 0.94 : 0.66]} />
            <SurfaceMaterial
              surface={index % 6 === 0 ? 'paper-cream' : 'paper-white'}
              repeat={[1, 1]}
              color={index % 7 === 0 ? room.theme.accent : undefined}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function SalesDesk({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'management-desk') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.desk as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 1.9, 0]}
      haloRadius={0.78}
    >
      <RoundedBox args={[2.15, 0.16, 0.92]} position={[0, 1.05, 0]} radius={0.05} smoothness={3} castShadow>
        <SurfaceMaterial surface={profile.surfaces.counter} repeat={[2.2, 1]} />
      </RoundedBox>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.9, 0.95, 0.72]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[2, 1]} color={room.theme.primary} />
      </mesh>
      <mesh position={[0.2, 1.45, 0]} castShadow>
        <boxGeometry args={[0.78, 0.48, 0.055]} />
        <SurfaceMaterial surface={profile.surfaces.metal} repeat={[1, 1]} />
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
    </InteractiveNode>
  )
}

export function PriceBoard({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'price-board') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.board as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0.28, 0.45, 0]}
      haloRadius={0.82}
    >
      <mesh castShadow>
        <boxGeometry args={[0.12, 1.75, 3.6]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 3]} />
      </mesh>
      <mesh position={[0.07, 0, 0]}>
        <boxGeometry args={[0.02, 1.45, 3.25]} />
        <SurfaceMaterial surface="paper-cream" repeat={[2, 1]} />
      </mesh>
      <Html center position={[0.11, 0.1, 0]} distanceFactor={7.8} style={{ pointerEvents: 'none' }}>
        <div className="bazaar-price-board">
          <strong>{vendor?.name ?? room.label}</strong>
          <span>{vendor ? `${vendor.products.length} قلم نمونه · قیمت/استعلام` : 'فضای آماده برای اسکن واقعی'}</span>
          <small>{vendor ? 'برای مشاهده کلیک / E' : 'GLB · LiDAR · Photogrammetry'}</small>
        </div>
      </Html>
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
      haloRadius={0.44}
    >
      <group rotation={[0.05, -0.18, 0.03]}>
        <mesh castShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.82, 0.08, 0.58]} />
          <meshStandardMaterial color={room.theme.primary} roughness={0.42} metalness={0.03} />
        </mesh>
        <mesh position={[0, 0.068, 0]}>
          <boxGeometry args={[0.73, 0.025, 0.52]} />
          <SurfaceMaterial surface="paper-cream" repeat={[1, 1]} />
        </mesh>
        <mesh position={[0, 0.09, -0.265]}>
          <boxGeometry args={[0.78, 0.04, 0.04]} />
          <meshStandardMaterial color={room.theme.accent} roughness={0.5} />
        </mesh>
      </group>
      <Html center position={[0, 0.47, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag catalog-world-tag">کاتالوگ · ورق بزن</div>
      </Html>
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
      haloPosition={[0, 1.35, 0]}
      haloRadius={0.62}
    >
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.25, 0.82, 1.02]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 1]} />
      </mesh>
      {[0, 0.13, 0.26, 0.39, 0.52].map((y, index) => (
        <mesh key={y} position={[0, 0.88 + y, 0]} castShadow>
          <boxGeometry args={[1.12 - index * 0.025, 0.095, 0.76 - index * 0.015]} />
          <SurfaceMaterial
            surface={index === 4 ? 'paper-cream' : 'paper-white'}
            repeat={[1, 1]}
            color={index === 4 ? room.theme.accent : undefined}
          />
        </mesh>
      ))}
      <Html center position={[0, 1.9, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag product-tag">{label}</div>
      </Html>
    </InteractiveNode>
  )
}

export function SampleWall({ room }: { room: RoomDefinition }) {
  const samples = ['#f5f1e7', '#e1d4b7', '#c89e67', '#aacfd7', '#d8b5bd', '#c8c4dc']
  return (
    <group position={[-2.57, 2.18, 1.85]}>
      <mesh>
        <boxGeometry args={[0.08, 2.45, 2.6]} />
        <meshStandardMaterial color="#38322d" roughness={0.75} />
      </mesh>
      {samples.map((color, index) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        return (
          <group key={color} position={[0.06, 0.55 - row * 1.05, -0.82 + col * 0.82]}>
            <mesh>
              <boxGeometry args={[0.03, 0.75, 0.62]} />
              <meshStandardMaterial color="#ede3d3" roughness={0.88} />
            </mesh>
            <mesh position={[0.02, 0.05, 0]}>
              <boxGeometry args={[0.015, 0.52, 0.46]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0.08, -1.05, 0]}>
        <boxGeometry args={[0.02, 0.04, 2.3]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function SwatchFan({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  return (
    <group position={[profile.layout.desk[0] - 0.45, 1.18, profile.layout.desk[2] + 0.08]} rotation={[0, 0.15, 0]}>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} rotation={[0, -0.36 + index * 0.12, 0]} position={[0.03 * index, index * 0.006, 0]}>
          <boxGeometry args={[0.2, 0.018, 0.62]} />
          <meshStandardMaterial
            color={['#f3eee3', '#e3d4b4', '#b98b58', '#9fcbd1', '#d8b2bb', '#c4c0dc', room.theme.accent][index]}
            roughness={0.9}
          />
        </mesh>
      ))}
      <mesh position={[-0.08, 0.04, -0.28]}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
        <meshStandardMaterial color="#6e573c" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function RollRack({ profile }: { profile: BoothProfile }) {
  return (
    <group position={[-1.45, 0, 2.62]}>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.45, 2.5, 0.18]} />
        <SurfaceMaterial surface={profile.surfaces.metal} repeat={[1, 3]} />
      </mesh>
      {[-0.48, 0, 0.48].map((x, index) => (
        <group key={x} position={[x, 1.15, -0.18]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 2.15, 18]} />
            <SurfaceMaterial surface={index === 1 ? 'paper-cream' : 'paper-white'} repeat={[1, 3]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 2.2, 12]} />
            <meshStandardMaterial color="#5b4b3a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function PalletStack({ profile }: { profile: BoothProfile }) {
  return (
    <group position={[1.55, 0, 2.25]}>
      {[0, 0.48, 0.96].map((y, row) => (
        <group key={y} position={[0, y, 0]}>
          {[-0.45, 0.45].map((x, col) => (
            <mesh key={x} position={[x, 0.25, 0]} castShadow>
              <boxGeometry args={[0.78, 0.44, 1.05]} />
              <SurfaceMaterial surface={row === 2 && col === 1 ? 'paper-cream' : 'paper-white'} repeat={[1, 1]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.9, 0.1, 1.3]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[2, 1]} />
      </mesh>
    </group>
  )
}

export function BookWall({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  return (
    <group position={[-2.48, 1.95, 1.9]}>
      {[0, 0.85, 1.7].map((y) => (
        <mesh key={y} position={[0.02, y - 0.9, 0]}>
          <boxGeometry args={[0.16, 0.08, 2.55]} />
          <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 2]} />
        </mesh>
      ))}
      {Array.from({ length: 18 }, (_, index) => (
        <mesh
          key={index}
          position={[0.12, -0.55 + Math.floor(index / 6) * 0.85, -1.02 + (index % 6) * 0.4]}
          rotation={[0, 0, (index % 3 - 1) * 0.02]}
        >
          <boxGeometry args={[0.18, 0.58, 0.3]} />
          <meshStandardMaterial
            color={[room.theme.primary, room.theme.accent, '#e7d8be', '#7d5546'][index % 4]}
            roughness={0.72}
          />
        </mesh>
      ))}
    </group>
  )
}

export function Pegboard({ room }: { room: RoomDefinition }) {
  return (
    <group position={[-2.56, 2.05, 1.9]}>
      <mesh>
        <boxGeometry args={[0.07, 2.6, 2.7]} />
        <meshStandardMaterial color="#c9c2b1" roughness={0.86} />
      </mesh>
      {Array.from({ length: 24 }, (_, index) => {
        const row = Math.floor(index / 6)
        const col = index % 6
        return (
          <mesh key={index} position={[0.045, 0.9 - row * 0.55, -1.05 + col * 0.42]}>
            <circleGeometry args={[0.025, 10]} />
            <meshStandardMaterial color="#54514c" roughness={0.6} />
          </mesh>
        )
      })}
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[0.1, 0.55 - index * 0.72, -0.4 + index * 0.42]}>
          <boxGeometry args={[0.15, 0.48, 0.7]} />
          <meshStandardMaterial color={index === 1 ? room.theme.accent : '#f0e8d9'} roughness={0.88} />
        </mesh>
      ))}
    </group>
  )
}

export function AcrylicDisplay({ room }: { room: RoomDefinition }) {
  return (
    <group position={[1.75, 0, 2.52]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.05, 1.4, 0.9]} />
        <meshPhysicalMaterial color="#d8f4ff" transmission={0.72} transparent opacity={0.32} roughness={0.08} thickness={0.18} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.74, 0.07, 0.62]} />
        <meshStandardMaterial color={room.theme.accent} emissive={room.theme.accent} emissiveIntensity={0.18} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function PrintFrames({ room }: { room: RoomDefinition }) {
  const colors = [room.theme.accent, '#d06d59', '#4e748b']
  return (
    <group position={[-2.57, 2.3, -1.95]}>
      {colors.map((color, index) => (
        <group key={color} position={[0, 0.72 - index * 0.75, -0.72 + index * 0.72]}>
          <mesh>
            <boxGeometry args={[0.08, 0.6, 0.58]} />
            <meshStandardMaterial color="#3a3028" roughness={0.65} />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <boxGeometry args={[0.012, 0.48, 0.46]} />
            <meshStandardMaterial color={color} roughness={0.72} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function ScanLab({ room }: { room: RoomDefinition }) {
  return (
    <group position={[-0.05, 0, 0.75]}>
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[2.6, 2.7, 2.6]} />
        <meshStandardMaterial color={room.theme.primary} wireframe emissive={room.theme.accent} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.65, 40]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      <Html center position={[0, 3, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="world-tag">محل تست GLB / LiDAR / Photogrammetry</div>
      </Html>
    </group>
  )
}
