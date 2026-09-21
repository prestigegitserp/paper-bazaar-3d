import { create } from 'zustand'
import type { Catalog } from './domain/catalog'
import type { CatalogDocument } from './domain/document'
import type { Interaction } from './domain/interaction'
import { seedCatalog } from './data/catalog/seedCatalog'
import { buildVendorDocuments } from './data/documents/buildVendorDocuments'
import type { RuntimeBundle } from './infrastructure/repositories/contracts'
import { demoWorld } from './world/demoWorld'
import type { Vec3, WorldDefinition } from './world/types'

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

function preferredQuality(): RenderQuality {
  if (typeof window === 'undefined') return 'cinematic'
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return coarse || window.innerWidth < 900 || (typeof memory === 'number' && memory <= 4) ? 'balanced' : 'cinematic'
}

type AppState = {
  catalog: Catalog
  catalogMode: 'seed' | 'api'
  catalogError: string | null
  world: WorldDefinition
  documents: CatalogDocument[]
  selected: Interaction | null
  nearby: Interaction | null
  started: boolean
  player: { x: number; z: number }
  quality: RenderQuality
  navigationRequest: NavigationRequest | null
  activeRoomId: string | null
  visitedRoomIds: string[]
  diagnostics: Diagnostics
  diagnosticsEnabled: boolean
  assetErrors: Record<string, string>
  setRuntimeBundle: (bundle: RuntimeBundle) => void
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
  setDiagnosticsEnabled: (enabled: boolean) => void
  reportAssetError: (roomId: string, message: string) => void
  clearAssetError: (roomId: string) => void
}

const initialDocuments = buildVendorDocuments(seedCatalog, demoWorld)

export const useAppStore = create<AppState>((set) => ({
  catalog: seedCatalog,
  catalogMode: 'seed',
  catalogError: null,
  world: demoWorld,
  documents: initialDocuments,
  selected: null,
  nearby: null,
  started: false,
  player: { x: 0, z: 20 },
  quality: preferredQuality(),
  navigationRequest: null,
  activeRoomId: null,
  visitedRoomIds: [],
  diagnostics: { calls: 0, triangles: 0, geometries: 0, textures: 0 },
  diagnosticsEnabled: false,
  assetErrors: {},
  setRuntimeBundle: (bundle) => set({
    catalog: bundle.catalog,
    catalogMode: bundle.catalogMode,
    catalogError: bundle.catalogError,
    world: bundle.world,
    documents: bundle.documents
  }),
  setCatalog: (catalog, catalogMode) => set((state) => ({
    catalog,
    catalogMode,
    catalogError: null,
    documents: buildVendorDocuments(catalog, state.world)
  })),
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
  setDiagnosticsEnabled: (diagnosticsEnabled) => set({ diagnosticsEnabled }),
  reportAssetError: (roomId, message) => set((state) => ({ assetErrors: { ...state.assetErrors, [roomId]: message } })),
  clearAssetError: (roomId) => set((state) => {
    const next = { ...state.assetErrors }
    delete next[roomId]
    return { assetErrors: next }
  })
}))
