import { create } from 'zustand'
import type { Catalog } from './domain/catalog'
import type { Interaction } from './domain/interaction'
import { seedCatalog } from './data/catalog/seedCatalog'

type AppState = {
  catalog: Catalog
  catalogMode: 'seed' | 'api'
  catalogError: string | null
  selected: Interaction | null
  nearby: Interaction | null
  started: boolean
  player: { x: number; z: number }
  setCatalog: (catalog: Catalog, mode: 'seed' | 'api') => void
  setCatalogError: (message: string | null) => void
  setSelected: (selected: Interaction | null) => void
  setNearby: (nearby: Interaction | null) => void
  setStarted: (started: boolean) => void
  setPlayer: (x: number, z: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  catalog: seedCatalog,
  catalogMode: 'seed',
  catalogError: null,
  selected: null,
  nearby: null,
  started: false,
  player: { x: 0, z: 23 },
  setCatalog: (catalog, catalogMode) => set({ catalog, catalogMode, catalogError: null }),
  setCatalogError: (catalogError) => set({ catalogError }),
  setSelected: (selected) => set({ selected }),
  setNearby: (nearby) => set({ nearby }),
  setStarted: (started) => set({ started }),
  setPlayer: (x, z) => set({ player: { x, z } })
}))
