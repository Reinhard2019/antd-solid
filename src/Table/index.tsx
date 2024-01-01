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
    <div>
      <table class="w-full">
        <thead>
          <tr>
            <For each={props.columns}>
              {item => (
                <th class="p-16px bg-[var(--ant-light-bg-color)] font-bold [border-bottom:1px_solid_var(--ant-secondary-border-color)] text-left">
                  {item.title}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.dataSource}>
            {row => (
              <tr class="hover:bg-[var(--ant-light-bg-color)]">
                <For each={props.columns}>
                  {item => (
                    <td class="p-16px [border-bottom:1px_solid_var(--ant-secondary-border-color)]">
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
