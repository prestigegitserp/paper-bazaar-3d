import { useMemo } from 'react'
import Architecture from './Architecture'
import DiagnosticsProbe from './DiagnosticsProbe'
import ExperienceEffects from './ExperienceEffects'
import PlayerController from './PlayerController'
import RoomRenderer from './RoomRenderer'
import WorldDecor from './WorldDecor'
import { useAppStore } from '../store'

export default function MallScene() {
  const vendors = useAppStore((state) => state.catalog.vendors)
  const world = useAppStore((state) => state.world)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])

  return (
    <>
      <color attach="background" args={['#181511']} />
      <fog attach="fog" args={['#211b16', 22, 54]} />

      <ambientLight intensity={0.28} />
      <hemisphereLight intensity={0.46} color="#eadfc7" groundColor="#302720" />
      <directionalLight
        position={[3, 11, 5]}
        intensity={0.72}
        color="#f5e2c2"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <Architecture />

      {world.rooms.map((room) => (
        <RoomRenderer
          key={room.id}
          room={room}
          vendor={room.vendorId ? vendorsById.get(room.vendorId) : undefined}
        />
      ))}

      <WorldDecor />
      <ExperienceEffects />
      <DiagnosticsProbe />
      <PlayerController world={world} />
    </>
  )
}
