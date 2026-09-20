import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useAppStore } from '../store'

export default function MaterialEnvironment() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const invalidate = useThree((state) => state.invalidate)
  const quality = useAppStore((state) => state.quality)
  const started = useAppStore((state) => state.started)

  useEffect(() => {
    if (!started) return

    let disposed = false
    let target: ReturnType<PMREMGenerator['fromScene']> | null = null
    let pmrem: PMREMGenerator | null = null
    const timer = window.setTimeout(() => {
      if (disposed) return

      pmrem = new PMREMGenerator(gl)
      pmrem.compileCubemapShader()
      const room = new RoomEnvironment()
      target = pmrem.fromScene(room, 0.04)
      const texture = target.texture

      scene.environment = texture
      scene.environmentIntensity = quality === 'cinematic' ? 0.82 : 0.58
      invalidate()
    }, 120)

    return () => {
      disposed = true
      window.clearTimeout(timer)
      if (target && scene.environment === target.texture) scene.environment = null
      target?.dispose()
      pmrem?.dispose()
      invalidate()
    }
  }, [gl, invalidate, quality, scene, started])

  return null
}
