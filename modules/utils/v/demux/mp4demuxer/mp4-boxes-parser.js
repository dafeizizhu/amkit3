import { binary, hex } from 'amkit3-modules/utils/dump'
import { uint32, uint16, uint8, int32, int16, int8, str } from 'amkit3-modules/utils/byte-range'

var parse_box = (data, position) => {
  var position = position || 0
  var size = uint32(data, position)
  position += 4
  var type = str(data, position, 4)
  position += 4

  return { size, type, position }
}

var parse_boxes = (data, position) => {
  var boxes = {}
  while (position < data.byteLength) {
    var box = parse_box(data, position)
    var type = box.type
    var size = box.size
    var parseHandler = boxParsers['parse_' + type] ? 
      boxParsers['parse_' + type] : 
      boxParsers.parse_unknow

    if (boxes[type]) {
      boxes[type] = [boxes[type]]
      boxes[type].push(parseHandler(data.subarray(position, position + size)))
    } else {
      boxes[type] = parseHandler(data.subarray(position, position + size))
    }
    position += size
  }
  return boxes
}

var merge_boxes = (box, boxes) => {
  var totalSize = 0
  for (var k in boxes) {
    if (boxes[k].type && boxes[k].size) {
      box[k] = boxes[k]
      totalSize += boxes[k].size
    } else if (boxes[k] instanceof Array) {
      box[k] = boxes[k]
      totalSize += boxes[k].map(b => b.size || 0).reduce((p, c) => p + c)
    }
  }
  return totalSize
}

var parse_container = (data) => {
  var container = parse_box(data)
  var position = container.position
  var boxesSize = merge_boxes(container, parse_boxes(data, position))
  container.position += boxesSize
  return container
}

var parse_fullbox = (data) => {
  var fullbox = parse_box(data)
  var position = fullbox.position

  fullbox.version = uint8(data, position)
  position += 1
  fullbox.flag = new Uint8Array(3)
  fullbox.flag.set(data.subarray(position, position + 3), 0)
  position += 3
  fullbox.position = position
  
  return fullbox
}
  
var parse_sample_entry = (data) => {
  var sampleEntry = parse_box(data)
  var position = sampleEntry.position

  // reserved int(8)[6] 0
  position += 6
  sampleEntry.data_reference_index = uint16(data, position)
  position += 2
  sampleEntry.position = position

  return sampleEntry
}

var parse_visual_sample_entry = (data) => {
  var visualSampleEntry = parse_sample_entry(data)
  var position = visualSampleEntry.position

  // pre_defined uint(16) 0
  position += 2
  // reserved uint(16) 0
  position += 2
  // pre_defined uint(32)[3] 0
  position += 12
  visualSampleEntry.width = int16(data, position)
  position += 2
  visualSampleEntry.height = int16(data, position)
  position += 2
  visualSampleEntry.horizresolution = uint32(data, position)
  position += 4
  visualSampleEntry.vertresolution = uint32(data, position)
  position += 4
  // reserved uint(32) 0
  position += 4
  visualSampleEntry.frame_count = uint16(data, position)
  position += 2
  visualSampleEntry.compressorname = str(data, position, 32)
  position += 32
  visualSampleEntry.depth = uint16(data, position)
  position += 2
  // pre_defined int(16) -1
  position += 2

  if (position < visualSampleEntry.size) {
    //var boxesSize = merge_boxes(visualSampleEntry, parse_boxes(data, position))
    //position += boxesSize

    var boxes = parse_boxes(data, position)
    visualSampleEntry.boxes = Object.keys(boxes).map(k => boxes[k])
    position += visualSampleEntry.boxes.map(b => b.size).reduce((p, c) => p + c, 0)
  }

  visualSampleEntry.position = position
  return visualSampleEntry
}

var parse_audio_sample_entry = (data) => {
  var audioSampleEntry = parse_sample_entry(data)
  var position = audioSampleEntry.position

  // reserved uint(32)[2] 0
  position += 8
  audioSampleEntry.channelcount = uint16(data, position)
  position += 2
  audioSampleEntry.samplesize = uint16(data, position)
  position += 2
  // pre_defined uint(16) 0
  position += 2
  // reserved uint(16) 0
  position += 2
  audioSampleEntry.samplereate = uint32(data, position)
  position += 4

  if (position < audioSampleEntry.size) {
    var boxes = parse_boxes(data, position)
    audioSampleEntry.boxes = Object.keys(boxes).map(k => boxes[k])
    position += audioSampleEntry.boxes.map(b => b.size).reduce((p, c) => p + c, 0)
  }

  audioSampleEntry.position = position
  return audioSampleEntry
}

var parse_unknow = (data) => {
  var box = parse_box(data)
  console.warn(box.type, 'is not implemented, skipped')
  box.data = new Uint8Array(box.size - 8)
  box.data.set(data.subarray(8, data.byteLength), 0)
  box.position = data.byteLength

  return box
}

var parse_ftyp = data => {
  var ftyp = parse_box(data)
  var position = ftyp.position

  ftyp.major_brand = str(data, position, 4)
  ftyp.minor_version = uint32(data, position + 4)
  ftyp.compatible_brands = []

  for (var i = position + 8; i < data.byteLength; i += 4) {
    ftyp.compatible_brands.push(str(data, i, 4))
  }

  ftyp.position = position

  return ftyp
}

var parse_moov = (data) => {
  return parse_container(data)
}

var parse_mvhd = (data) => {
  var mvhd = parse_fullbox(data)
  var position = 12

  if (mvhd.version == 0) {
    mvhd.create_time = uint32(data, position)
    position += 4
    mvhd.modification_time = uint32(data, position)
    position += 4
    mvhd.timescale = uint32(data, position)
    position += 4
    mvhd.duration = uint32(data, position)
    position += 4
  } else {
    throw new Error('version equal to 1 is not implemented')
  }

  mvhd.rate = parseFloat(uint16(data, position) + '.' + uint16(data, position + 2))
  position += 4
  mvhd.volume = parseFloat(uint8(data, position) + '.' + uint8(data, position + 1))
  position += 2
  // reserved bit(16) 0
  position += 2
  // reserved uint(32)[2] 0
  position += 8
  mvhd.matrix = new Uint8Array(36)
  mvhd.matrix.set(data.subarray(position, position + 36), 0)
  position += 36
  // pre_defined bit(32)[6] 0
  position += 24
  mvhd.next_track_ID = uint32(data, position)
  position += 4

  mvhd.position = position
  return mvhd
}

var parse_trak = (data) => {
  return parse_container(data)
}

var parse_tkhd = (data) => {
  var tkhd = parse_fullbox(data)
  var position = tkhd.position

  if (tkhd.version == 0) {
    tkhd.create_time = uint32(data, position)
    position += 4
    tkhd.modification_time = uint32(data, position)
    position += 4
    tkhd.track_ID = uint32(data, position)
    position += 4
    // reserved uint(32) 0
    position += 4
    tkhd.duration = uint32(data, position)
    position += 4
  } else {
    throw new Error('version equal to 1 is not implemented')
  }

  // reserved uint(32)[2] 0
  position += 8
  tkhd.layer = int16(data, position)
  position += 2
  tkhd.alternate_group = int16(data, position)
  position += 2
  tkhd.volume = parseFloat(uint8(data, position) + '.' + uint8(data, position + 1))
  position += 2
  tkhd.matrix = new Uint8Array(36)
  tkhd.matrix.set(data.subarray(position, position + 36), 0)
  position += 36
  tkhd.width = uint32(data, position)
  position += 4
  tkhd.height = uint32(data, position)
  position += 4

  tkhd.position = position
  return tkhd
}

var parse_edts = (data) => {
  return parse_container(data)
}

var parse_elst = (data) => {
  var elst = parse_fullbox(data)
  var position = elst.position

  elst.entry_count = uint32(data, position)
  position += 4

  elst.entries = []
  for (var i = 0; i < elst.entry_count; i++) {
    var segment_duration, media_time

    if (elst.version == 0) {
      segment_duration = uint32(data, position)
      position += 4
      media_time = int32(data, position)
      position += 4
    } else {
      throw new Error('version equal to 1 is not implemented')
    }

    var media_rate_integer = int16(data, position)
    position += 2
    var media_rate_fraction = int16(data, position)
    position += 2

    elst.entries.push({ segment_duration, media_time, media_rate_integer, media_rate_fraction })
  }

  elst.position = position
  return elst
}

var parse_mdia = (data) => {
  return parse_container(data)
}

var parse_mdhd = (data) => {
  var mdhd = parse_fullbox(data)
  var position = mdhd.position

  if (mdhd.version == 0) {
    mdhd.create_time = uint32(data, position)
    position += 4
    mdhd.modification_time = uint32(data, position)
    position += 4
    mdhd.timescale = uint32(data, position)
    position += 4
    mdhd.duration = uint32(data, position)
    position += 4
  } else {
    throw new Error('version equal to 1 is not implemented')
  }

  // pad bit(1) 0
  // language int(5)[3] 0x55, 0xc4
  // pre_defined uint(16) 0
  position += 4

  mdhd.position = position
  return mdhd
}

var parse_hdlr = (data) => {
  var hdlr = parse_fullbox(data)
  var position = hdlr.position

  // pre_defined uint(32) 0
  position += 4
  hdlr.handler_type = str(data, position, 4)
  position += 4
  // reserved uint(32)[3] 0
  position += 12
  hdlr.name = str(data, position, data.byteLength - position)
  position += hdlr.name.length

  hdlr.position = position
  return hdlr
}

var parse_minf = (data) => {
  return parse_container(data)
}

var parse_stbl = (data) => {
  return parse_container(data)
}

var parse_stsd = (data) => {
  var stsd = parse_fullbox(data)
  var position = stsd.position

  stsd.entry_count = uint32(data, position)
  position += 4

  stsd.entries = []

  for (var i = 0; i < stsd.entry_count; i++) {
    var box = parse_box(data, position)
    var type = box.type.trim()
    var size = box.size
    var parseHandler = boxParsers['parse_' + type] ? 
      boxParsers['parse_' + type] : 
      parse_unknow
    stsd.entries.push(parseHandler(data.subarray(position, position + size)))
    position += box.size
  }

  stsd.position = position
  return stsd
}

var parse_avc1 = (data) => {
  var avc1 = parse_visual_sample_entry(data)
  return avc1
}

var parse_avcC = (data) => {
  console.log(hex(data, ','))
  var avcC = parse_box(data)
  var position = avcC.position

  avcC.configurationVersion = uint8(data, position)
  position += 1
  avcC.AVCProfileIndication = uint8(data, position)
  position += 1
  avcC.profile_compatibility = uint8(data, position)
  position += 1
  avcC.AVCLevelIndication = uint8(data, position)
  position += 1
  avcC.lengthSizeMinusOne = (0x03 & uint8(data, position))
  position += 1
  avcC.numOfSequenceParameterSets = (0x1f & uint8(data, position))
  position += 1
  avcC.sequenceParameterSets = []
  for (var i = 0; i < avcC.numOfSequenceParameterSets; i++) {
    var sps = {}
    sps.sequenceParameterSetLength = uint16(data, position)
    position += 2
    sps.sequenceParameterSetNALUnit = new Uint8Array(sps.sequenceParameterSetLength)
    sps.sequenceParameterSetNALUnit.set(data.subarray(position, position + sps.sequenceParameterSetLength), 0)
    avcC.sequenceParameterSets.push(sps)
    position += sps.sequenceParameterSetLength
  }
  avcC.numOfPictureParameterSets = uint8(data, position)
  position += 1
  avcC.pictureParameterSets = []
  for (var i = 0; i < avcC.numOfPictureParameterSets; i++) {
    var pps = {}
    pps.pictureParameterSetLength = uint16(data, position)
    position += 2
    pps.pictureParameterSetNALUnit = new Uint8Array(pps.pictureParameterSetLength)
    pps.pictureParameterSetNALUnit.set(data.subarray(position, position + pps.pictureParameterSetLength), 0)
    avcC.pictureParameterSets.push(pps)
    position += pps.pictureParameterSetLength
  }

  // TODO avcC.AVCProfileIndication == 100 || 110 || 122 || 144 ...

  avcC.position = position
  console.log(avcC)
  return avcC
}

var parse_vmhd = (data) => {
  var vmhd = parse_fullbox(data)
  var position = vmhd.position

  vmhd.graphicsmode = uint16(data, position)
  position += 2
  vmhd.opcolor = []
  for (var i = 0; i < 3; i++) {
    vmhd.opcolor.push(uint16(data, position))
    position += 2
  }

  vmhd.position = position
  return vmhd
}

var parse_dinf = (data) => {
  return parse_container(data)
}

var parse_dref = (data) => {
  var dref = parse_fullbox(data)
  var position = dref.position

  dref.entry_count = uint32(data, position)
  position += 4

  dref.entries = []
  for (var i = 0; i < dref.entry_count; i++) {
    var box = parse_box(data, position)
    // TODO type has a blank in tail
    var type = box.type.trim()
    var size = box.size
    var parseHandler = boxParsers['parse_' + type] ? 
      boxParsers['parse_' + type] : 
      boxParsers.parse_unknow
    dref.entries.push(parseHandler(data.subarray(position, position + size)))
    position += size 
  }

  dref.position = position
  return dref
}

var parse_url = (data) => {
  var url = parse_fullbox(data)

  url.location = str(data, url.position, data.byteLength - url.position)
  url.position += data.byteLength - url.position

  return url
}

var parse_stts = (data) => {
  var stts = parse_fullbox(data)
  var position = stts.position
  stts.entry_count = uint32(data, position)
  position += 4
  stts.entries = []
  for (var i = 0; i < stts.entry_count; i++) {
    var entry = {}
    entry.sample_count = uint32(data, position)
    position += 4
    entry.sample_delta = uint32(data, position)
    position += 4
    stts.entries.push(entry)
  }
  stts.position = position
  return stts
}

var parse_stss = (data) => {
  var stss = parse_fullbox(data)
  var position = stss.position
  stss.entry_count = uint32(data, position)
  position += 4
  stss.entries = []
  for (var i = 0; i < stss.entry_count; i++) {
    var entry = {}
    entry.sample_number = uint32(data, position)
    position += 4
    stss.entries.push(entry)
  }
  stss.position = position
  return stss
}

var parse_ctts = (data) => {
  var ctts = parse_fullbox(data)
  var position = ctts.position
  ctts.entry_count = uint32(data, position)
  position += 4
  if (ctts.version == 0) {
    ctts.entries = []
    for (var i = 0; i < ctts.entry_count; i++) {
      var entry = {}
      entry.sample_count = uint32(data, position)
      position += 4
      entry.sample_offset = uint32(data, position)
      position += 4
      ctts.entries.push(entry)
    }
  } else {
    throw new Error('version equal to 1 is not implemented')
  }
  ctts.position = position
  return ctts
}

var parse_stsc = (data) => {
  var stsc = parse_fullbox(data)
  var position = stsc.position
  stsc.entry_count = uint32(data, position)
  position += 4
  stsc.entries = []
  for (var i = 0; i < stsc.entry_count; i++) {
    var entry = {}
    entry.first_chunk = uint32(data, position)
    position += 4
    entry.samples_per_chunk = uint32(data, position)
    position += 4
    entry.sample_description_index = uint32(data, position)
    position += 4
    stsc.entries.push(entry)
  }
  stsc.position = position
  return stsc
}

var parse_stsz = (data) => {
  var stsz = parse_fullbox(data)
  var position = stsz.position
  stsz.sample_size = uint32(data, position)
  position += 4
  stsz.sample_count = uint32(data, position)
  position += 4
  if (stsz.sample_size == 0) {
    stsz.samples = []
    for (var i = 0; i < stsz.sample_count; i++) {
      var sample = {}
      sample.entry_size = uint32(data, position)
      position += 4
      stsz.samples.push(sample)
    }
  }
  stsz.position = position
  return stsz
}

var parse_stco = (data) => {
  var stco = parse_fullbox(data)
  var position = stco.position
  stco.entry_count = uint32(data, position)
  position += 4
  stco.entries = []
  for (var i = 0; i < stco.entry_count; i++) {
    var entry = {}
    entry.chunk_offset = uint32(data, position)
    position += 4
    stco.entries.push(entry)
  }
  stco.position = position
  return stco
}

var parse_smhd = (data) => {
  var smhd = parse_fullbox(data)
  var position = smhd.position
  smhd.balance = parseFloat(uint8(data, position) + '.' + uint8(data, position + 1))
  position += 2
  // reserved uint(16) 0
  position += 2

  smhd.position = position
  return smhd
}

var parse_mp4a = (data) => {
  return parse_audio_sample_entry(data)
}

const ES_DescriptorTag = 0x03
const DecoderConfigDescriptorTag = 0x04
const DescriptorSpecificInfoTag = 0x05
const SLConfigDescriptorTag = 0x06

var esds_descriptor_parser = (data, tag) => {
  var descriptor = {}
  descriptor.tag = tag
  descriptor.data = new Uint8Array(data.byteLength)
  descriptor.data.set(data, 0)
  return descriptor
}

var esds_descriptor_parsers = {}
esds_descriptor_parsers.Descriptor = esds_descriptor_parser
esds_descriptor_parsers[ES_DescriptorTag] = (data, tag) => {
  var position = 0
  var ES_ID = uint16(data, position)
  position += 2
  var flags = uint8(data, position)
  position += 1
  var dependsOn_ES_ID = 0
  var url = null
  var ocr_ES_ID = 0
  if (flags & 0x80) throw new Error('not implemented')
  if (flags & 0x40) throw new Error('not implemented')
  if (flags & 0x20) throw new Error('not implemented')
  var descriptors = parse_esds_descriptors(data.subarray(position, data.byteLength))
  position = data.byteLength

  return { tag, ES_ID, flags, dependsOn_ES_ID, url, ocr_ES_ID, descriptors, position, size: data.byteLength }
}
esds_descriptor_parsers[DecoderConfigDescriptorTag] = (data, tag) => {
  var position = 0
  var oti = uint8(data, position)
  position += 1
  var stream_type = uint8(data, position)
  position += 1
  var buffer_size = (uint8(data, position) << 8) + uint16(data, position + 1)
  position += 3
  var max_bitrate = uint32(data, position)
  position += 4
  var avg_bitrate = uint32(data, position)
  position += 4
  var descriptors = parse_esds_descriptors(data.subarray(position, data.byteLength))
  position = data.byteLength

  return { tag, oti, stream_type, buffer_size, max_bitrate, avg_bitrate, descriptors, position, size: data.byteLength }
}
esds_descriptor_parsers[DescriptorSpecificInfoTag] = esds_descriptor_parser
esds_descriptor_parsers[SLConfigDescriptorTag] = esds_descriptor_parser

var parse_esds_descriptors = data => {
  var position = 0
  var descriptors = []

  while (position < data.byteLength) {
    var tag = uint8(data, position)
    position += 1
    var byteRead = uint8(data, position)
    position += 1
    var size = 0
    while (byteRead & 0x80) {
      size = (byteRead & 0x7f) << 7
      byteRead = uint8(data, position)
      position += 1
    }
    size += byteRead & 0x7f
    var descriptor
    if (esds_descriptor_parsers[tag]) {
      descriptor = esds_descriptor_parsers[tag](data.subarray(position, position + size), tag)
    } else {
      descriptor = esds_descriptor_parsers.Descriptor(data.subarray(position, position + size), tag)
    }
    descriptors.push(descriptor)

    position += size
  }
  return descriptors
}

var parse_esds = data => {
  var esds = parse_fullbox(data)
  var position = esds.position

  esds.descriptors = parse_esds_descriptors(data.subarray(position, data.byteLength))
  esds.position = data.byteLength

  return esds
}

var boxParsers = {
  parse_unknow,
  parse_ftyp,
  parse_moov,
  parse_mvhd,
  parse_trak,
  parse_tkhd,
  parse_edts,
  parse_mdia,
  parse_elst,
  parse_mdhd,
  parse_hdlr,
  parse_minf,
  parse_vmhd,
  parse_dinf,
  parse_stbl,
  parse_smhd,
  parse_dref,
  parse_stsd,
  parse_stts,
  parse_stss,
  parse_ctts,
  parse_stsc,
  parse_stco,
  parse_stsz,
  parse_url,
  parse_avc1,
  parse_mp4a,
  parse_avcC,
  parse_esds
}

module.exports = boxParsers
