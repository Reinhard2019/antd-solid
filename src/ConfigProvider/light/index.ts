import { type SeedToken } from '../types'
import genColorMapToken from '../utils/genColorMapToken'
import { generateColorPalettes, generateNeutralColorPalettes } from './colors'

export default function (token: SeedToken) {
  return genColorMapToken(token, {
    generateColorPalettes,
    generateNeutralColorPalettes,
  })
}
