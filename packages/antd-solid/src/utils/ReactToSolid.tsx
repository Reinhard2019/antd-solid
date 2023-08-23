import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
// import { renderToString } from 'react-dom/server'
import { onMount, onCleanup, createEffect, createMemo } from 'solid-js'

interface ReactToSolidProps<P extends {} = {}> {
  component: React.FunctionComponent<P> | React.ComponentClass<P>
  props: P
  container?: Element
}

function ReactToSolid<P extends {} = {}>(props: ReactToSolidProps<P>) {
  let root: Root

  const rootEle = createMemo(
    () => props.container ?? ((<div role={'ReactToSolid' as any} />) as Element),
  )
  onMount(() => {
    root = createRoot(rootEle())
    onCleanup(() => {
      root.unmount()
    })
  })

  createEffect(() => {
    root.render(React.createElement(props.component, { ...props.props }))
  })

  // if (import.meta.env.SSR) {
  //   // eslint-disable-next-line solid/reactivity
  //   const node = React.createElement(props.component, { ...props.props })
  //   // eslint-disable-next-line solid/components-return-once, solid/no-innerhtml
  //   return <div innerHTML={renderToString(node)} />
  // }
  return <>{rootEle}</>
}

export default ReactToSolid
