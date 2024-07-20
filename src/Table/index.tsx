import { type JSXElement, For, Show, type Accessor, useContext, createMemo } from 'solid-js'
import cs from 'classnames'
import Empty from '../Empty'
import Element from '../Element'
import ConfigProviderContext from '../ConfigProvider/context'

export interface TableColumn<R extends {}> {
  title: JSXElement
  render: (row: R, index: Accessor<number>) => JSXElement
}

export interface TableProps<R extends {}> {
  columns: Array<TableColumn<R>>
  dataSource: R[]
  /**
   * 默认 'middle'
   */
  size?: 'small' | 'middle' | 'large'
}

const sizeClassDict = {
  large: 'p-16px leading-22px',
  middle: 'px-8px py-12px leading-22px',
  small: 'p-8px leading-22px',
}

const Table = <R extends {}>(props: TableProps<R>) => {
  const { componentSize } = useContext(ConfigProviderContext)
  const size = createMemo(() => props.size ?? componentSize())

  return (
    <Element class="[font-size:var(--ant-font-size)] text-[var(--ant-color-text)] leading-[var(--ant-line-height)]">
      <table class="w-full">
        <thead>
          <tr>
            <For each={props.columns}>
              {item => (
                <th
                  class={cs(
                    sizeClassDict[size()],
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
            {(row, i) => (
              <tr class="hover:bg-[var(--ant-table-row-hover-bg)]">
                <For each={props.columns}>
                  {item => (
                    <td
                      class={cs(
                        sizeClassDict[size()],
                        '[border-bottom:1px_solid_var(--ant-table-border-color)]',
                      )}
                    >
                      {item.render(row, i)}
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
    </Element>
  )
}

export default Table
