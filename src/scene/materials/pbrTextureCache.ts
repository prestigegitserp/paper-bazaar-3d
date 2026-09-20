import {
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader
} from 'three'
import type { SurfacePresetId } from '../../world/boothProfiles'
import {
  getPbrSurfaceAsset,
  getPbrSurfaceUrls,
  PBR_PLAN_STANDARD,
  type PbrTexturePlan
} from './pbrSurfaceRegistry'

const loader = new TextureLoader()
loader.setCrossOrigin('anonymous')

const sourceTexturePromises = new Map<string, Promise<Texture>>()

type PbrLoadPriority = 'critical' | 'normal' | 'background'

const priorityWeight: Record<PbrLoadPriority, number> = {
  critical: 0,
  normal: 1,
  background: 2
}

type QueueItem<T> = {
  priority: number
  run: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

const queue: QueueItem<unknown>[] = []
let activeBuilds = 0
const MAX_CONCURRENT_BUILDS = 2

function pumpQueue() {
  while (activeBuilds < MAX_CONCURRENT_BUILDS && queue.length) {
    queue.sort((a, b) => a.priority - b.priority)
    const item = queue.shift()
    if (!item) return

    activeBuilds += 1
    void item.run()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        activeBuilds -= 1
        pumpQueue()
      })
  }
}

function schedule<T>(task: () => Promise<T>, priority: PbrLoadPriority) {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      priority: priorityWeight[priority],
      run: task,
      resolve: resolve as (value: unknown) => void,
      reject
    })
    pumpQueue()
  })
}

function loadSharedTexture(url: string, srgb = false) {
  let promise = sourceTexturePromises.get(url)
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
    sourceTexturePromises.set(url, promise)
    void promise.catch(() => {
      if (sourceTexturePromises.get(url) === promise) sourceTexturePromises.delete(url)
    })
  }
  return promise
}

async function loadWithFallback(
  primary: string,
  fallback: string,
  srgb = false
) {
  if (primary === fallback) return loadSharedTexture(primary, srgb)
  try {
    return await loadSharedTexture(primary, srgb)
  } catch {
    return loadSharedTexture(fallback, srgb)
  }
}

async function loadArmOrRoughness(
  primaryArm: string,
  fallbackArm: string,
  fallbackRoughness: string
) {
  try {
    return {
      source: await loadWithFallback(primaryArm, fallbackArm),
      packed: true
    }
  } catch {
    return {
      source: await loadSharedTexture(fallbackRoughness),
      packed: false
    }
  }
}

function cloneTexture(
  source: Texture,
  repeat: [number, number],
  anisotropy: number,
  srgb = false
) {
  const texture = source.clone()
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.anisotropy = anisotropy
  texture.channel = 0
  if (srgb) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export type PbrTextureSet = {
  map: Texture
  normalMap?: Texture
  roughnessMap?: Texture
  aoMap?: Texture
  plan: PbrTexturePlan
  packedArm: boolean
}

export type PbrTextureLease = {
  key: string
  set: PbrTextureSet
}

type VariantEntry = {
  refs: number
  set?: PbrTextureSet
  promise: Promise<PbrTextureSet>
}

const variantCache = new Map<string, VariantEntry>()

function variantKey(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number,
  full: boolean,
  plan: PbrTexturePlan
) {
  return [
    surface,
    `c:${plan.color}`,
    `n:${plan.normal}`,
    `a:${plan.arm}`,
    repeat[0].toFixed(3),
    repeat[1].toFixed(3),
    anisotropy.toFixed(2),
    full ? 'full' : 'albedo'
  ].join('|')
}

function disposeSet(set: PbrTextureSet) {
  const textures = new Set<Texture>()
  textures.add(set.map)
  if (set.normalMap) textures.add(set.normalMap)
  if (set.roughnessMap) textures.add(set.roughnessMap)
  if (set.aoMap) textures.add(set.aoMap)
  textures.forEach((texture) => texture.dispose())
}

async function createPbrTextureSet(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number,
  full: boolean,
  plan: PbrTexturePlan
) {
  const asset = getPbrSurfaceAsset(surface)
  const urls = getPbrSurfaceUrls(surface, plan)
  const fallback = getPbrSurfaceUrls(surface, PBR_PLAN_STANDARD)
  if (!asset || !urls || !fallback) throw new Error(`No PBR asset registered for ${surface}`)

  const sourceMapPromise = loadWithFallback(urls.color, fallback.color, true)
  const sourceNormalPromise = full
    ? loadWithFallback(urls.normal, fallback.normal)
    : Promise.resolve(undefined)
  const sourceArmPromise = full
    ? loadArmOrRoughness(urls.arm, fallback.arm, fallback.roughness)
    : Promise.resolve(undefined)

  const [sourceMap, sourceNormal, sourceArm] = await Promise.all([
    sourceMapPromise,
    sourceNormalPromise,
    sourceArmPromise
  ])

  const packedMap = sourceArm
    ? cloneTexture(sourceArm.source, repeat, anisotropy)
    : undefined

  return {
    map: cloneTexture(sourceMap, repeat, anisotropy, true),
    normalMap: sourceNormal
      ? cloneTexture(sourceNormal, repeat, anisotropy)
      : undefined,
    roughnessMap: packedMap,
    aoMap: sourceArm?.packed ? packedMap : undefined,
    plan,
    packedArm: sourceArm?.packed ?? false
  }
}

export async function acquirePbrTextureSet(
  surface: SurfacePresetId,
  {
    repeat,
    anisotropy,
    full,
    priority = 'normal',
    plan = PBR_PLAN_STANDARD
  }: {
    repeat: [number, number]
    anisotropy: number
    full: boolean
    priority?: PbrLoadPriority
    plan?: PbrTexturePlan
  }
): Promise<PbrTextureLease | null> {
  const asset = getPbrSurfaceAsset(surface)
  if (!asset) return null

  const key = variantKey(surface, repeat, anisotropy, full, plan)
  let entry = variantCache.get(key)

  if (!entry) {
    const next: VariantEntry = {
      refs: 0,
      promise: Promise.resolve(null as unknown as PbrTextureSet)
    }

    next.promise = schedule(
      () => createPbrTextureSet(surface, repeat, anisotropy, full, plan),
      priority
    )
      .then((set) => {
        next.set = set
        if (next.refs === 0) {
          disposeSet(set)
          if (variantCache.get(key) === next) variantCache.delete(key)
        }
        return set
      })
      .catch((error) => {
        if (variantCache.get(key) === next) variantCache.delete(key)
        throw error
      })

    entry = next
    variantCache.set(key, entry)
  }

  entry.refs += 1

  try {
    const set = await entry.promise
    return { key, set }
  } catch (error) {
    entry.refs = Math.max(0, entry.refs - 1)
    throw error
  }
}

export function releasePbrTextureSet(lease: PbrTextureLease | null | undefined) {
  if (!lease) return
  const entry = variantCache.get(lease.key)
  if (!entry) return

  entry.refs = Math.max(0, entry.refs - 1)
  if (entry.refs === 0 && entry.set) {
    disposeSet(entry.set)
    variantCache.delete(lease.key)
  }
}

export function getPbrResidencyStats() {
  return {
    sourceTextures: sourceTexturePromises.size,
    variants: variantCache.size,
    queuedBuilds: queue.length,
    activeBuilds
  }
}
