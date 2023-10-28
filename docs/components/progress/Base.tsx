import { type Component } from 'solid-js'
import { Progress } from 'antd-solid'

const Index: Component = () => {
  return (
    <>
      <Progress percent={30} />
      <Progress percent={50} status="active" />
      <Progress percent={70} status="exception" />
      <Progress percent={100} />
      <Progress percent={50} showInfo={false} />
    </>
  )
}

export default Index
