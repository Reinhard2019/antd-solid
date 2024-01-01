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
  success: 'text-#52c41a i-ant-design:check-circle-filled',
  info: 'text-[var(--ant-color-primary)] i-ant-design:exclamation-circle-filled',
  warning: 'text-#faad14 i-ant-design:warning-filled',
  error: 'text-#ff4d4f i-ant-design:close-circle-filled',
}

const Result: Component<ResultProps> = props => {
  return (
    <div class="text-center px-32px py-48px">
      <div class="mb-24px">
        <span class={cs(statusIconMap[props.status!], 'text-72px')} />
      </div>

      <div class="my-8px text-[rgba(0,0,0,.88)] text-24px">{props.title}</div>

      <div class="text-[rgba(0,0,0,.45)] text-14px">{props.subTitle}</div>

      <div class="mt-24px">{props.extra}</div>

      <div class="mt-24px">{props.children}</div>
    </div>
  )
}

export default Result
