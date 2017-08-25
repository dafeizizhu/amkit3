import assert from 'assert'

class Box {
  constructor(o) {
    assert(o)
    assert(typeof o.type == 'string')
    assert(o.type.length == 4)

    this.type = o.type
  }
  writeHead(stream) {
    stream.writeUint32(this.getSize())
    stream.writeString(this.type)
  }
  getSize() {
    throw new Error('not implemented')
  }
  writeData(stream) {
    throw new Error('not implemented')
  }
  write(stream) {
    this.writeHead(stream)
    this.writeData(stream)
  }
}

Box.fromStream = stream => {
  var size = stream.readUint32()
  var type = stream.readString(4)
  return { size, type }
}

export default Box
