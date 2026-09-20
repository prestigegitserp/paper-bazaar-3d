import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import MallScene from './components/MallScene'
import HUD from './components/HUD'
import { fetchCatalog } from './data/catalog/catalogClient'
import { useAppStore } from './store'

function CatalogLoader() {
  const setCatalog = useAppStore((s) => s.setCatalog)
  const setCatalogError = useAppStore((s) => s.setCatalogError)

  useEffect(() => {
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
  return (
    <main className="app-shell">
      <CatalogLoader />
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ fov: 67, near: 0.08, far: 120, position: [0, 1.72, 23] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <MallScene />
        </Suspense>
      </Canvas>
      <HUD />
    </main>
  )
}
