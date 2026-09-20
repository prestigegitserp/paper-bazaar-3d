import { useEffect, useMemo, useState } from 'react'
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
  const preset = getSurfacePreset(surface)
  const pbrAsset = getPbrSurfaceAsset(surface)
  const [loadedPbr, setLoadedPbr] = useState<LoadedPbr | null>(null)

  const fallback = useMemo(() => {
    const source = getSurfaceTextures(surface)
    const map = source.map.clone()
    const bump = source.bump.clone()
    map.repeat.set(repeat[0], repeat[1])
    bump.repeat.set(repeat[0], repeat[1])
    map.needsUpdate = true
    bump.needsUpdate = true
    return { map, bump }
  }, [repeat[0], repeat[1], surface])

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
        map.wrapS = RepeatWrapping
        map.wrapT = RepeatWrapping
        map.repeat.set(repeat[0], repeat[1])
        map.colorSpace = SRGBColorSpace
        map.needsUpdate = true

        const normalMap = sourceNormal?.clone()
        if (normalMap) {
          normalMap.wrapS = RepeatWrapping
          normalMap.wrapT = RepeatWrapping
          normalMap.repeat.set(repeat[0], repeat[1])
          normalMap.needsUpdate = true
        }

        const roughnessMap = sourceRoughness?.clone()
        if (roughnessMap) {
          roughnessMap.wrapS = RepeatWrapping
          roughnessMap.wrapT = RepeatWrapping
          roughnessMap.repeat.set(repeat[0], repeat[1])
          roughnessMap.needsUpdate = true
        }

        setLoadedPbr({ map, normalMap, roughnessMap })
      })
      .catch(() => {
        if (active) setLoadedPbr(null)
      })

    return () => {
      active = false
    }
  }, [pbrAsset, quality, repeat[0], repeat[1]])

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
  const normalScale = loadedPbr?.normalMap ? new Vector2(pbrAsset?.normalScale ?? 0.5, pbrAsset?.normalScale ?? 0.5) : undefined

  return (
    <meshStandardMaterial
      color={color ? new Color(color) : undefined}
      map={map}
      bumpMap={loadedPbr ? undefined : fallback.bump}
      bumpScale={loadedPbr ? 0 : preset.bumpScale}
      normalMap={loadedPbr?.normalMap}
      normalScale={normalScale}
      roughnessMap={loadedPbr?.roughnessMap}
      roughness={preset.roughness}
      metalness={preset.metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      side={side}
      transparent={transparent}
      opacity={opacity}
    />
  )
}
