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
      <color attach="background" args={['#040812']} />
      <fog attach="fog" args={['#040812', 28, 76]} />

      <ambientLight intensity={0.42} />
      <hemisphereLight intensity={0.9} color="#c8e4ff" groundColor="#111923" />
      <directionalLight
        position={[7, 15, 9]}
        intensity={1.65}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />

      <Architecture />

      {demoWorld.rooms.map((room) => {
        const vendor = vendorsById.get(room.vendorId)
        return vendor ? <RoomRenderer key={room.id} room={room} vendor={vendor} /> : null
      })}

      <WorldDecor />
      <ExperienceEffects />
      <DiagnosticsProbe />
      <PlayerController world={demoWorld} />
    </>
  )
}
