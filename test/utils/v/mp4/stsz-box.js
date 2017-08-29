import { assert } from 'chai'
import { hex } from 'amkit3-modules/utils/dump'

import StszBox from 'amkit3-modules/utils/v/mp4/stsz-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/stsz-box', () => {
  var type = 'stsz'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var sample_size = 0
  var entries = [
    { sample_size: 51026 },
    { sample_size: 4735 },
    { sample_size: 766 },
    { sample_size: 171 },
    { sample_size: 397 },
    { sample_size: 5262 },
    { sample_size: 513 },
    { sample_size: 555 },
    { sample_size: 5994 },
    { sample_size: 835 },
    { sample_size: 525 }
  ]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x0b, 0x00, 0x00, 0xc7, 0x52, 
    0x00, 0x00, 0x12, 0x7f, 0x00, 0x00, 0x02, 0xfe, 
    0x00, 0x00, 0x00, 0xab, 0x00, 0x00, 0x01, 0x8d, 
    0x00, 0x00, 0x14, 0x8e, 0x00, 0x00, 0x02, 0x01, 
    0x00, 0x00, 0x02, 0x2b, 0x00, 0x00, 0x17, 0x6a, 
    0x00, 0x00, 0x03, 0x43, 0x00, 0x00, 0x02, 0x0d 
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x40, 0x73, 0x74, 0x73, 0x7a]))
  boxData.set(data, 8)
  var o = { type, version, flags, sample_size, entries }

  it(':constructor', () => {
    assert.throws(() => new StszBox({ type, version, flags }))
    assert.throws(() => new StszBox({ type, version, flags, sample_size: 'str' }))
    assert.throws(() => new StszBox({ type, version, flags, sample_size, entries: 'str' }))
    assert.throws(() => new StszBox({ type, version, flags, sample_size, entries: [1, 2, 3] }))
    assert.throws(() => new StszBox({ type, version, flags, sample_size, entries: [{
      sample_size: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new StszBox(o)
      assert.equal(box.sample_size, sample_size)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new StszBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new StszBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new StszBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = StszBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.sample_size, sample_size)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = StszBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.sample_size, sample_size)
    assert.deepEqual(box.entries, entries)
  })
})
