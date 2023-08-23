import { Progress as ProgressAntd } from 'antd'
import { reactToSolidComponent, replaceChildren, replaceClassName } from './utils/component'

export default replaceChildren(replaceClassName(reactToSolidComponent(ProgressAntd)))
