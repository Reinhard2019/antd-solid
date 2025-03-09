import { type JSXElement, type Component, type ParentProps, mergeProps } from 'solid-js'
import cs from 'classnames'
import Element from '../Element'

type ResultStatusType = 'success' | 'error' | 'info' | 'warning'

export interface ResultProps extends ParentProps {
  status?: ResultStatusType
  title?: JSXElement
  subTitle?: JSXElement
  extra?: JSXElement
}

const statusIconMap = {
  success: '!text-[--ant-color-success] i-ant-design:check-circle-filled',
  info: '!text-[--ant-color-primary] i-ant-design:exclamation-circle-filled',
  warning: '!text-[--ant-color-warning] i-ant-design:warning-filled',
  error: '!text-[--ant-color-error] i-ant-design:close-circle-filled',
}

const Result: Component<ResultProps> = _props => {
  const props = mergeProps(
    {
      status: 'info' as const,
    },
    _props,
  )
  return (
    <Element class="text-center px-32px py-48px [font-size:var(--ant-font-size)] text-[--ant-color-text] leading-[--ant-line-height]">
      <div class="mb-24px">
        <span class={cs(statusIconMap[props.status!], 'text-72px')} />
      </div>

      <div class="my-8px text-[--ant-color-text-heading] text-24px">{props.title}</div>

      <div class="text-[--ant-color-text-description] text-14px">{props.subTitle}</div>

      <div class="mt-24px">{props.extra}</div>

      <div class="mt-24px">{props.children}</div>
    </Element>
  )
}

export default Result
