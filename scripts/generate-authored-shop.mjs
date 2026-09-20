import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MATERIALS = [
  ['plaster', [0.90, 0.89, 0.86, 1], 0, 0.68],
  ['floor', [0.76, 0.76, 0.73, 1], 0.02, 0.32],
  ['wood', [0.50, 0.34, 0.21, 1], 0, 0.64],
  ['paper', [0.92, 0.90, 0.85, 1], 0, 0.95],
  ['cardboard', [0.67, 0.49, 0.30, 1], 0, 0.92],
  ['metal', [0.20, 0.22, 0.23, 1], 0.76, 0.34],
  ['green', [0.18, 0.31, 0.29, 1], 0.12, 0.62],
  ['yellow', [0.91, 0.78, 0.24, 1], 0, 0.84],
  ['glass', [0.86, 0.93, 0.94, 0.18], 0, 0.06],
  ['white', [0.94, 0.94, 0.91, 1], 0, 0.48],
  ['black', [0.06, 0.07, 0.075, 1], 0.25, 0.32],
  ['red', [0.62, 0.11, 0.09, 1], 0, 0.5],
  ['blue', [0.11, 0.28, 0.45, 1], 0, 0.5],
  ['silver', [0.58, 0.61, 0.62, 1], 0.85, 0.26]
]

function pad4(value) {
  return (value + 3) & ~3
}

function box(name, material, scale, translation, extras = undefined, rotation = undefined) {
  return { name, material, scale, translation, extras, rotation }
}

function authoredShopNodes() {
  const nodes = [
    box('floor', 'floor', [5.5, 0.08, 7], [0, 0.04, 0]),
    box('back_wall', 'plaster', [0.16, 4.2, 7], [-2.68, 2.1, 0]),
    box('side_wall_north', 'plaster', [5.5, 4.2, 0.16], [0, 2.1, -3.42]),
    box('side_wall_south', 'plaster', [5.5, 4.2, 0.16], [0, 2.1, 3.42]),
    box('ceiling', 'metal', [5.5, 0.12, 7], [-0.05, 4.16, 0]),
    box('front_post_north', 'metal', [0.14, 4.1, 0.14], [2.68, 2.05, -3.15]),
    box('front_post_south', 'metal', [0.14, 4.1, 0.14], [2.68, 2.05, 3.15]),
    box('front_lintel', 'metal', [0.14, 0.14, 6.42], [2.68, 4.05, 0]),
    box('sign_frame', 'metal', [0.16, 0.72, 5.2], [2.67, 3.54, 0]),
    box('sign_face', 'green', [0.035, 0.58, 4.92], [2.77, 3.54, 0])
  ]

  for (const y of [0.34, 0.95, 1.57, 2.19, 2.81, 3.43]) {
    nodes.push(box(`shelf_${y}`, 'wood', [0.34, 0.06, 6.2], [-2.20, y, 0]))
  }

  for (const z of [-3, -2, -1, 0, 1, 2, 3]) {
    nodes.push(box(`shelf_upright_${z}`, 'metal', [0.12, 3.5, 0.1], [-2.38, 1.86, z]))
  }

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const z = -2.55 + col * 1.02
      const y = 0.55 + row * 0.62
      nodes.push(box(`paper_bundle_${row}_${col}`, 'paper', [0.60, 0.25, 0.72], [-2.03, y, z]))
      if ((row + col) % 5 === 0) {
        nodes.push(box(`paper_label_${row}_${col}`, 'yellow', [0.015, 0.12, 0.28], [-1.72, y, z]))
      }
    }
  }

  nodes.push(
    box('counter_base', 'wood', [0.78, 0.65, 2.65], [0.95, 0.33, -1.05]),
    box('counter_top', 'wood', [0.84, 0.07, 2.72], [0.95, 1.05, -1.05]),
    box('hotspot_management', 'glass', [0.035, 0.62, 2.52], [1.35, 0.78, -1.05], { semantic: 'management-desk' }),
    box('counter_glass_top', 'glass', [0.74, 0.035, 2.52], [0.98, 1.01, -1.05]),
    box('calculator', 'metal', [0.34, 0.08, 0.45], [0.80, 1.14, -0.45]),
    box('calculator_screen', 'green', [0.22, 0.015, 0.10], [0.80, 1.185, -0.56]),
    box('hotspot_catalog', 'green', [0.66, 0.035, 0.46], [0.72, 1.15, -1.45], { semantic: 'catalog-desk' }),
    box('catalog_pages', 'paper', [0.60, 0.022, 0.40], [0.72, 1.18, -1.45]),
    box('price_board', 'wood', [0.10, 1.35, 2.25], [-2.48, 2.05, 0.45]),
    box('hotspot_prices', 'paper', [0.025, 1.15, 2.04], [-2.42, 2.05, 0.45], { semantic: 'price-board' })
  )

  for (const [index, x, z] of [[0, -0.4, 1.65], [1, 1.45, 1.6]]) {
    nodes.push(box(`product_pedestal_${index}`, 'wood', [0.92, 0.62, 0.88], [x, 0.31, z]))
    for (let layer = 0; layer < 4; layer += 1) {
      const name = layer === 3 ? `hotspot_product_${index}` : `product_ream_${index}_${layer}`
      nodes.push(box(name, 'paper', [0.82 - layer * 0.015, 0.085, 0.66 - layer * 0.01], [x, 0.68 + layer * 0.10, z], layer === 3 ? { semantic: `product-${index}` } : undefined))
    }
    nodes.push(box(`product_band_${index}`, index === 0 ? 'green' : 'yellow', [0.84, 0.03, 0.14], [x, 1.02, z]))
  }

  for (const [index, x, y, z] of [
    [0, 0.25, 0.2, 2.75],
    [1, 0.9, 0.2, 2.70],
    [2, 0.52, 0.58, 2.78],
    [3, -0.18, 0.55, 2.80]
  ]) {
    nodes.push(box(`carton_${index}`, 'cardboard', [0.62, 0.36, 0.64], [x, y, z]))
  }

  nodes.push(box('roll_rack', 'metal', [1.2, 2.2, 0.12], [-1, 1.1, 2.95]))
  for (const [index, x] of [[0, -1.35], [1, -1], [2, -0.65]]) {
    nodes.push(box(`paper_roll_${index}`, 'paper', [0.36, 1.8, 0.36], [x, 1.15, 2.78]))
  }

  const samples = [
    [-0.8, 2.5, -3.30], [0, 2.5, -3.30], [0.8, 2.5, -3.30],
    [-0.8, 1.65, -3.30], [0, 1.65, -3.30], [0.8, 1.65, -3.30]
  ]
  samples.forEach((position, index) => nodes.push(box(`sample_${index}`, index % 3 === 2 ? 'yellow' : 'paper', [0.56, 0.62, 0.04], position)))

  for (const [index, z] of [[0, -1.5], [1, 1.5]]) {
    nodes.push(
      box(`light_case_${index}`, 'metal', [1.85, 0.08, 0.18], [0.2, 3.88, z]),
      box(`light_panel_${index}`, 'paper', [1.60, 0.025, 0.07], [0.2, 3.82, z])
    )
  }

  for (const y of [0.34, 0.95, 1.57, 2.19, 2.81, 3.43]) {
    nodes.push(box(`shelf_front_lip_${y}`, 'silver', [0.03, 0.05, 6.05], [-2.01, y + 0.055, 0]))
  }

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      if ((row + col) % 3 === 0) {
        const z = -2.55 + col * 1.02
        const y = 0.55 + row * 0.62
        nodes.push(box(`bundle_strap_${row}_${col}`, 'cardboard', [0.06, 0.285, 0.75], [-2.00, y, z]))
      }
    }
  }

  nodes.push(
    box('counter_glass_shelf', 'glass', [0.64, 0.025, 2.32], [0.98, 0.72, -1.05]),
    box('receipt_printer', 'white', [0.30, 0.13, 0.40], [0.68, 1.16, -0.66]),
    box('receipt_slot', 'black', [0.20, 0.018, 0.08], [0.68, 1.23, -0.77]),
    box('tape_dispenser', 'green', [0.18, 0.08, 0.30], [0.96, 1.15, -0.10]),
    box('pen_cup', 'silver', [0.12, 0.20, 0.12], [0.62, 1.17, 0.08]),
    box('pen_red', 'red', [0.018, 0.24, 0.018], [0.60, 1.31, 0.08]),
    box('pen_blue', 'blue', [0.018, 0.22, 0.018], [0.65, 1.30, 0.08]),
    box('drawer_front_0', 'white', [0.04, 0.22, 0.92], [1.36, 0.43, -1.62]),
    box('drawer_front_1', 'white', [0.04, 0.22, 0.92], [1.36, 0.43, -0.50]),
    box('drawer_handle_0', 'silver', [0.03, 0.035, 0.26], [1.39, 0.45, -1.62]),
    box('drawer_handle_1', 'silver', [0.03, 0.035, 0.26], [1.39, 0.45, -0.50]),
    box('power_outlet', 'white', [0.04, 0.18, 0.28], [-2.49, 0.55, -2.62]),
    box('cable_trunk', 'silver', [0.035, 0.035, 3.1], [-2.50, 3.25, -1.70]),
    box('cctv_body', 'white', [0.28, 0.16, 0.18], [-1.95, 3.54, -2.88]),
    box('cctv_lens', 'black', [0.05, 0.07, 0.07], [-1.80, 3.54, -2.88]),
    box('cctv_arm', 'silver', [0.28, 0.04, 0.04], [-2.12, 3.68, -2.88]),
    box('hvac_vent', 'white', [1.45, 0.05, 0.48], [-0.55, 4.06, 0.95]),
    box('waste_bin', 'black', [0.34, 0.56, 0.34], [1.95, 0.28, -2.65]),
    box('brochure_holder', 'glass', [0.12, 0.42, 0.50], [0.44, 1.28, 0.88]),
    box('service_bell', 'silver', [0.16, 0.08, 0.16], [0.72, 1.15, 0.92])
  )

  for (let index = 0; index < 8; index += 1) {
    nodes.push(box(`hvac_slot_${index}`, 'black', [0.08, 0.012, 0.35], [-1.10 + index * 0.16, 4.035, 0.95]))
  }

  for (const [index, z] of [[0, -1.72], [1, -0.38], [2, 0.96]]) {
    nodes.push(
      box(`counter_price_ticket_${index}`, index === 1 ? 'yellow' : 'white', [0.03, 0.16, 0.34], [1.37, 0.73, z]),
      box(`counter_ticket_clip_${index}`, 'silver', [0.04, 0.04, 0.08], [1.40, 0.83, z])
    )
  }

  for (const [index, x, z] of [[0, 0.25, 2.75], [1, 0.9, 2.70], [2, 0.52, 2.78], [3, -0.18, 2.80]]) {
    nodes.push(box(`carton_tape_${index}`, 'cardboard', [0.64, 0.045, 0.09], [x, index < 2 ? 0.40 : 0.77, z]))
  }

  nodes.push(
    box('fan_hub', 'metal', [0.18, 0.18, 0.18], [0.25, 3.70, 0.20]),
    box('fan_blade_0', 'metal', [1.0, 0.035, 0.16], [0.75, 3.66, 0.20]),
    box('fan_blade_1', 'metal', [1.0, 0.035, 0.16], [0.00, 3.66, 0.63], undefined, [0, 0.5, 0, 0.8660254]),
    box('fan_blade_2', 'metal', [1.0, 0.035, 0.16], [0.00, 3.66, -0.23], undefined, [0, -0.5, 0, 0.8660254]),
    box('wall_conduit', 'metal', [0.035, 0.035, 3], [-2.52, 3.25, -1.7]),
    box('junction_box', 'metal', [0.10, 0.24, 0.18], [-2.49, 2.85, -0.20])
  )

  return nodes
}

function unitCubeBinary() {
  const faces = [
    [[1,0,0], [[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]],
    [[-1,0,0], [[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]]],
    [[0,1,0], [[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]]],
    [[0,-1,0], [[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]]],
    [[0,0,1], [[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],
    [[0,0,-1], [[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]]
  ]

  const positions = []
  const normals = []
  const indices = []
  let offset = 0

  for (const [normal, vertices] of faces) {
    for (const vertex of vertices) {
      positions.push(...vertex)
      normals.push(...normal)
    }
    indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3)
    offset += 4
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices)
  }
}

function bufferFromTyped(array) {
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength)
}

export function buildAuthoredShopGlb() {
  const geometry = unitCubeBinary()
  const positionBuffer = bufferFromTyped(geometry.positions)
  const normalBuffer = bufferFromTyped(geometry.normals)
  const indexBuffer = bufferFromTyped(geometry.indices)

  const positionOffset = 0
  const normalOffset = pad4(positionOffset + positionBuffer.length)
  const indexOffset = pad4(normalOffset + normalBuffer.length)
  const binaryLength = pad4(indexOffset + indexBuffer.length)
  const binary = Buffer.alloc(binaryLength)

  positionBuffer.copy(binary, positionOffset)
  normalBuffer.copy(binary, normalOffset)
  indexBuffer.copy(binary, indexOffset)

  const materialIndex = new Map(MATERIALS.map(([name], index) => [name, index]))
  const materials = MATERIALS.map(([name, color, metallicFactor, roughnessFactor]) => ({
    name,
    pbrMetallicRoughness: {
      baseColorFactor: color,
      metallicFactor,
      roughnessFactor
    },
    ...(name === 'glass' ? { alphaMode: 'BLEND', doubleSided: true } : {})
  }))

  const meshes = MATERIALS.map(([name], index) => ({
    name: `box_${name}`,
    primitives: [{
      attributes: { POSITION: 0, NORMAL: 1 },
      indices: 2,
      material: index
    }]
  }))

  const nodeSpecs = authoredShopNodes()
  const nodes = nodeSpecs.map((node) => ({
    name: node.name,
    mesh: materialIndex.get(node.material),
    translation: node.translation,
    scale: node.scale,
    ...(node.rotation ? { rotation: node.rotation } : {}),
    ...(node.extras ? { extras: node.extras } : {})
  }))

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Paper Bazaar authored-shop generator v0.9'
    },
    scene: 0,
    scenes: [{ name: 'Iran Paper Authored Store', nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    materials,
    buffers: [{ byteLength: binary.length }],
    bufferViews: [
      { buffer: 0, byteOffset: positionOffset, byteLength: positionBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: normalOffset, byteLength: normalBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: indexOffset, byteLength: indexBuffer.length, target: 34963 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 24, type: 'VEC3', min: [-0.5,-0.5,-0.5], max: [0.5,0.5,0.5] },
      { bufferView: 1, componentType: 5126, count: 24, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: 36, type: 'SCALAR', min: [0], max: [23] }
    ]
  }

  const jsonBuffer = Buffer.from(JSON.stringify(gltf), 'utf8')
  const jsonLength = pad4(jsonBuffer.length)
  const paddedJson = Buffer.alloc(jsonLength, 0x20)
  jsonBuffer.copy(paddedJson)

  const totalLength = 12 + 8 + paddedJson.length + 8 + binary.length
  const output = Buffer.alloc(totalLength)
  output.write('glTF', 0, 4, 'ascii')
  output.writeUInt32LE(2, 4)
  output.writeUInt32LE(totalLength, 8)
  output.writeUInt32LE(paddedJson.length, 12)
  output.writeUInt32LE(0x4E4F534A, 16)
  paddedJson.copy(output, 20)

  const binHeader = 20 + paddedJson.length
  output.writeUInt32LE(binary.length, binHeader)
  output.writeUInt32LE(0x004E4942, binHeader + 4)
  binary.copy(output, binHeader + 8)

  return output
}

export function inspectAuthoredShopGlb(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error('Invalid GLB magic')
  if (buffer.readUInt32LE(4) !== 2) throw new Error('Expected GLB v2')
  if (buffer.readUInt32LE(8) !== buffer.length) throw new Error('GLB length header mismatch')

  const jsonLength = buffer.readUInt32LE(12)
  const jsonType = buffer.readUInt32LE(16)
  if (jsonType !== 0x4E4F534A) throw new Error('Missing GLB JSON chunk')

  return JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength).trim())
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const target = resolve(here, '../public/models/iran-paper-authored-v2.glb')
  await mkdir(dirname(target), { recursive: true })
  const buffer = buildAuthoredShopGlb()
  await writeFile(target, buffer)
  process.stdout.write(`Generated ${target} (${buffer.length} bytes)\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
