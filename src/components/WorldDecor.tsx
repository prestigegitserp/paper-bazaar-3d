import { Instance, Instances } from '@react-three/drei'

function PaperRollRack({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.8, 1.3, 0.75]} />
        <meshStandardMaterial color="#594534" roughness={0.82} />
      </mesh>
      <Instances limit={5}>
        <cylinderGeometry args={[0.2, 0.2, 1.45, 12]} />
        <meshStandardMaterial roughness={0.8} vertexColors />
        {[-0.62, -0.31, 0, 0.31, 0.62].map((x, index) => (
          <Instance
            key={x}
            position={[x, 1.5, 0]}
            rotation={[0, 0, Math.PI / 2]}
            color={index % 2 ? '#e6dcc7' : '#c9b48e'}
          />
        ))}
      </Instances>
    </group>
  )
}

function HandCart({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.45, 0.24, 1.9]} />
        <meshStandardMaterial color="#6c4b31" roughness={0.72} />
      </mesh>
      {[[-0.58, 0.18, -0.65], [0.58, 0.18, -0.65], [-0.58, 0.18, 0.65], [0.58, 0.18, 0.65]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.11, 12]} />
          <meshStandardMaterial color="#25221f" roughness={0.88} />
        </mesh>
      ))}
      {[0.72, 0.92, 1.12].map((y, index) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.25 - index * 0.06, 0.16, 1.65 - index * 0.08]} />
          <meshStandardMaterial color="#e4dccb" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.62, 0.72, 12]} />
        <meshStandardMaterial color="#6e4f38" roughness={0.88} />
      </mesh>
      {[0, 1, 2, 3].map((index) => (
        <mesh key={index} position={[Math.sin(index * 1.7) * 0.22, 0.9 + (index % 2) * 0.18, Math.cos(index * 1.7) * 0.22]}>
          <sphereGeometry args={[0.23, 8, 8]} />
          <meshStandardMaterial color={index % 2 ? '#4e7450' : '#668760'} roughness={0.88} />
        </mesh>
      ))}
    </group>
  )
}

export default function WorldDecor() {
  return (
    <>
      <HandCart position={[0, 0, 14.6]} />
      <Planter position={[-3.9, 0, 15]} />
      <Planter position={[3.9, 0, 15]} />
      <PaperRollRack position={[-4.15, 0, -18]} />
      <PaperRollRack position={[4.15, 0, -18]} rotationY={Math.PI} />
    </>
  )
}
