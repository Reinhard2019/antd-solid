import { type Component } from 'solid-js'
import { Button, Form, type FormInstance, Input, Radio } from 'antd-solid'
import { string } from 'yup'

const App: Component = () => {
  let ref: FormInstance | undefined

  return (
    <Form
      ref={ref}
      initialValues={{
        layout: 'horizontal',
      }}
      layout={ref?.getFieldValue('layout')}
    >
      <Form.Item
        label="Layout"
        name="layout"
        component={props => (
          <Radio.Group
            {...props}
            onChange={e => {
              props.onChange(e.target.value)
            }}
            optionType="button"
            options={[
              {
                label: 'Horizontal',
                value: 'horizontal',
              },
              {
                label: 'Vertical',
                value: 'vertical',
              },
              {
                label: 'Inline',
                value: 'inline',
              },
            ]}
          />
        )}
        required
        rules={[string().required('Please input your username!')]}
      />
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
                ?.validateFields()
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

export default App
