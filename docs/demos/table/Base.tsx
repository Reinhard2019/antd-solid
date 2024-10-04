import { type Component } from 'solid-js'
import { type TableColumn, Table } from 'antd-solid'

interface Row {
  name: string
  age: number
  address: string
}

const dataSource: Row[] = [
  {
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
  },
]

const columns: Array<TableColumn<Row>> = [
  {
    title: '姓名',
    render(row) {
      return <div>{row.name}</div>
    },
  },
  {
    title: '年龄',
    render(row) {
      return <div>{row.age}</div>
    },
  },
  {
    title: '住址',
    render(row) {
      return <div>{row.address}</div>
    },
  },
]

const App: Component = () => {
  return <Table columns={columns} dataSource={dataSource} />
}

export default App
