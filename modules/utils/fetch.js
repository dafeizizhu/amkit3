if (process.env.TEST) {
  var DataStream = require('amkit3-modules/utils/data-stream')['default']

  exports.range = (u, range, cb) => {
    var http = require('http')
    var url = require('url')
    var ret = url.parse(u)
    var req = http.request({
      protocol: ret.protocol,
      hostname: ret.hostname,
      port: ret.port,
      path: ret.path,
      headers: {
        'Range': 'bytes=' + range[0] + '-' + range[1]
      }
    }, res => {
      var dataStream = new DataStream()
      res.on('data', chunk => {
        dataStream.writeUint8Array(Uint8Array.from(chunk))
      })
      res.on('end', () => {
        dataStream.seek(0)
        cb(null, dataStream.readUint8Array(dataStream.getByteLength()))
      })
    })
    req.end()
  }
} else {
  exports.range = (url, range, cb) => {
    try {
      var req = new XMLHttpRequest()
      req.open('GET', url, true)
      req.responseType = 'arraybuffer'
      req.setRequestHeader('Range', 'bytes=' + range[0] + '-' + range[1])
      req.onload = evt => {
        var arrayBuffer = req.response
        if (arrayBuffer) {
          var byteArray = new Uint8Array(arrayBuffer)
          cb(null, byteArray)
        } else {
          cb(new Error('no response'))
        }
      }
      req.send(null)
    } catch (err) {
      cb(err)
    }
  }
}
