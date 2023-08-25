import { type JSXElement, type Component, type ParentProps } from 'solid-js'
import cs from 'classnames'

type ResultStatusType = 'success' | 'error' | 'info' | 'warning'

export interface ResultProps extends ParentProps {
  status?: ResultStatusType
  title?: JSXElement
  subTitle?: JSXElement
  extra?: JSXElement
}

const statusIconMap = {
  success: 'ant-text-#52c41a i-ant-design:check-circle-filled',
  info: 'ant-text-[var(--primary-color)] i-ant-design:exclamation-circle-filled',
  warning: 'ant-text-#faad14 i-ant-design:warning-filled',
  error: 'ant-text-#ff4d4f i-ant-design:close-circle-filled',
}

const Result: Component<ResultProps> = props => {
  return (
    <div class="ant-text-center ant-px-32px ant-py-48px">
      <div class="ant-mb-24px">
        <span class={cs(statusIconMap[props.status!], 'ant-text-72px')} />
      </div>

      <div class="ant-my-8px ant-text-[rgba(0,0,0,.88)] ant-text-24px">{props.title}</div>

      <div class="ant-text-[rgba(0,0,0,.45)] ant-text-14px">{props.subTitle}</div>

      <div class="ant-mt-24px">{props.extra}</div>

      <div class="ant-mt-24px">{props.children}</div>
    </div>
  )
}

export default Result
