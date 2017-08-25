import { assert } from 'chai'

import FtypBox from 'amkit3-modules/utils/v/mp4/ftyp-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/ftyp-box', () => {
  var type = 'ftyp'
  var major_brand = 'avc1'
  var minor_version = 0
  var compatible_brands = ['avc1', 'mp4a']
  var data = new Uint8Array([
    0x61, 0x76, 0x63, 0x31, 0x00, 0x00, 0x00, 0x00,
    0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x61
  ])
  var boxData = new Uint8Array(8 + data.length)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]))
  boxData.set(data, 8)

  it(':constructor', () => {
    assert.throws(() => new FtypBox({ type }))
    assert.throws(() => new FtypBox({ type, major_brand: 1 }))
    assert.throws(() => new FtypBox({ type, major_brand: 'dsadfasfa' }))
    assert.throws(() => new FtypBox({ type, major_brand }))
    assert.throws(() => new FtypBox({ type, major_brand, minor_version: 'fsfsfd' }))
    assert.throws(() => new FtypBox({ type, major_brand, minor_version, compatibal_brands: 1 }))
    assert.throws(() => new FtypBox({ type, major_brand, minor_version, compatibal_brands: ['sfasfa', 1] }))
    assert.doesNotThrow(() => {
      var box = new FtypBox({ type, major_brand, minor_version, compatible_brands })
      assert.equal(box.major_brand, major_brand)
      assert.equal(box.minor_version, minor_version)
      assert.deepEqual(box.compatible_brands, compatible_brands)
    })
  })
  it('getSize', () => {
    var box = new FtypBox({ type, major_brand, minor_version, compatible_brands })
    assert.equal(box.getSize(), 8 + 4 + 4 + compatible_brands.length * 4)
  })
  it('writeData', () => {
    var box = new FtypBox({ type, major_brand, minor_version, compatible_brands })
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new FtypBox({ type, major_brand, minor_version, compatible_brands })
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = FtypBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.major_brand, major_brand)
    assert.equal(box.minor_version, minor_version)
    assert.deepEqual(box.compatible_brands, compatible_brands)
  })
  it(':dataFromStream', () => {
    var box = FtypBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.major_brand, major_brand)
    assert.equal(box.minor_version, minor_version)
    assert.deepEqual(box.compatible_brands, compatible_brands)
  })
})
