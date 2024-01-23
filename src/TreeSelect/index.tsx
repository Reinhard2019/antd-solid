import { splitProps, type JSXElement, untrack } from 'solid-js'
import { type StringOrJSXElement } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { get } from 'lodash-es'
import Tree, { type TreeProps, type TreeNode } from '../Tree'
import SelectInput, { type SelectInputProps } from '../Select/SelectInput'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface TreeSelectProps<T extends {} = TreeNode>
  extends Omit<SelectInputProps<T>, 'optionLabelRender' | 'content'>,
  Omit<TreeProps<T>, 'fieldNames'> {
  /**
   * 自定义节点 title、key、children 的字段
   * 默认 { title: 'title', children: 'children' }
   */
  fieldNames?: {
    title?: string | ((node: T) => JSXElement)
    children?: string | ((node: T) => T[] | undefined)
  }
}

const TreeSelect = <T extends {} = TreeNode>(props: TreeSelectProps<T>) => {
  const [selectInputProps] = splitProps(props, [
    'multiple',
    'allowClear',
    'class',
    'disabled',
    'placeholder',
  ])

  const fieldNames = Object.assign(
    {
      title: 'title' as string | ((node: T) => JSXElement),
      children: 'children' as string | ((node: T) => T[] | undefined),
    },
    untrack(() => props.fieldNames),
  )
  const getTitle = (node: T): JSXElement => {
    const titleFieldName = fieldNames.title
    return typeof titleFieldName === 'function'
      ? titleFieldName(node)
      : unwrapStringOrJSXElement(get(node, titleFieldName) as StringOrJSXElement)
  }

  const [value, setValue] = createControllableValue<T[] | undefined>(props, {
    defaultValue: [],
  })

  return (
    <SelectInput
      {...selectInputProps}
      optionLabelRender={getTitle}
      value={value()}
      onChange={setValue}
      content={close => (
        <div class="px-4px py-8px">
          <Tree
            selectedNodes={value()}
            onSelect={nodes => {
              setValue(nodes)
              if (!props.multiple) close()
            }}
            treeData={props.treeData}
            multiple={props.multiple}
            blockNode
          />
        </div>
      )}
    />
  )
}

export default TreeSelect
