import { type Accessor, createContext, type Setter } from 'solid-js'
import { type TFunction } from 'i18next'
import { type Lang } from './types'

const LangContext = createContext({
  lang: (() => 'zh') as Accessor<Lang>,
  setLang: (() => {}) as Setter<Lang>,
  /**
   * i18next.t 函数
   */
  getT: (() => '') as TFunction,
})

export default LangContext
