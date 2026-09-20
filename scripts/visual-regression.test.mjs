import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const fixtureFiles = [
  '../src/scene/retail/fixtures/StockWall.tsx',
  '../src/scene/retail/fixtures/ProductDisplays.tsx',
  '../src/scene/retail/fixtures/ShopCounter.tsx',
  '../src/scene/retail/fixtures/MarketProps.tsx'
]

test('interior retail fixtures do not render raw Drei Html labels', async () => {
  for (const relative of fixtureFiles) {
    const source = await readFile(new URL(relative, import.meta.url), 'utf8')
    assert.equal(/<Html(?:\s|>)/.test(source), false, `${relative} must use RoomScopedHtml`)
    assert.equal(/\bHtml\b[^\n]*@react-three\/drei/.test(source), false, `${relative} must not import Drei Html directly`)
  }
})
