import assert from 'assert'

import Box from './box'
import Boxes from './boxes'

class ContainerBox extends Box {
  constructor(o) {
    super(o)

    assert(o.boxes)
    assert(o.boxes instanceof Array)
    o.boxes.forEach(b => assert(b instanceof Box))
    
    this.boxes = o.boxes
  }
  getSize() {
    return 8 + this.boxes.map(box => box.getSize()).reduce((p, c) => p + c, 0)
  }
  writeData(stream) {
    this.boxes.forEach(b => b.write(stream))
  }
}

ContainerBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return ContainerBox.dataFromStream(box.type, box.size, stream)
}

ContainerBox.dataFromStream = (t, s, stream) => {
  var boxes = []
  var readed = 0

  while (readed < s - 8) {
    var { type, size } = Box.fromStream(stream)
    if (Boxes[type]) {
      boxes.push(Boxes[type].dataFromStream(type, size, stream))
    } else {
      console.warn('box', type, 'parsed to data box')
      boxes.push(Boxes.data.dataFromStream(type, size, stream))
    }
    readed += size
  }

  return new ContainerBox({ type: t, boxes })
}

export default ContainerBox
