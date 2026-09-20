import { useMemo } from 'react'
import Architecture from './Architecture'
import DiagnosticsProbe from './DiagnosticsProbe'
import ExperienceEffects from './ExperienceEffects'
import PlayerController from './PlayerController'
import RoomRenderer from './RoomRenderer'
import WorldDecor from './WorldDecor'
import { useAppStore } from '../store'
import { demoWorld } from '../world/demoWorld'

export default function MallScene() {
  const vendors = useAppStore((state) => state.catalog.vendors)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])

  return (
    <>
      <color attach="background" args={['#17120d']} />
      <fog attach="fog" args={['#1b1510', 26, 62]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.72} color="#f3dfbf" groundColor="#3a2d22" />
      <directionalLight
        position={[4, 12, 7]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <Architecture />

      {demoWorld.rooms.map((room) => (
        <RoomRenderer
          key={room.id}
          room={room}
          vendor={room.vendorId ? vendorsById.get(room.vendorId) : undefined}
        />
      ))}

      <WorldDecor />
      <ExperienceEffects />
      <DiagnosticsProbe />
      <PlayerController world={demoWorld} />
    </>
  )
}
