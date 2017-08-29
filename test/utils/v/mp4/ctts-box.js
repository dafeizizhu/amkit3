import { assert } from 'chai'

import CttsBox from 'amkit3-modules/utils/v/mp4/ctts-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/ctts-box', () => {
  var type = 'ctts'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var entries = [
    { sample_count: 1, sample_offset: 1024 },
    { sample_count: 1, sample_offset: 2560 },
    { sample_count: 1, sample_offset: 1024 },
    { sample_count: 1, sample_offset: 0 },
    { sample_count: 1, sample_offset: 512 },
    { sample_count: 1, sample_offset: 2048 },
    { sample_count: 1, sample_offset: 1024 }
  ]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x04, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x0a, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x04, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x02, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x08, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x04, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x48, 0x63, 0x74, 0x74, 0x73]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':contructor', () => {
    assert.throws(() => new CttsBox({ type, version, flags }))
    assert.throws(() => new CttsBox({ type, version, flags, entries: 'str' }))
    assert.throws(() => new CttsBox({ type, version, flags, entries: [1, 2, 3] }))
    assert.throws(() => new CttsBox({ type, version, flags, entries: [{
      sample_count: 'str'
    }]}))
    assert.throws(() => new CttsBox({ type, version, flags, entries: [{
      sample_count: 1,
      sample_offset: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new CttsBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new CttsBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new CttsBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new CttsBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = CttsBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = CttsBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
})
