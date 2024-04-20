import { type JSXElement, For, Show, mergeProps, useContext } from 'solid-js'
import cs from 'classnames'
import Empty from '../Empty'
import ConfigProviderContext from '../ConfigProvider/context'

export interface TableColumn<R extends {}> {
  title: JSXElement
  render: (row: R) => JSXElement
}

export interface TableProps<R extends {}> {
  columns: Array<TableColumn<R>>
  dataSource: R[]
  /**
   * 默认 'middle'
   */
  size?: 'large' | 'middle' | 'small'
}

const sizeClassDict = {
  large: 'p-16px leading-22px',
  middle: 'px-8px py-12px leading-22px',
  small: 'p-8px leading-22px',
}

const Table = <R extends {}>(_props: TableProps<R>) => {
  const { cssVariables } = useContext(ConfigProviderContext)
  const props = mergeProps(
    {
      size: 'middle',
    } as const,
    _props,
  )

  return (
    <div
      class="text-[var(--ant-color-text)] [font-size:var(--ant-font-size)]"
      style={cssVariables()}
    >
      <table class="w-full">
        <thead>
          <tr>
            <For each={props.columns}>
              {item => (
                <th
                  class={cs(
                    sizeClassDict[props.size],
                    'bg-[var(--ant-table-header-bg)] font-bold [border-bottom:1px_solid_var(--ant-table-border-color)] text-left',
                  )}
                >
                  {item.title}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.dataSource}>
            {row => (
              <tr class="hover:bg-[var(--ant-table-row-hover-bg)]">
                <For each={props.columns}>
                  {item => (
                    <td
                      class={cs(
                        sizeClassDict[props.size],
                        '[border-bottom:1px_solid_var(--ant-table-border-color)]',
                      )}
                    >
                      {item.render(row)}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      <Show when={!props.dataSource.length}>
        <Empty.PRESENTED_IMAGE_SIMPLE />
      </Show>
    </div>
  )
}

export default Table
