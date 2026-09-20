import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useAppStore } from '../store'

export default function MaterialEnvironment() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const quality = useAppStore((state) => state.quality)

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    pmrem.compileCubemapShader()
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    const texture = target.texture

    scene.environment = texture
    scene.environmentIntensity = quality === 'cinematic' ? 0.82 : 0.58

    return () => {
      if (scene.environment === texture) scene.environment = null
      target.dispose()
      pmrem.dispose()
    }
  }, [gl, quality, scene])

  return null
}
