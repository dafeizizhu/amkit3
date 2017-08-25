exports.join = (...args) => {
  var size = args.map(a => a.byteLength || 0).reduce((p, c) => p + c, 0)
  var buf = new ArrayBuffer(size)
  var uint8Array = new Uint8Array(buf)
  var pos = 0
  args.forEach(a => {
    if (!a.byteLength) return
    uint8Array.set(a, pos)
    pos += a.byteLength
  })
  return uint8Array
}

exports.ascii_string = (str, length) => {
  var length = isNaN(length) ? str.length : length
  var buf = new ArrayBuffer(length)
  var d = new DataView(buf)
  for (var i = 0; i < length; i++) {
    d.setUint8(i, str.charCodeAt(i) % 256)
  }
  return new Uint8Array(buf)
}

exports.uint32 = number => {
  var buf = new ArrayBuffer(4)
  var d = new DataView(buf)
  d.setUint32(0, number)
  return new Uint8Array(buf)
}

exports.int16 = number => {
  var buf = new ArrayBuffer(2)
  var d = new DataView(buf)
  d.setInt16(0, number)
  return new Uint8Array(buf)
}

exports.int32 = number => {
  var buf = new ArrayBuffer(4)
  var d = new DataView(buf)
  d.setInt32(0, number)
  return new Uint8Array(buf)
}

exports.uint16 = number => {
  var buf = new ArrayBuffer(2)
  var d = new DataView(buf)
  d.setUint16(0, number)
  return new Uint8Array(buf)
}

exports.uint8 = number => {
  var buf = new ArrayBuffer(1)
  var d = new DataView(buf)
  d.setUint8(0, number)
  return new Uint8Array(buf)
}
