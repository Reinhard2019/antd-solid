import i18next from 'i18next'
import zh from './zh_CN'
import en from './en_US'
import { type Lang } from './types'
import { type ModalLocale } from '../Modal'

const defaultLang = 'en_US'

export interface Locale {
  locale: string
  Modal?: ModalLocale
}

i18next.init({
  lng: (localStorage.getItem('lang') as Lang) ?? defaultLang, // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
})
