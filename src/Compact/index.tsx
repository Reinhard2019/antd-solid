import { type ParentProps } from 'solid-js'

interface CompactProps extends ParentProps {}

function Compact(props: CompactProps) {
  return (
    <div class="ant-compact ant-flex child[:first-child]>:ant-rounded-l-6px child[:last-child]>:ant-rounded-r-6px">
      {props.children}
    </div>
  )
}

Compact.compactItemClass = 'p[.ant-compact]:ant-ml--1px p[.ant-compact]:first:ant-ml-0'
Compact.compactItemRounded0Class = 'p[.ant-compact]:ant-rounded-0'
Compact.compactItemRoundedLeftClass = 'p[.ant-compact>:first-child]:ant-rounded-l-6px'
Compact.compactItemRoundedRightClass = 'p[.ant-compact>:last-child]:ant-rounded-r-6px'
Compact.compactItemZIndexClass =
  'p[.ant-compact]:hover:ant-z-10 p[.ant-compact]:focus:ant-z-10 p[.ant-compact]:focus-within:ant-z-10'

export default Compact
