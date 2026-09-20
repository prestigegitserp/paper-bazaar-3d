let wakeup: (() => void) | null = null

export function registerRenderWakeup(callback: () => void) {
  wakeup = callback
  return () => {
    if (wakeup === callback) wakeup = null
  }
}

export function requestRenderWakeup() {
  wakeup?.()
}
