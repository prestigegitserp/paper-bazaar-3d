import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { useAppStore } from '../store'

export default function DiagnosticsProbe() {
  const { gl } = useThree()
  const setDiagnostics = useAppStore((state) => state.setDiagnostics)
  const frame = useRef(0)

  useFrame(() => {
    frame.current += 1
    if (frame.current % 30 !== 0) return

    setDiagnostics({
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures
    })
  })

  return null
}
