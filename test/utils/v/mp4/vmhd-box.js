import { assert } from 'chai'

import VmhdBox from 'amkit3-modules/utils/v/mp4/vmhd-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/vmhd-box', () => {
  var type = 'vmhd'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x01])
  var graphicsmode = 0
  var opcolor = [0, 0, 0]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x14, 0x76, 0x6d, 0x68, 0x64]))
  boxData.set(data, 8)
  var o = { type, version, flags, graphicsmode, opcolor }

  it(':constructor', () => {
    assert.throws(() => new VmhdBox({ type }))
    assert.throws(() => new VmhdBox({ type, graphicsmode: 'str' }))
    assert.throws(() => new VmhdBox({ type, graphicsmode, opcolor: 'str' }))
    assert.throws(() => new VmhdBox({ type, graphicsmode, opcolor: [] }))
    assert.throws(() => new VmhdBox({ type, graphicsmode, opcolor: ['str', 'str', 'str'] }))
    assert.doesNotThrow(() => {
      var box = new VmhdBox(o)
      assert.equal(box.graphicsmode, graphicsmode)
      assert.deepEqual(box.opcolor, opcolor)
    })
  })
  it('getSize', () => {
    var box = new VmhdBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new VmhdBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new VmhdBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = VmhdBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.graphicsmode, graphicsmode)
    assert.deepEqual(box.opcolor, opcolor)
  })
  it(':dataFromStream', () => {
    var box = VmhdBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.graphicsmode, graphicsmode)
    assert.deepEqual(box.opcolor, opcolor)
  })
})
  
