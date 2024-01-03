import { isNil } from 'lodash-es'

/**
 * 如果传入一个非数组字段，则将其转化为数组
 * @param value
 * @param allowNil 如果设置为 false，则 value isNil 的情况下，会返回空数组
 * @returns
 */
export function toArray<T>(value: T | T[], allowNil: boolean = true) {
  if (!allowNil && isNil(value)) return []
  return Array.isArray(value) ? value : [value]
}

export interface StandardNode {
  children?: this[]
}
/**
 * 将数组中每个对象的 children 拍扁后返回
 * @param nodes
 * @returns
 */
export function flatChildren<T extends StandardNode = StandardNode>(nodes: T[] | undefined): T[] {
  if (!nodes) return []
  return nodes.flatMap(node => [node, ...flatChildren(node.children)])
}
