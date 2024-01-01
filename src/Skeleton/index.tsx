import { Skeleton as SkeletonAntd } from 'antd'
import { reactToSolidComponent, replaceClassName } from '../utils/component'

const _Skeleton = replaceClassName(reactToSolidComponent(SkeletonAntd))

const Image = replaceClassName(reactToSolidComponent(SkeletonAntd.Image))

const Skeleton = _Skeleton as typeof _Skeleton & {
  Image: typeof Image
}

Skeleton.Image = Image

export default Skeleton
