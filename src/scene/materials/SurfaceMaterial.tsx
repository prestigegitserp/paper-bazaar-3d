import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import {
  Color,
  Vector2,
  type Side
} from 'three'
import { useAppStore } from '../../store'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getPbrSurfaceAsset } from './pbrSurfaceRegistry'
import {
  disposePbrTextureSet,
  loadPbrTextureSet,
  type PbrTextureSet
} from './pbrTextureCache'
import { getSurfacePreset, getSurfaceTextures } from './proceduralSurfaces'
import { getSurfacePhysicalProfile } from './surfacePhysicalProfiles'

export default function SurfaceMaterial({
  surface,
  repeat = [2, 2],
  color,
  emissive,
  emissiveIntensity = 0,
  side,
  transparent,
  opacity
}: {
  surface: SurfacePresetId
  repeat?: [number, number]
  color?: string
  emissive?: string
  emissiveIntensity?: number
  side?: Side
  transparent?: boolean
  opacity?: number
}) {
  const quality = useAppStore((state) => state.quality)
  const gl = useThree((state) => state.gl)
  const preset = getSurfacePreset(surface)
  const physical = getSurfacePhysicalProfile(surface)
  const pbrAsset = getPbrSurfaceAsset(surface)
  const [loadedPbr, setLoadedPbr] = useState<PbrTextureSet | null>(null)
  const textureAnisotropy = quality === 'cinematic'
    ? Math.min(8, gl.capabilities.getMaxAnisotropy())
    : Math.min(4, gl.capabilities.getMaxAnisotropy())

  const fallback = useMemo(() => {
    const source = getSurfaceTextures(surface)
    const map = source.map.clone()
    const bump = source.bump.clone()
    map.repeat.set(repeat[0], repeat[1])
    bump.repeat.set(repeat[0], repeat[1])
    map.anisotropy = textureAnisotropy
    bump.anisotropy = textureAnisotropy
    map.needsUpdate = true
    bump.needsUpdate = true
    return { map, bump }
  }, [repeat[0], repeat[1], surface, textureAnisotropy])

  useEffect(() => {
    if (!pbrAsset) {
      setLoadedPbr(null)
      return
    }

    let active = true
    let next: PbrTextureSet | null = null

    void loadPbrTextureSet(surface, {
      repeat,
      anisotropy: textureAnisotropy,
      full: quality === 'cinematic'
    })
      .then((loaded) => {
        next = loaded
        if (!active) {
          disposePbrTextureSet(loaded)
          return
        }
        setLoadedPbr(loaded)
      })
      .catch(() => {
        if (active) setLoadedPbr(null)
      })

    return () => {
      active = false
      if (next && next !== loadedPbr) disposePbrTextureSet(next)
    }
  }, [pbrAsset, quality, repeat[0], repeat[1], surface, textureAnisotropy])

  useEffect(() => () => {
    fallback.map.dispose()
    fallback.bump.dispose()
  }, [fallback])

  useEffect(() => () => {
    disposePbrTextureSet(loadedPbr)
  }, [loadedPbr])

  const map = loadedPbr?.map ?? fallback.map
  const baseNormalScale = pbrAsset?.normalScale ?? 0.5
  const normalScale = loadedPbr?.normalMap
    ? new Vector2(
        baseNormalScale * physical.normalScaleMultiplier,
        baseNormalScale * physical.normalScaleMultiplier
      )
    : undefined

  return (
    <meshPhysicalMaterial
      color={color ? new Color(color) : undefined}
      map={map}
      bumpMap={loadedPbr ? undefined : fallback.bump}
      bumpScale={loadedPbr ? 0 : preset.bumpScale}
      normalMap={loadedPbr?.normalMap}
      normalScale={normalScale}
      roughnessMap={loadedPbr?.roughnessMap}
      roughness={preset.roughness}
      metalness={preset.metalness}
      clearcoat={quality === 'cinematic' ? physical.clearcoat : physical.clearcoat * 0.45}
      clearcoatRoughness={physical.clearcoatRoughness}
      envMapIntensity={physical.envMapIntensity}
      anisotropy={quality === 'cinematic' ? physical.anisotropy : physical.anisotropy * 0.45}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      side={side}
      transparent={transparent}
      opacity={opacity}
    />
  )
}
