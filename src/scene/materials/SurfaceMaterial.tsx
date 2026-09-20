import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import {
  Color,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  type Side
} from 'three'
import { useAppStore } from '../../store'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getPbrSurfaceAsset } from './pbrSurfaceRegistry'
import { getSurfacePreset, getSurfaceTextures } from './proceduralSurfaces'
import { getSurfacePhysicalProfile } from './surfacePhysicalProfiles'

const loader = new TextureLoader()
loader.setCrossOrigin('anonymous')
const texturePromises = new Map<string, Promise<Texture>>()

function fetchTexture(url: string, srgb = false) {
  let promise = texturePromises.get(url)
  if (!promise) {
    promise = new Promise<Texture>((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
          if (srgb) texture.colorSpace = SRGBColorSpace
          resolve(texture)
        },
        undefined,
        reject
      )
    })
    texturePromises.set(url, promise)
  }
  return promise
}

type LoadedPbr = {
  map: Texture
  normalMap?: Texture
  roughnessMap?: Texture
}

function tuneTexture(texture: Texture, repeat: [number, number], anisotropy: number, srgb = false) {
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.anisotropy = anisotropy
  if (srgb) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
}

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
  const [loadedPbr, setLoadedPbr] = useState<LoadedPbr | null>(null)
  const textureAnisotropy = quality === 'cinematic' ? Math.min(8, gl.capabilities.getMaxAnisotropy()) : Math.min(4, gl.capabilities.getMaxAnisotropy())

  const fallback = useMemo(() => {
    const source = getSurfaceTextures(surface)
    const map = source.map.clone()
    const bump = source.bump.clone()
    tuneTexture(map, repeat, textureAnisotropy, true)
    tuneTexture(bump, repeat, textureAnisotropy)
    return { map, bump }
  }, [repeat[0], repeat[1], surface, textureAnisotropy])

  useEffect(() => {
    if (!pbrAsset) {
      setLoadedPbr(null)
      return
    }

    let active = true
    const colorPromise = fetchTexture(pbrAsset.color, true)
    const normalPromise = quality === 'cinematic' ? fetchTexture(pbrAsset.normal) : Promise.resolve(undefined)
    const roughnessPromise = quality === 'cinematic' ? fetchTexture(pbrAsset.roughness) : Promise.resolve(undefined)

    void Promise.all([colorPromise, normalPromise, roughnessPromise])
      .then(([sourceMap, sourceNormal, sourceRoughness]) => {
        if (!active) return

        const map = sourceMap.clone()
        tuneTexture(map, repeat, textureAnisotropy, true)

        const normalMap = sourceNormal?.clone()
        if (normalMap) tuneTexture(normalMap, repeat, textureAnisotropy)

        const roughnessMap = sourceRoughness?.clone()
        if (roughnessMap) tuneTexture(roughnessMap, repeat, textureAnisotropy)

        setLoadedPbr({ map, normalMap, roughnessMap })
      })
      .catch(() => {
        if (active) setLoadedPbr(null)
      })

    return () => {
      active = false
    }
  }, [pbrAsset, quality, repeat[0], repeat[1], textureAnisotropy])

  useEffect(() => () => {
    fallback.map.dispose()
    fallback.bump.dispose()
  }, [fallback])

  useEffect(() => () => {
    loadedPbr?.map.dispose()
    loadedPbr?.normalMap?.dispose()
    loadedPbr?.roughnessMap?.dispose()
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
