import { reactToSolidComponent, replaceChildren, replaceClassName } from './utils/component'
import { Upload as UploadAntd } from 'antd'

export type { UploadFile } from 'antd/es/upload'

const Upload = replaceChildren(replaceClassName(reactToSolidComponent(UploadAntd)))

export type UploadProps = Parameters<typeof Upload>[0]

export default Upload
