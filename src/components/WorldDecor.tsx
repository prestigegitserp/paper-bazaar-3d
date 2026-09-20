import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

function KineticPaperSculpture() {
  const rotor = useRef<Group>(null)

  useFrame((_, delta) => {
    if (rotor.current) rotor.current.rotation.y += delta * 0.085
  })

  return (
    <group position={[0, 0, -7]}>
      <mesh receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.36, 36]} />
        <meshStandardMaterial color="#121b29" metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[1.78, 1.78, 2.8, 36, 1, true]} />
        <meshPhysicalMaterial
          color="#7fcfff"
          transparent
          opacity={0.1}
          transmission={0.7}
          thickness={0.25}
          roughness={0.12}
          metalness={0}
          side={2}
        />
      </mesh>
      <Float speed={1.05} rotationIntensity={0.15} floatIntensity={0.24}>
        <group ref={rotor} position={[0, 2.55, 0]} rotation={[0.12, 0.2, -0.06]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0, (i - 3.5) * 0.2, 0]} rotation={[0, i * 0.14, i * 0.024]} castShadow>
              <boxGeometry args={[3.15 - i * 0.07, 0.07, 2.18 - i * 0.045]} />
              <meshStandardMaterial
                color={i % 2 ? '#f5f0e6' : '#dcebf2'}
                roughness={0.7}
                emissive={i === 7 ? '#73d1ff' : '#000000'}
                emissiveIntensity={i === 7 ? 0.2 : 0}
              />
            </mesh>
          ))}
        </group>
      </Float>
      <pointLight position={[0, 3.8, 0]} color="#8fd3ff" intensity={34} distance={10} />
    </group>
  )
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.84, 18]} />
        <meshStandardMaterial color="#252b35" metalness={0.3} roughness={0.38} />
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

function LoungeBench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.4, 0.26, 0.78]} />
        <meshStandardMaterial color="#24364b" roughness={0.38} metalness={0.22} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.62]} />
          <meshStandardMaterial color="#131b28" metalness={0.45} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.65, -0.3]} castShadow>
        <boxGeometry args={[2.25, 0.62, 0.12]} />
        <meshStandardMaterial color="#324b67" roughness={0.42} />
      </mesh>
    </group>
  )
}

export default function WorldDecor() {
  return (
    <>
      <KineticPaperSculpture />
      <Planter position={[-3.6, 0, 12]} />
      <Planter position={[3.6, 0, 12]} />
      <Planter position={[-3.6, 0, -20]} />
      <Planter position={[3.6, 0, -20]} />
      <LoungeBench position={[-1.9, 0, 17]} rotationY={Math.PI / 2} />
      <LoungeBench position={[1.9, 0, 17]} rotationY={-Math.PI / 2} />
    </>
  )
}
