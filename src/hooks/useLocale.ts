import { useContext } from 'solid-js'
import ConfigProviderContext from '../ConfigProvider/context'

export default function useLocale() {
  const { locale } = useContext(ConfigProviderContext)
  return locale
}
