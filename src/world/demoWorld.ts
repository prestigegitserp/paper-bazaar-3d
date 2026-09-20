import { paperBoothColliders, paperBoothEntryAnchor, paperBoothFootprint } from './presets/paperBooth'
import type { HotspotDefinition, RoomDefinition, WorldDefinition } from './types'

const themes = {
  'iran-paper-net': { primary: '#112a46', secondary: '#e8f1f6', accent: '#38bdf8', floor: '#16263a' },
  'kaghaz-foroush': { primary: '#0e3b35', secondary: '#e9f5ed', accent: '#f8c15c', floor: '#12342f' },
  'mellat-pub': { primary: '#351020', secondary: '#f6eef1', accent: '#fb7185', floor: '#2e1620' },
  kaghaz20: { primary: '#251755', secondary: '#f2efff', accent: '#22d3ee', floor: '#211842' }
} as const

function boothHotspots(vendorId: string): HotspotDefinition[] {
  return [
    {
      id: `${vendorId}:management`,
      anchor: { kind: 'slot', slot: 'management-desk' },
      action: { kind: 'vendor', vendorId, label: 'اطلاعات و وب‌سایت غرفه' }
    },
    {
      id: `${vendorId}:prices`,
      anchor: { kind: 'slot', slot: 'price-board' },
      action: { kind: 'products', vendorId, label: 'محصولات و آخرین قیمت ثبت‌شده' }
    },
    {
      id: `${vendorId}:product:0`,
      anchor: { kind: 'slot', slot: 'product-pedestal', index: 0 },
      action: { kind: 'product-slot', vendorId, productIndex: 0, label: 'محصول منتخب غرفه' }
    },
    {
      id: `${vendorId}:product:1`,
      anchor: { kind: 'slot', slot: 'product-pedestal', index: 1 },
      action: { kind: 'product-slot', vendorId, productIndex: 1, label: 'محصول منتخب غرفه' }
    }
  ]
}

function booth(vendorId: keyof typeof themes, label: string, x: number, z: number, rotationY: number): RoomDefinition {
  return {
    id: `booth:${vendorId}`,
    label,
    kind: 'booth',
    vendorId,
    position: [x, 0, z],
    rotationY,
    footprint: paperBoothFootprint,
    entryAnchor: paperBoothEntryAnchor,
    discoveryRadius: 5.25,
    theme: themes[vendorId],
    asset: {
      kind: 'procedural',
      renderer: 'paper-booth-v1',
      assetId: `procedural:${vendorId}`,
      version: '1.0.0',
      metersPerUnit: 1
    },
    hotspots: boothHotspots(vendorId),
    colliders: paperBoothColliders
  }
}

export const demoWorld: WorldDefinition = {
  id: 'paper-bazaar-demo',
  name: 'Paper Bazaar 3D',
  version: 2,
  spawn: [0, 1.72, 23],
  bounds: { minX: -13.25, maxX: 13.25, minZ: -26.2, maxZ: 26 },
  rooms: [
    booth('iran-paper-net', 'شبکه کاغذ ایران', -9, -16, 0),
    booth('kaghaz-foroush', 'کاغذ فروش', 9, -16, Math.PI),
    booth('mellat-pub', 'انتشارات ملت / کیمیا تجارت', -9, 2, 0),
    booth('kaghaz20', 'کاغذ ۲۰', 9, 2, Math.PI)
  ],
  staticColliders: [
    { kind: 'circle', x: 0, z: -7, radius: 2.65 },
    { kind: 'circle', x: -3.6, z: 12, radius: 1.02 },
    { kind: 'circle', x: 3.6, z: 12, radius: 1.02 },
    { kind: 'circle', x: -3.6, z: -20, radius: 1.02 },
    { kind: 'circle', x: 3.6, z: -20, radius: 1.02 }
  ]
}
