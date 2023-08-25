import React, { type FunctionComponent, type ReactElement, useEffect, useRef } from 'react'
import { type JSX } from 'solid-js'
import { render } from 'solid-js/web'

export interface SolidToReactProps {
  children?: JSX.Element
  container?: ReactElement
}

const SolidToReact: FunctionComponent<SolidToReactProps> = ({ children, container }) => {
  const ref = useRef<HTMLDivElement>()

  useEffect(() => render(() => children, ref.current!), [])

  // if (import.meta.env.SSR) {
  //   return React.createElement('div', {
  //     dangerouslySetInnerHTML: { __html: renderToString(() => children) },
  //   })
  // }
  return container
    ? React.cloneElement(container, {
      ref,
    })
    : React.createElement('div', { ref, role: 'SolidToReact' })
}

export default SolidToReact
