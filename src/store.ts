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

function progressKey(interaction: Interaction) {
  if (interaction.kind === 'product') return `product:${interaction.vendorId}:${interaction.productId}`
  if (interaction.kind === 'document') return `document:${interaction.vendorId}:${interaction.documentId}`
  return `${interaction.kind}:${interaction.vendorId}`
}

function interactionScore(interaction: Interaction) {
  if (interaction.kind === 'product') return 15
  if (interaction.kind === 'document') return 20
  return 8
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
  marketScore: number
  exploredInteractionKeys: string[]
  discoveredProductIds: string[]
  sampledProductIds: string[]
  favoriteProductIds: string[]
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
  collectSample: (productId: string) => void
  toggleFavoriteProduct: (productId: string) => void
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
  marketScore: 0,
  exploredInteractionKeys: [],
  discoveredProductIds: [],
  sampledProductIds: [],
  favoriteProductIds: [],
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
  setSelected: (selected) => set((state) => {
    if (!selected) return { selected: null }

    const key = progressKey(selected)
    const newlyExplored = !state.exploredInteractionKeys.includes(key)
    const discoveredProductIds = selected.kind === 'product' && !state.discoveredProductIds.includes(selected.productId)
      ? [...state.discoveredProductIds, selected.productId]
      : state.discoveredProductIds

    return {
      selected,
      exploredInteractionKeys: newlyExplored
        ? [...state.exploredInteractionKeys, key]
        : state.exploredInteractionKeys,
      discoveredProductIds,
      marketScore: state.marketScore + (newlyExplored ? interactionScore(selected) : 0)
    }
  }),
  setNearby: (nearby) => set({ nearby }),
  setStarted: (started) => set({ started }),
  setPlayer: (x, z) => set({ player: { x, z } }),
  setQuality: (quality) => set({ quality }),
  requestNavigation: (navigationRequest) => set({ navigationRequest }),
  clearNavigationRequest: () => set({ navigationRequest: null }),
  setActiveRoom: (activeRoomId) => set((state) => {
    const newlyVisited = Boolean(activeRoomId && !state.visitedRoomIds.includes(activeRoomId))
    return {
      activeRoomId,
      visitedRoomIds: newlyVisited && activeRoomId
        ? [...state.visitedRoomIds, activeRoomId]
        : state.visitedRoomIds,
      marketScore: state.marketScore + (newlyVisited ? 10 : 0)
    }
  }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  setDiagnosticsEnabled: (diagnosticsEnabled) => set({ diagnosticsEnabled }),
  collectSample: (productId) => set((state) => {
    if (state.sampledProductIds.includes(productId)) return {}
    return {
      sampledProductIds: [...state.sampledProductIds, productId],
      marketScore: state.marketScore + 25
    }
  }),
  toggleFavoriteProduct: (productId) => set((state) => ({
    favoriteProductIds: state.favoriteProductIds.includes(productId)
      ? state.favoriteProductIds.filter((id) => id !== productId)
      : [...state.favoriteProductIds, productId]
  })),
  reportAssetError: (roomId, message) => set((state) => ({ assetErrors: { ...state.assetErrors, [roomId]: message } })),
  clearAssetError: (roomId) => set((state) => {
    const next = { ...state.assetErrors }
    delete next[roomId]
    return { assetErrors: next }
  })
}))
