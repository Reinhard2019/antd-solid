import Empty from './Empty'
import { type JSXElement, For, Show } from 'solid-js'

export interface TableColumn<R extends {}> {
  title: JSXElement
  render: (row: R) => JSXElement
}

export interface TableProps<R extends {}> {
  columns: Array<TableColumn<R>>
  dataSource: R[]
}

const Table = <R extends {}>(props: TableProps<R>) => {
  return (
    <div>
      <table class="ant-w-full">
        <thead>
          <tr>
            <For each={props.columns}>
              {item => (
                <th class="ant-p-16px ant-bg-[var(--light-bg-color)] ant-font-bold ant-[border-bottom:1px_solid_var(--secondary-border-color)] ant-text-left">
                  {item.title}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.dataSource}>
            {row => (
              <tr class="hover:ant-bg-[var(--light-bg-color)]">
                <For each={props.columns}>
                  {item => (
                    <td class="ant-p-16px ant-[border-bottom:1px_solid_var(--secondary-border-color)]">
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
