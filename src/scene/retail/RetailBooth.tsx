import type { Vendor } from '../../domain/catalog'
import { getBoothProfile } from '../../world/boothProfiles'
import { findHotspot, resolveHotspotInteraction } from '../../world/hotspots'
import type { RoomDefinition } from '../../world/types'
import RetailShell from './RetailShell'
import {
  AcrylicDisplay,
  BookWall,
  CatalogProp,
  PalletStack,
  Pegboard,
  PriceBoard,
  PrintFrames,
  ProductPaperStack,
  RollRack,
  SalesDesk,
  SampleWall,
  ScanLab,
  StockShelves,
  SwatchFan
} from './RetailFixtures'

export default function RetailBooth({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const profile = getBoothProfile(room.experience?.profileId)
  const productA = vendor?.products[0]
  const productB = vendor?.products[1]
  const hotspotA = vendor ? findHotspot(room.hotspots, 'product-pedestal', 0) : null
  const hotspotB = vendor ? findHotspot(room.hotspots, 'product-pedestal', 1) : null
  const productAInteraction = vendor && productA && hotspotA ? resolveHotspotInteraction(hotspotA, vendor) : null
  const productBInteraction = vendor && productB && hotspotB ? resolveHotspotInteraction(hotspotB, vendor) : null

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <RetailShell room={room} vendor={vendor} profile={profile} />

      {profile.template !== 'scan-lab' && <StockShelves room={room} profile={profile} />}
      <SalesDesk room={room} vendor={vendor} profile={profile} />
      <PriceBoard room={room} vendor={vendor} profile={profile} />
      <CatalogProp room={room} vendor={vendor} profile={profile} />

      {profile.features.sampleWall && <SampleWall room={room} />}
      {profile.features.swatchFan && <SwatchFan room={room} profile={profile} />}
      {profile.features.rollRack && <RollRack profile={profile} />}
      {profile.features.palletStack && <PalletStack profile={profile} />}
      {profile.features.bookWall && <BookWall room={room} profile={profile} />}
      {profile.features.pegboard && <Pegboard room={room} />}
      {profile.features.acrylicDisplay && <AcrylicDisplay room={room} />}
      {profile.features.printFrames && <PrintFrames room={room} />}

      {productA && (
        <ProductPaperStack
          position={profile.layout.products[0] as [number, number, number]}
          room={room}
          profile={profile}
          interaction={productAInteraction}
          label={productA.name}
        />
      )}

      {productB && (
        <ProductPaperStack
          position={profile.layout.products[1] as [number, number, number]}
          room={room}
          profile={profile}
          interaction={productBInteraction}
          label={productB.name}
        />
      )}

      {profile.template === 'scan-lab' && <ScanLab room={room} />}

      <pointLight
        position={[1.4, 3.2, 0]}
        intensity={profile.lighting.intensity}
        distance={6.5}
        color={profile.lighting.color}
      />
    </group>
  )
}
