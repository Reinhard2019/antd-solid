import React from 'react'
import { type Component, createMemo, type JSXElement } from 'solid-js'
import { omit } from 'lodash-es'
import { solidToReact } from './solid'
import ReactToSolid from './ReactToSolid'
import { ConfigProvider } from 'antd'
import zhCN from './zh_CN'
import { type ConfigProviderProps } from 'antd/es/config-provider'

/**
 * 将组件 props 中的 className 替换为 class
 * @param C
 * @returns
 */
export function replaceClassName<
  T extends { className?: string },
  Target extends Omit<T, 'className'> & { class?: string },
>(C: Component<T>): Component<Target> {
  return function (_props: Target) {
    const props = createMemo(() => {
      return {
        ...omit(_props, 'class'),
        className: _props.class,
      }
    })
    return <C {...(props() as unknown as T)} />
  }
}

/**
 * 将组件 props 中的 children 替换为 JSXElement
 * @param C
 * @returns
 */
export function replaceChildren<
  T extends { children?: React.ReactNode },
  Target extends Omit<T, 'children'> & { children?: JSXElement },
>(C: Component<T>): Component<Target> {
  return function (_props: Target) {
    const props = createMemo(() => {
      return {
        ..._props,
        children: solidToReact(_props.children),
      }
    })
    return <C {...(props() as unknown as T)} />
  }
}

export function reactToSolidComponent<P extends {} = {}>(
  component: React.FunctionComponent<P> | React.ComponentClass<P>,
  container?: Element | (() => Element),
  defaultProps?: P,
) {
  return function (props: P) {
    return (
      <ReactToSolid
        component={component}
        props={{ ...defaultProps, ...props }}
        container={typeof container === 'function' ? container() : container}
      />
    )
  }
}

/**
 * 返回被 ConfigProvider 包裹后的 component
 * @param component
 * @param configProviderProps
 * @returns
 */
export function configProvider<P extends {} = {}>(
  component: React.FunctionComponent<P> | React.ComponentClass<P>,
  configProviderProps?: ConfigProviderProps,
) {
  return function (props: P) {
    return React.createElement(
      ConfigProvider,
      {
        locale: zhCN,
        ...configProviderProps,
      },
      React.createElement(component, props),
    )
  }
}
