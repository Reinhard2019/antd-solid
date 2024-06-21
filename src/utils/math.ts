import { inRange } from 'lodash-es'

/**
 * 角度转弧度
 * @param degrees
 */
export function degToRad(degrees: number) {
  return (degrees / 180) * Math.PI
}

/**
 * 弧度转角度
 * @param degrees
 */
export function radToDeg(radian: number) {
  return (radian / Math.PI) * 180
}

/**
 * 获取圆上的点
 * 角度以 x 轴正轴为起点，顺时针
 * 注意：与 canvas 一样，y 轴正轴朝下
 */
export function getPointOfCircle(_angle: number, radius = 1) {
  // 将超出[0, 360]范围的角度转换为[0, 360]
  const angle = _angle >= 0 ? _angle % (Math.PI * 2) : Math.PI * 2 + (_angle % (Math.PI * 2))
  let x = 0
  let y = 0
  if (inRange(angle, 0, Math.PI / 2)) {
    x = Math.cos(angle) * radius
    y = Math.sin(angle) * radius
  } else if (inRange(angle, Math.PI / 2, Math.PI)) {
    x = -Math.sin(angle - Math.PI / 2) * radius
    y = Math.cos(angle - Math.PI / 2) * radius
  } else if (inRange(angle, Math.PI, Math.PI * 1.5)) {
    x = -Math.cos(angle - Math.PI) * radius
    y = -Math.sin(angle - Math.PI) * radius
  } else if (inRange(angle, Math.PI * 1.5, Math.PI * 2)) {
    x = Math.sin(angle - Math.PI * 1.5) * radius
    y = -Math.cos(angle - Math.PI * 1.5) * radius
  }
  return [x, y]
}

/**
 * 获取两个点之间的距离
 * @param p1
 * @param p2
 * @returns
 */
export function distance(p1: [number, number], p2: [number, number]) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
}

/**
 * 根据 DOMMatrix 获取旋转角度
 * @param matrix
 * @returns
 */
export function getRotationAngleOfMatrix(matrix: DOMMatrix) {
  return Math.atan2(matrix.b, matrix.a)
}
