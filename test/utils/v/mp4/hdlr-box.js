import { assert } from 'chai'

import HdlrBox from 'amkit3-modules/utils/v/mp4/hdlr-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/hdlr-box', () => {
  var type = 'hdlr'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var handler_type = 'vide'
  var name = 'VideoHandler\u0000'
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x76, 0x69, 0x64, 0x65, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x56, 0x69, 0x64, 0x65, 0x6f, 0x48, 0x61, 0x6e,
    0x64, 0x6c, 0x65, 0x72, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x2d, 0x68, 0x64, 0x6c, 0x72]))
  boxData.set(data, 8)
  var o = { type, version, flags, handler_type, name }

  it(':constructor', () => {
    assert.throws(() => new HdlrBox({ type }))
    assert.throws(() => new HdlrBox({ type, handler_type: 1 }))
    assert.throws(() => new HdlrBox({ type, handler_type: 'str' }))
    assert.throws(() => new HdlrBox({ type, handler_type, name: 1 }))
    assert.doesNotThrow(() => {
      var box = new HdlrBox(o)
      assert.equal(box.handler_type, handler_type)
      assert.equal(box.name, name)
    })
  })
  it('getSize', () => {
    var box = new HdlrBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new HdlrBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new HdlrBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = HdlrBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.handler_type, handler_type)
    assert.equal(box.name, name)
  })
  it(':dataFromStream', () => {
    var box = HdlrBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.handler_type, handler_type)
    assert.equal(box.name, name)
  })
})
