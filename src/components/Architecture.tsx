import { Html, Instance, Instances } from '@react-three/drei'
import { useMemo } from 'react'
import { BackSide } from 'three'
import SurfaceMaterial from '../scene/materials/SurfaceMaterial'
import { useAppStore } from '../store'

const AISLE_HALF_WIDTH = 2.7
const VAULT_BASE_Y = 2.48
const MARKET_LENGTH = 39.6

function HangingSign({ position, label, sublabel }: { position: [number, number, number]; label: string; sublabel: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.05, 8]} />
        <meshStandardMaterial color="#2b2c29" metalness={0.72} roughness={0.55} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[3.25, 0.66, 0.075]} />
        <meshStandardMaterial color="#31514a" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, -0.325, 0.045]}>
        <boxGeometry args={[3.05, 0.025, 0.028]} />
        <meshBasicMaterial color="#d5b375" toneMapped={false} />
      </mesh>
      <Html center position={[0, 0, 0.055]} distanceFactor={8.7} style={{ pointerEvents: 'none' }}>
        <div className="wayfinding-sign wayfinding-sign--bazaar">
          <strong>{label}</strong>
          <span>{sublabel}</span>
        </div>
      </Html>
    </group>
  )
}

function BrickVault() {
  const zPositions = useMemo(() => Array.from({ length: 11 }, (_, index) => -18 + index * 3.65), [])

  return (
    <>
      <mesh position={[0, VAULT_BASE_Y, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry
          args={[AISLE_HALF_WIDTH, AISLE_HALF_WIDTH, MARKET_LENGTH, 36, 1, true, Math.PI / 2, Math.PI]}
        />
        <SurfaceMaterial surface="bazaar-brick" repeat={[5.4, 13]} side={BackSide} />
      </mesh>

      <Instances limit={zPositions.length} castShadow receiveShadow={false}>
        <torusGeometry args={[AISLE_HALF_WIDTH, 0.11, 8, 40, Math.PI]} />
        <meshStandardMaterial color="#6e4934" roughness={0.94} />
        {zPositions.map((z) => (
          <Instance key={z} position={[0, VAULT_BASE_Y, z]} />
        ))}
      </Instances>

      {zPositions.map((z) => (
        <group key={`pier:${z}`}>
          <mesh position={[-AISLE_HALF_WIDTH, 1.23, z]} castShadow>
            <boxGeometry args={[0.3, 2.46, 0.38]} />
            <SurfaceMaterial surface="bazaar-brick" repeat={[1, 2.2]} />
          </mesh>
          <mesh position={[AISLE_HALF_WIDTH, 1.23, z]} castShadow>
            <boxGeometry args={[0.3, 2.46, 0.38]} />
            <SurfaceMaterial surface="bazaar-brick" repeat={[1, 2.2]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function FluorescentFixture({ z, warm = false }: { z: number; warm?: boolean }) {
  const color = warm ? '#ffe2b4' : '#edf4e8'
  return (
    <group position={[0, 4.63, z]}>
      <mesh castShadow>
        <boxGeometry args={[2.3, 0.11, 0.34]} />
        <meshStandardMaterial color="#4a4741" metalness={0.58} roughness={0.48} />
      </mesh>
      {[-0.52, 0.52].map((x) => (
        <mesh key={x} position={[x, -0.075, 0]}>
          <boxGeometry args={[0.78, 0.035, 0.12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.1} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, -0.28, 0]} color={color} intensity={warm ? 8 : 9.5} distance={8.5} decay={2} />
    </group>
  )
}

function MarketFloor() {
  const seamZ = useMemo(() => Array.from({ length: 32 }, (_, index) => -18.5 + index * 1.2), [])

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.028, 0]}>
        <planeGeometry args={[16.55, MARKET_LENGTH]} />
        <SurfaceMaterial surface="bazaar-floor" repeat={[8.5, 18]} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[5.0, 38.5]} />
        <meshStandardMaterial color="#69665f" roughness={0.58} metalness={0.015} transparent opacity={0.22} />
      </mesh>
      <Instances limit={seamZ.length}>
        <boxGeometry args={[5.0, 0.008, 0.018]} />
        <meshBasicMaterial color="#24231f" transparent opacity={0.22} />
        {seamZ.map((z) => <Instance key={z} position={[0, 0.012, z]} />)}
      </Instances>
    </>
  )
}

function ClosedBay({
  x,
  z,
  rotationY,
  label,
  signColor
}: {
  x: number
  z: number
  rotationY: number
  label: string
  signColor: string
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[2.73, 1.68, 0]} castShadow>
        <boxGeometry args={[0.1, 3.35, 2.65]} />
        <SurfaceMaterial surface="bazaar-shutter" repeat={[2.2, 3.1]} color="#85847e" />
      </mesh>
      <mesh position={[2.64, 3.58, 0]} castShadow>
        <boxGeometry args={[0.22, 0.62, 2.9]} />
        <meshStandardMaterial color={signColor} roughness={0.68} />
      </mesh>
      <Html center position={[2.51, 3.58, 0]} distanceFactor={8.4} style={{ pointerEvents: 'none' }}>
        <div className="closed-bay-sign">{label}<small>فروش عمده · بازار</small></div>
      </Html>
    </group>
  )
}

function EntranceGate() {
  return (
    <group position={[0, 0, 19.25]}>
      {[-2.92, 2.92].map((x) => (
        <mesh key={x} position={[x, 2.1, 0]} castShadow>
          <boxGeometry args={[0.46, 4.2, 0.7]} />
          <SurfaceMaterial surface="bazaar-brick" repeat={[1, 3]} />
        </mesh>
      ))}
      <mesh position={[0, 4.42, 0]} castShadow>
        <boxGeometry args={[6.25, 0.62, 0.74]} />
        <SurfaceMaterial surface="bazaar-brick" repeat={[4, 1]} />
      </mesh>
      <Html center position={[0, 4.43, -0.42]} distanceFactor={8.4} style={{ pointerEvents: 'none' }}>
        <div className="market-gate-sign market-gate-sign--real">
          <strong>راسته کاغذ و تحریر</strong>
          <span>BAZAAR PAPER ALLEY · TEHRAN-INSPIRED</span>
        </div>
      </Html>
    </group>
  )
}

function ElectricalRuns() {
  return (
    <>
      {[-2.48, 2.48].map((x) => (
        <group key={x}>
          <mesh position={[x, 3.55, 0]}>
            <boxGeometry args={[0.035, 0.035, 37.5]} />
            <meshStandardMaterial color="#262825" metalness={0.55} roughness={0.64} />
          </mesh>
          {[-13, -3, 7].map((z) => (
            <mesh key={z} position={[x, 3.2, z]}>
              <boxGeometry args={[0.16, 0.28, 0.21]} />
              <meshStandardMaterial color="#4e514c" roughness={0.72} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

export default function Architecture() {
  const quality = useAppStore((state) => state.quality)

  return (
    <>
      <MarketFloor />

      <mesh position={[-8.25, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.32, 5.6, MARKET_LENGTH]} />
        <SurfaceMaterial surface="bazaar-plaster" repeat={[2, 12]} />
      </mesh>
      <mesh position={[8.25, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.32, 5.6, MARKET_LENGTH]} />
        <SurfaceMaterial surface="bazaar-plaster" repeat={[2, 12]} />
      </mesh>
      <mesh position={[0, 2.8, -19.55]} receiveShadow>
        <boxGeometry args={[16.55, 5.6, 0.32]} />
        <SurfaceMaterial surface="bazaar-plaster" repeat={[8, 3]} />
      </mesh>

      <BrickVault />
      <ElectricalRuns />

      {[-14.5, -8.2, -1.9, 4.4, 10.7, 16.1].map((z, index) => (
        <FluorescentFixture key={z} z={z} warm={index % 3 === 1} />
      ))}

      {quality === 'cinematic' && (
        <>
          <spotLight position={[-2.1, 4.45, 7.2]} target-position={[-5.35, 1.7, 7.5]} color="#ffd3a0" intensity={13} distance={8} angle={0.55} penumbra={0.9} />
          <spotLight position={[2.1, 4.45, -3.0]} target-position={[5.35, 1.7, -3]} color="#eef4df" intensity={12} distance={8} angle={0.55} penumbra={0.9} />
        </>
      )}

      <ClosedBay x={-5.35} z={-8.25} rotationY={0} label="انبار کاغذ و مقوا" signColor="#5b4939" />
      <ClosedBay x={5.35} z={-8.25} rotationY={Math.PI} label="صحافی و ملزومات" signColor="#375149" />
      <ClosedBay x={-5.35} z={2.25} rotationY={0} label="چاپ و تحریر" signColor="#67413b" />
      <ClosedBay x={5.35} z={2.25} rotationY={Math.PI} label="کاغذ رنگی" signColor="#45546a" />
      <ClosedBay x={-5.35} z={12.65} rotationY={0} label="فروش عمده" signColor="#66512f" />
      <ClosedBay x={5.35} z={12.65} rotationY={Math.PI} label="انبار سفارشات" signColor="#39464a" />

      <EntranceGate />
      <HangingSign position={[0, 4.15, 10.4]} label="کاغذ · مقوا · تحریر" sublabel="الهام از راسته‌های بازار تهران" />
      <HangingSign position={[0, 4.15, -9.4]} label="فروش عمده و استعلام روز" sublabel="WHOLESALE · PAPER · BOARD" />
    </>
  )
}
