import DataBox from './data-box'
import ContainerBox from './container-box'
import FtypBox from './ftyp-box'
import MvhdBox from './mvhd-box'
import TkhdBox from './tkhd-box'
import ElstBox from './elst-box'
import MdhdBox from './mdhd-box'

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
  mdhd: MdhdBox
}

export default boxes
