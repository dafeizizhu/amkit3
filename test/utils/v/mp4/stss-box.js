import { assert } from 'chai'

import StssBox from 'amkit3-modules/utils/v/mp4/stss-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/stss-box', () => {
  var type = 'stss'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var entries = [
    { sample_number: 1 },
    { sample_number: 91 },
    { sample_number: 181 },
    { sample_number: 271 },
    { sample_number: 361 },
    { sample_number: 451 },
    { sample_number: 541 },
    { sample_number: 631 },
    { sample_number: 721 }
  ]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x5b,
    0x00, 0x00, 0x00, 0xb5, 0x00, 0x00, 0x01, 0x0f,
    0x00, 0x00, 0x01, 0x69, 0x00, 0x00, 0x01, 0xc3,
    0x00, 0x00, 0x02, 0x1d, 0x00, 0x00, 0x02, 0x77,
    0x00, 0x00, 0x02, 0xd1
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x34, 0x73, 0x74, 0x73, 0x73]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':constructor', () => {
    assert.throws(() => new SttsBox({ type, version, flags }))
    assert.throws(() => new SttsBox({ type, version, flags, entries: 'str' }))
    assert.throws(() => new SttsBox({ type, version, flags, entries: [1, 2, 3] }))
    assert.throws(() => new SttsBox({ type, version, flags, entries: [{
      sample_number: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new StssBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new StssBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new StssBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new StssBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = StssBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = StssBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
})
