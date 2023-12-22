import { type Component } from 'solid-js'
import { type TableColumn, Table } from 'antd-solid'

interface Row {
  name: string
}

const Index: Component = () => {
  const columns: Array<TableColumn<Row>> = [
    {
      title: '动画',
      render(row) {
        return <div>{row.name}</div>
      },
    },
    {
      title: '属性',
      render(row) {
        return <div>{row.name}</div>
      },
    },
  ]
  const dataSource = [
    {
      name: '1',
    },
    {
      name: '2',
    },
  ]
  return <Table columns={columns} dataSource={dataSource} />
}

export default Index
