import {
  TinyColor,
  stringInputToObject,
  isValidCSSUnit,
  type TinyColorOptions,
  type RGB,
  type RGBA,
  type HSL,
  type HSLA,
  type HSV,
  type HSVA,
  type CMYK,
  type Numberify,
} from '@ctrl/tinycolor'

export type ColorInput = string | number | RGB | RGBA | HSL | HSLA | HSV | HSVA | CMYK | Color

/**
 * 扩展 TinyColor
 * 用于在 HSV 格式下，当 s 或者 v 为 0 时，正常保存 h 值
 */
class Color extends TinyColor {
  /** Hue */
  private readonly h: number = 0
  /** Saturation */
  private readonly s: number = 0
  /** Value */
  private readonly v: number = 0

  constructor(color?: ColorInput, opts?: Partial<TinyColorOptions>) {
    color = color instanceof Color ? color.toHsv() : color

    super(color, opts)

    if (typeof color === 'string') {
      color = stringInputToObject(color)
    }
    if (typeof color === 'object') {
      if (isHsv(color)) {
        this.h = Number(color.h)
        this.s = Number(color.s)
        this.v = Number(color.v)
        this.a = isHsva(color) ? color.a : 1
      }
    }

    if (!this.isValid) {
      this.a = 0
    }
  }

  toHsv(): Numberify<HSVA> {
    const hsv = super.toHsv()
    if (this.equals(new TinyColor('black'))) {
      hsv.h = this.h
      hsv.s = this.s
      hsv.v = this.v
    }
    return hsv
  }

  toHsvString(): string {
    const hsv = this.toHsv()
    return `hsva(${hsv.h}, ${hsv.s}, ${hsv.v}, ${hsv.a})`
  }

  /**
   * 获取色相对应的颜色 rgb 字符串
   * @returns string
   */
  toHueRgbString() {
    const hsv = this.toHsv()
    return new Color(`hsv(${hsv.h}, 1, 1)`).toRgbString()
  }

  clone() {
    return new Color(this)
  }
}

function isHsv(color: RGB | RGBA | HSL | HSLA | HSV | HSVA | CMYK): color is HSV {
  return (
    isValidCSSUnit((color as HSV).h) &&
    isValidCSSUnit((color as HSV).s) &&
    isValidCSSUnit((color as HSV).v)
  )
}

function isHsva(color: RGB | RGBA | HSL | HSLA | HSV | HSVA | CMYK): color is HSVA {
  return isHsv(color) && isValidCSSUnit((color as HSVA).a)
}

export default Color
