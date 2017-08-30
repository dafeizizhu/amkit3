import { assert } from 'chai'

import StcoBox from 'amkit3-modules/utils/v/mp4/stco-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/stco-box', () => {
  var type = 'stco'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var entries = [
    { chunk_offset: 31120 },
    { chunk_offset: 87066 },
    { chunk_offset: 88236 },
    { chunk_offset: 88648 },
    { chunk_offset: 89526 },
    { chunk_offset: 95243 },
    { chunk_offset: 96195 },
    { chunk_offset: 97216 },
    { chunk_offset: 103448 },
    { chunk_offset: 104711 }
  ]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a,
    0x00, 0x00, 0x79, 0x90, 0x00, 0x01, 0x54, 0x1a,
    0x00, 0x01, 0x58, 0xac, 0x00, 0x01, 0x5a, 0x48,
    0x00, 0x01, 0x5d, 0xb6, 0x00, 0x01, 0x74, 0x0b,
    0x00, 0x01, 0x77, 0xc3, 0x00, 0x01, 0x7b, 0xc0,
    0x00, 0x01, 0x94, 0x18, 0x00, 0x01, 0x99, 0x07
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x38, 0x73, 0x74, 0x63, 0x6f]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':constructor', () => {
    assert.throws(() => new StcoBox({ type, version, flags }))
    assert.throws(() => new StcoBox({ type, version, flags, entries: 'str' }))
    assert.throws(() => new StcoBox({ type, version, flags, entries: [1, 2, 3] }))
    assert.throws(() => new StcoBox({ type, version, flags, entries: [{
      chunk_offset: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new StcoBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new StcoBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new StcoBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new StcoBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = StcoBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = StcoBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
})
