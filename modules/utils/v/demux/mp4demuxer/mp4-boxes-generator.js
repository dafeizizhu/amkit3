import { join, ascii_string, uint32, int16, int32, uint16, uint8 } from 'amkit3-modules/utils/to-uint8-array'
import { hex } from 'amkit3-modules/utils/dump'

var unknow = o => {
  console.warn('generate unknow box type', o.type)
  if (o.data) {
    return join(uint32(8 + o.data.byteLength), ascii_string(o.type, 4), o.data)
  } else {
    return join(uint32(8), ascii_string(o.type, 4))
  }
}

var box = (...args) => {
  var size = 8 + args.slice(1).map(a => a.byteLength || 0).reduce((p, c) => p + c, 0)
  return join(uint32(size), ascii_string(args[0], 4), join.apply(null, args.slice(1)))
}

var fullbox = (...args) => {
  if (args.length < 3) throw new Error('fullbox need type, version and flag')
  
  var type = args[0]
  var version = args[1]
  var flags = args[2]

  if (flags.length != 3) throw new Error('flags must be an array contains 3 number')
  if (version != 0) throw new Error('version equal to 1 is not implemented')

  return box.call(null, type, 
    new Uint8Array([version, flags[0], flags[1], flags[2]]),
    join.apply(null, args.slice(3)))
}

var ftyp = obj => {
  var major_brand = ascii_string(obj.major_brand)
  var minor_version = uint32(obj.minor_version)
  var compatible_brands = join.apply(null, obj.compatible_brands.map(b => ascii_string(b)))
  var ret =  box('ftyp', major_brand, minor_version, compatible_brands)


  return ret
}

var mvhd = o => {
  var { version, flag, create_time, modification_time, timescale, duration, matrix, next_track_ID } = o
  var ret = fullbox('mvhd', version, flag,
    uint32(create_time),
    uint32(modification_time),
    uint32(timescale),
    uint32(duration),
    new Uint8Array([0x00, 0x01, 0x00, 0x00]),
    new Uint8Array([0x01, 0x00]),
    new Uint8Array([0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    matrix,
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    uint32(next_track_ID)
  )

  return ret
}

var tkhd = o => {
  var { version, flag, create_time, modification_time, track_ID, duration, layer, alternate_group, volume, matrix, width, height } = o
  var ret = fullbox('tkhd', version, flag,
    uint32(create_time),
    uint32(modification_time),
    uint32(track_ID),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    uint32(duration),
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    int16(layer),
    int16(alternate_group),
    volume ? new Uint8Array([0x01, 0x00]) : new Uint8Array([0x00, 0x00]),
    matrix,
    uint32(width),
    uint32(height),
    // TODO
    new Uint8Array([0x00, 0x00])
  )

  return ret
}

var elst = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('elst', version, flag,
    uint32(entry_count),
    join.apply(null, entries.map(entry => {
      var { segment_duration, media_time, media_rate_integer, media_rate_fraction } = entry
      return join(
        uint32(segment_duration),
        int32(media_time),
        int16(media_rate_integer),
        int16(media_rate_fraction)
      )
    }))
  )

  return ret
}

var mdhd = o => {
  var { version, flag, create_time, modification_time, timescale, duration } = o
  var ret = fullbox('mdhd', version, flag,
    uint32(create_time),
    uint32(modification_time),
    uint32(timescale),
    uint32(duration),
    new Uint8Array([0x55, 0xc4, 0x00, 0x00])
  )

  return ret
}

var hdlr = o => {
  var { version, flag, handler_type, name } = o
  var ret = fullbox('hdlr', version, flag,
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    ascii_string(handler_type),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    ascii_string(name)
  )

  return ret
}

var vmhd = o => {
  var { version, flag, graphicsmode, opcolor } = o
  var ret = fullbox('vmhd', version, flag,
    uint16(graphicsmode),
    uint16(opcolor[0]),
    uint16(opcolor[1]),
    uint16(opcolor[2])
  )

  return ret
}

var joinEntries = entries => {
  return join.apply(null, entries.map(entry => {
    var handler = generators[entry.type.trim()] ? generators[entry.type.trim()] : unknow
    return handler(entry)
  }))
}

var dref = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('dref', version, flag, uint32(entry_count), joinEntries(entries))

  return ret
}

var url = o => {
  var { version, flag, location } = o
  var ret = fullbox('url ', version, flag, ascii_string(location))
  
  return ret
}

var stsd = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('stsd', version, flag, uint32(entry_count), joinEntries(entries))

  return ret
}

var sample_entry = (...args) => {
  if (args.length < 2) throw new Error('sample entry need type and data_reference_index')
  
  var type = args[0]
  var data_reference_index = args[1]

  return box.call(null, type, 
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    uint16(data_reference_index),
    join.apply(null, args.slice(2)))
}

var visual_sample_entry = o => {
  var { type, data_reference_index, width, height, horizresolution, vertresolution, frame_count, compressorname, depth, boxes } = o
  var ret = sample_entry(type, data_reference_index, 
    new Uint8Array([0x00, 0x00]),
    new Uint8Array([0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    int16(width),
    int16(height),
    uint32(horizresolution),
    uint32(vertresolution),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    uint16(frame_count),
    ascii_string(compressorname, 32),
    uint16(depth),
    int16(-1),
    joinEntries(boxes)
  )
  return ret
}

var avc1 = o => {
  var ret = visual_sample_entry(o)

  return ret
}

var avcC = o => {
  var { configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, numOfSequenceParameterSets, sequenceParameterSets, numOfPictureParameterSets, pictureParameterSets } = o
  var ret = box('avcC',
    uint8(configurationVersion),
    uint8(AVCProfileIndication),
    uint8(profile_compatibility),
    uint8(AVCLevelIndication),
    uint8(0xfc | lengthSizeMinusOne),
    uint8(0xe0 | numOfSequenceParameterSets),
    join.apply(null, sequenceParameterSets.map(s => {
      var { sequenceParameterSetLength, sequenceParameterSetNALUnit } = s
      return join(uint16(sequenceParameterSetLength), sequenceParameterSetNALUnit)
    })),
    uint8(numOfPictureParameterSets),
    join.apply(null, pictureParameterSets.map(s => {
      var { pictureParameterSetLength, pictureParameterSetNALUnit } = s
      return join(uint16(pictureParameterSetLength), pictureParameterSetNALUnit)
    }))
  )
  
  return ret
}

var stts = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('stts', version, flag,
    uint32(entry_count),
    join.apply(null, entries.map(entry => {
      var { sample_count, sample_delta } = entry
      return join(uint32(sample_count), uint32(sample_delta))
    }))
  )

  return ret
}

var ctts = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('ctts', version, flag,
    uint32(entry_count),
    join.apply(null, entries.map(entry => {
      var { sample_count, sample_offset } = entry
      return join(uint32(sample_count), uint32(sample_offset))
    }))
  )

  return ret
}

var stsc = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('stsc', version, flag,
    uint32(entry_count),
    join.apply(null, entries.map(entry => {
      var { first_chunk, samples_per_chunk, sample_description_index } = entry
      return join(uint32(first_chunk), uint32(samples_per_chunk), uint32(sample_description_index))
    }))
  )

  return ret
}

var stsz = o => {
  var { version, flag, sample_size, sample_count, samples } = o
  var ret = fullbox('stsz', version, flag,
    uint32(sample_size),
    uint32(sample_count),
    sample_size == 0 ? join.apply(null, samples.map(sample => {
      var { entry_size } = sample
      return uint32(entry_size)
    })) : new Uint8Array(0)
  )

  return ret
}

var stco = o => {
  var { version, flag, entry_count, entries } = o
  var ret = fullbox('stco', version, flag,
    uint32(entry_count),
    join.apply(null, entries.map(entry => {
      var { chunk_offset } = entry
      return uint32(chunk_offset)
    }))
  )

  return ret
}

var mehd = o => {
  var { version, flag, fragment_duration } = o
  var ret = fullbox('mehd', version, flag, uint32(fragment_duration))
  return ret
}

var trex = o => {
  var { version, flag, track_ID, 
    default_sample_description_index, 
    default_sample_duration,
    default_sample_size,
    default_sample_flags
  } = o
  var ret = fullbox('trex', version, flag,
    uint32(track_ID),
    uint32(default_sample_description_index),
    uint32(default_sample_duration),
    uint32(default_sample_size),
    uint32(default_sample_flags)
  )
  return ret
}

var smhd = o => {
  var { version, flag } = o
  var ret = fullbox('smhd', version, flag,
    new Uint8Array([0x01, 0x00]),
    new Uint8Array([0x00, 0x00])
  )
  return ret
}

var audio_sample_entry = o => {
  var { type, data_reference_index, channelcount, samplesize, samplerate, boxes } = o
  var ret = sample_entry(type, data_reference_index,
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    uint16(channelcount),
    uint16(samplesize),
    new Uint8Array([0x00, 0x00]),
    new Uint8Array([0x00, 0x00]),
    uint32(samplerate),
    joinEntries(boxes)
  )
  return ret
}

var mp4a = o => {
  var ret = audio_sample_entry(o)
  return ret
}

const ES_DescriptorTag = 0x03
const DecoderConfigDescriptorTag = 0x04
const DescriptorSpecificInfoTag = 0x05
const SLConfigDescriptorTag = 0x06

var esds_descriptor = o => {
  var { tag, data } = o
  var ret = join(uint8(tag), 
    new Uint8Array([0x80, 0x80, 0x80]),
    new Uint8Array([data.byteLength]),
    data
  )
  return ret
}

var esds_descriptor_map = {}
esds_descriptor_map.Descriptor = esds_descriptor
esds_descriptor_map[ES_DescriptorTag] = o => {
  var { tag, ES_ID, flags, descriptors } = o
  
  if (flags & 0x80) throw new Error('not implemented')
  if (flags & 0x40) throw new Error('not implemented')
  if (flags & 0x20) throw new Error('not implemented')

  var data = join(uint16(ES_ID),
    uint8(flags),
    esds_descriptors(descriptors)
  )
  var ret = join(uint8(tag),
    new Uint8Array([0x80, 0x80, 0x80]),
    new Uint8Array([data.byteLength]),
    data
  )
  return ret
}
esds_descriptor_map[DecoderConfigDescriptorTag] = o => {
  var { tag, oti, stream_type, buffer_size, max_bitrate, avg_bitrate, descriptors } = o
  var data = join(uint8(oti),
    uint8(stream_type),
    uint8(buffer_size >> 8), uint16(buffer_size % 0xffff),
    uint32(max_bitrate),
    uint32(avg_bitrate),
    esds_descriptors(descriptors)
  )
  var ret = join(uint8(tag),
    new Uint8Array([0x80, 0x80, 0x80]),
    new Uint8Array([data.byteLength]),
    data
  )
  return ret
}
esds_descriptor_map[DescriptorSpecificInfoTag] = esds_descriptor
esds_descriptor_map[SLConfigDescriptorTag] = esds_descriptor

var esds_descriptors = descriptors => {
  var rets = descriptors.map(d => {
    var tag = d.tag
    if (esds_descriptor_map[tag]) {
      return esds_descriptor_map[tag](d)
    } else {
      return esds_descriptor.Descriptor(d)
    }
  })
  return join.apply(null, rets)
}

var esds = o => {
  var { version, flag, descriptors } = o
  var ret = fullbox('esds', version, flag, esds_descriptors(descriptors))
  return ret
}

var mfhd = o => {
  var { version, flag, sequence_number } = o
  var ret = fullbox('mfhd', version, flag, uint32(sequence_number))
  return ret
}

var tfhd = o => {
  var { version, flag, track_ID } = o
  
  if (flag[0] != 2 || flag[1] != 0 || flag[2] != 0) throw new Error('not implemented')

  var ret = fullbox('tfhd', version, flag, uint32(track_ID))
  return  ret
}

var tfdt = o => {
  var { version, flag, baseMediaDecodeTime } = o
  var ret = fullbox('tfdt', version, flag, uint32(baseMediaDecodeTime))
  return ret
}

var trun = o => {
  var { version, flag, sample_count, data_offset, first_sample_flags, samples } = o
  
  if (flag[0] != 0 || flag[1] != 0x0f || flag[2] != 1 ) throw new Error('not implemented')

  var ret = fullbox('trun', version, flag,
    uint32(sample_count),
    int32(data_offset),
    join.apply(null, samples.map(s => join(uint32(s.sample_duration), uint32(s.sample_size), uint32(s.sample_flags), uint32(s.sample_composition_time_offset))))
  )
  return ret
}

var generators = {
  box,
  ftyp,
  mvhd,
  tkhd,
  elst,
  mdhd,
  hdlr,
  vmhd,
  dref,
  stsd,
  stts,
  ctts,
  stsc,
  stsz,
  stco,
  mehd,
  trex,
  url,
  avc1,
  avcC,
  smhd,
  mp4a,
  esds,
  mfhd,
  tfhd,
  tfdt,
  trun
}

module.exports = generators
