import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { AgXToneMapping, SRGBColorSpace } from 'three'
import CatalogReader from './features/catalog-reader/CatalogReader'
import MallScene from './components/MallScene'
import HUD from './components/HUD'
import { loadRuntimeBundle } from './infrastructure/repositories/runtimeRepositories'
import { useAppStore } from './store'
import { validateWorldDefinition } from './world/validation'

function RuntimeLoader() {
  const setRuntimeBundle = useAppStore((state) => state.setRuntimeBundle)
  const setCatalogError = useAppStore((state) => state.setCatalogError)

  useEffect(() => {
    const controller = new AbortController()

    void loadRuntimeBundle(controller.signal)
      .then((bundle) => {
        const issues = validateWorldDefinition(bundle.world, bundle.catalog)
        if (issues.length) console.error('[world-validation]', issues)
        setRuntimeBundle(bundle)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Runtime content unavailable'
        setCatalogError(message)
      })

    return () => controller.abort()
  }, [setCatalogError, setRuntimeBundle])

  return null
}

export default function App() {
  const quality = useAppStore((state) => state.quality)
  const world = useAppStore((state) => state.world)

  return (
    <main className="app-shell">
      <RuntimeLoader />
      <Canvas
        shadows={quality === 'cinematic'}
        dpr={quality === 'cinematic' ? [1, 1.55] : [0.72, 1.12]}
        camera={{ fov: 66, near: 0.08, far: 90, position: world.spawn as [number, number, number] }}
        gl={{ antialias: quality === 'cinematic', powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = AgXToneMapping
          gl.toneMappingExposure = 1.0
          gl.outputColorSpace = SRGBColorSpace
        }}
      >
        <Suspense fallback={null}>
          <MallScene />
        </Suspense>
      </Canvas>
      <HUD />
      <CatalogReader />
    </main>
  )
}
