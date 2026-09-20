import type { Texture, WebGLRenderer } from 'three'
import type { PbrTextureSet } from './pbrTextureCache'

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
}

let uploadTail: Promise<void> = Promise.resolve()

function idleUpload(task: () => void) {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      task()
      resolve()
      return
    }

    const idleWindow = window as IdleWindow
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(() => {
        task()
        resolve()
      }, { timeout: 850 })
      return
    }

    window.setTimeout(() => {
      task()
      resolve()
    }, 16)
  })
}

function queueTextureUpload(renderer: WebGLRenderer, texture: Texture) {
  uploadTail = uploadTail.then(() => idleUpload(() => {
    renderer.initTexture(texture)
  }))
  return uploadTail
}

export async function warmPbrTextureSet(renderer: WebGLRenderer, set: PbrTextureSet) {
  const textures = [set.map, set.normalMap, set.roughnessMap].filter(Boolean) as Texture[]
  for (const texture of textures) await queueTextureUpload(renderer, texture)
}
