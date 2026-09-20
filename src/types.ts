// Compatibility barrel. New code should import from domain/* and world/* directly.
export type { Catalog, CrawlStatus, Product, Vendor } from './domain/catalog'
export type { Interaction } from './domain/interaction'
export type { BoothTheme, HotspotDefinition, RoomDefinition, WorldAsset, WorldDefinition } from './world/types'
