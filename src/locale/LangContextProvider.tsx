import {
  createMemo,
  createRenderEffect,
  createSignal,
  on,
  type Component,
  type ParentProps,
} from 'solid-js'
import i18next, { type TFunction } from 'i18next'
import LangContext from './langContext'
import { type Lang } from './types'

const LangContextProvider: Component<ParentProps> = props => {
  const [lang, setLang] = createSignal<Lang>(i18next.language as Lang)
  createRenderEffect(
    on(
      lang,
      () => {
        i18next.changeLanguage(lang())
        localStorage.setItem('lang', lang())
      },
      {
        defer: true,
      },
    ),
  )

  const t = createMemo(() => i18next.getFixedT(lang()))
  // eslint-disable-next-line solid/reactivity
  const getT = ((...argus: Parameters<TFunction>) => t()(...argus)) as TFunction

  return (
    <LangContext.Provider
      value={{
        lang,
        setLang,
        getT,
      }}
    >
      {props.children}
    </LangContext.Provider>
  )
}

export default LangContextProvider
