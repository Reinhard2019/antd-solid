import { type JSXElement, For, Show } from 'solid-js'
import Empty from '../Empty'

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
    <div
      style={{
        '--ant-table-header-bg': '#fafafa',
        '--ant-table-row-hover-bg': '#fafafa',
        '--ant-table-border-color': '#f0f0f0',
      }}
    >
      <table class="w-full">
        <thead>
          <tr>
            <For each={props.columns}>
              {item => (
                <th class="p-16px bg-[var(--ant-table-header-bg)] font-bold [border-bottom:1px_solid_var(--ant-table-border-color)] text-left">
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
                    <td class="p-16px [border-bottom:1px_solid_var(--ant-table-border-color)]">
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
