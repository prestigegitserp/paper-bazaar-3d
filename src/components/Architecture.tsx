import { Html, MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { useAppStore } from '../store'

function WayfindingSign({ position, label, sublabel }: { position: [number, number, number]; label: string; sublabel: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[4.9, 0.92, 0.12]} />
        <meshStandardMaterial color="#08111f" metalness={0.45} roughness={0.26} emissive="#102c49" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <boxGeometry args={[5.15, 0.035, 0.16]} />
        <meshBasicMaterial color="#66d4ff" toneMapped={false} />
      </mesh>
      <Html center position={[0, 0, 0.08]} distanceFactor={8.5} style={{ pointerEvents: 'none' }}>
        <div className="wayfinding-sign">
          <strong>{label}</strong>
          <span>{sublabel}</span>
        </div>
      </Html>
    </group>
  )
}

export default function Architecture() {
  const quality = useAppStore((state) => state.quality)
  const ceilingLights = useMemo(() => Array.from({ length: 10 }, (_, i) => -22.5 + i * 5), [])
  const ceilingRibs = useMemo(() => Array.from({ length: 14 }, (_, i) => -26 + i * 4), [])

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <planeGeometry args={[28, 54]} />
        <meshStandardMaterial color="#0a111d" roughness={0.62} metalness={0.16} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[7.8, 52]} />
        {quality === 'cinematic' ? (
          <MeshReflectorMaterial
            color="#202c3d"
            metalness={0.28}
            roughness={0.6}
            resolution={512}
            blur={[280, 90]}
            mixBlur={0.65}
            mixStrength={4.5}
            mirror={0.18}
            depthScale={0.22}
            minDepthThreshold={0.72}
            maxDepthThreshold={1.3}
          />
        ) : (
          <meshStandardMaterial color="#202c3d" roughness={0.5} metalness={0.24} />
        )}
      </mesh>

      <mesh position={[-13.85, 3.3, 0]} receiveShadow>
        <boxGeometry args={[0.28, 6.6, 54]} />
        <meshStandardMaterial color="#0d1726" roughness={0.72} />
      </mesh>
      <mesh position={[13.85, 3.3, 0]} receiveShadow>
        <boxGeometry args={[0.28, 6.6, 54]} />
        <meshStandardMaterial color="#0d1726" roughness={0.72} />
      </mesh>
      <mesh position={[0, 3.3, -26.85]} receiveShadow>
        <boxGeometry args={[28, 6.6, 0.28]} />
        <meshStandardMaterial color="#0d1726" roughness={0.72} />
      </mesh>
      <mesh position={[0, 6.48, 0]} receiveShadow>
        <boxGeometry args={[28, 0.18, 54]} />
        <meshStandardMaterial color="#07101c" roughness={0.85} />
      </mesh>

      {ceilingRibs.map((z) => (
        <mesh key={z} position={[0, 6.28, z]} castShadow>
          <boxGeometry args={[27.2, 0.16, 0.2]} />
          <meshStandardMaterial color="#1d2b3c" metalness={0.42} roughness={0.35} />
        </mesh>
      ))}

      {ceilingLights.map((z) => (
        <group key={z} position={[0, 6.05, z]}>
          <RoundedBox args={[8.8, 0.1, 0.32]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#d9edff" emissive="#8dcfff" emissiveIntensity={2.15} toneMapped={false} />
          </RoundedBox>
          <pointLight intensity={quality === 'cinematic' ? 24 : 14} distance={10} color="#d8ebff" />
        </group>
      ))}

      {[-4.3, 4.3].map((x) => (
        <mesh key={x} position={[x, 0.055, 0]}>
          <boxGeometry args={[0.035, 0.018, 51]} />
          <meshBasicMaterial color="#49c8ff" toneMapped={false} transparent opacity={0.48} />
        </mesh>
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
        <mesh position={[0, 5.65, -0.43]}>
          <boxGeometry args={[8.4, 0.06, 0.04]} />
          <meshBasicMaterial color="#5fd3ff" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 4.8, -1]} color="#5cc8ff" intensity={32} distance={12} />
      </group>

      <WayfindingSign position={[0, 4.72, 9]} label="بازار کاغذ ایران" sublabel="PAPER WHOLESALE · ZONE 01" />
      <WayfindingSign position={[0, 4.72, -12]} label="قیمت و تامین عمده" sublabel="LIVE CATALOG · ZONE 02" />
    </>
  )
}
