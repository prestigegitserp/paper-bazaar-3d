import { create } from 'zustand'
import type { Catalog } from './domain/catalog'
import type { Interaction } from './domain/interaction'
import { seedCatalog } from './data/catalog/seedCatalog'
import type { Vec3 } from './world/types'

export type RenderQuality = 'cinematic' | 'balanced'

export type NavigationRequest = {
  target: Vec3
  yaw: number
  label: string
}

export type Diagnostics = {
  calls: number
  triangles: number
  geometries: number
  textures: number
}

type AppState = {
  catalog: Catalog
  catalogMode: 'seed' | 'api'
  catalogError: string | null
  selected: Interaction | null
  nearby: Interaction | null
  started: boolean
  player: { x: number; z: number }
  quality: RenderQuality
  navigationRequest: NavigationRequest | null
  activeRoomId: string | null
  visitedRoomIds: string[]
  diagnostics: Diagnostics
  assetErrors: Record<string, string>
  setCatalog: (catalog: Catalog, mode: 'seed' | 'api') => void
  setCatalogError: (message: string | null) => void
  setSelected: (selected: Interaction | null) => void
  setNearby: (nearby: Interaction | null) => void
  setStarted: (started: boolean) => void
  setPlayer: (x: number, z: number) => void
  setQuality: (quality: RenderQuality) => void
  requestNavigation: (request: NavigationRequest) => void
  clearNavigationRequest: () => void
  setActiveRoom: (roomId: string | null) => void
  setDiagnostics: (diagnostics: Diagnostics) => void
  reportAssetError: (roomId: string, message: string) => void
  clearAssetError: (roomId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  catalog: seedCatalog,
  catalogMode: 'seed',
  catalogError: null,
  selected: null,
  nearby: null,
  started: false,
  player: { x: 0, z: 23 },
  quality: 'cinematic',
  navigationRequest: null,
  activeRoomId: null,
  visitedRoomIds: [],
  diagnostics: { calls: 0, triangles: 0, geometries: 0, textures: 0 },
  assetErrors: {},
  setCatalog: (catalog, catalogMode) => set({ catalog, catalogMode, catalogError: null }),
  setCatalogError: (catalogError) => set({ catalogError }),
  setSelected: (selected) => set({ selected }),
  setNearby: (nearby) => set({ nearby }),
  setStarted: (started) => set({ started }),
  setPlayer: (x, z) => set({ player: { x, z } }),
  setQuality: (quality) => set({ quality }),
  requestNavigation: (navigationRequest) => set({ navigationRequest }),
  clearNavigationRequest: () => set({ navigationRequest: null }),
  setActiveRoom: (activeRoomId) => set((state) => ({
    activeRoomId,
    visitedRoomIds: activeRoomId && !state.visitedRoomIds.includes(activeRoomId)
      ? [...state.visitedRoomIds, activeRoomId]
      : state.visitedRoomIds
  })),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  reportAssetError: (roomId, message) => set((state) => ({ assetErrors: { ...state.assetErrors, [roomId]: message } })),
  clearAssetError: (roomId) => set((state) => {
    const next = { ...state.assetErrors }
    delete next[roomId]
    return { assetErrors: next }
  })
}))
