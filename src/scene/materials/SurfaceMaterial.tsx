import { useEffect, useMemo } from 'react'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getSurfacePreset, getSurfaceTextures } from './proceduralSurfaces'

export default function SurfaceMaterial({
  surface,
  repeat = [2, 2],
  color,
  emissive,
  emissiveIntensity = 0
}: {
  surface: SurfacePresetId
  repeat?: [number, number]
  color?: string
  emissive?: string
  emissiveIntensity?: number
}) {
  const preset = getSurfacePreset(surface)
  const textures = useMemo(() => {
    const source = getSurfaceTextures(surface)
    const map = source.map.clone()
    const bump = source.bump.clone()
    map.repeat.set(repeat[0], repeat[1])
    bump.repeat.set(repeat[0], repeat[1])
    map.needsUpdate = true
    bump.needsUpdate = true
    return { map, bump }
  }, [repeat[0], repeat[1], surface])

  useEffect(() => () => {
    textures.map.dispose()
    textures.bump.dispose()
  }, [textures])

  return (
    <meshStandardMaterial
      color={color}
      map={textures.map}
      bumpMap={textures.bump}
      bumpScale={preset.bumpScale}
      roughness={preset.roughness}
      metalness={preset.metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  )
}
