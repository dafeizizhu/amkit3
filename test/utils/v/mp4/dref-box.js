import { assert } from 'chai'

import Box from 'amkit3-modules/utils/v/mp4/box'
import DrefBox from 'amkit3-modules/utils/v/mp4/dref-box'
import DataBox from 'amkit3-modules/utils/v/mp4/data-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/dref-box', () => {
  var type = 'dref'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var location = ''
  var entries = [new DataBox({ type: 'url1', data: new Uint8Array([0x00, 0x00, 0x00, 0x01]) })]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x0c, 0x75, 0x72, 0x6c, 0x31,
    0x00, 0x00, 0x00, 0x01
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x1c, 0x64, 0x72, 0x65, 0x66]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':constructor', () => {
    assert.throws(() => new DrefBox({ type }))
    assert.throws(() => new DrefBox({ type, entries: 'str' }))
    assert.throws(() => new DrefBox({ type, entries: [1, 2, 3] }))
    assert.doesNotThrow(() => {
      var box = new DrefBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new DrefBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new DrefBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new DrefBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = DrefBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = DrefBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
})
