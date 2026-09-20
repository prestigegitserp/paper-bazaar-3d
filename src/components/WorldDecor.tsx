import { Instance, Instances } from '@react-three/drei'

function HandCart({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.12, 0]}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[1.2, 0.18, 1.65]} />
        <meshStandardMaterial color="#715039" roughness={0.78} />
      </mesh>
      {[
        [-0.5, 0.16, -0.55],
        [0.5, 0.16, -0.55],
        [-0.5, 0.16, 0.55],
        [0.5, 0.16, 0.55]
      ].map((wheel, index) => (
        <mesh key={index} position={wheel as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.17, 0.17, 0.09, 14]} />
          <meshStandardMaterial color="#22221f" roughness={0.9} />
        </mesh>
      ))}
      {[0.68, 0.86, 1.04].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.04 - index * 0.05, 0.14, 1.42 - index * 0.07]} />
          <meshStandardMaterial color={index === 1 ? '#d8c6a5' : '#e8e1d3'} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 1.05]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 1.0]} />
        <meshStandardMaterial color="#5f4431" roughness={0.8} />
      </mesh>
    </group>
  )
}

function CartonPile({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const boxes = [
    [-0.38, 0.2, 0],
    [0.34, 0.18, 0.05],
    [-0.22, 0.58, 0.02],
    [0.42, 0.52, -0.04],
    [0.02, 0.91, 0.02]
  ] as const

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {boxes.map((box, index) => (
        <mesh key={index} position={box} rotation={[0, (index % 3 - 1) * 0.07, 0]} castShadow>
          <boxGeometry args={[0.68, index === 4 ? 0.32 : 0.36, 0.62]} />
          <meshStandardMaterial color={index % 2 ? '#a98057' : '#bb9364'} roughness={0.96} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.92, 0.34]}>
        <boxGeometry args={[0.46, 0.05, 0.02]} />
        <meshStandardMaterial color="#6f5538" roughness={0.88} />
      </mesh>
    </group>
  )
}

function PaperRollRack({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1.55, 1.16, 0.62]} />
        <meshStandardMaterial color="#50453a" roughness={0.82} />
      </mesh>
      <Instances limit={5}>
        <cylinderGeometry args={[0.17, 0.17, 1.28, 14]} />
        <meshStandardMaterial roughness={0.88} vertexColors />
        {[-0.52, -0.26, 0, 0.26, 0.52].map((x, index) => (
          <Instance
            key={x}
            position={[x, 1.36, 0]}
            rotation={[0, 0, Math.PI / 2]}
            color={index % 2 ? '#e5dccb' : '#cbb591'}
          />
        ))}
      </Instances>
    </group>
  )
}

function FoldingStool({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.52, 0.07, 0.42]} />
        <meshStandardMaterial color="#6b4d36" roughness={0.8} />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.23, 0]} rotation={[0, 0, x < 0 ? 0.17 : -0.17]}>
            <boxGeometry args={[0.055, 0.46, 0.055]} />
            <meshStandardMaterial color="#3f413d" metalness={0.52} roughness={0.58} />
          </mesh>
          <mesh position={[x, 0.23, 0]} rotation={[0, 0, x < 0 ? -0.17 : 0.17]}>
            <boxGeometry args={[0.055, 0.46, 0.055]} />
            <meshStandardMaterial color="#3f413d" metalness={0.52} roughness={0.58} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bicycle({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={0.82}>
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[0, 0.56, z]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.45, 0.025, 8, 26]} />
          <meshStandardMaterial color="#272825" roughness={0.62} metalness={0.48} />
        </mesh>
      ))}
      <mesh position={[0, 0.7, 0]} rotation={[0.78, 0, 0]}>
        <boxGeometry args={[0.045, 0.045, 1.05]} />
        <meshStandardMaterial color="#4d5d55" metalness={0.48} roughness={0.56} />
      </mesh>
      <mesh position={[0, 0.7, -0.1]} rotation={[-0.82, 0, 0]}>
        <boxGeometry args={[0.045, 0.045, 0.84]} />
        <meshStandardMaterial color="#4d5d55" metalness={0.48} roughness={0.56} />
      </mesh>
      <mesh position={[0, 1.02, 0.34]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.055, 0.55, 0.055]} />
        <meshStandardMaterial color="#4d5d55" metalness={0.48} roughness={0.56} />
      </mesh>
      <mesh position={[0, 1.29, 0.33]}>
        <boxGeometry args={[0.38, 0.04, 0.04]} />
        <meshStandardMaterial color="#2d2e2a" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, -0.14]}>
        <boxGeometry args={[0.3, 0.05, 0.16]} />
        <meshStandardMaterial color="#4b352a" roughness={0.82} />
      </mesh>
    </group>
  )
}

export default function WorldDecor() {
  return (
    <>
      <HandCart position={[0, 0, 14.65]} />
      <CartonPile position={[-2.22, 0, 16.7]} rotationY={-0.12} />
      <CartonPile position={[2.2, 0, -17.5]} rotationY={Math.PI + 0.08} />
      <FoldingStool position={[-2.18, 0, 11.55]} rotationY={0.3} />
      <PaperRollRack position={[-2.15, 0, -18]} />
      <PaperRollRack position={[2.15, 0, -18]} rotationY={Math.PI} />
      <Bicycle position={[2.28, 0, 16.1]} rotationY={0.04} />
    </>
  )
}
