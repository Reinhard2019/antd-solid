import { type Component, Switch, Match, mergeProps, Show, createMemo, useContext } from 'solid-js'
import cs from 'classnames'
import Circle from './Circle'
import ConfigProviderContext from '../ConfigProvider/context'

export interface ProgressProps {
  /**
   * 百分比
   * 默认 0
   */
  percent?: number
  /**
   * 状态
   */
  status?: 'normal' | 'success' | 'error'
  /**
   * 进度条的高度
   * 默认 8
   */
  height?: number
  /**
   * 是否显示进度数值或状态图标
   * 默认 true
   */
  showInfo?: boolean
}

const Progress: Component<ProgressProps> & {
  Circle: typeof Circle
} = _props => {
  const { cssVariables } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      percent: 0,
      height: 8,
      showInfo: true,
    },
    _props,
  )

  const status = createMemo(() => {
    if (props.status) return props.status
    return props.percent >= 100 ? 'success' : 'normal'
  })

  return (
    <div class="flex items-center" style={{}}>
      <div
        class={cs(
          'w-full bg-[var(--ant-progress-remaining-color)]',
          'before:content-empty before:block before:bg-[var(--color)] before:w-[var(--percent)] before:h-full before:rounded-inherit',
        )}
        style={{
          ...cssVariables(),
          height: `${props.height}px`,
          'border-radius': `${props.height / 2}px`,
          '--percent': `${props.percent}%`,
          '--color': {
            normal: 'var(--ant-color-primary)',
            success: 'var(--ant-color-success)',
            error: 'var(--ant-color-error)',
          }[status()],
        }}
      />

      <Show when={props.showInfo}>
        <span class="shrink-0 min-w-40px ml-8px text-center">
          <Switch fallback={`${props.percent}%`}>
            <Match when={status() === 'success'}>
              <span class="i-ant-design:check-circle-filled text-[var(--ant-color-success)]" />
            </Match>
            <Match when={status() === 'error'}>
              <span class="i-ant-design:close-circle-filled text-[var(--ant-color-error)]" />
            </Match>
          </Switch>
        </span>
      </Show>
    </div>
  )
}

Progress.Circle = Circle

export default Progress
