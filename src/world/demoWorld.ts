import { bazaarShopColliders, bazaarShopEntryAnchor, bazaarShopFootprint } from './presets/bazaarShop'
import type { BoothTheme, HotspotDefinition, RoomDefinition, WorldDefinition } from './types'

const themes: Record<string, BoothTheme> = {
  'iran-paper-net': { primary: '#183d51', secondary: '#e8edf0', accent: '#5bc8ee', floor: '#5f696f' },
  'kaghaz-foroush': { primary: '#354638', secondary: '#e7dfcf', accent: '#ca954d', floor: '#6d5d4d' },
  'mellat-pub': { primary: '#5e3034', secondary: '#f0e7da', accent: '#d9a65b', floor: '#6a4d40' },
  kaghaz20: { primary: '#304b68', secondary: '#eff4f6', accent: '#5cc9e8', floor: '#737d83' },
  'seraj-cellulose': { primary: '#5a4329', secondary: '#eadfc8', accent: '#d09c4d', floor: '#76573e' },
  'scan-preview': { primary: '#2c4a4d', secondary: '#e3eceb', accent: '#65d7e5', floor: '#626b6b' }
}

function shopHotspots(vendorId: string): HotspotDefinition[] {
  const documentId = `catalog:${vendorId}:2026`
  return [
    {
      id: `${vendorId}:management`,
      anchor: { kind: 'slot', slot: 'management-desk' },
      action: { kind: 'vendor', vendorId, label: 'اطلاعات و وب‌سایت مغازه' }
    },
    {
      id: `${vendorId}:prices`,
      anchor: { kind: 'slot', slot: 'price-board' },
      action: { kind: 'products', vendorId, label: 'کالاها و آخرین قیمت ثبت‌شده' }
    },
    {
      id: `${vendorId}:catalog`,
      anchor: { kind: 'slot', slot: 'catalog-desk' },
      action: { kind: 'document', vendorId, documentId, label: 'باز کردن کاتالوگ دیجیتال' }
    },
    {
      id: `${vendorId}:product:0`,
      anchor: { kind: 'slot', slot: 'product-pedestal', index: 0 },
      action: { kind: 'product-slot', vendorId, productIndex: 0, label: 'کالای منتخب مغازه' }
    },
    {
      id: `${vendorId}:product:1`,
      anchor: { kind: 'slot', slot: 'product-pedestal', index: 1 },
      action: { kind: 'product-slot', vendorId, productIndex: 1, label: 'کالای منتخب مغازه' }
    }
  ]
}

function shop(
  id: string,
  label: string,
  themeKey: string,
  profileId: string,
  x: number,
  z: number,
  rotationY: number,
  vendorId?: string
): RoomDefinition {
  return {
    id,
    label,
    kind: 'booth',
    vendorId,
    position: [x, 0, z],
    rotationY,
    footprint: bazaarShopFootprint,
    entryAnchor: bazaarShopEntryAnchor,
    discoveryRadius: 4.5,
    theme: themes[themeKey],
    asset: {
      kind: 'procedural',
      renderer: 'retail-booth-v3',
      assetId: `procedural:${id}`,
      version: '3.0.0',
      metersPerUnit: 1
    },
    experience: {
      profileId,
      catalogDocumentId: vendorId ? `catalog:${vendorId}:2026` : undefined
    },
    hotspots: vendorId ? shopHotspots(vendorId) : [],
    colliders: bazaarShopColliders
  }
}

export const demoWorld: WorldDefinition = {
  id: 'paper-bazaar-tehran-alley',
  name: 'Paper Bazaar 3D — Tehran Paper Alley',
  version: 4,
  spawn: [0, 1.68, 18.8],
  bounds: { minX: -9.7, maxX: 9.7, minZ: -18.8, maxZ: 20.8 },
  rooms: [
    shop('shop:iran-paper-net', 'شبکه کاغذ ایران', 'iran-paper-net', 'iran-paper-modern', -6.4, -13.5, 0, 'iran-paper-net'),
    shop('shop:kaghaz-foroush', 'کاغذ فروش', 'kaghaz-foroush', 'kaghazforoush-stockroom', 6.4, -13.5, Math.PI, 'kaghaz-foroush'),
    shop('shop:mellat-pub', 'انتشارات ملت / کیمیا تجارت', 'mellat-pub', 'mellat-editorial', -6.4, -3, 0, 'mellat-pub'),
    shop('shop:kaghaz20', 'کاغذ ۲۰', 'kaghaz20', 'kaghaz20-retail', 6.4, -3, Math.PI, 'kaghaz20'),
    shop('shop:seraj-cellulose', 'سراج سلولز / برادران محمودی', 'seraj-cellulose', 'seraj-heritage', -6.4, 7.5, 0, 'seraj-cellulose'),
    shop('shop:scan-preview', 'غرفه نمونه اسکن و Digital Twin', 'scan-preview', 'scan-lab', 6.4, 7.5, Math.PI)
  ],
  staticColliders: [
    { kind: 'circle', x: -3.9, z: 15, radius: 0.78 },
    { kind: 'circle', x: 3.9, z: 15, radius: 0.78 }
  ]
}
