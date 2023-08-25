import { Select as SelectAntd } from 'antd'
import { reactToSolidComponent, replaceClassName } from './utils/component'

const Select = replaceClassName(reactToSolidComponent(SelectAntd))

export default Select
