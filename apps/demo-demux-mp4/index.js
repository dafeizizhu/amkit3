import ensureZepto from 'amkit3-modules/utils/ensure-zepto'
import Mp4Demuxer from 'amkit3-modules/utils/v/demux/mp4demuxer'
import { range } from 'amkit3-modules/utils/fetch'
import { binary, hex } from 'amkit3-modules/utils/dump'
import { uint32, uint16, int32, int16 } from 'amkit3-modules/utils/byte-range'

import Downloader from './downloader'

ensureZepto((err, $) => {
  $(function () {
    var $t = $('#t')
    var $s_t = $('#s_t')
    var mp4Demuxer = new Mp4Demuxer()

    $s_t.on('click', () => {
      reset()
      play()
    })

    // DEMO
    var mp4Box
    var mp4Info

    var downloader = new Downloader()

    var video
    
    var reset = () => {
      resetMediaSource()
    }
    var resetMediaSource = () => {
      var mediaSource
      mediaSource = new MediaSource()
      mediaSource.video = video
      video.ms = mediaSource
      mediaSource.addEventListener('sourceopen', onSourceOpen)
      mediaSource.addEventListener('sourceclose', onSourceClose)
      video.src = window.URL.createObjectURL(mediaSource)
      video.onloadedmetadata = (...args) => console.log(['loadedmetadata'].concat(args))
      video.onplaying = (...args) => console.log(['playing'].concat(args))
      video.onplay = (...args) => console.log(['play'].concat(args))
      video.onabort = (...args) => console.log(['abort'].concat(args))
      video.oncanplay = (...args) => console.log(['canplay'].concat(args))
      video.oncanplaythrough = (...args) => console.log(['canplaythrough'].concat(args))
      video.onended = (...args) => console.log(['ended'].concat(args))
      video.onloadeddata = (...args) => console.log(['loadeddata'].concat(args))
      video.onloadstart = (...args) => console.log(['loadstart'].concat(args))
      video.onpause = (...args) => console.log(['pause'].concat(args))
      video.onprogress = (...args) => console.log(['progress'].concat(args))
      video.onseeked = (...args) => console.log(['seeked'].concat(args))
      video.onseeking = (...args) => console.log(['seeking'].concat(args))
      video.onstalled = (...args) => console.log(['stalled'].concat(args))
      video.onwaiting = (...args) => console.log(['waiting'].concat(args))
    }
    var onSourceOpen = () => {}
    var onSourceClose = () => {}
    var play = () => {
      video.play()

      setTimeout(load, 1000)
    }
    var load = () => {
      var ms = video.ms
      if (ms.readyState != 'open') return

      mp4Box = new Mp4Demuxer()
      mp4Box.onReady = info => {
        console.log(info)
        mp4Info = info
        // TODO suppose it is not fragmented
        ms.duration = info.duration / info.timescale
        initializeAllSourceBuffers()
      }
      mp4Box.onFragment = (id, user, buffer, sampleNum) => {
        var sb = user
        sb.appends.push({ buffer })
        onUpdateEnd({ target: sb })
      }
      downloader.setCallback((response, end, err) => {
        var nextStart = 0
        if (response) {
          nextStart = mp4Box.append(new Uint8Array(response))
        }
        // TODO
        return downloader.stop()

        if (end) {
          // TODO
        } else {
          downloader.setChunkStart(nextStart)
        }
        if (err) {
          reset()
        }
      })
      downloader.setInterval(500)
      downloader.setChunkSize(1048576 * 10)
      downloader.setUrl($t.val())
      downloader.start()
    }
    var initializeAllSourceBuffers = () => {
      if (mp4Info) {
        for (var i = 0; i < mp4Info.tracks.length; i++) {
          var track = mp4Info.tracks[i]
          addBuffer(video, track)
        }
        initializeSourceBuffers()
      }
    }
    var addBuffer = (video, track) => {
      var sb
      var ms = video.ms
      var track_id = track.id
      var codec = track.codec
      var mime = 'video/mp4; codecs="' + codec + '"'
      if (MediaSource.isTypeSupported(mime)) {
        try {
          sb = ms.addSourceBuffer(mime)
          sb.track_id = track_id
          sb.addEventListener('error', e => console.log('MSE SourceBuffer #' + track_id, e, sb))
          sb.ms = ms
          sb.id = track_id
          mp4Box.setSegmentOptions(track_id, sb, { nbSamples: 1000 })
          sb.pendingAppends = []
        } catch (e) {
          console.log('MES SourceBuffer #' + track_id, 'Cannot create buffer with type', mime, e)
        }
      }
    }
    var initializeSourceBuffers = () => {
      var initSegs = mp4Box.initializeSegmentation()
      for (var i = 0; i < initSegs.length; i++) {
        var sb = initSegs[i].user
        if (i == 0) {
          sb.ms.pendingInits = 0
        }
        sb.addEventListener('updateend', onInitAppended)
        sb.appendBuffer(initSegs[i].buffer)
        sb.segmentIndex = 0
        sb.ms.pendingInits++
        sb.appends = []
      }
    }
    var onInitAppended = evt => {
      var sb = evt.target
      if (sb.ms.readyState == 'open') {
        sb.removeEventListener('updateend', onInitAppended)
        sb.addEventListener('updateend', onUpdateEnd)
        onUpdateEnd({ target: sb })
      }
    }
    var onUpdateEnd = evt => {
      var sb = evt.target
      if (sb.ms.readyState == 'open' && !sb.updating && sb.appends.length) {
        var obj = sb.appends.shift()
        sb.appendBuffer(obj.buffer) 

        if (!sb.appends.length) {
          sb.removeEventListener('updateend', onUpdateEnd)
          sb.addEventListener('updateend', onUpdateEndFinal)
        }
      }
    }
    var onUpdateEndFinal = evt => {
      //var sb = evt.target
      //if (sb.ms.readyState == 'open') {
      //  sb.ms.endOfStream()
      //}
    }

    video = document.getElementById('v')
    reset()
    play()
  })
})
