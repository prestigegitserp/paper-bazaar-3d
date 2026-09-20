import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAuthoredShopGlb, inspectAuthoredShopGlb } from './generate-authored-shop.mjs'

test('authored shop generator emits a valid GLB with semantic anchor nodes', () => {
  const buffer = buildAuthoredShopGlb()
  const gltf = inspectAuthoredShopGlb(buffer)

  assert.ok(buffer.length > 10_000)
  assert.ok(buffer.length < 250_000)
  assert.equal(gltf.asset.version, '2.0')

  const names = new Set(gltf.nodes.map((node) => node.name))
  for (const required of [
    'hotspot_management',
    'hotspot_prices',
    'hotspot_catalog',
    'hotspot_product_0',
    'hotspot_product_1',
    'counter_glass_top',
    'paper_roll_0',
    'junction_box',
    'receipt_printer',
    'cctv_body',
    'hvac_vent',
    'counter_glass_shelf',
    'service_bell'
  ]) {
    assert.ok(names.has(required), `missing authored node: ${required}`)
  }

  assert.ok(gltf.nodes.length >= 120, 'authored shop should remain meaningfully detailed after v0.9 detail pass')
  assert.ok(gltf.materials.some((material) => material.name === 'glass'))
})
