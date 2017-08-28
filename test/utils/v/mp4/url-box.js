import { assert } from 'chai'

import UrlBox from 'amkit3-modules/utils/v/mp4/url-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/url-box', () => {
  var type = 'url '
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x01])
  var location = ''
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x01
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x0c, 0x75, 0x72, 0x6c, 0x20]))
  boxData.set(data, 8)
  var o = { type, version, flags, location }

  it(':constructor', () => {
    assert.doesNotThrow(() => {
      var box = new UrlBox(o)
      assert.equal(box.location, location)
    })
  })
  it('getSize', () => {
    var box = new UrlBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new UrlBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new UrlBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = UrlBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.location, location)
  })
  it(':dataFromStream', () => {
    var box = UrlBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.location, location)
  })
})
