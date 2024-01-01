import { mergeProps, type Component, Switch, Match, Show, createMemo } from 'solid-js'
import cs from 'classnames'

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
   * 'line' 类型进度条的高度
   * 默认 8
   */
  height?: number
  /**
   * 是否显示进度数值或状态图标
   * 默认 true
   */
  showInfo?: boolean
}

const Progress: Component<ProgressProps> = _props => {
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
    <div
      class="flex items-center"
      style={{
        '--progress-remaining-color': 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        class={cs(
          'w-full bg-[var(--progress-remaining-color)]',
          'before:content-empty before:block before:bg-[var(--color)] before:w-[var(--percent)] before:h-full before:rounded-inherit',
        )}
        style={{
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

export default Progress
