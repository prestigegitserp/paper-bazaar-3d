import { Html, Instance, Instances } from '@react-three/drei'
import { useMemo } from 'react'
import { useAppStore } from '../store'

function HangingSign({ position, label, sublabel }: { position: [number, number, number]; label: string; sublabel: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[4.4, 0.82, 0.1]} />
        <meshStandardMaterial color="#24433d" roughness={0.58} />
      </mesh>
      <mesh position={[0, -0.43, 0]}>
        <boxGeometry args={[4.55, 0.04, 0.13]} />
        <meshBasicMaterial color="#d5a65e" toneMapped={false} />
      </mesh>
      <Html center position={[0, 0, 0.07]} distanceFactor={8.5} style={{ pointerEvents: 'none' }}>
        <div className="wayfinding-sign wayfinding-sign--bazaar">
          <strong>{label}</strong>
          <span>{sublabel}</span>
        </div>
      </Html>
    </group>
  )
}

function ArchRibs() {
  const zPositions = useMemo(() => Array.from({ length: 9 }, (_, index) => -17 + index * 4.7), [])

  return (
    <Instances limit={zPositions.length} castShadow={false}>
      <torusGeometry args={[5.05, 0.16, 6, 30, Math.PI]} />
      <meshStandardMaterial color="#7e5b3f" roughness={0.92} />
      {zPositions.map((z) => (
        <Instance key={z} position={[0, 0.32, z]} />
      ))}
    </Instances>
  )
}

function CeilingStrips() {
  const zPositions = useMemo(() => [-14.5, -7.5, -0.5, 6.5, 13.5], [])

  return (
    <>
      <Instances limit={zPositions.length}>
        <boxGeometry args={[5.1, 0.055, 0.18]} />
        <meshStandardMaterial color="#ffe7b5" emissive="#ffd48a" emissiveIntensity={2.4} toneMapped={false} />
        {zPositions.map((z) => <Instance key={z} position={[0, 5.15, z]} />)}
      </Instances>
      {[-11, 0, 11].map((z) => (
        <pointLight key={z} position={[0, 4.65, z]} color="#ffd89b" intensity={15} distance={11} decay={2} />
      ))}
    </>
  )
}

function FloorPattern() {
  const stripeZ = useMemo(() => Array.from({ length: 18 }, (_, index) => -17 + index * 2.1), [])

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <planeGeometry args={[19.4, 39.6]} />
        <meshStandardMaterial color="#6b5645" roughness={0.82} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[6.4, 38.2]} />
        <meshPhysicalMaterial color="#8a765e" roughness={0.42} metalness={0.04} clearcoat={0.08} clearcoatRoughness={0.7} />
      </mesh>

      <Instances limit={stripeZ.length}>
        <boxGeometry args={[6.15, 0.012, 0.035]} />
        <meshBasicMaterial color="#b69b79" transparent opacity={0.55} />
        {stripeZ.map((z) => <Instance key={z} position={[0, 0.014, z]} />)}
      </Instances>

      {[-3.18, 3.18].map((x) => (
        <mesh key={x} position={[x, 0.018, 0]}>
          <boxGeometry args={[0.045, 0.014, 38.2]} />
          <meshBasicMaterial color="#4e4034" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  )
}

export default function Architecture() {
  const quality = useAppStore((state) => state.quality)

  return (
    <>
      <FloorPattern />

      <mesh position={[-9.55, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.32, 5.6, 39.6]} />
        <meshStandardMaterial color="#8f6d50" roughness={0.95} />
      </mesh>
      <mesh position={[9.55, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.32, 5.6, 39.6]} />
        <meshStandardMaterial color="#8f6d50" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.8, -19.55]} receiveShadow>
        <boxGeometry args={[19.4, 5.6, 0.32]} />
        <meshStandardMaterial color="#806046" roughness={0.95} />
      </mesh>

      <mesh position={[0, 5.72, 0]} receiveShadow>
        <boxGeometry args={[19.4, 0.18, 39.6]} />
        <meshStandardMaterial color="#34291f" roughness={0.9} />
      </mesh>

      <ArchRibs />
      <CeilingStrips />

      {quality === 'cinematic' && (
        <>
          <spotLight position={[-4.8, 4.8, 7]} target-position={[-6.4, 1.6, 7.5]} color="#ffc97d" intensity={24} distance={10} angle={0.52} penumbra={0.8} />
          <spotLight position={[4.8, 4.8, -3]} target-position={[6.4, 1.6, -3]} color="#ffdba0" intensity={22} distance={10} angle={0.52} penumbra={0.8} />
        </>
      )}

      <group position={[0, 0, 19.35]}>
        <mesh position={[-5.05, 2.75, 0]} castShadow>
          <boxGeometry args={[0.48, 5.5, 0.65]} />
          <meshStandardMaterial color="#76563d" roughness={0.88} />
        </mesh>
        <mesh position={[5.05, 2.75, 0]} castShadow>
          <boxGeometry args={[0.48, 5.5, 0.65]} />
          <meshStandardMaterial color="#76563d" roughness={0.88} />
        </mesh>
        <mesh position={[0, 5.02, 0]} castShadow>
          <boxGeometry args={[10.55, 0.48, 0.68]} />
          <meshStandardMaterial color="#664934" roughness={0.86} />
        </mesh>
        <Html center position={[0, 4.98, -0.38]} distanceFactor={8.6} style={{ pointerEvents: 'none' }}>
          <div className="market-gate-sign">
            <strong>راسته کاغذفروشان</strong>
            <span>Paper Bazaar · Digital Twin Demo</span>
          </div>
        </Html>
      </group>

      <HangingSign position={[0, 4.45, 10.4]} label="راسته کاغذ و مقوا" sublabel="حال‌وهوای بازار مرکزی تهران" />
      <HangingSign position={[0, 4.45, -9.4]} label="فروش عمده و استعلام روز" sublabel="WHOLESALE · PAPER · BOARD" />
    </>
  )
}
