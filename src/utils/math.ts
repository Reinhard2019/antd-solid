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
 * 获取两个点之间的距离
 * @param p1
 * @param p2
 * @returns
 */
export function distance(p1: [number, number], p2: [number, number]) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
}

/**
 * 根据 skewX、skewY 创建 DOMMatrix
 * @param sx
 * @param sy
 * @returns
 */
export function createSkewDOMMatrix(sx: number, sy: number) {
  return new DOMMatrix([1, Math.tan(degToRad(sy)), Math.tan(degToRad(sx)), 1, 0, 0])
}
