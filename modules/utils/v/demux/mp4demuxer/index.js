import { binary, hex } from 'amkit3-modules/utils/dump'
import { uint32, uint16, uint8, int32, int16, int8, str } from 'amkit3-modules/utils/byte-range'
import { join } from 'amkit3-modules/utils/to-uint8-array'

import Mp4BoxesParser from './mp4-boxes-parser'
import Mp4BoxesGenerator from './mp4-boxes-generator'

var decimalToHex = (d, padding) => {
  var hex = d.toString(16)
  var padding = (typeof padding == 'undefined' || pading == null) ? 2 : padding
  while (hex.length < padding) hex = '0' + hex
  return hex
}

var getCodec = sample_des => {
  var baseCodec = sample_des.type.replace('.', '')
  try {
    if (sample_des.type == 'avc1') {
      var avcC = sample_des.boxes.filter(b => b.type == 'avcC')[0]
      return baseCodec + '.' + decimalToHex(avcC.AVCProfileIndication) + 
        decimalToHex(avcC.profile_compatibility) + 
        decimalToHex(avcC.AVCLevelIndication)
    } else if (sample_des.type == 'mp4a') {
      var esds = sample_des.boxes.filter(b => b.type == 'esds')[0]
      var oti = esds.descriptors.filter(d => d.tag == 3)[0].descriptors.filter(d => d.tag == 4)[0].oti
      var audio_config = null
      var dsi = esds.descriptors.filter(d => d.tag == 3)[0].descriptors.filter(d => d.tag == 4)[0].descriptors.filter(d => d.tag == 5)[0]
      if (dsi) {
        audio_config = (dsi.data[0] & 0xf8) >> 3
      }
      return baseCodec + '.' + decimalToHex(oti) + (audio_config ? '.' + audio_config : '')
    } else {
      return baseCodec
    }
  } catch (e) {
    console.warn(e)
    return baseCodec
  }
}

var buildSampleList = trak => {
  var samples = []
  var samples_duration = 0
  var samples_size = 0

  var j
  var { stco, stsc, stsz, stts, ctts, stss, stsd, subs, stdp, sbgp, sgpd } = trak.mdia.minf.stbl
  var chunk_run_index, chunk_index, last_chunk_in_run, offset_in_chunk, last_sample_in_chunk
  var last_sample_in_stts_run, stts_run_index, last_sample_in_ctts_run, ctts_run_index, last_stss_index

  last_sample_in_stts_run = -1
  stts_run_index = -1
  last_sample_in_ctts_run = -1
  ctts_run_index = -1
  last_stss_index = 0

  if (sbgp || sgpd) throw new Error('stbl contain sbgp or sgpd is not implemented')

  if (stsz) {
    for (j = 0; j < stsz.sample_count; j++) {
      var sample = {}
      sample.number = j
      sample.track_id = trak.tkhd.track_ID
      sample.timescale = trak.mdia.mdhd.timescale
      sample.alreadyRead = 0
      samples.push(sample)
      sample.size = stsz.samples[j].entry_size
      samples_size += sample.size

      if (j == 0) {
        chunk_index = 1
        chunk_run_index = 0
        sample.chunk_index = chunk_index
        sample.chunk_run_index = chunk_run_index
        last_sample_in_chunk = stsc.entries[chunk_run_index].samples_per_chunk
        offset_in_chunk = 0

        if (chunk_run_index + 1 < stsc.entries.length) {
          last_chunk_in_run = stsc.entries[chunk_run_index + 1].first_chunk - 1
        } else {
          last_chunk_in_run = Infinity
        }
      } else {
        if (j < last_sample_in_chunk) {
          sample.chunk_index = chunk_index
          sample.chunk_run_index = chunk_run_index
        } else {
          chunk_index += 1
          sample.chunk_index = chunk_index
          offset_in_chunk = 0
          if (chunk_index <= last_chunk_in_run) {
          } else {
            chunk_run_index += 1
            if (chunk_run_index + 1 < stsc.entries.length) {
              last_chunk_in_run = stsc.entries[chunk_run_index + 1].first_chunk - 1
            } else {
              last_chunk_in_run = Infinity
            }
          }
          sample.chunk_run_index = chunk_run_index
          last_sample_in_chunk += stsc.entries[chunk_run_index].samples_per_chunk
        }
      }

      sample.description_index = stsc.entries[sample.chunk_run_index].sample_description_index - 1
      sample.description = stsd.entries[sample.description_index]
      sample.offset = stco.entries[sample.chunk_index - 1].chunk_offset + offset_in_chunk
      offset_in_chunk += sample.size

      if (j > last_sample_in_stts_run) {
        stts_run_index += 1
        if (last_sample_in_stts_run < 0) {
          last_sample_in_stts_run = 0
        }
        last_sample_in_stts_run += stts.entries[stts_run_index].sample_count
      }
      if (j > 0) {
        samples[j - 1].duration = stts.entries[stts_run_index].sample_delta
        samples_duration += samples[j - 1].duration
        sample.dts = samples[j - 1].dts + samples[j - 1].duration
      } else {
        sample.dts = 0
      }
      if (ctts) {
        if (j >= last_sample_in_ctts_run) {
          ctts_run_index += 1
          if (last_sample_in_ctts_run < 0) {
            last_sample_in_ctts_run = 0
          }
          last_sample_in_ctts_run += ctts.entries[ctts_run_index].sample_count
        }
        sample.cts = samples[j].dts + ctts.entries[ctts_run_index].sample_offset
      } else {
        sample.cts = sample.dts
      }
      if (stss) {
        if (last_stss_index < stss.entry_count && j == stss.entries[last_stss_index].sample_number - 1) {
          sample.is_sync = true
          last_stss_index += 1
        } else {
          sample.is_sync = false
        }
      } else {
        sample.is_sync = true
      }
      if (stdp) throw new Error('stbl contain stdp is not implemented')
      if (subs) throw new Error('stbl contain subs is not implemented')
      if (sbgp) throw new Error('stbl contain sbgp is not implemented')
      if (sgpd) throw new Error('stbl contain sgpd is not implemented')
    }
    if (j > 0) {
      samples[j - 1].duration = Math.max(trak.mdia.mdhd.duration - samples[j - 1].dts, 0)
      samples_duration += samples[j - 1].duration
    }
  }

  return { samples, samples_duration, samples_size }
}

class Mp4Demuxer {
  constructor() {
    this.data = new Uint8Array()
    this.position = 0
    this.boxes = {}
    this.info = null
    this.readySize = 0
    
    this.fragmentedTracks = []
    this.nextMoofNumber = 0
  }
  append(data) {
    var temp = new Uint8Array(this.data.length + data.length)
    temp.set(this.data, 0)
    temp.set(data, this.data.byteLength)
    this.data = temp

    if (this.data.length - this.position < 8) return
    if (!this.ready) {
      do {
        var size = uint32(this.data, this.position)
        var type = str(this.data, this.position + 4, 4)
        
        if (type == 'moov') {
          this.readySize = this.position + size
        }

        if (this.position + size <= this.data.byteLength) {
          if (Mp4BoxesParser['parse_' + type]) {
            this.boxes[type] = Mp4BoxesParser['parse_' + type](this.data.subarray(this.position, this.position + size))
          } else {
            this.boxes[type] = Mp4BoxesParser.parse_unknow(this.data.subarray(this.position, this.position + size))
          }
          if (type == 'moov') {
            console.log('ready', this.boxes)
            this.ready = true
            if (typeof this.onReady == 'function') {
              this.onReady(this.getInfo())
            }
          }
          this.position += size
        } else {
          break
        }
      } while (this.position < this.data.byteLength - 4)
    }

    if (this.ready) {
      this.info.tracks.forEach((track, i) => {
        var fragmentData
        while (track.nextSample < track.samples.length) {
          var { nextSample, samples, id } = track
          var sample = samples[nextSample]
          if (this.data.byteLength >= sample.offset + sample.size) {
            sample.data = new Uint8Array(sample.size)
            sample.data.set(this.data.subarray(sample.offset, sample.offset + sample.size), 0)

            var mfhd = { version: 0, flag: new Uint8Array([0, 0, 0]), sequence_number: this.nextMoofNumber }
            this.nextMoofNumber += 1
            var tfhd = { version: 0, flag: new Uint8Array([2, 0, 0]), track_ID: id }
            var tfdt = { version: 0, flag: new Uint8Array([0, 0, 0]), baseMediaDecodeTime: sample.dts }
            var trun = {
              version: 0,
              flag: new Uint8Array([0, 0x0f, 1]),
              sample_count: 1,
              data_offset: 108,
              first_sample_flags: 0,
              samples: [{
                sample_duration: sample.duration,
                sample_size: sample.size,
                sample_flags: 0,
                sample_composition_time_offset: sample.cts - sample.dts
              }]
            }

            var moof = Mp4BoxesGenerator.box('moof',
              Mp4BoxesGenerator.mfhd(mfhd),
              Mp4BoxesGenerator.box('traf',
                Mp4BoxesGenerator.tfhd(tfhd),
                Mp4BoxesGenerator.tfdt(tfdt),
                Mp4BoxesGenerator.trun(trun)
              )
            )
            var mdat = Mp4BoxesGenerator.box('mdat', sample.data)
            
            if (this.onFragment) {
              var fragmentedTrack = this.fragmentedTracks[i]
              this.onFragment(1, fragmentedTrack.user, join(moof, mdat), nextSample)
            }
            track.nextSample = nextSample + 1
          } else {
            console.log('not enough data, require', sample.offset + sample.size, ', actual', data.byteLength)
            break
          }
        }
      })
    }

    return this.data.byteLength
  }
  getInfo() {
    if (this.info) return this.info

    var tracks = []
    var track = trak => {
      var sample_des = trak.mdia.minf.stbl.stsd.entries[0] 
      var { samples, samples_duration, samples_size } = buildSampleList(trak)
      return {
        sample_des,
        id: trak.tkhd.track_ID,
        name: trak.mdia.hdlr.name,
        edits: trak.edts ? trak.edts.elst.entries : null,
        codec: getCodec(sample_des),
        samples, samples_duration, samples_size,
        nextSample: 0
      }
    }
    
    if (this.boxes.moov.trak instanceof Array) {
      for (var i = 0; i < this.boxes.moov.trak.length; i++) {
        tracks.push(track(this.boxes.moov.trak[i]))
      }
    } else {
      tracks.push(track(this.boxes.moov.trak))
    }

    this.info = {
      duration: this.boxes.moov.mvhd.duration,
      timescale: this.boxes.moov.mvhd.timescale,
      tracks
    }

    return this.info
  }
  getTrakById(id) {
    var traks = this.boxes.moov.trak instanceof Array ? this.boxes.moov.trak : [this.boxes.moov.trak]
    var trak = traks.filter(trak => trak.tkhd.track_ID == id)[0]
    return trak
  }
  setSegmentOptions(id, user, options) {
    var trak = this.getTrakById(id)
    if (trak) {
      var fragTrack = {}
      this.fragmentedTracks.push(fragTrack)
      fragTrack.id = id
      fragTrack.user = user
      fragTrack.trak = trak
      trak.nextSample = 0
      fragTrack.segmentStream = null
      fragTrack.nb_samples = 1000
      fragTrack.rapAlignment = true
    }
  }
  initializeSegmentation() {
    var i, j, box, initSegs, trak, seg
    if (!this.isFragmentationInitialized) {
      this.isFragmentationInitialized = true
      this.nextMoofNumber = 0
    }
    initSegs = []
    for (i = 0; i < this.fragmentedTracks.length; i++) {
      var seg = {}
      var trak = this.fragmentedTracks[i].trak
      seg.id = this.fragmentedTracks[i].id
      seg.user = this.fragmentedTracks[i].user
      var uint8Array = join(
        Mp4BoxesGenerator.ftyp(this.boxes.ftyp), 
        Mp4BoxesGenerator.box('moov', 
          Mp4BoxesGenerator.mvhd(Object.assign({}, this.boxes.moov.mvhd, { duration: 0 })),
          Mp4BoxesGenerator.box('trak',
            Mp4BoxesGenerator.tkhd(Object.assign({}, trak.tkhd, { duration: 0 })),
            Mp4BoxesGenerator.box('edts', Mp4BoxesGenerator.elst(trak.edts.elst)),
            Mp4BoxesGenerator.box('mdia',
              Mp4BoxesGenerator.mdhd(Object.assign({}, trak.mdia.mdhd, { duration: 0 })),
              Mp4BoxesGenerator.hdlr(trak.mdia.hdlr),
              Mp4BoxesGenerator.box('minf',
                trak.mdia.minf.vmhd ? Mp4BoxesGenerator.vmhd(trak.mdia.minf.vmhd) : Mp4BoxesGenerator.smhd(trak.mdia.minf.smhd),
                Mp4BoxesGenerator.box('dinf', Mp4BoxesGenerator.dref(trak.mdia.minf.dinf.dref)),
                Mp4BoxesGenerator.box('stbl', 
                  Mp4BoxesGenerator.stsd(trak.mdia.minf.stbl.stsd),
                  Mp4BoxesGenerator.stts(Object.assign({}, trak.mdia.minf.stbl.stts, { entry_count: 0, entries: [] })),
                  trak.mdia.minf.stbl.ctts ? Mp4BoxesGenerator.ctts(Object.assign({}, trak.mdia.minf.stbl.ctts, { entry_count: 0, entries: [] })) : new Uint8Array(0),
                  Mp4BoxesGenerator.stsc(Object.assign({}, trak.mdia.minf.stbl.stsc, { entry_count: 0, entries: [] })),
                  Mp4BoxesGenerator.stsz(Object.assign({}, trak.mdia.minf.stbl.stsz, { sample_count: 0, samples: [] })),
                  Mp4BoxesGenerator.stco(Object.assign({}, trak.mdia.minf.stbl.stco, { entry_count: 0, entries: [] }))
                )
              )
            )
          ),
          Mp4BoxesGenerator.box('mvex',
            Mp4BoxesGenerator.trex({ version: 0, flag: new Uint8Array([0, 0, 0]), 
              track_ID: trak.tkhd.track_ID,
              default_sample_description_index: 1,
              default_sample_duration: this.info.tracks[i].samples[0].duration,
              default_sample_size: 0,
              default_sample_flags: 1 << 16
            })
          )
        )
      )
      seg.buffer = uint8Array.buffer

      initSegs.push(seg)
    }
    return initSegs
  }
}


export default Mp4Demuxer
