import { Html } from '@react-three/drei'
import type { Vendor } from '../../domain/catalog'
import type { BoothProfile } from '../../world/boothProfiles'
import type { RoomDefinition } from '../../world/types'
import SurfaceMaterial from '../materials/SurfaceMaterial'

function ShopSign({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const clean = profile.template === 'modern-gallery' || profile.template === 'bright-retail' || profile.template === 'scan-lab'
  return (
    <group position={[2.68, 3.55, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.16, clean ? 0.86 : 0.78, 5.18]} />
        <SurfaceMaterial
          surface={clean ? profile.surfaces.metal : profile.surfaces.wood}
          repeat={[2, 1]}
          color={room.theme.primary}
        />
      </mesh>
      <mesh position={[0.09, -0.35, 0]}>
        <boxGeometry args={[0.025, 0.05, 5.02]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
      <Html center position={[0.12, 0, 0]} distanceFactor={7.2} style={{ pointerEvents: 'none' }}>
        <div className={`bazaar-shop-sign bazaar-shop-sign--${profile.template}`}>
          <b>{vendor?.name ?? room.label}</b>
          <span>{vendor?.shortName ?? 'SCAN-READY SPACE'}</span>
        </div>
      </Html>
    </group>
  )
}

function Awning({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  if (!['warehouse', 'heritage-warehouse'].includes(profile.template)) return null
  return (
    <group position={[2.57, 3.02, 0]}>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} position={[0.22, 0, (index - 4) * 0.56]} rotation={[0, 0, -0.32]}>
          <boxGeometry args={[0.72, 0.035, 0.5]} />
          <SurfaceMaterial
            surface="fabric-canvas"
            repeat={[1, 1]}
            color={index % 2 === 0 ? room.theme.secondary : room.theme.primary}
          />
        </mesh>
      ))}
    </group>
  )
}

function ModernPortal({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  if (!['modern-gallery', 'bright-retail', 'scan-lab'].includes(profile.template)) return null
  return (
    <group>
      {[-3.08, 3.08].map((z) => (
        <mesh key={z} position={[2.7, 2.35, z]}>
          <boxGeometry args={[0.08, 4.45, 0.08]} />
          <meshStandardMaterial color={room.theme.accent} emissive={room.theme.accent} emissiveIntensity={1.05} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[2.7, 4.55, 0]}>
        <boxGeometry args={[0.08, 0.08, 6.2]} />
        <meshStandardMaterial color={room.theme.accent} emissive={room.theme.accent} emissiveIntensity={1.05} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function RetailShell({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const darkerCeiling = profile.template === 'warehouse' || profile.template === 'heritage-warehouse'

  return (
    <>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.09, 7.2]} />
        <SurfaceMaterial surface={profile.surfaces.floor} repeat={[4.6, 5.8]} />
      </mesh>

      <mesh position={[-2.74, 2.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4.3, 7.2]} />
        <SurfaceMaterial surface={profile.surfaces.wall} repeat={[1.5, 4.2]} />
      </mesh>
      <mesh position={[0, 2.15, -3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <SurfaceMaterial surface={profile.surfaces.wall} repeat={[3.2, 2.6]} />
      </mesh>
      <mesh position={[0, 2.15, 3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <SurfaceMaterial surface={profile.surfaces.wall} repeat={[3.2, 2.6]} />
      </mesh>

      <mesh position={[-0.1, 4.18, 0]} receiveShadow>
        <boxGeometry args={[5.45, 0.15, 7.05]} />
        <SurfaceMaterial
          surface={darkerCeiling ? 'wood-walnut' : profile.surfaces.metal}
          repeat={[3, 3]}
          color={darkerCeiling ? '#4c382a' : undefined}
        />
      </mesh>

      <ShopSign room={room} vendor={vendor} profile={profile} />
      <Awning room={room} profile={profile} />
      <ModernPortal room={room} profile={profile} />
    </>
  )
}
