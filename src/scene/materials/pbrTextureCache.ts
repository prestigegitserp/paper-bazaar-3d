import {
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader
} from 'three'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getPbrSurfaceAsset } from './pbrSurfaceRegistry'

const loader = new TextureLoader()
loader.setCrossOrigin('anonymous')
const texturePromises = new Map<string, Promise<Texture>>()

function loadSharedTexture(url: string, srgb = false) {
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

function cloneTexture(source: Texture, repeat: [number, number], anisotropy: number, srgb = false) {
  const texture = source.clone()
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.anisotropy = anisotropy
  if (srgb) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export type PbrTextureSet = {
  map: Texture
  normalMap?: Texture
  roughnessMap?: Texture
}

export async function loadPbrTextureSet(
  surface: SurfacePresetId,
  {
    repeat,
    anisotropy,
    full
  }: {
    repeat: [number, number]
    anisotropy: number
    full: boolean
  }
): Promise<PbrTextureSet | null> {
  const asset = getPbrSurfaceAsset(surface)
  if (!asset) return null

  const [sourceMap, sourceNormal, sourceRoughness] = await Promise.all([
    loadSharedTexture(asset.color, true),
    full ? loadSharedTexture(asset.normal) : Promise.resolve(undefined),
    full ? loadSharedTexture(asset.roughness) : Promise.resolve(undefined)
  ])

  return {
    map: cloneTexture(sourceMap, repeat, anisotropy, true),
    normalMap: sourceNormal ? cloneTexture(sourceNormal, repeat, anisotropy) : undefined,
    roughnessMap: sourceRoughness ? cloneTexture(sourceRoughness, repeat, anisotropy) : undefined
  }
}

export function disposePbrTextureSet(set: PbrTextureSet | null | undefined) {
  set?.map.dispose()
  set?.normalMap?.dispose()
  set?.roughnessMap?.dispose()
}
