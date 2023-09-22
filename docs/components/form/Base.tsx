import { type Component } from 'solid-js'
import { Button, Form, type FormInstance, Input } from 'antd-solid'
import { string } from 'yup'

const Base: Component = () => {
  let ref: FormInstance

  return (
    <Form ref={ref!}>
      <Form.Item
        label="Username"
        name="username"
        component={props => (
          <Input
            {...props}
            onChange={e => {
              props.onChange?.(e.target.value)
            }}
          />
        )}
        required
        rules={[string().required('Please input your username!')]}
      />
      <Form.Item
        label="Password"
        name="password"
        component={props => (
          <Input
            {...props}
            type="password"
            onChange={e => {
              props.onChange?.(e.target.value)
            }}
          />
        )}
        required
        rules={[string().required('Please input your password!')]}
      />
      <Form.Item
        component={() => (
          <Button
            type="primary"
            // eslint-disable-next-line solid/reactivity
            onClick={() => {
              ref
                .validateFields()
                .then(resp => {
                  console.log('resp', resp)
                })
                .catch(err => {
                  console.log('catch', err)
                })
            }}
          >
            提交
          </Button>
        )}
      />
    </Form>
  )
}

export default Base
