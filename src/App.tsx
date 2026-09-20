import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import MallScene from './components/MallScene'
import HUD from './components/HUD'
import { fetchCatalog } from './data/catalog/catalogClient'
import { seedCatalog } from './data/catalog/seedCatalog'
import { useAppStore } from './store'
import { demoWorld } from './world/demoWorld'
import { validateWorldDefinition } from './world/validation'

const worldIssues = validateWorldDefinition(demoWorld, seedCatalog)
if (worldIssues.length) console.error('[world-validation]', worldIssues)

function CatalogLoader() {
  const setCatalog = useAppStore((s) => s.setCatalog)
  const setCatalogError = useAppStore((s) => s.setCatalogError)

  useEffect(() => {
    if (import.meta.env.VITE_STATIC_DEMO === 'true') return

    const controller = new AbortController()
    void fetchCatalog(controller.signal)
      .then((catalog) => setCatalog(catalog, 'api'))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Catalog API unavailable'
        setCatalogError(message)
      })

    return () => controller.abort()
  }, [setCatalog, setCatalogError])

  return null
}

export default function App() {
  const quality = useAppStore((state) => state.quality)

  return (
    <main className="app-shell">
      <CatalogLoader />
      <Canvas
        shadows
        dpr={quality === 'cinematic' ? [1, 1.75] : [0.8, 1.25]}
        camera={{ fov: 67, near: 0.08, far: 120, position: [0, 1.72, 23] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.12
          gl.outputColorSpace = SRGBColorSpace
        }}
      >
        <Suspense fallback={null}>
          <MallScene />
        </Suspense>
      </Canvas>
      <HUD />
    </main>
  )
}
