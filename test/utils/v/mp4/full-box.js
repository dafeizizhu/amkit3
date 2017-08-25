import { assert } from 'chai'

import FullBox from 'amkit3-modules/utils/v/mp4/full-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/full-box', () => {
  var type = 'ftyp'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var data = new Uint8Array(4)
  data.set(new Uint8Array([version]))
  data.set(flags, 1)
  var boxData = new Uint8Array(12)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x0c]))
  boxData.set(new Uint8Array(type.split('').map(s => s.charCodeAt(0))), 4)
  boxData.set(data, 8)

  it(':constructor', () => {
    assert.throws(() => new FullBox({ type }))
    assert.throws(() => new FullBox({ type, version: 1 }))
    assert.throws(() => new FullBox({ type, flags: 1 }))
    assert.throws(() => new FullBox({ type, flags: new Uint8Array([0x01, 0x02]) }))
    assert.doesNotThrow(() => {
      var box = new FullBox({ type, version, flags })
      assert.equal(box.version, version)
      assert.deepEqual(box.flags, flags)
    })
  })
  it('getSize', () => {
    var box = new FullBox({ type, version, flags })
    assert.equal(box.getSize(), 12)
  })
  it('writeData', () => {
    var box = new FullBox({ type, version, flags })
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new FullBox({ type, version, flags })
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var fullBox = FullBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(fullBox.type, type)
    assert.equal(fullBox.version, version)
    assert.deepEqual(fullBox.flags, flags)
  })
  it(':dataFromStream', () => {
    var fullBox = FullBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(fullBox.type, type)
    assert.equal(fullBox.version, version)
    assert.deepEqual(fullBox.flags, flags)
  })
})
