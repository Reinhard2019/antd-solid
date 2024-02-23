import { mergeProps, type Component, Switch, Match, Show, createMemo } from 'solid-js'
import { type ProgressProps } from '.'
import { useSize } from '../hooks'

export interface CircleProps extends Omit<ProgressProps, 'type' | 'height'> {
  /**
   * 圆形进度条线的宽度，单位是进度条画布宽度的百分比
   * 默认 6
   */
  strokeWidth?: number
  /**
   * 进度条的高度
   * 默认 120px
   */
  height?: string
}

const Circle: Component<CircleProps> = _props => {
  let ref: HTMLDivElement | undefined
  const props = mergeProps(
    {
      percent: 0,
      height: '120px',
      showInfo: true,
      strokeWidth: 6,
    },
    _props,
  )

  const status = createMemo(() => {
    if (props.status) return props.status
    return props.percent >= 100 ? 'success' : 'normal'
  })

  const radius = createMemo(() => 50 - props.strokeWidth / 2)
  const perimeter = createMemo(() => radius() * 2 * Math.PI)

  const size = useSize(() => ref)

  return (
    <div
      ref={ref}
      class="flex items-center relative"
      style={{
        '--ant-progress-remaining-color': 'rgba(0, 0, 0, 0.06)',
        height: props.height,
        width: typeof size()?.height === 'number' ? `${size()!.height}px` : undefined,
        'font-size': typeof size()?.height === 'number' ? `${size()!.height / 5}px` : undefined,
      }}
    >
      <svg viewBox="0 0 100 100" role="presentation">
        <circle
          r={radius()}
          cx="50"
          cy="50"
          stroke-linecap="round"
          stroke-width={props.strokeWidth}
          style={{
            stroke: 'var(--ant-progress-remaining-color)',
            'stroke-dasharray': `${perimeter()}px, ${perimeter()}px`,
            'stroke-dashoffset': '0',
            transform: 'rotate(-90deg)',
            'transform-origin': '50px 50px',
            transition:
              'stroke-dashoffset 0.3s ease 0s, stroke-dasharray 0.3s ease 0s, stroke 0.3s ease 0s, stroke-width 0.06s ease 0.3s, opacity 0.3s ease 0s',
            'fill-opacity': '0',
          }}
        />
        <circle
          r={radius()}
          cx="50"
          cy="50"
          stroke-linecap="round"
          stroke-width={props.strokeWidth}
          opacity="1"
          style={{
            stroke: {
              normal: 'var(--ant-color-primary)',
              success: 'var(--ant-color-success)',
              error: 'var(--ant-color-error)',
            }[status()],
            'stroke-dasharray': `${perimeter()}px, ${perimeter()}px`,
            'stroke-dashoffset': `${(perimeter() * (100 - props.percent)) / 100}px`,
            transform: 'rotate(-90deg)',
            'transform-origin': '50px 50px',
            transition:
              'stroke-dashoffset 0.3s ease 0s, stroke-dasharray 0.3s ease 0s, stroke 0.3s ease 0s, stroke-width 0.06s ease 0.3s, opacity ease 0s',
            'fill-opacity': '0',
          }}
        />
      </svg>

      <Show when={props.showInfo}>
        <span class="shrink-0 min-w-40px text-center text-1em absolute top-1/2 left-1/2 -translate-1/2">
          <Switch fallback={`${props.percent}%`}>
            <Match when={status() === 'success'}>
              <span class="i-ant-design:check-outlined text-[var(--ant-color-success)] text-1.1667em" />
            </Match>
            <Match when={status() === 'error'}>
              <span class="i-ant-design:close-outlined text-[var(--ant-color-error)] text-1.1667em" />
            </Match>
          </Switch>
        </span>
      </Show>
    </div>
  )
}

export default Circle
