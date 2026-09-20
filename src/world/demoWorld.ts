import { bazaarShopColliders, bazaarShopEntryAnchor, bazaarShopFootprint } from './presets/bazaarShop'
import type { BoothTheme, HotspotDefinition, RoomDefinition, WorldDefinition } from './types'

const themes: Record<string, BoothTheme> = {
  'iran-paper-net': { primary: '#1d3c4d', secondary: '#e8dfcf', accent: '#d8aa62', floor: '#6f5a45' },
  'kaghaz-foroush': { primary: '#30453b', secondary: '#e7dfcf', accent: '#c8944c', floor: '#665544' },
  'mellat-pub': { primary: '#5b302f', secondary: '#eee1cf', accent: '#d9a65b', floor: '#745748' },
  kaghaz20: { primary: '#34445a', secondary: '#e4ddcf', accent: '#b9874d', floor: '#625448' },
  'seraj-cellulose': { primary: '#5b4328', secondary: '#e8ddc5', accent: '#cf9b4b', floor: '#6a5138' },
  'scan-preview': { primary: '#3e4945', secondary: '#dfdacd', accent: '#b48a54', floor: '#5d5348' }
}

function shopHotspots(vendorId: string): HotspotDefinition[] {
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
      renderer: 'tehran-paper-shop-v2',
      assetId: `procedural:${id}`,
      version: '2.0.0',
      metersPerUnit: 1
    },
    hotspots: vendorId ? shopHotspots(vendorId) : [],
    colliders: bazaarShopColliders
  }
}

export const demoWorld: WorldDefinition = {
  id: 'paper-bazaar-tehran-alley',
  name: 'Paper Bazaar 3D — Tehran Paper Alley',
  version: 3,
  spawn: [0, 1.68, 18.8],
  bounds: { minX: -9.7, maxX: 9.7, minZ: -18.8, maxZ: 20.8 },
  rooms: [
    shop('shop:iran-paper-net', 'شبکه کاغذ ایران', 'iran-paper-net', -6.4, -13.5, 0, 'iran-paper-net'),
    shop('shop:kaghaz-foroush', 'کاغذ فروش', 'kaghaz-foroush', 6.4, -13.5, Math.PI, 'kaghaz-foroush'),
    shop('shop:mellat-pub', 'انتشارات ملت / کیمیا تجارت', 'mellat-pub', -6.4, -3, 0, 'mellat-pub'),
    shop('shop:kaghaz20', 'کاغذ ۲۰', 'kaghaz20', 6.4, -3, Math.PI, 'kaghaz20'),
    shop('shop:seraj-cellulose', 'سراج سلولز / برادران محمودی', 'seraj-cellulose', -6.4, 7.5, 0, 'seraj-cellulose'),
    shop('shop:scan-preview', 'غرفه نمونه اسکن و Digital Twin', 'scan-preview', 6.4, 7.5, Math.PI)
  ],
  staticColliders: [
    { kind: 'circle', x: -3.9, z: 15, radius: 0.78 },
    { kind: 'circle', x: 3.9, z: 15, radius: 0.78 }
  ]
}
