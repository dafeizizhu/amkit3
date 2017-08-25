import assert from 'assert'

import Box from './box'

class FtypBox extends Box {
  constructor(o) {
    super(o)

    assert(o.major_brand)
    assert(typeof o.major_brand == 'string')
    assert(o.major_brand.length == 4)
    assert(!isNaN(o.minor_version))
    assert(o.compatible_brands)
    assert(o.compatible_brands instanceof Array)
    o.compatible_brands.forEach(b => {
      assert(typeof b == 'string')
      assert(b.length == 4)
    })

    this.major_brand = o.major_brand
    this.minor_version = o.minor_version
    this.compatible_brands = o.compatible_brands
  }
  getSize() {
    return 8 + 4 + 4 + this.compatible_brands.length * 4
  }
  writeData(stream) {
    stream.writeString(this.major_brand)
    stream.writeUint32(this.minor_version)
    this.compatible_brands.forEach(b => stream.writeString(b))
  }
}

FtypBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return FtypBox.dataFromStream(box.type, box.size, stream)
}

FtypBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var major_brand = stream.readString(4)
  var minor_version = stream.readUint32()
  var compatible_brands = []
  while (stream.getPosition() < lastPosition) {
    compatible_brands.push(stream.readString(4))
  }
  return new FtypBox({ type, major_brand, minor_version, compatible_brands })
}

export default FtypBox
