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
    'junction_box'
  ]) {
    assert.ok(names.has(required), `missing authored node: ${required}`)
  }

  assert.ok(gltf.nodes.length >= 80, 'authored shop should remain meaningfully detailed')
  assert.ok(gltf.materials.some((material) => material.name === 'glass'))
})
