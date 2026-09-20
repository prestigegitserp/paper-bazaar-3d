import { Float, RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { useAppStore } from '../store'
import { demoWorld } from '../world/demoWorld'
import RoomRenderer from './RoomRenderer'
import PlayerController from './PlayerController'

function PaperSculpture() {
  return (
    <group position={[0, 0, -7]}>
      <mesh receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.36, 36]} />
        <meshStandardMaterial color="#121b29" metalness={0.4} roughness={0.34} />
      </mesh>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.28}>
        <group position={[0, 2.5, 0]} rotation={[0.15, 0.2, -0.08]}>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} position={[0, (i - 3) * 0.22, 0]} rotation={[0, i * 0.12, i * 0.025]} castShadow>
              <boxGeometry args={[3.2 - i * 0.08, 0.08, 2.2 - i * 0.05]} />
              <meshStandardMaterial color={i % 2 ? '#f4efe4' : '#dce9ee'} roughness={0.78} />
            </mesh>
          ))}
        </group>
      </Float>
      <pointLight position={[0, 3.8, 0]} color="#8fd3ff" intensity={32} distance={10} />
    </group>
  )
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.84, 18]} />
        <meshStandardMaterial color="#2c3038" metalness={0.25} roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.sin(i) * 0.35, 1.1 + (i % 2) * 0.25, Math.cos(i) * 0.35]} rotation={[0.4, i, 0.2]} castShadow>
          <sphereGeometry args={[0.28, 10, 10]} />
          <meshStandardMaterial color={i % 2 ? '#4f8b61' : '#6ba77a'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export default function MallScene() {
  const vendors = useAppStore((s) => s.catalog.vendors)
  const ceilingLights = useMemo(() => Array.from({ length: 9 }, (_, i) => -20 + i * 5), [])
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])

  return (
    <>
      <color attach="background" args={['#050914']} />
      <fog attach="fog" args={['#050914', 25, 70]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={1.0} color="#bfdcff" groundColor="#18202a" />
      <directionalLight position={[6, 14, 10]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[28, 54]} />
        <meshStandardMaterial color="#0d1420" roughness={0.58} metalness={0.12} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[7.6, 51]} />
        <meshStandardMaterial color="#253144" roughness={0.46} metalness={0.18} />
      </mesh>

      <mesh position={[-13.85, 3.3, 0]} receiveShadow>
        <boxGeometry args={[0.28, 6.6, 54]} />
        <meshStandardMaterial color="#101827" roughness={0.7} />
      </mesh>
      <mesh position={[13.85, 3.3, 0]} receiveShadow>
        <boxGeometry args={[0.28, 6.6, 54]} />
        <meshStandardMaterial color="#101827" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.3, -26.85]} receiveShadow>
        <boxGeometry args={[28, 6.6, 0.28]} />
        <meshStandardMaterial color="#101827" roughness={0.7} />
      </mesh>

      {ceilingLights.map((z) => (
        <group key={z} position={[0, 6.05, z]}>
          <RoundedBox args={[8.5, 0.12, 0.34]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#b8d7ff" emissive="#8bc5ff" emissiveIntensity={1.7} toneMapped={false} />
          </RoundedBox>
          <pointLight intensity={22} distance={10} color="#d8ebff" />
        </group>
      ))}

      <group position={[0, 0, 25.2]}>
        <mesh position={[-6.4, 3.1, 0]} castShadow>
          <boxGeometry args={[0.45, 6.2, 0.8]} />
          <meshStandardMaterial color="#253046" metalness={0.28} roughness={0.38} />
        </mesh>
        <mesh position={[6.4, 3.1, 0]} castShadow>
          <boxGeometry args={[0.45, 6.2, 0.8]} />
          <meshStandardMaterial color="#253046" metalness={0.28} roughness={0.38} />
        </mesh>
        <mesh position={[0, 5.72, 0]} castShadow>
          <boxGeometry args={[13.2, 0.42, 0.82]} />
          <meshStandardMaterial color="#1c2b43" metalness={0.3} roughness={0.34} />
        </mesh>
        <pointLight position={[0, 4.8, -1]} color="#5cc8ff" intensity={32} distance={12} />
      </group>

      {demoWorld.rooms.map((room) => {
        const vendor = vendorsById.get(room.vendorId)
        return vendor ? <RoomRenderer key={room.id} room={room} vendor={vendor} /> : null
      })}

      <PaperSculpture />
      <Planter position={[-3.6, 0, 12]} />
      <Planter position={[3.6, 0, 12]} />
      <Planter position={[-3.6, 0, -20]} />
      <Planter position={[3.6, 0, -20]} />

      <PlayerController world={demoWorld} />
    </>
  )
}
