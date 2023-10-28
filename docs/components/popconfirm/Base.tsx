import { type Component } from 'solid-js'
import { Button, Popconfirm, message } from 'antd-solid'

const Index: Component = () => {
  const confirm = () => {
    message.success('Click on Yes')
  }
  const cancel = () => {
    message.error('Click on No');
  };

  return (
    <Popconfirm
      title="是否同步删除后续继承节点"
      okText="是"
      cancelText="否"
      onConfirm={confirm}
      onCancel={cancel}
    >
      <Button danger>Delete</Button>
    </Popconfirm>
  )
}

export default Index
