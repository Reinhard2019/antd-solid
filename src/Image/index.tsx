import { Image as ImageAntd } from 'antd'
import { configProvider, reactToSolidComponent, replaceClassName } from '../utils/component'
import { solidToReact } from '../utils/solid'
import { type JSXElement, createMemo } from 'solid-js'
import { mapValues } from 'lodash-es'

const _Image = replaceClassName(
  reactToSolidComponent(configProvider(ImageAntd), () => (<div class="inline-flex" />) as any),
)

type ImageProps = Omit<Parameters<typeof _Image>[0], 'placeholder'> & {
  placeholder?: JSXElement
}

function Image(_props: ImageProps) {
  const props = createMemo(() =>
    mapValues(_props, (value, key) => {
      switch (key) {
        case 'placeholder':
          return solidToReact(value as Element)
        default:
          return value
      }
    }),
  )
  return <_Image {...(props() as any)} />
}

export default Image
