import DataBox from './data-box'
import ContainerBox from './container-box'
import FtypBox from './ftyp-box'
import MvhdBox from './mvhd-box'
import TkhdBox from './tkhd-box'
import ElstBox from './elst-box'
import MdhdBox from './mdhd-box'
import HdlrBox from './hdlr-box'
import VmhdBox from './vmhd-box'
import EntriesBox from './entries-box'
import UrlBox from './url-box'
import VisualSampleEntryBox from './visual-sample-entry-box'
import AvcCBox from './avcC-box'
import SttsBox from './stts-box'
import StssBox from './stss-box'
import CttsBox from './ctts-box'
import StscBox from './stsc-box'
import StszBox from './stsz-box'
import StcoBox from './stco-box'
import SmhdBox from './smhd-box'

var boxes = {
  data: DataBox,
  ftyp: FtypBox,
  moov: ContainerBox,
  trak: ContainerBox,
  mvhd: MvhdBox,
  tkhd: TkhdBox,
  edts: ContainerBox,
  elst: ElstBox,
  mdia: ContainerBox,
  mdhd: MdhdBox,
  hdlr: HdlrBox,
  minf: ContainerBox,
  vmhd: VmhdBox,
  dinf: ContainerBox,
  dref: EntriesBox,
  'url ': UrlBox,
  stbl: ContainerBox,
  stsd: EntriesBox,
  avc1: VisualSampleEntryBox,
  avcC: AvcCBox,
  stts: SttsBox,
  stss: StssBox,
  ctts: CttsBox,
  stsc: StscBox,
  stsz: StszBox,
  stco: StcoBox,
  smhd: SmhdBox
}

export default boxes
