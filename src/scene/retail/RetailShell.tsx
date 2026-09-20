import { Html } from '@react-three/drei'
import type { Vendor } from '../../domain/catalog'
import type { BoothProfile } from '../../world/boothProfiles'
import type { RoomDefinition } from '../../world/types'
import SurfaceMaterial from '../materials/SurfaceMaterial'

function ShopSign({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  return (
    <group position={[2.68, 3.55, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.72, 5.22]} />
        <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.38} roughness={0.56} />
      </mesh>
      <mesh position={[0.105, 0, 0]}>
        <boxGeometry args={[0.035, 0.59, 4.94]} />
        <meshStandardMaterial color={profile.shopfront.signColor} roughness={0.7} />
      </mesh>
      <Html center position={[0.135, 0, 0]} distanceFactor={7.7} style={{ pointerEvents: 'none' }}>
        <div
          className="market-shop-sign"
          style={{
            '--sign-text': profile.shopfront.signText,
            '--sign-accent': room.theme.accent
          } as React.CSSProperties}
        >
          <b>{vendor?.name ?? room.label}</b>
          <span>{vendor?.shortName ?? 'DIGITAL TWIN / SCAN SPACE'}</span>
        </div>
      </Html>
    </group>
  )
}

function ShopfrontFrame({ profile }: { profile: BoothProfile }) {
  return (
    <group>
      {[-3.16, 3.16].map((z) => (
        <mesh key={z} position={[2.68, 2.1, z]} castShadow>
          <boxGeometry args={[0.16, 4.15, 0.16]} />
          <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.64} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[2.68, 4.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, 6.45]} />
        <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.64} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Shutter({ profile }: { profile: BoothProfile }) {
  if (profile.shopfront.shutter === 'open') return null

  if (profile.shopfront.shutter === 'rolled') {
    return (
      <group position={[2.72, 3.96, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 5.55, 18]} />
          <SurfaceMaterial surface="bazaar-shutter" repeat={[3, 1]} color="#85847d" />
        </mesh>
        <mesh position={[-0.17, 0, 0]}>
          <boxGeometry args={[0.08, 0.48, 5.7]} />
          <meshStandardMaterial color="#555750" roughness={0.68} metalness={0.5} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[2.73, 3.18, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 1.45, 5.55]} />
        <SurfaceMaterial surface="bazaar-shutter" repeat={[3, 2]} color="#85847d" />
      </mesh>
      {[-2.45, 0, 2.45].map((z) => (
        <mesh key={z} position={[0.065, 0, z]}>
          <boxGeometry args={[0.025, 1.45, 0.04]} />
          <meshStandardMaterial color="#595b55" metalness={0.55} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function ShopLights({ profile }: { profile: BoothProfile }) {
  return (
    <group>
      {[-1.55, 1.45].map((z, index) => (
        <group key={z} position={[0.15, 3.88, z]}>
          <mesh>
            <boxGeometry args={[2.25, 0.07, 0.18]} />
            <meshStandardMaterial color="#5c5a54" roughness={0.66} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.048, 0]}>
            <boxGeometry args={[1.94, 0.025, 0.085]} />
            <meshStandardMaterial
              color={profile.lighting.color}
              emissive={profile.lighting.color}
              emissiveIntensity={2.6}
              toneMapped={false}
            />
          </mesh>
          {index === 0 && (
            <pointLight
              position={[0, -0.35, 0]}
              color={profile.lighting.color}
              intensity={profile.lighting.intensity}
              distance={5.5}
              decay={2}
            />
          )}
        </group>
      ))}
    </group>
  )
}

function WallConduit({ profile }: { profile: BoothProfile }) {
  return (
    <group>
      <mesh position={[-2.55, 3.25, -1.7]}>
        <boxGeometry args={[0.04, 0.04, 3.2]} />
        <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.5} roughness={0.68} />
      </mesh>
      <mesh position={[-2.51, 2.85, -0.15]}>
        <boxGeometry args={[0.1, 0.24, 0.18]} />
        <meshStandardMaterial color="#4b4d48" roughness={0.74} />
      </mesh>
    </group>
  )
}

export default function RetailShell({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  return (
    <>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.09, 7.2]} />
        <SurfaceMaterial surface={profile.surfaces.floor} repeat={[4.4, 5.7]} />
      </mesh>

      <mesh position={[-2.74, 2.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4.3, 7.2]} />
        <SurfaceMaterial surface={profile.surfaces.wall} repeat={[2, 4.4]} />
      </mesh>
      <mesh position={[0, 2.15, -3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <SurfaceMaterial surface="bazaar-plaster" repeat={[3.4, 2.6]} />
      </mesh>
      <mesh position={[0, 2.15, 3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <SurfaceMaterial surface="bazaar-plaster" repeat={[3.4, 2.6]} />
      </mesh>

      <mesh position={[-0.1, 4.18, 0]} receiveShadow>
        <boxGeometry args={[5.45, 0.15, 7.05]} />
        <meshStandardMaterial color="#403a32" roughness={0.9} />
      </mesh>

      <ShopfrontFrame profile={profile} />
      <Shutter profile={profile} />
      <ShopSign room={room} vendor={vendor} profile={profile} />
      <ShopLights profile={profile} />
      <WallConduit profile={profile} />
    </>
  )
}
