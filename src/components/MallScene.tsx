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
      <color attach="background" args={['#e7e8e6']} />
      <fog attach="fog" args={['#dcdedc', 35, 78]} />

      <ambientLight intensity={0.72} />
      <hemisphereLight intensity={0.82} color="#fffaf0" groundColor="#7d8587" />
      <directionalLight
        position={[5, 12, 8]}
        intensity={0.9}
        color="#fff6e6"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-near={1}
        shadow-camera-far={46}
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
